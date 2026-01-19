import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET - Fetch all employees for a salon
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

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

    // Build where clause
    const whereClause: { salonId: string; isActive?: boolean } = { salonId };
    if (activeOnly) {
      whereClause.isActive = true;
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        isActive: true,
        color: true,
        specialties: true,
        order: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      employees,
      count: employees.length,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { salonId, name, color, specialties, order } = body;

    // Validate required fields
    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Employee name is required' }, { status: 400 });
    }

    // Verify the salon exists
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Get current max order if not provided
    let employeeOrder = order;
    if (employeeOrder === undefined) {
      const maxOrderEmployee = await prisma.employee.findFirst({
        where: { salonId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      employeeOrder = maxOrderEmployee ? maxOrderEmployee.order + 1 : 0;
    }

    // Create the employee
    const employee = await prisma.employee.create({
      data: {
        salonId,
        name: name.trim(),
        color: color || null,
        specialties: specialties || [],
        order: employeeOrder,
        isActive: true,
      },
    });

    return NextResponse.json({
      message: 'Employee created successfully',
      employee,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update an employee
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, salonId, name, color, specialties, isActive, order } = body;

    if (!id || !salonId) {
      return NextResponse.json({ error: 'ID and Salon ID are required' }, { status: 400 });
    }

    // Find the employee and verify ownership
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id,
        salonId,
      },
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: {
      name?: string;
      color?: string | null;
      specialties?: string[];
      isActive?: boolean;
      order?: number;
    } = {};

    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json({ error: 'Employee name cannot be empty' }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (color !== undefined) {
      updateData.color = color || null;
    }

    if (specialties !== undefined) {
      updateData.specialties = specialties;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    if (order !== undefined) {
      updateData.order = parseInt(order, 10);
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete an employee
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const salonId = searchParams.get('salonId');

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    // Find the employee and verify ownership
    const employee = await prisma.employee.findFirst({
      where: {
        id,
        salonId,
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found or access denied' }, { status: 404 });
    }

    // Note: Due to onDelete: SetNull on OwnerAppointment.employee relation,
    // deleting an employee will set employeeId to null on all their appointments
    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Employee deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
