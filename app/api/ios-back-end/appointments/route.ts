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
    const employeeIdParam = searchParams.get('employeeId'); // Optional: filter by specific employee

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
      const whereClause: { salonId: string; status: string; employeeId?: string } = {
        salonId,
        status: 'Completed',
      };
      if (employeeIdParam) {
        whereClause.employeeId = employeeIdParam;
      }

      const appointments = await prisma.ownerAppointment.findMany({
        where: whereClause,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
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
      const whereClause: { salonId: string; status: string; employeeId?: string } = {
        salonId,
        status: 'Canceled',
      };
      if (employeeIdParam) {
        whereClause.employeeId = employeeIdParam;
      }

      const appointments = await prisma.ownerAppointment.findMany({
        where: whereClause,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
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

    // Handle today's revenue query - returns today's earnings for dashboard card
    if (typeParam === 'todayRevenue') {
      // Use the date parameter if provided (from client's local timezone), otherwise use server's current date
      const dateParam = searchParams.get('date');
      let todayStr: string;
      if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        todayStr = dateParam;
      } else {
        const now = new Date();
        todayStr = now.toISOString().split('T')[0];
      }
      const todayStart = parseDateToUTC(todayStr);
      const todayEnd = new Date(todayStart);
      todayEnd.setUTCHours(23, 59, 59, 999);

      const result = await prisma.ownerAppointment.aggregate({
        where: {
          salonId,
          status: 'Completed',
          appointmentDate: { gte: todayStart, lte: todayEnd },
          amount: { not: null },
        },
        _sum: { amount: true },
        _count: { id: true },
      });

      return NextResponse.json({
        todayEarnings: result._sum.amount || 0,
        completedWithAmountCount: result._count.id,
        type: 'todayRevenue',
      }, { status: 200 });
    }

    // Handle revenue query - returns earnings data with optional filters
    if (typeParam === 'revenue') {
      const startDateParam = searchParams.get('startDate'); // Optional: range start YYYY-MM-DD
      const endDateParam = searchParams.get('endDate'); // Optional: range end YYYY-MM-DD
      const clientNameParam = searchParams.get('clientName'); // Optional: filter by client

      // Build where clause
      const whereClause: {
        salonId: string;
        status: string;
        amount: { not: null };
        appointmentDate?: { gte?: Date; lte?: Date };
        clientName?: { contains: string; mode: 'insensitive' };
      } = {
        salonId,
        status: 'Completed',
        amount: { not: null }, // Only appointments with amount set
      };

      // Date filtering
      if (startDateParam && /^\d{4}-\d{2}-\d{2}$/.test(startDateParam)) {
        whereClause.appointmentDate = {
          ...whereClause.appointmentDate,
          gte: parseDateToUTC(startDateParam),
        };
      }
      if (endDateParam && /^\d{4}-\d{2}-\d{2}$/.test(endDateParam)) {
        const endDate = parseDateToUTC(endDateParam);
        endDate.setUTCHours(23, 59, 59, 999);
        whereClause.appointmentDate = {
          ...whereClause.appointmentDate,
          lte: endDate,
        };
      }

      // Client name filtering (case-insensitive partial match)
      if (clientNameParam && clientNameParam.trim() !== '') {
        whereClause.clientName = { contains: clientNameParam.trim(), mode: 'insensitive' };
      }

      const appointments = await prisma.ownerAppointment.findMany({
        where: whereClause,
        orderBy: [
          { appointmentDate: 'desc' },
          { appointmentHour: 'desc' },
        ],
        select: {
          id: true,
          clientName: true,
          service: true,
          appointmentDate: true,
          appointmentHour: true,
          appointmentMinute: true,
          amount: true,
        },
      });

      // Calculate totals
      const totalEarnings = appointments.reduce((sum, apt) => sum + (apt.amount || 0), 0);

      return NextResponse.json({
        appointments,
        count: appointments.length,
        totalEarnings,
        type: 'revenue',
      }, { status: 200 });
    }

    // Handle future appointments query
    if (typeParam === 'future') {
      // Get tomorrow's date at midnight UTC (future starts from tomorrow)
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));

      console.log('Fetching future appointments from:', tomorrow);

      const whereClause: {
        salonId: string;
        appointmentDate: { gte: Date };
        status: string;
        employeeId?: string;
      } = {
        salonId,
        appointmentDate: { gte: tomorrow },
        status: 'Pending',
      };
      if (employeeIdParam) {
        whereClause.employeeId = employeeIdParam;
      }

      const appointments = await prisma.ownerAppointment.findMany({
        where: whereClause,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
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

    // Build where clause with optional status and employee filters
    const whereClause: {
      salonId: string;
      appointmentDate: { gte: Date; lte: Date };
      status?: string;
      employeeId?: string;
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

    // Add employee filter if provided
    if (employeeIdParam) {
      whereClause.employeeId = employeeIdParam;
    }

    console.log('Query params:', { salonId, dateStr, startOfDay, endOfDay, status: statusParam, employeeId: employeeIdParam });

    const appointments = await prisma.ownerAppointment.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
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
      employeeId, // Optional: Assign to specific employee
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

    // Validate employeeId if provided
    if (employeeId) {
      const employee = await prisma.employee.findFirst({
        where: { id: employeeId, salonId },
      });
      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }
      if (!employee.isActive) {
        return NextResponse.json({ error: 'Cannot assign to inactive employee' }, { status: 400 });
      }
    }

    // --- OVERLAP AND MARGIN CHECK ---
    const startInMinutes = hour * 60 + minute;
    const endInMinutes = startInMinutes + dHours * 60 + dMinutes;

    // Build where clause for overlap check
    // If employeeId is provided: check against that employee's appointments AND unassigned appointments
    // If employeeId is null: check against ALL salon appointments (preserves backward compatibility)
    let existingAppointments;

    if (employeeId) {
      // When booking with an employee, check against:
      // 1. That employee's appointments (to prevent double-booking the employee)
      // 2. Unassigned appointments (which could be assigned to this employee later)
      existingAppointments = await prisma.ownerAppointment.findMany({
        where: {
          salonId,
          appointmentDate: parsedDate,
          status: 'Pending',
          OR: [
            { employeeId: employeeId },
            { employeeId: null },
          ],
        },
      });
    } else {
      // When booking without an employee (unassigned), check against ALL appointments
      // This preserves backward compatibility
      existingAppointments = await prisma.ownerAppointment.findMany({
        where: {
          salonId,
          appointmentDate: parsedDate,
          status: 'Pending',
        },
      });
    }

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
        employeeId: employeeId || null, // Optional employee assignment
        clientName: clientName.trim(),
        service: service.trim(),
        appointmentDate: parsedDate,
        appointmentHour: hour,
        appointmentMinute: minute,
        durationHours: dHours,
        durationMinutes: dMinutes,
        status: 'Pending',
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
      employeeId, // Optional: Reassign to different employee
      clientName,
      service,
      appointmentDate,
      appointmentHour,
      appointmentMinute,
      durationHours,
      durationMinutes,
      status,
      amount,
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

    // Handle employeeId update (allow setting to null to unassign)
    let targetEmployeeId = currentAppointment.employeeId;
    if (employeeId !== undefined) {
      if (employeeId === null || employeeId === '') {
        updateData.employeeId = null;
        targetEmployeeId = null;
      } else {
        // Validate the new employee
        const employee = await prisma.employee.findFirst({
          where: { id: employeeId, salonId },
        });
        if (!employee) {
          return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }
        if (!employee.isActive) {
          return NextResponse.json({ error: 'Cannot assign to inactive employee' }, { status: 400 });
        }
        updateData.employeeId = employeeId;
        targetEmployeeId = employeeId;
      }
    }

    // Handle amount update (only for completed appointments)
    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        return NextResponse.json({ error: 'Amount must be a non-negative number' }, { status: 400 });
      }
      // Only allow amount on completed appointments
      const appointmentStatus = status || currentAppointment.status;
      if (appointmentStatus !== 'Completed') {
        return NextResponse.json({ error: 'Amount can only be set for completed appointments' }, { status: 400 });
      }
      updateData.amount = parsedAmount;
    }

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

    // --- OVERLAP CHECK (only if time/date/duration/employee changed and status is Pending) ---
    const isPending = (status || currentAppointment.status) === 'Pending';
    const timeOrEmployeeChanged =
      appointmentHour !== undefined ||
      appointmentMinute !== undefined ||
      durationHours !== undefined ||
      durationMinutes !== undefined ||
      appointmentDate !== undefined ||
      employeeId !== undefined;

    if (isPending && timeOrEmployeeChanged) {
      const hour = updateData.appointmentHour ?? currentAppointment.appointmentHour;
      const minute = updateData.appointmentMinute ?? currentAppointment.appointmentMinute;
      const dHours = updateData.durationHours ?? currentAppointment.durationHours;
      const dMinutes = updateData.durationMinutes ?? currentAppointment.durationMinutes;

      const startInMinutes = hour * 60 + minute;
      const endInMinutes = startInMinutes + dHours * 60 + dMinutes;

      // Build overlap check where clause
      // If targetEmployeeId is set: check against that employee's appointments AND unassigned
      // If null: check against ALL salon appointments (backward compatibility)
      let existingAppointments;

      if (targetEmployeeId) {
        // Check against this employee's appointments + unassigned appointments
        existingAppointments = await prisma.ownerAppointment.findMany({
          where: {
            salonId,
            appointmentDate: targetDate,
            status: 'Pending',
            id: { not: id },
            OR: [
              { employeeId: targetEmployeeId },
              { employeeId: null },
            ],
          },
        });
      } else {
        // Check against ALL appointments when unassigned
        existingAppointments = await prisma.ownerAppointment.findMany({
          where: {
            salonId,
            appointmentDate: targetDate,
            status: 'Pending',
            id: { not: id },
          },
        });
      }

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
