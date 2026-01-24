import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// PATCH - Activate all employees for a salon
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { salonId } = body;

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

    // Activate all employees for this salon
    const result = await prisma.employee.updateMany({
      where: { salonId },
      data: { isActive: true },
    });

    return NextResponse.json({
      message: 'All employees activated successfully',
      count: result.count,
    }, { status: 200 });
  } catch (error) {
    console.error('Error activating employees:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
