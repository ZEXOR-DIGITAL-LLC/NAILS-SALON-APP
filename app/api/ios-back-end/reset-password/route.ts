import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, pin, newPassword } = await request.json();

    if (!email || !pin || !newPassword) {
      return NextResponse.json({ error: 'Email, PIN, and new password are required' }, { status: 400 });
    }

    // Validate password requirements: 1 uppercase, 1 number, 1 symbol, min 10 characters
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{10,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json({
        error: 'Password must be at least 10 characters and contain an uppercase letter, a number, and a special character'
      }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

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

      // Update password and clear reset fields
      await prisma.salon.update({
        where: { id: salon.id },
        data: {
          password: hashedPassword,
          resetPin: null,
          resetPinExpiry: null,
        },
      });

      // Send confirmation email
      await sendConfirmationEmail(email, salon.firstName);

      return NextResponse.json({
        message: 'Password has been reset successfully'
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

      // Update password and clear reset fields
      await prisma.client.update({
        where: { id: client.id },
        data: {
          password: hashedPassword,
          resetPin: null,
          resetPinExpiry: null,
        },
      });

      // Send confirmation email
      await sendConfirmationEmail(email, client.firstName);

      return NextResponse.json({
        message: 'Password has been reset successfully'
      }, { status: 200 });
    }

    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendConfirmationEmail(email: string, firstName: string) {
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
      subject: 'Nails Salon - Password Changed Successfully',
      text: `Hello ${firstName}, your password has been changed successfully. If you did not make this change, please contact support immediately.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e91e63;">Password Changed Successfully</h2>
          <p>Hello ${firstName},</p>
          <p>Your password has been changed successfully.</p>
          <p>If you did not make this change, please contact support immediately at:</p>
          <p><a href="mailto:${process.env.CONTACT_EMAIL}">${process.env.CONTACT_EMAIL}</a></p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated message from Nails Salon Connect.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (emailError) {
    console.error('Failed to send password change confirmation email:', emailError);
    // Don't fail the password reset if email fails
  }
}
