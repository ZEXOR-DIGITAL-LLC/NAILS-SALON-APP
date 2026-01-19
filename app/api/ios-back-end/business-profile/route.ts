import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET - Fetch salon profile by salonId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: {
        id: true,
        email: true,
        businessName: true,
        businessImage: true,
        type: true,
        otherType: true,
        waitingAmenities: true,
        otherAmenity: true,
        country: true,
        city: true,
        address: true,
        latitude: true,
        longitude: true,
        phoneNumber: true,
        phoneCode: true,
        // Business Hours
        isOpen: true,
        workingDays: true,
        openingHour: true,
        openingMinute: true,
        closingHour: true,
        closingMinute: true,
      },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    return NextResponse.json({ salon }, { status: 200 });
  } catch (error) {
    console.error('Error fetching salon profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update salon profile
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      salonId,
      email,
      businessName,
      type,
      otherType,
      waitingAmenities,
      otherAmenity,
      country,
      city,
      address,
      latitude,
      longitude,
      phoneNumber,
      phoneCode,
      // Business Hours
      isOpen,
      workingDays,
      openingHour,
      openingMinute,
      closingHour,
      closingMinute,
    } = body;

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    // Verify the salon exists
    const existingSalon = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!existingSalon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // If email is being updated, check for uniqueness
    if (email && email !== existingSalon.email) {
      const emailExists = await prisma.salon.findFirst({
        where: {
          email,
          id: { not: salonId },
        },
      });

      if (emailExists) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }

      // Also check if email exists in Client table
      const clientEmailExists = await prisma.client.findFirst({
        where: { email },
      });

      if (clientEmailExists) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
    }

    // Build update data with only provided fields
    const updateData: {
      email?: string;
      businessName?: string;
      type?: string;
      otherType?: string | null;
      waitingAmenities?: string[];
      otherAmenity?: string | null;
      country?: string;
      city?: string;
      address?: string;
      latitude?: number | null;
      longitude?: number | null;
      phoneNumber?: string;
      phoneCode?: string;
      // Business Hours
      isOpen?: boolean;
      workingDays?: number[];
      openingHour?: number;
      openingMinute?: number;
      closingHour?: number;
      closingMinute?: number;
    } = {};

    if (email !== undefined) updateData.email = email;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (type !== undefined) updateData.type = type;
    if (otherType !== undefined) updateData.otherType = otherType;
    if (waitingAmenities !== undefined) updateData.waitingAmenities = waitingAmenities;
    if (otherAmenity !== undefined) updateData.otherAmenity = otherAmenity;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (address !== undefined) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (phoneCode !== undefined) updateData.phoneCode = phoneCode;
    // Business Hours
    if (isOpen !== undefined) updateData.isOpen = isOpen;
    if (workingDays !== undefined) updateData.workingDays = workingDays;
    if (openingHour !== undefined) updateData.openingHour = openingHour;
    if (openingMinute !== undefined) updateData.openingMinute = openingMinute;
    if (closingHour !== undefined) updateData.closingHour = closingHour;
    if (closingMinute !== undefined) updateData.closingMinute = closingMinute;

    // Update the salon
    const updatedSalon = await prisma.salon.update({
      where: { id: salonId },
      select: {
        id: true,
        email: true,
        businessName: true,
        businessImage: true,
        type: true,
        otherType: true,
        waitingAmenities: true,
        otherAmenity: true,
        country: true,
        city: true,
        address: true,
        latitude: true,
        longitude: true,
        phoneNumber: true,
        phoneCode: true,
        // Business Hours
        isOpen: true,
        workingDays: true,
        openingHour: true,
        openingMinute: true,
        closingHour: true,
        closingMinute: true,
      },
      data: updateData,
    });

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        salon: updatedSalon,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating salon profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
