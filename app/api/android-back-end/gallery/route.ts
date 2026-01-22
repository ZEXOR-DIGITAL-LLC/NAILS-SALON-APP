import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '@/app/lib/prisma';

// Initialize R2 client for deleting images when gallery is deleted
const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || '';

// Helper function to extract key from R2 URL
function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}

// GET - Fetch all galleries for a salon
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    // Verify salon exists
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { id: true },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Fetch galleries with images
    const galleries = await prisma.gallery.findMany({
      where: { salonId },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ galleries }, { status: 200 });
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return NextResponse.json({ error: 'Failed to fetch galleries' }, { status: 500 });
  }
}

// POST - Create a new gallery
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { salonId, title, description } = body;

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Gallery title is required' }, { status: 400 });
    }

    // Verify salon exists
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { id: true },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Create gallery
    const gallery = await prisma.gallery.create({
      data: {
        salonId,
        title: title.trim(),
        description: description?.trim() || null,
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(
      { message: 'Gallery created successfully', gallery },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating gallery:', error);
    return NextResponse.json({ error: 'Failed to create gallery' }, { status: 500 });
  }
}

// PATCH - Update gallery title/description
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { galleryId, salonId, title, description } = body;

    if (!galleryId) {
      return NextResponse.json({ error: 'Gallery ID is required' }, { status: 400 });
    }

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    // Verify gallery exists and belongs to salon
    const existingGallery = await prisma.gallery.findFirst({
      where: { id: galleryId, salonId },
    });

    if (!existingGallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }

    // Build update data
    const updateData: { title?: string; description?: string | null } = {};
    if (title !== undefined) {
      if (title.trim() === '') {
        return NextResponse.json({ error: 'Gallery title cannot be empty' }, { status: 400 });
      }
      updateData.title = title.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    // Update gallery
    const gallery = await prisma.gallery.update({
      where: { id: galleryId },
      data: updateData,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json(
      { message: 'Gallery updated successfully', gallery },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating gallery:', error);
    return NextResponse.json({ error: 'Failed to update gallery' }, { status: 500 });
  }
}

// DELETE - Delete entire gallery and all its images
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get('galleryId');
    const salonId = searchParams.get('salonId');

    if (!galleryId) {
      return NextResponse.json({ error: 'Gallery ID is required' }, { status: 400 });
    }

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    // Verify gallery exists and belongs to salon
    const gallery = await prisma.gallery.findFirst({
      where: { id: galleryId, salonId },
      include: {
        images: true,
      },
    });

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }

    // Delete all images from R2
    for (const image of gallery.images) {
      try {
        const imageKey = extractKeyFromUrl(image.imageUrl);
        if (imageKey) {
          await R2.send(
            new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: imageKey,
            })
          );
        }
      } catch (deleteError) {
        console.error('Error deleting image from R2:', deleteError);
        // Continue with other images even if one fails
      }
    }

    // Delete gallery (cascade will delete GalleryImage records)
    await prisma.gallery.delete({
      where: { id: galleryId },
    });

    return NextResponse.json(
      { message: 'Gallery deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting gallery:', error);
    return NextResponse.json({ error: 'Failed to delete gallery' }, { status: 500 });
  }
}
