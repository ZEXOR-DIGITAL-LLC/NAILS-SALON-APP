import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // First, try to find a salon with this email
    const salon = await prisma.salon.findUnique({
      where: { email },
    });

    if (salon) {
      if (!salon.confirmed) {
        return NextResponse.json({ error: 'Email not confirmed. Please check your email for confirmation PIN.' }, { status: 400 });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, salon.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Check if trial or promo has expired and auto-update status
      let subscriptionStatus = salon.subscriptionStatus;
      if (
        salon.subscriptionExpiresAt &&
        new Date() > salon.subscriptionExpiresAt &&
        ['trial', 'promo'].includes(salon.subscriptionStatus)
      ) {
        subscriptionStatus = 'expired';
        await prisma.salon.update({
          where: { id: salon.id },
          data: { subscriptionStatus: 'expired' },
        });
      }

      return NextResponse.json({
        message: 'Sign in successful',
        userType: 'salon',
        user: {
          id: salon.id,
          businessName: salon.businessName,
          email: salon.email,
          firstName: salon.firstName,
          lastName: salon.lastName
        },
        subscription: {
          status: subscriptionStatus,
          startDate: salon.subscriptionStartDate,
          expiresAt: salon.subscriptionExpiresAt,
          promoCodeUsed: salon.promoCodeUsed,
        }
      }, { status: 200 });
    }

    // If no salon found, try to find a client
    const client = await prisma.client.findUnique({
      where: { email },
    });

    if (client) {
      if (!client.confirmed) {
        return NextResponse.json({ error: 'Email not confirmed. Please check your email for confirmation PIN.' }, { status: 400 });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, client.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      return NextResponse.json({
        message: 'Sign in successful',
        userType: 'client',
        user: {
          id: client.id,
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName
        }
      }, { status: 200 });
    }

    // No user found with this email
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}