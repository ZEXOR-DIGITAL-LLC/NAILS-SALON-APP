import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET - Fetch all products for a salon with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');
    const status = searchParams.get('status'); // 'low', 'critical', 'expired', 'expiring', 'ok'
    const categoryId = searchParams.get('categoryId');
    const supplier = searchParams.get('supplier');
    const search = searchParams.get('search');
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // Default to true

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

    // Build where clause
    interface WhereClause {
      salonId: string;
      isActive?: boolean;
      categoryId?: string;
      supplier?: { contains: string; mode: 'insensitive' };
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
        sku?: { contains: string; mode: 'insensitive' };
      }>;
    }

    const whereClause: WhereClause = { salonId };

    if (activeOnly) {
      whereClause.isActive = true;
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (supplier) {
      whereClause.supplier = { contains: supplier, mode: 'insensitive' };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    let products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { name: 'asc' },
      ],
    });

    // Update expired status for products
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Check and update expired products
    const expiredProductIds: string[] = [];
    products = products.map(product => {
      const isExpired = product.expirationDate && new Date(product.expirationDate) < now;
      if (isExpired && !product.isExpired) {
        expiredProductIds.push(product.id);
      }
      return {
        ...product,
        isExpired: isExpired || product.isExpired,
      };
    });

    // Update expired products in database
    if (expiredProductIds.length > 0) {
      await prisma.product.updateMany({
        where: { id: { in: expiredProductIds } },
        data: { isExpired: true },
      });
    }

    // Filter by status if specified
    if (status) {
      products = products.filter(product => {
        const isExpired = product.isExpired || (product.expirationDate && new Date(product.expirationDate) < now);
        const isExpiring = product.expirationDate &&
          new Date(product.expirationDate) >= now &&
          new Date(product.expirationDate) <= thirtyDaysFromNow;

        switch (status) {
          case 'expired':
            return isExpired;
          case 'expiring':
            return isExpiring && !isExpired;
          case 'critical':
            return !isExpired && product.currentStock <= product.criticalPoint;
          case 'low':
            return !isExpired &&
                   product.currentStock > product.criticalPoint &&
                   product.currentStock <= product.reorderPoint;
          case 'ok':
            return !isExpired && product.currentStock > product.reorderPoint;
          default:
            return true;
        }
      });
    }

    // Calculate status for each product
    const productsWithStatus = products.map(product => {
      const isExpired = product.isExpired || (product.expirationDate && new Date(product.expirationDate) < now);
      const isExpiring = product.expirationDate &&
        new Date(product.expirationDate) >= now &&
        new Date(product.expirationDate) <= thirtyDaysFromNow;

      let productStatus: 'ok' | 'low' | 'critical' | 'expired' = 'ok';
      if (isExpired) {
        productStatus = 'expired';
      } else if (product.currentStock <= product.criticalPoint) {
        productStatus = 'critical';
      } else if (product.currentStock <= product.reorderPoint) {
        productStatus = 'low';
      }

      return {
        ...product,
        status: productStatus,
        isExpiring: !isExpired && isExpiring,
      };
    });

    return NextResponse.json({
      products: productsWithStatus,
      count: productsWithStatus.length,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      salonId,
      name,
      description,
      categoryId,
      sku,
      currentStock,
      reorderPoint,
      criticalPoint,
      unitCost,
      supplier,
      expirationDate,
    } = body;

    // Validate required fields
    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    // Verify the salon exists
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Verify category exists if provided
    if (categoryId) {
      const category = await prisma.productCategory.findFirst({
        where: { id: categoryId, salonId },
      });
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
    }

    // Calculate if product is already expired
    const isExpired = expirationDate && new Date(expirationDate) < new Date();

    // Create the product
    const product = await prisma.product.create({
      data: {
        salonId,
        name: name.trim(),
        description: description?.trim() || null,
        categoryId: categoryId || null,
        sku: sku?.trim() || null,
        currentStock: Math.max(0, parseInt(currentStock) || 0),
        reorderPoint: Math.max(0, parseInt(reorderPoint) || 5),
        criticalPoint: Math.max(0, parseInt(criticalPoint) || 2),
        unitCost: unitCost ? parseFloat(unitCost) : null,
        supplier: supplier?.trim() || null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        isExpired: Boolean(isExpired),
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
    });

    // Create history entry
    await prisma.productHistory.create({
      data: {
        productId: product.id,
        salonId,
        action: 'created',
        newStock: product.currentStock,
        notes: `Product created with initial stock of ${product.currentStock}`,
      },
    });

    return NextResponse.json({
      message: 'Product created successfully',
      product,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a product
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      salonId,
      name,
      description,
      categoryId,
      sku,
      reorderPoint,
      criticalPoint,
      unitCost,
      supplier,
      expirationDate,
      isActive,
    } = body;

    if (!id || !salonId) {
      return NextResponse.json({ error: 'ID and Salon ID are required' }, { status: 400 });
    }

    // Find the product and verify ownership
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        salonId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Verify category exists if provided
    if (categoryId !== undefined && categoryId !== null) {
      const category = await prisma.productCategory.findFirst({
        where: { id: categoryId, salonId },
      });
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
    }

    // Prepare update data
    interface UpdateData {
      name?: string;
      description?: string | null;
      categoryId?: string | null;
      sku?: string | null;
      reorderPoint?: number;
      criticalPoint?: number;
      unitCost?: number | null;
      supplier?: string | null;
      expirationDate?: Date | null;
      isExpired?: boolean;
      isActive?: boolean;
    }

    const updateData: UpdateData = {};

    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json({ error: 'Product name cannot be empty' }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (categoryId !== undefined) {
      updateData.categoryId = categoryId || null;
    }

    if (sku !== undefined) {
      updateData.sku = sku?.trim() || null;
    }

    if (reorderPoint !== undefined) {
      updateData.reorderPoint = Math.max(0, parseInt(reorderPoint) || 5);
    }

    if (criticalPoint !== undefined) {
      updateData.criticalPoint = Math.max(0, parseInt(criticalPoint) || 2);
    }

    if (unitCost !== undefined) {
      updateData.unitCost = unitCost ? parseFloat(unitCost) : null;
    }

    if (supplier !== undefined) {
      updateData.supplier = supplier?.trim() || null;
    }

    if (expirationDate !== undefined) {
      updateData.expirationDate = expirationDate ? new Date(expirationDate) : null;
      // Update expired status based on new expiration date
      updateData.isExpired = expirationDate ? new Date(expirationDate) < new Date() : false;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create history entry for update
    await prisma.productHistory.create({
      data: {
        productId: id,
        salonId,
        action: 'updated',
        notes: 'Product details updated',
      },
    });

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const salonId = searchParams.get('salonId');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    // Find the product and verify ownership
    const product = await prisma.product.findFirst({
      where: {
        id,
        salonId,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found or access denied' }, { status: 404 });
    }

    // Delete the product (history will cascade delete)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Product deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
