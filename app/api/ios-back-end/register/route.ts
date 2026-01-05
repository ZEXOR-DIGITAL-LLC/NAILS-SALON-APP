import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      businessName,
      type,
      otherType,
      waitingAmenities,
      otherAmenity,
      country,
      city,
      address,
      phoneNumber,
      phoneCode,
      termsAccepted,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !businessName || !type || !country || !city || !address || !phoneNumber || !phoneCode || termsAccepted === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'Other' && !otherType) {
      return NextResponse.json({ error: 'Other type is required' }, { status: 400 });
    }

    if (waitingAmenities.includes('Other') && !otherAmenity) {
      return NextResponse.json({ error: 'Other amenity is required' }, { status: 400 });
    }

    // Generate 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // Create salon
    const salon = await prisma.salon.create({
      data: {
        firstName,
        lastName,
        email,
        businessName,
        type,
        otherType: type === 'Other' ? otherType : null,
        waitingAmenities,
        otherAmenity: waitingAmenities.includes('Other') ? otherAmenity : null,
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
      html: `<p>Your confirmation PIN is: <strong>${pin}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Registration successful. Check your email for confirmation PIN.', salonId: salon.id }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}