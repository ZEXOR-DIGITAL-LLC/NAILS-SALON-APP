import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      country,
      city,
      address,
      phoneNumber,
      phoneCode,
      termsAccepted,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !country || !city || !address || !phoneNumber || !phoneCode || termsAccepted === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate password requirements: number, special char, capital letter
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({
        error: 'Password must be at least 8 characters and contain a capital letter, a number, and a special character'
      }, { status: 400 });
    }

    // Check if email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email },
    });

    if (existingClient) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Generate 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create client
    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        country,
        city,
        address,
        phoneNumber,
        phoneCode,
        termsAccepted,
        pin,
        confirmed: false,
      },
    });

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
        subject: 'Confirm your Nails Salon registration',
        text: `Your confirmation PIN is: ${pin}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e91e63;">Welcome to Nails Salon!</h2>
            <p>Thank you for creating your account, <strong>${firstName}</strong>!</p>
            <p>Your confirmation PIN is:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e91e63;">${pin}</span>
            </div>
            <p>Enter this PIN in the app to complete your registration.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      };

      const emailResult = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', emailResult.messageId);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail the registration if email fails - user can request resend
      // But log the error for debugging
      return NextResponse.json({
        message: 'Registration successful but email delivery failed. Please contact support if you do not receive your PIN.',
        clientId: client.id,
        emailError: true
      }, { status: 201 });
    }

    return NextResponse.json({ message: 'Registration successful. Check your email for confirmation PIN.', clientId: client.id }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
