import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const salon = await prisma.salon.findUnique({
      where: { email },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    if (!salon.confirmed) {
      return NextResponse.json({ error: 'Email not confirmed' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Sign in successful', salon: { id: salon.id, businessName: salon.businessName, email: salon.email } }, { status: 200 });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}