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

// PATCH - Adjust stock level for a product
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, salonId, quantity, action, notes } = body;

    // Validate required fields
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (quantity === undefined || quantity === null) {
      return NextResponse.json({ error: 'Quantity is required' }, { status: 400 });
    }

    const adjustQuantity = parseInt(quantity);
    if (isNaN(adjustQuantity) || adjustQuantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 });
    }

    if (!action || !['add', 'remove'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "add" or "remove"' }, { status: 400 });
    }

    // Find the product and verify ownership
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        salonId,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product is expired - prevent stock changes on expired products
    if (product.isExpired || (product.expirationDate && new Date(product.expirationDate) < new Date())) {
      return NextResponse.json({
        error: 'Cannot adjust stock for expired products',
      }, { status: 400 });
    }

    // Calculate new stock
    const previousStock = product.currentStock;
    let newStock: number;

    if (action === 'add') {
      newStock = previousStock + adjustQuantity;
    } else {
      newStock = previousStock - adjustQuantity;
      // Prevent negative stock
      if (newStock < 0) {
        return NextResponse.json({
          error: 'Cannot remove more stock than available',
          availableStock: previousStock,
        }, { status: 400 });
      }
    }

    // Update the product stock
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { currentStock: newStock },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create history entry
    await prisma.productHistory.create({
      data: {
        productId,
        action: action === 'add' ? 'stock_added' : 'stock_removed',
        previousStock,
        newStock,
        quantity: adjustQuantity,
        notes: notes?.trim() || null,
      },
    });

    // Calculate status
    const isExpired = updatedProduct.isExpired;
    let status: 'ok' | 'low' | 'critical' | 'expired' = 'ok';
    if (isExpired) {
      status = 'expired';
    } else if (newStock <= updatedProduct.criticalPoint) {
      status = 'critical';
    } else if (newStock <= updatedProduct.reorderPoint) {
      status = 'low';
    }

    // Send push notification if stock crossed a threshold (only when removing stock)
    if (action === 'remove' && (status === 'low' || status === 'critical')) {
      // Check if this is a new threshold crossing (previous stock was above the threshold)
      const previousStatus = previousStock <= updatedProduct.criticalPoint
        ? 'critical'
        : previousStock <= updatedProduct.reorderPoint
          ? 'low'
          : 'ok';

      if (previousStatus !== status) {
        // Check notification settings and get push token
        try {
          const salon = await prisma.salon.findUnique({
            where: { id: salonId },
            select: { pushToken: true },
          });

          const settings = await prisma.notificationSettings.findUnique({
            where: { salonId },
          });

          if (salon?.pushToken && settings?.lowStockEnabled) {
            const title = status === 'critical' ? 'Critical Stock Alert' : 'Low Stock Alert';
            const body = status === 'critical'
              ? `${updatedProduct.name} is critically low (${newStock} remaining)`
              : `${updatedProduct.name} is running low (${newStock} remaining)`;

            await sendInventoryPushNotification(salon.pushToken, title, body, {
              type: status === 'critical' ? 'critical_stock' : 'low_stock',
              productId: updatedProduct.id,
            });
          }
        } catch (pushError) {
          console.error('Error sending stock push notification:', pushError);
        }
      }
    }

    return NextResponse.json({
      message: 'Stock updated successfully',
      product: {
        ...updatedProduct,
        status,
      },
      stockChange: {
        action,
        quantity: adjustQuantity,
        previousStock,
        newStock,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
