import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Helper function to send push notification
async function sendAutoSchedulePushNotification(
  pushToken: string,
  title: string,
  body: string
) {
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify({
        to: pushToken,
        title,
        body,
        sound: 'default',
        priority: 'high',
        channelId: 'bookings-v3',
        data: { type: 'auto_schedule' },
      }),
    });
  } catch (error) {
    console.error('Failed to send auto-schedule push notification:', error);
  }
}

// POST - Check and perform auto-schedule toggle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { salonId, currentHour, currentMinute, currentDayOfWeek, currentDate } = body;

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (
      typeof currentHour !== 'number' ||
      typeof currentMinute !== 'number' ||
      typeof currentDayOfWeek !== 'number' ||
      typeof currentDate !== 'string'
    ) {
      return NextResponse.json(
        { error: 'currentHour, currentMinute, currentDayOfWeek (numbers) and currentDate (string) are required' },
        { status: 400 }
      );
    }

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: {
        id: true,
        isOpen: true,
        workingDays: true,
        openingHour: true,
        openingMinute: true,
        closingHour: true,
        closingMinute: true,
        lastAutoOpenDate: true,
        lastAutoCloseDate: true,
        pushToken: true,
      },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Check if today is a working day
    const isWorkingDay = salon.workingDays.includes(currentDayOfWeek);

    if (!isWorkingDay) {
      return NextResponse.json(
        { action: null, isOpen: salon.isOpen },
        { status: 200 }
      );
    }

    const currentMinutes = currentHour * 60 + currentMinute;
    const openingMinutes = salon.openingHour * 60 + salon.openingMinute;
    const closingMinutes = salon.closingHour * 60 + salon.closingMinute;

    // Auto-Open: It's past opening time, salon is closed, and hasn't been auto-opened today
    if (
      currentMinutes >= openingMinutes &&
      currentMinutes < closingMinutes &&
      !salon.isOpen &&
      salon.lastAutoOpenDate !== currentDate
    ) {
      await prisma.salon.update({
        where: { id: salonId },
        data: {
          isOpen: true,
          lastAutoOpenDate: currentDate,
        },
      });

      // Create salon notification
      await prisma.salonNotification.create({
        data: {
          salonId,
          type: 'auto_opened',
          message: `Your salon was automatically opened at your scheduled opening time.`,
        },
      });

      // Send push notification if token exists
      if (salon.pushToken) {
        await sendAutoSchedulePushNotification(
          salon.pushToken,
          'Salon Auto-Opened',
          'Your salon has been automatically opened based on your working hours.'
        );
      }

      return NextResponse.json(
        { action: 'opened', isOpen: true },
        { status: 200 }
      );
    }

    // Auto-Close: It's past closing time, salon is open, and hasn't been auto-closed today
    if (
      currentMinutes >= closingMinutes &&
      salon.isOpen &&
      salon.lastAutoCloseDate !== currentDate
    ) {
      await prisma.salon.update({
        where: { id: salonId },
        data: {
          isOpen: false,
          lastAutoCloseDate: currentDate,
        },
      });

      // Create salon notification
      await prisma.salonNotification.create({
        data: {
          salonId,
          type: 'auto_closed',
          message: `Your salon was automatically closed at your scheduled closing time.`,
        },
      });

      // Send push notification if token exists
      if (salon.pushToken) {
        await sendAutoSchedulePushNotification(
          salon.pushToken,
          'Salon Auto-Closed',
          'Your salon has been automatically closed based on your working hours.'
        );
      }

      return NextResponse.json(
        { action: 'closed', isOpen: false },
        { status: 200 }
      );
    }

    // No action needed
    return NextResponse.json(
      { action: null, isOpen: salon.isOpen },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in auto-schedule check:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
