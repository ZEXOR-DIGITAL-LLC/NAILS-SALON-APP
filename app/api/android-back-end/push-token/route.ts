import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// POST - Register push token for a salon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { salonId, pushToken } = body;

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (!pushToken) {
      return NextResponse.json({ error: 'Push token is required' }, { status: 400 });
    }

    // Verify the salon exists
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Save push token to salon
    await prisma.salon.update({
      where: { id: salonId },
      data: { pushToken },
    });

    // Enable booking notifications in settings
    await prisma.notificationSettings.upsert({
      where: { salonId },
      update: { bookingNotificationsEnabled: true },
      create: {
        salonId,
        bookingNotificationsEnabled: true,
        inventoryExpirationEnabled: false,
        daysBeforeExpiration: 7,
        lowStockEnabled: false,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error registering push token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Unregister push token for a salon
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');

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

    // Remove push token
    await prisma.salon.update({
      where: { id: salonId },
      data: { pushToken: null },
    });

    // Disable booking notifications in settings
    await prisma.notificationSettings.upsert({
      where: { salonId },
      update: { bookingNotificationsEnabled: false },
      create: {
        salonId,
        bookingNotificationsEnabled: false,
        inventoryExpirationEnabled: false,
        daysBeforeExpiration: 7,
        lowStockEnabled: false,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error unregistering push token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Check if push notifications are enabled for a salon
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { pushToken: true },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    return NextResponse.json({
      enabled: !!salon.pushToken,
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking push token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
