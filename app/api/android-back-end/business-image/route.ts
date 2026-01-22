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
// R2_PUBLIC_URL should be your R2 bucket's public URL (e.g., https://pub-xxxxx.r2.dev or custom domain)
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// POST - Upload business image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const salonId = formData.get('salonId') as string | null;

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 5MB' },
        { status: 400 }
      );
    }

    // Verify salon exists
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { id: true, businessImage: true },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Delete old image if exists
    if (salon.businessImage) {
      try {
        const oldKey = extractKeyFromUrl(salon.businessImage);
        if (oldKey) {
          await R2.send(
            new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: oldKey,
            })
          );
        }
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `business-images/${salonId}/${Date.now()}.${fileExtension}`;

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

    // Construct public URL (remove trailing slash from R2_PUBLIC_URL if present)
    const baseUrl = R2_PUBLIC_URL.endsWith('/') ? R2_PUBLIC_URL.slice(0, -1) : R2_PUBLIC_URL;
    const imageUrl = `${baseUrl}/${fileName}`;

    // Update salon with image URL
    const updatedSalon = await prisma.salon.update({
      where: { id: salonId },
      data: { businessImage: imageUrl },
      select: { id: true, businessImage: true },
    });

    return NextResponse.json(
      {
        message: 'Image uploaded successfully',
        imageUrl: updatedSalon.businessImage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading business image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

// DELETE - Remove business image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    // Get salon and current image
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { id: true, businessImage: true },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    if (!salon.businessImage) {
      return NextResponse.json({ error: 'No image to delete' }, { status: 400 });
    }

    // Delete from R2
    const imageKey = extractKeyFromUrl(salon.businessImage);
    if (imageKey) {
      await R2.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: imageKey,
        })
      );
    }

    // Remove URL from database
    await prisma.salon.update({
      where: { id: salonId },
      data: { businessImage: null },
    });

    return NextResponse.json(
      { message: 'Image deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting business image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}

// Helper function to extract key from R2 URL
function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Remove leading slash from pathname
    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}
