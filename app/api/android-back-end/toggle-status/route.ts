import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// PATCH - Toggle salon isOpen status (real-time update)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { salonId, isOpen } = body;

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (typeof isOpen !== 'boolean') {
      return NextResponse.json({ error: 'isOpen must be a boolean' }, { status: 400 });
    }

    // Verify the salon exists
    const existingSalon = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!existingSalon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Update the salon's isOpen status
    const updatedSalon = await prisma.salon.update({
      where: { id: salonId },
      data: { isOpen },
      select: {
        id: true,
        isOpen: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: isOpen ? 'Salon is now open for bookings' : 'Salon is now closed for bookings',
        isOpen: updatedSalon.isOpen,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error toggling salon status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
