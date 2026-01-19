import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET - Fetch public galleries for booking page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const { salonId } = await params;

    if (!salonId) {
      return NextResponse.json(
        { success: false, error: 'Salon ID is required' },
        { status: 400 }
      );
    }

    // Verify salon exists
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { id: true },
    });

    if (!salon) {
      return NextResponse.json(
        { success: false, error: 'Salon not found' },
        { status: 404 }
      );
    }

    // Fetch galleries with images (public view)
    const galleries = await prisma.gallery.findMany({
      where: { salonId },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        success: true,
        galleries,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching public galleries:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
