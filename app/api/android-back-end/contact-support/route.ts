import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { salonId, message } = await request.json();

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get salon info for context
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { email: true, firstName: true, lastName: true, businessName: true },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Send email from contact email to itself
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
      to: process.env.CONTACT_EMAIL,
      subject: `Support Request - ${salon.businessName || `${salon.firstName} ${salon.lastName}`}`,
      text: `Support request from ${salon.firstName} ${salon.lastName} (${salon.email}):\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e91e63;">Support Request</h2>
          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 4px 0;"><strong>From:</strong> ${salon.firstName} ${salon.lastName}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${salon.email}</p>
            <p style="margin: 4px 0;"><strong>Business:</strong> ${salon.businessName || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Salon ID:</strong> ${salonId}</p>
          </div>
          <h3 style="color: #333;">Message:</h3>
          <div style="background-color: #fff; border: 1px solid #ddd; padding: 16px; border-radius: 8px;">
            <p style="white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Contact support error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
