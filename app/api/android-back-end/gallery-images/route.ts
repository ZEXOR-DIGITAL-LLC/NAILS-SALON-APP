import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '@/app/lib/prisma';

// Initialize R2 client
const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total for all files
const MAX_IMAGES_PER_GALLERY = 10;

// Helper function to extract key from R2 URL
function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}

// POST - Upload images to a gallery (supports multiple images)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const salonId = formData.get('salonId') as string | null;
    const galleryId = formData.get('galleryId') as string | null;

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (!galleryId) {
      return NextResponse.json({ error: 'Gallery ID is required' }, { status: 400 });
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

    // Get all files from form data
    const files: File[] = [];
    formData.forEach((value, key) => {
      if (key === 'images' && value instanceof File) {
        files.push(value);
      }
    });

    if (files.length === 0) {
      return NextResponse.json({ error: 'At least one image file is required' }, { status: 400 });
    }

    // Check if adding these images would exceed the limit
    const currentImageCount = gallery.images.length;
    if (currentImageCount + files.length > MAX_IMAGES_PER_GALLERY) {
      return NextResponse.json(
        {
          error: `Cannot add ${files.length} images. Gallery already has ${currentImageCount} images. Maximum ${MAX_IMAGES_PER_GALLERY} allowed.`
        },
        { status: 400 }
      );
    }

    // Validate all files first
    let totalSize = 0;
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type for ${file.name}. Allowed: JPEG, PNG, GIF, WebP` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size per file: 10MB` },
          { status: 400 }
        );
      }

      totalSize += file.size;
    }

    // Check total size of all files
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { error: `Total upload size exceeds 50MB limit. Please reduce the number or size of images.` },
        { status: 400 }
      );
    }

    // Upload all files and create database records
    const uploadedImages = [];
    const baseUrl = R2_PUBLIC_URL.endsWith('/') ? R2_PUBLIC_URL.slice(0, -1) : R2_PUBLIC_URL;
    const timestamp = Date.now();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `gallery-images/${salonId}/${galleryId}/${timestamp}-${i}.${fileExtension}`;

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to R2
      await R2.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
        })
      );

      const imageUrl = `${baseUrl}/${fileName}`;

      // Create database record
      const galleryImage = await prisma.galleryImage.create({
        data: {
          galleryId,
          imageUrl,
          order: currentImageCount + i,
        },
      });

      uploadedImages.push(galleryImage);
    }

    // Fetch updated gallery with all images
    const updatedGallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json(
      {
        message: `${uploadedImages.length} image(s) uploaded successfully`,
        uploadedImages,
        gallery: updatedGallery,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading gallery images:', error);
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
  }
}

// DELETE - Delete a single image from gallery
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    const salonId = searchParams.get('salonId');

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    // Find image and verify it belongs to a gallery owned by this salon
    const image = await prisma.galleryImage.findUnique({
      where: { id: imageId },
      include: {
        gallery: {
          select: { id: true, salonId: true },
        },
      },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    if (image.gallery.salonId !== salonId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete from R2
    const imageKey = extractKeyFromUrl(image.imageUrl);
    if (imageKey) {
      try {
        await R2.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: imageKey,
          })
        );
      } catch (deleteError) {
        console.error('Error deleting image from R2:', deleteError);
        // Continue with database deletion even if R2 delete fails
      }
    }

    // Delete from database
    await prisma.galleryImage.delete({
      where: { id: imageId },
    });

    // Fetch updated gallery
    const updatedGallery = await prisma.gallery.findUnique({
      where: { id: image.gallery.id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json(
      { message: 'Image deleted successfully', gallery: updatedGallery },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
