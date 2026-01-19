import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Helper to convert appointment time to minutes for comparison
function appointmentToMinutes(hour: number, minute: number): number {
  return hour * 60 + minute;
}

// GET - Fetch public booking data by appointment ID with queue information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Fetch appointment with salon information
    const appointment = await prisma.ownerAppointment.findUnique({
      where: { id },
      include: {
        salon: {
          select: {
            businessName: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check if appointment is completed or canceled (link expired)
    const isExpired = appointment.status === 'Completed' || appointment.status === 'Canceled';

    // Calculate queue position - count pending appointments before this one on the same day
    let queuePosition = 0;
    let totalQueueToday = 0;

    if (!isExpired) {
      const thisAppointmentTime = appointmentToMinutes(
        appointment.appointmentHour,
        appointment.appointmentMinute
      );

      // Get all pending appointments for this salon on the same day
      const todayAppointments = await prisma.ownerAppointment.findMany({
        where: {
          salonId: appointment.salonId,
          appointmentDate: appointment.appointmentDate,
          status: 'Pending',
        },
        select: {
          id: true,
          appointmentHour: true,
          appointmentMinute: true,
        },
        orderBy: [
          { appointmentHour: 'asc' },
          { appointmentMinute: 'asc' },
        ],
      });

      totalQueueToday = todayAppointments.length;

      // Find position in queue (1-indexed)
      for (let i = 0; i < todayAppointments.length; i++) {
        const apt = todayAppointments[i];
        if (apt.id === appointment.id) {
          queuePosition = i + 1;
          break;
        }
      }

      // Count how many are ahead (appointments that start before this one)
      const appointmentsAhead = todayAppointments.filter((apt) => {
        if (apt.id === appointment.id) return false;
        const aptTime = appointmentToMinutes(apt.appointmentHour, apt.appointmentMinute);
        return aptTime < thisAppointmentTime;
      }).length;

      queuePosition = appointmentsAhead + 1;
    }

    return NextResponse.json({
      success: true,
      expired: isExpired,
      data: {
        id: appointment.id,
        appointmentDate: appointment.appointmentDate.toISOString(),
        appointmentHour: appointment.appointmentHour,
        appointmentMinute: appointment.appointmentMinute,
        durationHours: appointment.durationHours,
        durationMinutes: appointment.durationMinutes,
        service: appointment.service,
        status: appointment.status,
        businessName: appointment.salon.businessName,
        clientName: appointment.clientName,
        // Queue information
        queuePosition,
        totalQueueToday,
        // Created time for tracking changes
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}
