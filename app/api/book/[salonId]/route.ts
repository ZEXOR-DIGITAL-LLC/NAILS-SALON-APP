import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Helper function to parse YYYY-MM-DD string to UTC start of day
function parseDateToUTC(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Create date at UTC midnight for the specified date
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

// GET - Fetch public salon info for booking page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const { salonId } = await params;

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    // Fetch salon with only public info (no sensitive data like email, coordinates)
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: {
        id: true,
        businessName: true,
        businessImage: true,
        type: true,
        address: true,
        city: true,
        country: true,
        phoneCode: true,
        phoneNumber: true,
        // Business Hours
        isOpen: true,
        workingDays: true,
        openingHour: true,
        openingMinute: true,
        closingHour: true,
        closingMinute: true,
      },
    });

    if (!salon) {
      return NextResponse.json(
        { success: false, error: 'Salon not found' },
        { status: 404 }
      );
    }

    // Fetch active employees for the salon
    const employees = await prisma.employee.findMany({
      where: {
        salonId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        salon,
        employees,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching salon:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper to generate the next client code for a salon (CLT-0001, CLT-0002, etc.)
async function generateNextClientCode(salonId: string): Promise<string> {
  const lastClient = await prisma.salonClient.findFirst({
    where: { salonId, clientCode: { not: null } },
    orderBy: { clientCode: 'desc' },
    select: { clientCode: true },
  });

  let nextNumber = 1;
  if (lastClient?.clientCode) {
    const match = lastClient.clientCode.match(/CLT-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `CLT-${nextNumber.toString().padStart(4, '0')}`;
}

// POST - Create a new appointment (public booking)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const { salonId } = await params;
    const body = await request.json();
    const {
      clientName,
      service,
      appointmentDate,
      appointmentHour,
      appointmentMinute,
      durationHours = 0,
      durationMinutes = 0,
      employeeId = null, // Optional: client can select a specific employee
      clientCode = null, // Optional: existing client code for linking
    } = body;

    // Validate salonId
    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    // Validate required fields
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

    // Check if salon is open for bookings
    if (!salon.isOpen) {
      return NextResponse.json(
        {
          success: false,
          error: 'This salon is currently not accepting bookings',
          code: 'SALON_CLOSED',
        },
        { status: 403 }
      );
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

    // Validate employee if selected
    let selectedEmployeeId: string | null = null;
    if (employeeId) {
      const activeEmployees = await prisma.employee.findMany({
        where: {
          salonId,
          isActive: true,
        },
        select: { id: true },
      });
      const selectedEmployee = activeEmployees.find(emp => emp.id === employeeId);
      if (!selectedEmployee) {
        return NextResponse.json(
          { error: 'Selected employee is not available.' },
          { status: 400 }
        );
      }
      selectedEmployeeId = employeeId;
    }

    // Handle client code: lookup existing or create new SalonClient
    let salonClientId: string | null = null;
    let assignedClientCode: string | null = null;

    if (clientCode && clientCode.trim()) {
      // Look up existing client by code
      const existingClient = await prisma.salonClient.findFirst({
        where: { salonId, clientCode: clientCode.trim().toUpperCase() },
      });
      if (existingClient) {
        salonClientId = existingClient.id;
        assignedClientCode = existingClient.clientCode;
      }
    }

    // Auto-create SalonClient if not found by code
    if (!salonClientId) {
      const nameParts = clientName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Check if client with same name already exists
      const existingByName = await prisma.salonClient.findFirst({
        where: {
          salonId,
          firstName: { equals: firstName, mode: 'insensitive' },
          lastName: { equals: lastName, mode: 'insensitive' },
        },
      });

      if (existingByName) {
        salonClientId = existingByName.id;
        // Backfill code if missing
        if (!existingByName.clientCode) {
          const newCode = await generateNextClientCode(salonId);
          await prisma.salonClient.update({
            where: { id: existingByName.id },
            data: { clientCode: newCode },
          });
          assignedClientCode = newCode;
        } else {
          assignedClientCode = existingByName.clientCode;
        }
      } else {
        // Create new client with auto-generated code
        const newCode = await generateNextClientCode(salonId);
        const newClient = await prisma.salonClient.create({
          data: {
            salonId,
            clientCode: newCode,
            firstName,
            lastName,
          },
        });
        salonClientId = newClient.id;
        assignedClientCode = newCode;
      }
    }

    // Create the appointment (with optional employee assignment and client linking)
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
        employeeId: selectedEmployeeId,
        salonClientId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment booked successfully',
        appointment: {
          id: appointment.id,
          appointmentDate: appointment.appointmentDate,
          appointmentHour: appointment.appointmentHour,
          appointmentMinute: appointment.appointmentMinute,
          durationHours: appointment.durationHours,
          durationMinutes: appointment.durationMinutes,
          service: appointment.service,
          clientName: appointment.clientName,
        },
        clientCode: assignedClientCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
