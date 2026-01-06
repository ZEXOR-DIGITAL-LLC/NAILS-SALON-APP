import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET - Fetch public booking data by appointment ID
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

    // Check if appointment is completed (link expired)
    const isExpired = appointment.status === 'Completed';

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
