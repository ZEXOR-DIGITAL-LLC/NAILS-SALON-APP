import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { clientId, pin } = await request.json();

    if (!clientId || !pin) {
      return NextResponse.json({ error: 'Missing clientId or pin' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (client.pin !== pin) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
    }

    await prisma.client.update({
      where: { id: clientId },
      data: { confirmed: true },
    });

    return NextResponse.json({ message: 'Email confirmed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
