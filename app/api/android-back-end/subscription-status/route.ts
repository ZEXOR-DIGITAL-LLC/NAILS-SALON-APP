import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

type SubscriptionStatus = 'none' | 'trial' | 'paid' | 'promo' | 'expired';

// POST: Update salon subscription status
export async function POST(request: NextRequest) {
  try {
    const { salonId, status, expiresAt } = await request.json();

    if (!salonId) {
      return NextResponse.json({ error: 'salonId is required' }, { status: 400 });
    }

    const validStatuses: SubscriptionStatus[] = ['none', 'trial', 'paid', 'promo', 'expired'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify salon exists
    const salon = await prisma.salon.findUnique({ where: { id: salonId } });
    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Build update data
    const updateData: {
      subscriptionStatus: string;
      subscriptionStartDate?: Date;
      subscriptionExpiresAt?: Date | null;
    } = {
      subscriptionStatus: status,
    };

    // Set start date if transitioning to an active status
    if (['trial', 'paid', 'promo'].includes(status) && salon.subscriptionStatus !== status) {
      updateData.subscriptionStartDate = new Date();
    }

    // Set expiration date if provided
    if (expiresAt) {
      updateData.subscriptionExpiresAt = new Date(expiresAt);
    } else if (status === 'trial') {
      // 3-day trial from now
      updateData.subscriptionExpiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    } else if (status === 'expired' || status === 'none') {
      updateData.subscriptionExpiresAt = null;
    }

    const updated = await prisma.salon.update({
      where: { id: salonId },
      data: updateData,
      select: {
        id: true,
        subscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionExpiresAt: true,
        promoCodeUsed: true,
      },
    });

    return NextResponse.json({
      message: 'Subscription status updated',
      subscription: updated,
    }, { status: 200 });
  } catch (error) {
    console.error('Subscription status update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Check salon subscription status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');

    if (!salonId) {
      return NextResponse.json({ error: 'salonId is required' }, { status: 400 });
    }

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: {
        id: true,
        subscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionExpiresAt: true,
        promoCodeUsed: true,
      },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Check if an active status has expired
    const now = new Date();
    if (
      salon.subscriptionExpiresAt &&
      now > salon.subscriptionExpiresAt &&
      ['trial', 'promo'].includes(salon.subscriptionStatus)
    ) {
      // Auto-expire the status
      const updated = await prisma.salon.update({
        where: { id: salonId },
        data: { subscriptionStatus: 'expired' },
        select: {
          id: true,
          subscriptionStatus: true,
          subscriptionStartDate: true,
          subscriptionExpiresAt: true,
          promoCodeUsed: true,
        },
      });
      return NextResponse.json({ subscription: updated }, { status: 200 });
    }

    return NextResponse.json({ subscription: salon }, { status: 200 });
  } catch (error) {
    console.error('Subscription status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
