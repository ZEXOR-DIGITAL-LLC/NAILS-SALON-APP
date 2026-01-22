import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET - Fetch product history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');
    const productId = searchParams.get('productId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

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

    // Build where clause for history
    interface WhereClause {
      product: {
        salonId: string;
        id?: string;
      };
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    }

    const whereClause: WhereClause = {
      product: {
        salonId,
      },
    };

    // If productId is provided, verify the product exists and belongs to the salon
    if (productId) {
      const product = await prisma.product.findFirst({
        where: {
          id: productId,
          salonId,
        },
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      whereClause.product.id = productId;
    }

    // Date filters
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = endOfDay;
      }
    }

    const history = await prisma.productHistory.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit ? parseInt(limit) : 100,
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Format the history entries
    const formattedHistory = history.map(entry => ({
      id: entry.id,
      productId: entry.productId,
      productName: entry.product.name,
      action: entry.action,
      previousStock: entry.previousStock,
      newStock: entry.newStock,
      quantity: entry.quantity,
      notes: entry.notes,
      createdAt: entry.createdAt,
      // Human-readable action description
      actionDescription: getActionDescription(entry.action, entry.quantity, entry.previousStock, entry.newStock),
    }));

    return NextResponse.json({
      history: formattedHistory,
      count: formattedHistory.length,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getActionDescription(
  action: string,
  quantity: number | null,
  previousStock: number | null,
  newStock: number | null
): string {
  switch (action) {
    case 'created':
      return `Product created with initial stock of ${newStock ?? 0}`;
    case 'stock_added':
      return `Added ${quantity ?? 0} units (${previousStock ?? 0} → ${newStock ?? 0})`;
    case 'stock_removed':
      return `Removed ${quantity ?? 0} units (${previousStock ?? 0} → ${newStock ?? 0})`;
    case 'updated':
      return 'Product details updated';
    case 'expired':
      return 'Product marked as expired';
    default:
      return action;
  }
}
