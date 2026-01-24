import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// POST: Redeem a promo code
export async function POST(request: NextRequest) {
  try {
    const { code, email, salonId } = await request.json();

    if (!code || !email || !salonId) {
      return NextResponse.json(
        { error: 'Code, email, and salonId are required' },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();

    // Find the promo code
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: normalizedCode },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Invalid promo code' },
        { status: 404 }
      );
    }

    // Check if already used
    if (promoCode.isUsed) {
      return NextResponse.json(
        { error: 'This promo code has already been used' },
        { status: 400 }
      );
    }

    // Redeem the code: set usedAt, expiresAt (30 days from now), link to user
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const updatedPromoCode = await prisma.promoCode.update({
      where: { code: normalizedCode },
      data: {
        isUsed: true,
        usedByEmail: email,
        salonId: salonId,
        usedAt: now,
        expiresAt: expiresAt,
      },
    });

    // Update the Salon's subscription status to 'promo'
    await prisma.salon.update({
      where: { id: salonId },
      data: {
        subscriptionStatus: 'promo',
        subscriptionStartDate: now,
        subscriptionExpiresAt: expiresAt,
        promoCodeUsed: normalizedCode,
      },
    });

    return NextResponse.json({
      message: 'Promo code redeemed successfully',
      promoCode: {
        code: updatedPromoCode.code,
        usedAt: updatedPromoCode.usedAt,
        expiresAt: updatedPromoCode.expiresAt,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Promo code redemption error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Check promo code status for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const salonId = searchParams.get('salonId');

    if (!email || !salonId) {
      return NextResponse.json(
        { error: 'Email and salonId are required' },
        { status: 400 }
      );
    }

    // Find an active promo code for this user/salon
    const promoCode = await prisma.promoCode.findFirst({
      where: {
        usedByEmail: email,
        salonId: salonId,
        isUsed: true,
      },
    });

    if (!promoCode) {
      return NextResponse.json({
        hasActivePromo: false,
      }, { status: 200 });
    }

    // Check if the promo code is still within its 30-day validity
    const now = new Date();
    const isActive = promoCode.expiresAt ? now < promoCode.expiresAt : false;

    return NextResponse.json({
      hasActivePromo: isActive,
      promoCode: {
        code: promoCode.code,
        usedAt: promoCode.usedAt,
        expiresAt: promoCode.expiresAt,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Promo code check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
