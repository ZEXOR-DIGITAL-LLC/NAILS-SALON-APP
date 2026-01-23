import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Helper function to parse YYYY-MM-DD string to UTC start of day
function parseDateToUTC(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

// POST - Extend appointment time and shift subsequent bookings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, salonId, additionalHours, additionalMinutes } = body;

    // Validate required fields
    if (!appointmentId || !salonId) {
      return NextResponse.json(
        { error: 'Appointment ID and Salon ID are required' },
        { status: 400 }
      );
    }

    if (additionalHours === undefined || additionalMinutes === undefined) {
      return NextResponse.json(
        { error: 'Additional hours and minutes are required' },
        { status: 400 }
      );
    }

    const addHours = parseInt(additionalHours, 10) || 0;
    const addMinutes = parseInt(additionalMinutes, 10) || 0;

    if (addHours === 0 && addMinutes === 0) {
      return NextResponse.json(
        { error: 'Must add at least some time' },
        { status: 400 }
      );
    }

    // Find the appointment to extend
    const appointment = await prisma.ownerAppointment.findFirst({
      where: {
        id: appointmentId,
        salonId: salonId,
        status: 'Pending',
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found or not pending' },
        { status: 404 }
      );
    }

    // Calculate the current end time in minutes from midnight
    const currentEndMinutes =
      appointment.appointmentHour * 60 +
      appointment.appointmentMinute +
      appointment.durationHours * 60 +
      appointment.durationMinutes;

    // Calculate the additional time in minutes
    const additionalTimeMinutes = addHours * 60 + addMinutes;

    // Calculate the new end time
    const newEndMinutes = currentEndMinutes + additionalTimeMinutes;

    // Calculate new duration
    const newDurationTotalMinutes =
      appointment.durationHours * 60 + appointment.durationMinutes + additionalTimeMinutes;
    const newDurationHours = Math.floor(newDurationTotalMinutes / 60);
    const newDurationMinutes = newDurationTotalMinutes % 60;

    // Get the appointment date string for querying
    const appointmentDateStr = appointment.appointmentDate.toISOString().split('T')[0];
    const startOfDay = parseDateToUTC(appointmentDateStr);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Build where clause for subsequent appointments
    // If appointment has an employee, only shift that employee's appointments
    // If no employee (unassigned), shift all salon appointments (backward compatible)
    const subsequentWhereClause: {
      salonId: string;
      appointmentDate: { gte: Date; lte: Date };
      status: string;
      id: { not: string };
      employeeId?: string | null;
    } = {
      salonId,
      appointmentDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: 'Pending',
      id: { not: appointmentId },
    };

    if (appointment.employeeId) {
      subsequentWhereClause.employeeId = appointment.employeeId;
    }

    // Find all subsequent pending appointments on the same day (same employee if assigned)
    const subsequentAppointments = await prisma.ownerAppointment.findMany({
      where: subsequentWhereClause,
      orderBy: [{ appointmentHour: 'asc' }, { appointmentMinute: 'asc' }],
    });

    // Filter to appointments that would overlap after extension
    // or were already starting after the current end time
    const appointmentsToShift = subsequentAppointments.filter((apt) => {
      const aptStart = apt.appointmentHour * 60 + apt.appointmentMinute;
      // Include appointments that start before the new end time
      return aptStart >= currentEndMinutes && aptStart < newEndMinutes;
    }).concat(
      // Also include all appointments that start at or after newEndMinutes
      // but need to maintain their relative position
      subsequentAppointments.filter((apt) => {
        const aptStart = apt.appointmentHour * 60 + apt.appointmentMinute;
        return aptStart >= newEndMinutes;
      })
    );

    // Remove duplicates and sort
    const uniqueAppointmentsToShift = [...new Map(
      appointmentsToShift.map(apt => [apt.id, apt])
    ).values()].sort((a, b) => {
      const aTime = a.appointmentHour * 60 + a.appointmentMinute;
      const bTime = b.appointmentHour * 60 + b.appointmentMinute;
      return aTime - bTime;
    });

    // Use a transaction to update all appointments atomically
    const updates = await prisma.$transaction(async (tx) => {
      // Update the current appointment's duration
      const updatedAppointment = await tx.ownerAppointment.update({
        where: { id: appointmentId },
        data: {
          durationHours: newDurationHours,
          durationMinutes: newDurationMinutes,
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      // Shift all subsequent appointments to maintain proper spacing
      const shiftedAppointments = [];
      let nextAvailableSlot = newEndMinutes;

      for (const apt of uniqueAppointmentsToShift) {
        const currentStartMinutes = apt.appointmentHour * 60 + apt.appointmentMinute;
        const aptDurationMinutes = apt.durationHours * 60 + apt.durationMinutes;

        // Calculate new start time - either shift by additional time or use next available slot
        let newStartMinutes = currentStartMinutes + additionalTimeMinutes;

        // Ensure the appointment doesn't start before the next available slot
        if (newStartMinutes < nextAvailableSlot) {
          newStartMinutes = nextAvailableSlot;
        }

        // Calculate new hour and minute
        let newHour = Math.floor(newStartMinutes / 60);
        let newMinute = newStartMinutes % 60;

        // Check if the new time goes past midnight (into next day)
        // If so, we'll cap it at 23:59 and log a warning
        if (newHour >= 24) {
          console.warn(
            `Appointment ${apt.id} would be shifted past midnight. Capping at 23:59.`
          );
          newHour = 23;
          newMinute = 59;
        }

        const shifted = await tx.ownerAppointment.update({
          where: { id: apt.id },
          data: {
            appointmentHour: newHour,
            appointmentMinute: newMinute,
          },
        });

        shiftedAppointments.push(shifted);

        // Update next available slot for the following appointment
        nextAvailableSlot = newHour * 60 + newMinute + aptDurationMinutes;
      }

      return {
        updatedAppointment,
        shiftedAppointments,
        shiftedCount: shiftedAppointments.length,
      };
    });

    return NextResponse.json(
      {
        message: 'Appointment extended successfully',
        appointment: updates.updatedAppointment,
        shiftedAppointments: updates.shiftedAppointments,
        shiftedCount: updates.shiftedCount,
        additionalTime: {
          hours: addHours,
          minutes: addMinutes,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error extending appointment time:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
