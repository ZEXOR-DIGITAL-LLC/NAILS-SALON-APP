import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET - Fetch notification settings for a salon
export async function GET(request: NextRequest) {
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

    // Get or create notification settings
    let settings = await prisma.notificationSettings.findUnique({
      where: { salonId },
    });

    // If settings don't exist, create default settings
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          salonId,
          inventoryExpirationEnabled: false,
          daysBeforeExpiration: 7,
          lowStockEnabled: false,
        },
      });
    }

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update notification settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { salonId, inventoryExpirationEnabled, daysBeforeExpiration, lowStockEnabled } = body;

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

    // Build update data
    const updateData: {
      inventoryExpirationEnabled?: boolean;
      daysBeforeExpiration?: number;
      lowStockEnabled?: boolean;
    } = {};

    if (inventoryExpirationEnabled !== undefined) {
      updateData.inventoryExpirationEnabled = inventoryExpirationEnabled;
    }
    if (daysBeforeExpiration !== undefined) {
      updateData.daysBeforeExpiration = daysBeforeExpiration;
    }
    if (lowStockEnabled !== undefined) {
      updateData.lowStockEnabled = lowStockEnabled;
    }

    // Upsert the settings
    const settings = await prisma.notificationSettings.upsert({
      where: { salonId },
      update: updateData,
      create: {
        salonId,
        inventoryExpirationEnabled: inventoryExpirationEnabled ?? false,
        daysBeforeExpiration: daysBeforeExpiration ?? 7,
        lowStockEnabled: lowStockEnabled ?? false,
      },
    });

    // If expiration notifications were enabled, generate notifications for expiring products
    if (inventoryExpirationEnabled) {
      await generateExpirationNotifications(salonId, settings.daysBeforeExpiration);
    }

    // If low stock notifications were enabled, generate notifications for low stock products
    if (lowStockEnabled) {
      await generateLowStockNotifications(salonId);
    }

    return NextResponse.json(
      {
        message: 'Settings updated successfully',
        settings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate expiration notifications
async function generateExpirationNotifications(salonId: string, daysBeforeExpiration: number) {
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
          gte: now, // Not yet expired
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

      if (!existingNotification) {
        const daysUntilExpiry = Math.ceil(
          (product.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

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
      }
    }

    // Create notifications for expired products (if not already exists)
    for (const product of expiredProducts) {
      if (!product.expirationDate) continue;

      const existingNotification = await prisma.inventoryNotification.findFirst({
        where: {
          salonId,
          productId: product.id,
          type: 'expired',
          isArchived: false,
        },
      });

      if (!existingNotification) {
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
      }
    }
  } catch (error) {
    console.error('Error generating expiration notifications:', error);
  }
}

// Helper function to generate low stock notifications
async function generateLowStockNotifications(salonId: string) {
  try {
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
      }
    }

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
      }
    }
  } catch (error) {
    console.error('Error generating low stock notifications:', error);
  }
}
