import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/app/lib/prisma';

// GET - Check if revenue PIN is configured
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { revenuePin: true },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    return NextResponse.json({
      hasPinConfigured: !!salon.revenuePin,
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking revenue PIN:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Set or verify revenue PIN
export async function POST(request: NextRequest) {
  try {
    const { salonId, pin, action } = await request.json();

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 });
    }

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { revenuePin: true },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Action: 'set' - Set a new PIN (only if none exists)
    if (action === 'set') {
      if (salon.revenuePin) {
        return NextResponse.json({ error: 'PIN already configured' }, { status: 400 });
      }

      const hashedPin = await bcrypt.hash(pin, 10);
      await prisma.salon.update({
        where: { id: salonId },
        data: { revenuePin: hashedPin },
      });

      return NextResponse.json({ message: 'Revenue PIN set successfully' }, { status: 200 });
    }

    // Action: 'verify' - Verify the existing PIN
    if (action === 'verify') {
      if (!salon.revenuePin) {
        return NextResponse.json({ error: 'No PIN configured' }, { status: 400 });
      }

      const isValid = await bcrypt.compare(pin, salon.revenuePin);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
      }

      return NextResponse.json({ message: 'PIN verified successfully' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action. Use "set" or "verify"' }, { status: 400 });
  } catch (error) {
    console.error('Error processing revenue PIN:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Reset revenue PIN (requires salon password)
export async function PATCH(request: NextRequest) {
  try {
    const { salonId, password, newPin } = await request.json();

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return NextResponse.json({ error: 'New PIN must be exactly 4 digits' }, { status: 400 });
    }

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { password: true },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Verify the salon owner's password
    const isPasswordValid = await bcrypt.compare(password, salon.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Set the new PIN
    const hashedPin = await bcrypt.hash(newPin, 10);
    await prisma.salon.update({
      where: { id: salonId },
      data: { revenuePin: hashedPin },
    });

    return NextResponse.json({ message: 'Revenue PIN reset successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error resetting revenue PIN:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
