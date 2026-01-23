import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

function appointmentToMinutes(hour: number, minute: number): number {
  return hour * 60 + minute;
}

// GET - Fetch appointments by client code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, message: 'Client code is required' },
        { status: 400 }
      );
    }

    // Find all SalonClient records matching this client code
    const salonClients = await prisma.salonClient.findMany({
      where: { clientCode: code.trim().toUpperCase() },
      select: {
        id: true,
        salonId: true,
        firstName: true,
        lastName: true,
        salon: {
          select: { businessName: true },
        },
      },
    });

    if (salonClients.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No appointments found for this code' },
        { status: 404 }
      );
    }

    // Fetch appointments for all matching salon clients
    const salonClientIds = salonClients.map((sc) => sc.id);

    const appointments = await prisma.ownerAppointment.findMany({
      where: { salonClientId: { in: salonClientIds } },
      orderBy: [
        { appointmentDate: 'desc' },
        { appointmentHour: 'desc' },
        { appointmentMinute: 'desc' },
      ],
      include: {
        salon: { select: { businessName: true } },
      },
    });

    if (appointments.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No appointments found for this code' },
        { status: 404 }
      );
    }

    // Calculate queue position for pending appointments
    const results = await Promise.all(
      appointments.map(async (appointment) => {
        let queuePosition = 0;
        let totalQueueToday = 0;

        if (appointment.status === 'Pending') {
          const thisAppointmentTime = appointmentToMinutes(
            appointment.appointmentHour,
            appointment.appointmentMinute
          );

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

          const appointmentsAhead = todayAppointments.filter((apt) => {
            if (apt.id === appointment.id) return false;
            const aptTime = appointmentToMinutes(apt.appointmentHour, apt.appointmentMinute);
            return aptTime < thisAppointmentTime;
          }).length;

          queuePosition = appointmentsAhead + 1;
        }

        return {
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
          queuePosition,
          totalQueueToday,
          createdAt: appointment.createdAt.toISOString(),
          updatedAt: appointment.updatedAt.toISOString(),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: results,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching appointments by code:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
