import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if email exists in Salon or Client
    let userType: 'salon' | 'client' | null = null;
    let userId: string | null = null;
    let firstName: string | null = null;

    const salon = await prisma.salon.findUnique({
      where: { email },
    });

    if (salon) {
      userType = 'salon';
      userId = salon.id;
      firstName = salon.firstName;
    } else {
      const client = await prisma.client.findUnique({
        where: { email },
      });

      if (client) {
        userType = 'client';
        userId = client.id;
        firstName = client.firstName;
      }
    }

    // For security, always return success even if email not found
    if (!userType || !userId) {
      return NextResponse.json({
        message: 'If an account exists with this email, a reset PIN has been sent.'
      }, { status: 200 });
    }

    // Generate 6-digit PIN
    const resetPin = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry to 15 minutes from now
    const resetPinExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Update the appropriate model with reset PIN
    if (userType === 'salon') {
      await prisma.salon.update({
        where: { id: userId },
        data: { resetPin, resetPinExpiry },
      });
    } else {
      await prisma.client.update({
        where: { id: userId },
        data: { resetPin, resetPinExpiry },
      });
    }

    // Send email with PIN
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.HOSTINGER_SERVER,
        port: parseInt(process.env.HOSTINGER_PORT || '465'),
        secure: true,
        auth: {
          user: process.env.CONTACT_EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.CONTACT_EMAIL,
        to: email,
        subject: 'Nails Salon - Password Reset PIN',
        text: `Your password reset PIN is: ${resetPin}. This PIN expires in 15 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e91e63;">Password Reset Request</h2>
            <p>Hello ${firstName},</p>
            <p>We received a request to reset your password. Your password reset PIN is:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e91e63;">${resetPin}</span>
            </div>
            <p>This PIN will expire in <strong>15 minutes</strong>.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return NextResponse.json({
        error: 'Failed to send reset email. Please try again later.'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'If an account exists with this email, a reset PIN has been sent.',
      userType,
      userId
    }, { status: 200 });
  } catch (error) {
    console.error('Request reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
