import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Helper function to send push notification for inventory alerts
async function sendInventoryPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
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
        channelId: 'inventory-alerts',
        data: data || {},
      }),
    });
  } catch (error) {
    console.error('Failed to send inventory push notification:', error);
  }
}

// GET - Fetch inventory notifications for a salon
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const type = searchParams.get('type'); // 'count' | 'expiring' | 'expired' | 'low_stock' | 'critical_stock' | null (all)

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

    // Check if notifications are enabled
    const settings = await prisma.notificationSettings.findUnique({
      where: { salonId },
    });

    const expirationEnabled = settings?.inventoryExpirationEnabled ?? false;
    const lowStockEnabled = settings?.lowStockEnabled ?? false;

    if (!expirationEnabled && !lowStockEnabled) {
      return NextResponse.json(
        {
          notifications: [],
          count: 0,
          unreadCount: 0,
          enabled: false
        },
        { status: 200 }
      );
    }

    // Refresh notifications based on current product states (with 60s time guard)
    const latestNotification = await prisma.inventoryNotification.findFirst({
      where: { salonId },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    });
    const shouldRefresh = !latestNotification ||
      (Date.now() - latestNotification.updatedAt.getTime() > 60000);

    if (shouldRefresh) {
      if (expirationEnabled) {
        await refreshExpirationNotifications(salonId, settings!.daysBeforeExpiration, salon.pushToken);
      }
      if (lowStockEnabled) {
        await refreshLowStockNotifications(salonId, salon.pushToken);
      }
    }

    // If type is 'count', just return the count
    if (type === 'count') {
      const count = await prisma.inventoryNotification.count({
        where: {
          salonId,
          isArchived: false,
        },
      });

      const unreadCount = await prisma.inventoryNotification.count({
        where: {
          salonId,
          isArchived: false,
          isRead: false,
        },
      });

      return NextResponse.json({ count, unreadCount, enabled: true }, { status: 200 });
    }

    // Build the where clause
    const whereClause: {
      salonId: string;
      isArchived?: boolean;
      type?: string;
    } = { salonId };

    if (!includeArchived) {
      whereClause.isArchived = false;
    }

    if (type && type !== 'count') {
      whereClause.type = type;
    }

    // Fetch notifications
    const notifications = await prisma.inventoryNotification.findMany({
      where: whereClause,
      orderBy: [
        { isRead: 'asc' }, // Unread first
        { createdAt: 'desc' }, // Then by newest
      ],
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json(
      {
        notifications,
        count: notifications.length,
        unreadCount,
        enabled: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching inventory notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update notification (mark as read, archive)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { salonId, notificationId, action, notificationIds } = body;

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

    // Handle bulk actions
    if (notificationIds && Array.isArray(notificationIds)) {
      if (action === 'markAllRead') {
        await prisma.inventoryNotification.updateMany({
          where: {
            id: { in: notificationIds },
            salonId,
          },
          data: { isRead: true },
        });
        return NextResponse.json({ message: 'All notifications marked as read' }, { status: 200 });
      }

      if (action === 'archiveAll') {
        await prisma.inventoryNotification.updateMany({
          where: {
            id: { in: notificationIds },
            salonId,
          },
          data: { isArchived: true },
        });
        return NextResponse.json({ message: 'All notifications archived' }, { status: 200 });
      }
    }

    // Handle single notification actions
    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    // Verify the notification exists and belongs to the salon
    const notification = await prisma.inventoryNotification.findFirst({
      where: {
        id: notificationId,
        salonId,
      },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    let updatedNotification;

    switch (action) {
      case 'read':
        updatedNotification = await prisma.inventoryNotification.update({
          where: { id: notificationId },
          data: { isRead: true },
        });
        break;
      case 'unread':
        updatedNotification = await prisma.inventoryNotification.update({
          where: { id: notificationId },
          data: { isRead: false },
        });
        break;
      case 'archive':
        updatedNotification = await prisma.inventoryNotification.update({
          where: { id: notificationId },
          data: { isArchived: true },
        });
        break;
      case 'unarchive':
        updatedNotification = await prisma.inventoryNotification.update({
          where: { id: notificationId },
          data: { isArchived: false },
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: 'Notification updated successfully',
        notification: updatedNotification,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete notification
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

    // Verify the salon exists
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Verify the notification exists and belongs to the salon
    const notification = await prisma.inventoryNotification.findFirst({
      where: {
        id: notificationId,
        salonId,
      },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    await prisma.inventoryNotification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({ message: 'Notification deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to refresh expiration notifications
async function refreshExpirationNotifications(salonId: string, daysBeforeExpiration: number, pushToken?: string | null) {
  try {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysBeforeExpiration);

    // Find products that are expiring within the configured days
    const expiringProducts = await prisma.product.findMany({
      where: {
        salonId,
        isActive: true,
        expirationDate: {
          not: null,
          lte: futureDate,
          gte: now,
        },
      },
    });

    // Find products that have already expired
    const expiredProducts = await prisma.product.findMany({
      where: {
        salonId,
        isActive: true,
        expirationDate: {
          not: null,
          lt: now,
        },
      },
    });

    let newExpiringCount = 0;
    let newExpiredCount = 0;

    // Create notifications for expiring products (if not already exists)
    for (const product of expiringProducts) {
      if (!product.expirationDate) continue;

      const existingNotification = await prisma.inventoryNotification.findFirst({
        where: {
          salonId,
          productId: product.id,
          type: 'expiring',
          isArchived: false,
        },
      });

      const daysUntilExpiry = Math.ceil(
        (product.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (!existingNotification) {
        await prisma.inventoryNotification.create({
          data: {
            salonId,
            productId: product.id,
            productName: product.name,
            type: 'expiring',
            message: `${product.name} expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`,
            expiresAt: product.expirationDate,
          },
        });
        newExpiringCount++;
      } else {
        // Update the message with current days remaining
        await prisma.inventoryNotification.update({
          where: { id: existingNotification.id },
          data: {
            message: `${product.name} expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`,
          },
        });
      }
    }

    // Convert expiring notifications to expired if product has expired
    for (const product of expiredProducts) {
      if (!product.expirationDate) continue;

      // Check if there's an existing 'expiring' notification to convert
      const expiringNotification = await prisma.inventoryNotification.findFirst({
        where: {
          salonId,
          productId: product.id,
          type: 'expiring',
          isArchived: false,
        },
      });

      if (expiringNotification) {
        // Convert to expired
        await prisma.inventoryNotification.update({
          where: { id: expiringNotification.id },
          data: {
            type: 'expired',
            message: `${product.name} has expired`,
            isRead: false, // Mark as unread since status changed
          },
        });
        newExpiredCount++;
      } else {
        // Check if expired notification already exists
        const existingExpiredNotification = await prisma.inventoryNotification.findFirst({
          where: {
            salonId,
            productId: product.id,
            type: 'expired',
            isArchived: false,
          },
        });

        if (!existingExpiredNotification) {
          await prisma.inventoryNotification.create({
            data: {
              salonId,
              productId: product.id,
              productName: product.name,
              type: 'expired',
              message: `${product.name} has expired`,
              expiresAt: product.expirationDate,
            },
          });
          newExpiredCount++;
        }
      }
    }

    // Send push notification for new expiration alerts
    if (pushToken && (newExpiringCount > 0 || newExpiredCount > 0)) {
      const parts: string[] = [];
      if (newExpiringCount > 0) {
        parts.push(`${newExpiringCount} item${newExpiringCount === 1 ? '' : 's'} expiring soon`);
      }
      if (newExpiredCount > 0) {
        parts.push(`${newExpiredCount} item${newExpiredCount === 1 ? ' has' : 's have'} expired`);
      }
      await sendInventoryPushNotification(
        pushToken,
        'Inventory Expiration Alert',
        parts.join(', '),
        { type: 'expiration' }
      );
    }

    // Remove expiration notifications for products that are no longer expiring soon
    // (e.g., expiration date was updated or product was deleted)
    const allActiveExpirationNotifications = await prisma.inventoryNotification.findMany({
      where: {
        salonId,
        isArchived: false,
        type: { in: ['expiring', 'expired'] },
      },
    });

    const expiringProductIds = new Set(expiringProducts.map((p) => p.id));
    const expiredProductIds = new Set(expiredProducts.map((p) => p.id));

    for (const notification of allActiveExpirationNotifications) {
      const productStillRelevant =
        (notification.type === 'expiring' && expiringProductIds.has(notification.productId)) ||
        (notification.type === 'expired' && expiredProductIds.has(notification.productId));

      if (!productStillRelevant) {
        await prisma.inventoryNotification.update({
          where: { id: notification.id },
          data: { isArchived: true },
        });
      }
    }
  } catch (error) {
    console.error('Error refreshing expiration notifications:', error);
  }
}

// Helper function to refresh low stock notifications
async function refreshLowStockNotifications(salonId: string, pushToken?: string | null) {
  try {
    // Prisma doesn't support field-to-field comparison, so we filter in application code
    const allActiveProducts = await prisma.product.findMany({
      where: {
        salonId,
        isActive: true,
      },
    });

    const lowProducts = allActiveProducts.filter(
      (p) => p.currentStock <= p.reorderPoint && p.currentStock > p.criticalPoint
    );

    const criticalProducts = allActiveProducts.filter(
      (p) => p.currentStock <= p.criticalPoint
    );

    let newLowCount = 0;
    let newCriticalCount = 0;

    // Create/update notifications for low stock products
    for (const product of lowProducts) {
      const existingNotification = await prisma.inventoryNotification.findFirst({
        where: {
          salonId,
          productId: product.id,
          type: { in: ['low_stock', 'critical_stock'] },
          isArchived: false,
        },
      });

      if (!existingNotification) {
        await prisma.inventoryNotification.create({
          data: {
            salonId,
            productId: product.id,
            productName: product.name,
            type: 'low_stock',
            message: `${product.name} is low on stock (${product.currentStock} remaining)`,
          },
        });
        newLowCount++;
      } else if (existingNotification.type === 'critical_stock') {
        // Upgrade from critical back to low (stock was replenished partially)
        await prisma.inventoryNotification.update({
          where: { id: existingNotification.id },
          data: {
            type: 'low_stock',
            message: `${product.name} is low on stock (${product.currentStock} remaining)`,
            isRead: false,
          },
        });
      } else {
        // Update the message with current stock count
        await prisma.inventoryNotification.update({
          where: { id: existingNotification.id },
          data: {
            message: `${product.name} is low on stock (${product.currentStock} remaining)`,
          },
        });
      }
    }

    // Create/update notifications for critical stock products
    for (const product of criticalProducts) {
      const existingNotification = await prisma.inventoryNotification.findFirst({
        where: {
          salonId,
          productId: product.id,
          type: { in: ['low_stock', 'critical_stock'] },
          isArchived: false,
        },
      });

      if (!existingNotification) {
        await prisma.inventoryNotification.create({
          data: {
            salonId,
            productId: product.id,
            productName: product.name,
            type: 'critical_stock',
            message: `${product.name} is critically low on stock (${product.currentStock} remaining)`,
          },
        });
        newCriticalCount++;
      } else if (existingNotification.type === 'low_stock') {
        // Downgrade from low to critical (stock decreased further)
        await prisma.inventoryNotification.update({
          where: { id: existingNotification.id },
          data: {
            type: 'critical_stock',
            message: `${product.name} is critically low on stock (${product.currentStock} remaining)`,
            isRead: false,
          },
        });
        newCriticalCount++;
      } else {
        // Update the message with current stock count
        await prisma.inventoryNotification.update({
          where: { id: existingNotification.id },
          data: {
            message: `${product.name} is critically low on stock (${product.currentStock} remaining)`,
          },
        });
      }
    }

    // Send push notification for new stock alerts
    if (pushToken && (newLowCount > 0 || newCriticalCount > 0)) {
      const parts: string[] = [];
      if (newCriticalCount > 0) {
        parts.push(`${newCriticalCount} item${newCriticalCount === 1 ? '' : 's'} critically low`);
      }
      if (newLowCount > 0) {
        parts.push(`${newLowCount} item${newLowCount === 1 ? '' : 's'} low on stock`);
      }
      await sendInventoryPushNotification(
        pushToken,
        'Low Stock Alert',
        parts.join(', '),
        { type: 'low_stock' }
      );
    }

    // Archive stock notifications for products that are no longer low/critical
    const allActiveStockNotifications = await prisma.inventoryNotification.findMany({
      where: {
        salonId,
        isArchived: false,
        type: { in: ['low_stock', 'critical_stock'] },
      },
    });

    const lowProductIds = new Set(lowProducts.map((p) => p.id));
    const criticalProductIds = new Set(criticalProducts.map((p) => p.id));

    for (const notification of allActiveStockNotifications) {
      const productStillRelevant =
        (notification.type === 'low_stock' && lowProductIds.has(notification.productId)) ||
        (notification.type === 'critical_stock' && criticalProductIds.has(notification.productId));

      if (!productStillRelevant) {
        await prisma.inventoryNotification.update({
          where: { id: notification.id },
          data: { isArchived: true },
        });
      }
    }
  } catch (error) {
    console.error('Error refreshing low stock notifications:', error);
  }
}
