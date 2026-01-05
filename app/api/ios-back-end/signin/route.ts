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

    const salon = await prisma.salon.findUnique({
      where: { email },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!salon.confirmed) {
      return NextResponse.json({ error: 'Email not confirmed. Please check your email for confirmation PIN.' }, { status: 400 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, salon.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Sign in successful',
      salon: {
        id: salon.id,
        businessName: salon.businessName,
        email: salon.email,
        firstName: salon.firstName,
        lastName: salon.lastName
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}