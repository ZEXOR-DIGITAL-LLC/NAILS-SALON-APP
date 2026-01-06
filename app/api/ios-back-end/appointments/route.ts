import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// 5-minute margin between appointments for preparation time
const BOOKING_MARGIN_MINUTES = 5;

// Helper function to parse YYYY-MM-DD string to UTC start of day
function parseDateToUTC(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Create date at UTC midnight for the specified date
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

// GET - Fetch appointments for a salon owner (today's appointments by default)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');
    const dateParam = searchParams.get('date'); // Expected format: YYYY-MM-DD
    const typeParam = searchParams.get('type'); // 'future' for future appointments, 'counts' for status counts
    const statusParam = searchParams.get('status'); // 'Pending', 'Completed', 'Canceled'

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    // Verify the salon exists
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Handle status counts query - returns counts for Completed and Canceled appointments
    if (typeParam === 'counts') {
      const [completedCount, canceledCount] = await Promise.all([
        prisma.ownerAppointment.count({
          where: {
            salonId,
            status: 'Completed',
          },
        }),
        prisma.ownerAppointment.count({
          where: {
            salonId,
            status: 'Canceled',
          },
        }),
      ]);

      return NextResponse.json({
        completedCount,
        canceledCount,
        type: 'counts',
      }, { status: 200 });
    }

    // Handle completed appointments query - all completed appointments
    if (typeParam === 'completed') {
      const appointments = await prisma.ownerAppointment.findMany({
        where: {
          salonId,
          status: 'Completed',
        },
        orderBy: [
          { appointmentDate: 'desc' },
          { appointmentHour: 'desc' },
          { appointmentMinute: 'desc' },
        ],
      });

      return NextResponse.json({
        appointments,
        count: appointments.length,
        type: 'completed',
      }, { status: 200 });
    }

    // Handle canceled appointments query - all canceled appointments
    if (typeParam === 'canceled') {
      const appointments = await prisma.ownerAppointment.findMany({
        where: {
          salonId,
          status: 'Canceled',
        },
        orderBy: [
          { appointmentDate: 'desc' },
          { appointmentHour: 'desc' },
          { appointmentMinute: 'desc' },
        ],
      });

      return NextResponse.json({
        appointments,
        count: appointments.length,
        type: 'canceled',
      }, { status: 200 });
    }

    // Handle future appointments query
    if (typeParam === 'future') {
      // Get tomorrow's date at midnight UTC (future starts from tomorrow)
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));

      console.log('Fetching future appointments from:', tomorrow);

      const appointments = await prisma.ownerAppointment.findMany({
        where: {
          salonId,
          appointmentDate: {
            gte: tomorrow,
          },
          status: 'Pending', // Only pending future appointments
        },
        orderBy: [
          { appointmentDate: 'asc' },
          { appointmentHour: 'asc' },
          { appointmentMinute: 'asc' },
        ],
      });

      console.log('Future appointments:', appointments);

      return NextResponse.json({
        appointments,
        count: appointments.length,
        type: 'future',
      }, { status: 200 });
    }

    // Get the date to filter by (today by default)
    let dateStr: string;
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      dateStr = dateParam;
    } else {
      // Use today's date in UTC
      const now = new Date();
      dateStr = now.toISOString().split('T')[0];
    }

    // Parse the date string to UTC boundaries
    const startOfDay = parseDateToUTC(dateStr);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Build where clause with optional status filter
    const whereClause: {
      salonId: string;
      appointmentDate: { gte: Date; lte: Date };
      status?: string;
    } = {
      salonId,
      appointmentDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    // Add status filter if provided
    if (statusParam && ['Pending', 'Completed', 'Canceled'].includes(statusParam)) {
      whereClause.status = statusParam;
    }

    console.log('Query params:', { salonId, dateStr, startOfDay, endOfDay, status: statusParam });

    const appointments = await prisma.ownerAppointment.findMany({
      where: whereClause,
      orderBy: [
        { appointmentHour: 'asc' },
        { appointmentMinute: 'asc' },
      ],
    });

    console.log('Filtered appointments:', appointments);

    return NextResponse.json({
      appointments,
      count: appointments.length,
      date: dateStr,
      status: statusParam || 'all',
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      salonId,
      clientName,
      service,
      appointmentDate,
      appointmentHour,
      appointmentMinute,
      durationHours = 1,
      durationMinutes = 0,
    } = body;

    // Validate required fields
    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (!clientName || clientName.trim() === '') {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    }

    if (!service || service.trim() === '') {
      return NextResponse.json({ error: 'Service is required' }, { status: 400 });
    }

    if (!appointmentDate) {
      return NextResponse.json({ error: 'Appointment date is required' }, { status: 400 });
    }

    if (appointmentHour === undefined || appointmentHour === null) {
      return NextResponse.json({ error: 'Appointment hour is required' }, { status: 400 });
    }

    if (appointmentMinute === undefined || appointmentMinute === null) {
      return NextResponse.json({ error: 'Appointment minute is required' }, { status: 400 });
    }

    // Validate hour and minute ranges
    const hour = parseInt(appointmentHour, 10);
    const minute = parseInt(appointmentMinute, 10);
    const dHours = parseInt(durationHours, 10);
    const dMinutes = parseInt(durationMinutes, 10);

    if (isNaN(hour) || hour < 0 || hour > 23) {
      return NextResponse.json({ error: 'Hour must be between 0 and 23' }, { status: 400 });
    }

    if (isNaN(minute) || minute < 0 || minute > 59) {
      return NextResponse.json({ error: 'Minute must be between 0 and 59' }, { status: 400 });
    }

    // Verify the salon exists
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Parse the appointment date - expect YYYY-MM-DD format
    let parsedDate: Date;
    if (typeof appointmentDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      parsedDate = parseDateToUTC(appointmentDate);
    } else {
      const dateObj = new Date(appointmentDate);
      const dateStr = dateObj.toISOString().split('T')[0];
      parsedDate = parseDateToUTC(dateStr);
    }

    // --- OVERLAP AND MARGIN CHECK ---
    const startInMinutes = hour * 60 + minute;
    const endInMinutes = startInMinutes + dHours * 60 + dMinutes;

    const existingAppointments = await prisma.ownerAppointment.findMany({
      where: {
        salonId,
        appointmentDate: parsedDate,
        status: 'Pending', // Only check against Pending appointments
      },
    });

    for (const existing of existingAppointments) {
      const existingStart = existing.appointmentHour * 60 + existing.appointmentMinute;
      const existingEnd =
        existingStart + existing.durationHours * 60 + existing.durationMinutes;
      // Add 5-minute margin after the existing appointment
      const existingEndWithMargin = existingEnd + BOOKING_MARGIN_MINUTES;

      // Direct overlap condition: (startA < endB) AND (endA > startB)
      if (startInMinutes < existingEnd && endInMinutes > existingStart) {
        return NextResponse.json(
          { error: 'This time slot overlaps with another appointment.' },
          { status: 409 }
        );
      }

      // Margin violation: new appointment starts within 5 minutes after existing ends
      // OR new appointment ends within 5 minutes before existing starts
      const newStartsTooSoonAfterExisting = startInMinutes >= existingEnd && startInMinutes < existingEndWithMargin;
      const newEndsTooCloseToExistingStart = endInMinutes > (existingStart - BOOKING_MARGIN_MINUTES) && endInMinutes <= existingStart;

      if (newStartsTooSoonAfterExisting || newEndsTooCloseToExistingStart) {
        return NextResponse.json(
          {
            error: 'A 5-minute margin is required between appointments for preparation.',
            code: 'MARGIN_REQUIRED',
            suggestedStartTime: existingEndWithMargin,
          },
          { status: 422 }
        );
      }
    }
    // -----------------------

    // Create the appointment
    const appointment = await prisma.ownerAppointment.create({
      data: {
        salonId,
        clientName: clientName.trim(),
        service: service.trim(),
        appointmentDate: parsedDate,
        appointmentHour: hour,
        appointmentMinute: minute,
        durationHours: dHours,
        durationMinutes: dMinutes,
        status: 'Pending',
      },
    });

    return NextResponse.json(
      {
        message: 'Appointment created successfully',
        appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update an appointment
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      salonId,
      clientName,
      service,
      appointmentDate,
      appointmentHour,
      appointmentMinute,
      durationHours,
      durationMinutes,
      status,
    } = body;

    if (!id || !salonId) {
      return NextResponse.json({ error: 'ID and Salon ID are required' }, { status: 400 });
    }

    const currentAppointment = await prisma.ownerAppointment.findUnique({
      where: { id },
    });

    if (!currentAppointment || currentAppointment.salonId !== salonId) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (clientName !== undefined) updateData.clientName = clientName.trim();
    if (service !== undefined) updateData.service = service.trim();
    if (status !== undefined) updateData.status = status;

    let targetDate = currentAppointment.appointmentDate;
    if (appointmentDate) {
      targetDate =
        typeof appointmentDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)
          ? parseDateToUTC(appointmentDate)
          : parseDateToUTC(new Date(appointmentDate).toISOString().split('T')[0]);
      updateData.appointmentDate = targetDate;
    }

    if (appointmentHour !== undefined) updateData.appointmentHour = parseInt(appointmentHour, 10);
    if (appointmentMinute !== undefined)
      updateData.appointmentMinute = parseInt(appointmentMinute, 10);
    if (durationHours !== undefined) updateData.durationHours = parseInt(durationHours, 10);
    if (durationMinutes !== undefined) updateData.durationMinutes = parseInt(durationMinutes, 10);

    // --- OVERLAP CHECK (only if time/date/duration changed and status is Pending) ---
    const isPending = (status || currentAppointment.status) === 'Pending';
    const timeChanged =
      appointmentHour !== undefined ||
      appointmentMinute !== undefined ||
      durationHours !== undefined ||
      durationMinutes !== undefined ||
      appointmentDate !== undefined;

    if (isPending && timeChanged) {
      const hour = updateData.appointmentHour ?? currentAppointment.appointmentHour;
      const minute = updateData.appointmentMinute ?? currentAppointment.appointmentMinute;
      const dHours = updateData.durationHours ?? currentAppointment.durationHours;
      const dMinutes = updateData.durationMinutes ?? currentAppointment.durationMinutes;

      const startInMinutes = hour * 60 + minute;
      const endInMinutes = startInMinutes + dHours * 60 + dMinutes;

      const existingAppointments = await prisma.ownerAppointment.findMany({
        where: {
          salonId,
          appointmentDate: targetDate,
          status: 'Pending',
          id: { not: id }, // Exclude current appointment
        },
      });

      for (const existing of existingAppointments) {
        const existingStart = existing.appointmentHour * 60 + existing.appointmentMinute;
        const existingEnd =
          existingStart + existing.durationHours * 60 + existing.durationMinutes;
        const existingEndWithMargin = existingEnd + BOOKING_MARGIN_MINUTES;

        // Direct overlap
        if (startInMinutes < existingEnd && endInMinutes > existingStart) {
          return NextResponse.json(
            { error: 'The new time slot overlaps with another appointment.' },
            { status: 409 }
          );
        }

        // Margin violation
        const newStartsTooSoonAfterExisting = startInMinutes >= existingEnd && startInMinutes < existingEndWithMargin;
        const newEndsTooCloseToExistingStart = endInMinutes > (existingStart - BOOKING_MARGIN_MINUTES) && endInMinutes <= existingStart;

        if (newStartsTooSoonAfterExisting || newEndsTooCloseToExistingStart) {
          return NextResponse.json(
            {
              error: 'A 5-minute margin is required between appointments for preparation.',
              code: 'MARGIN_REQUIRED',
              suggestedStartTime: existingEndWithMargin,
            },
            { status: 422 }
          );
        }
      }
    }
    // -----------------------

    const updated = await prisma.ownerAppointment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      {
        message: 'Appointment updated successfully',
        appointment: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete an appointment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('id');
    const salonId = searchParams.get('salonId');

    if (!appointmentId) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    // Find the appointment and verify ownership
    const appointment = await prisma.ownerAppointment.findFirst({
      where: {
        id: appointmentId,
        salonId: salonId,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found or access denied' }, { status: 404 });
    }

    // Delete the appointment
    await prisma.ownerAppointment.delete({
      where: { id: appointmentId },
    });

    return NextResponse.json({
      message: 'Appointment deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
