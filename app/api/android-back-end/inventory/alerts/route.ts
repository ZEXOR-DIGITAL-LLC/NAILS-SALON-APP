import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET - Fetch inventory alerts (low stock, critical, expiring, expired)
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

    // Fetch all active products
    const products = await prisma.product.findMany({
      where: {
        salonId,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Categorize alerts
    const lowStockProducts: typeof products = [];
    const criticalStockProducts: typeof products = [];
    const expiringProducts: typeof products = [];
    const expiredProducts: typeof products = [];

    // Track expired product IDs for batch update
    const newlyExpiredIds: string[] = [];

    for (const product of products) {
      const isExpired = product.isExpired ||
        (product.expirationDate && new Date(product.expirationDate) < now);
      const isExpiring = product.expirationDate &&
        new Date(product.expirationDate) >= now &&
        new Date(product.expirationDate) <= thirtyDaysFromNow;

      // Track newly expired products
      if (isExpired && !product.isExpired) {
        newlyExpiredIds.push(product.id);
      }

      if (isExpired) {
        expiredProducts.push(product);
      } else {
        // Only check stock levels for non-expired products
        if (product.currentStock <= product.criticalPoint) {
          criticalStockProducts.push(product);
        } else if (product.currentStock <= product.reorderPoint) {
          lowStockProducts.push(product);
        }

        if (isExpiring) {
          expiringProducts.push(product);
        }
      }
    }

    // Update newly expired products in database
    if (newlyExpiredIds.length > 0) {
      await prisma.product.updateMany({
        where: { id: { in: newlyExpiredIds } },
        data: { isExpired: true },
      });

      // Create history entries for expired products
      await prisma.productHistory.createMany({
        data: newlyExpiredIds.map(id => ({
          productId: id,
          salonId: salonId!,
          action: 'expired',
          notes: 'Product marked as expired automatically',
        })),
      });
    }

    // Format products for response
    const formatProduct = (product: typeof products[0], alertType: string) => ({
      id: product.id,
      name: product.name,
      category: product.category?.name || null,
      currentStock: product.currentStock,
      reorderPoint: product.reorderPoint,
      criticalPoint: product.criticalPoint,
      expirationDate: product.expirationDate,
      daysUntilExpiration: product.expirationDate
        ? Math.ceil((new Date(product.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null,
      alertType,
    });

    const alerts = {
      lowStock: lowStockProducts.map(p => formatProduct(p, 'low')),
      criticalStock: criticalStockProducts.map(p => formatProduct(p, 'critical')),
      expiring: expiringProducts.map(p => formatProduct(p, 'expiring')),
      expired: expiredProducts.map(p => formatProduct(p, 'expired')),
    };

    const summary = {
      lowStockCount: lowStockProducts.length,
      criticalStockCount: criticalStockProducts.length,
      expiringCount: expiringProducts.length,
      expiredCount: expiredProducts.length,
      totalAlerts:
        lowStockProducts.length +
        criticalStockProducts.length +
        expiringProducts.length +
        expiredProducts.length,
    };

    return NextResponse.json({
      alerts,
      summary,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
