import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET - Fetch salon notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');
    const type = searchParams.get('type'); // 'count' | null (all)

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // If type is 'count', just return the counts
    if (type === 'count') {
      const unreadCount = await prisma.salonNotification.count({
        where: {
          salonId,
          isRead: false,
        },
      });

      return NextResponse.json({ unreadCount }, { status: 200 });
    }

    // Fetch all non-read notifications (latest first)
    const notifications = await prisma.salonNotification.findMany({
      where: { salonId },
      orderBy: [
        { isRead: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 50, // Limit to recent 50
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json(
      { notifications, unreadCount },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching salon notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update notification (mark as read)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { salonId, notificationId, action } = body;

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    const notification = await prisma.salonNotification.findFirst({
      where: {
        id: notificationId,
        salonId,
      },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    switch (action) {
      case 'read':
        await prisma.salonNotification.update({
          where: { id: notificationId },
          data: { isRead: true },
        });
        break;
      case 'markAllRead':
        await prisma.salonNotification.updateMany({
          where: { salonId, isRead: false },
          data: { isRead: true },
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(
      { message: 'Notification updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating salon notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a salon notification
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');
    const notificationId = searchParams.get('id');

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const notification = await prisma.salonNotification.findFirst({
      where: {
        id: notificationId,
        salonId,
      },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    await prisma.salonNotification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({ message: 'Notification deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting salon notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
