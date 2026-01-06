import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, pin } = await request.json();

    if (!email || !pin) {
      return NextResponse.json({ error: 'Email and PIN are required' }, { status: 400 });
    }

    // Check salon first
    const salon = await prisma.salon.findUnique({
      where: { email },
    });

    if (salon) {
      if (!salon.resetPin || !salon.resetPinExpiry) {
        return NextResponse.json({ error: 'No password reset request found. Please request a new PIN.' }, { status: 400 });
      }

      if (new Date() > salon.resetPinExpiry) {
        return NextResponse.json({ error: 'PIN has expired. Please request a new one.' }, { status: 400 });
      }

      if (salon.resetPin !== pin) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
      }

      return NextResponse.json({
        message: 'PIN verified successfully',
        userType: 'salon',
        userId: salon.id
      }, { status: 200 });
    }

    // Check client
    const client = await prisma.client.findUnique({
      where: { email },
    });

    if (client) {
      if (!client.resetPin || !client.resetPinExpiry) {
        return NextResponse.json({ error: 'No password reset request found. Please request a new PIN.' }, { status: 400 });
      }

      if (new Date() > client.resetPinExpiry) {
        return NextResponse.json({ error: 'PIN has expired. Please request a new one.' }, { status: 400 });
      }

      if (client.resetPin !== pin) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
      }

      return NextResponse.json({
        message: 'PIN verified successfully',
        userType: 'client',
        userId: client.id
      }, { status: 200 });
    }

    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  } catch (error) {
    console.error('Verify reset PIN error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
