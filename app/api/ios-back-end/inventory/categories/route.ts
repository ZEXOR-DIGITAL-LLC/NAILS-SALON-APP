import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET - Fetch all categories for a salon
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

    const categories = await prisma.productCategory.findMany({
      where: { salonId },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    // Format response
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      order: cat.order,
      productCount: cat._count.products,
      createdAt: cat.createdAt,
    }));

    return NextResponse.json({
      categories: formattedCategories,
      count: formattedCategories.length,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { salonId, name, description, order } = body;

    // Validate required fields
    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Verify the salon exists
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Check for duplicate category name
    const existingCategory = await prisma.productCategory.findFirst({
      where: {
        salonId,
        name: { equals: name.trim(), mode: 'insensitive' },
      },
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
    }

    // Get current max order if not provided
    let categoryOrder = order;
    if (categoryOrder === undefined) {
      const maxOrderCategory = await prisma.productCategory.findFirst({
        where: { salonId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      categoryOrder = maxOrderCategory ? maxOrderCategory.order + 1 : 0;
    }

    // Create the category
    const category = await prisma.productCategory.create({
      data: {
        salonId,
        name: name.trim(),
        description: description?.trim() || null,
        order: categoryOrder,
      },
    });

    return NextResponse.json({
      message: 'Category created successfully',
      category,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a category
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, salonId, name, description, order } = body;

    if (!id || !salonId) {
      return NextResponse.json({ error: 'ID and Salon ID are required' }, { status: 400 });
    }

    // Find the category and verify ownership
    const existingCategory = await prisma.productCategory.findFirst({
      where: {
        id,
        salonId,
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check for duplicate name if name is being changed
    if (name !== undefined && name.trim() !== existingCategory.name) {
      const duplicateCategory = await prisma.productCategory.findFirst({
        where: {
          salonId,
          name: { equals: name.trim(), mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (duplicateCategory) {
        return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
      }
    }

    // Prepare update data
    interface UpdateData {
      name?: string;
      description?: string | null;
      order?: number;
    }

    const updateData: UpdateData = {};

    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json({ error: 'Category name cannot be empty' }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (order !== undefined) {
      updateData.order = parseInt(order, 10);
    }

    const updatedCategory = await prisma.productCategory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Category updated successfully',
      category: updatedCategory,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const salonId = searchParams.get('salonId');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    // Find the category and verify ownership
    const category = await prisma.productCategory.findFirst({
      where: {
        id,
        salonId,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found or access denied' }, { status: 404 });
    }

    // Delete the category (products will have categoryId set to null due to SetNull)
    await prisma.productCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Category deleted successfully',
      productsUnassigned: category._count.products,
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
