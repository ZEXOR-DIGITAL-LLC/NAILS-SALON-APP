import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { salonId, pin } = await request.json();

    if (!salonId || !pin) {
      return NextResponse.json({ error: 'Missing salonId or pin' }, { status: 400 });
    }

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    if (salon.pin !== pin) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
    }

    await prisma.salon.update({
      where: { id: salonId },
      data: { confirmed: true },
    });

    return NextResponse.json({ message: 'Email confirmed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}