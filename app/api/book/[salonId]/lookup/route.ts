import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// POST - Look up a salon client by code (public endpoint for booking page)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const { salonId } = await params;
    const body = await request.json();
    const { code } = body;

    if (!salonId) {
      return NextResponse.json({ success: false, error: 'Salon ID is required' }, { status: 400 });
    }

    if (!code || !code.trim()) {
      return NextResponse.json({ success: false, error: 'Client code is required' }, { status: 400 });
    }

    // Normalize the code: accept both "CLT-XXXX" and just "XXXX"
    let normalizedCode = code.trim().toUpperCase();
    if (/^\d+$/.test(normalizedCode)) {
      // User entered just the number, prepend CLT-
      normalizedCode = `CLT-${normalizedCode.padStart(4, '0')}`;
    }

    // Verify the salon exists
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { id: true },
    });

    if (!salon) {
      return NextResponse.json({ success: false, error: 'Salon not found' }, { status: 404 });
    }

    // Look up client by code within this salon (tenant-isolated)
    const client = await prisma.salonClient.findFirst({
      where: {
        salonId,
        clientCode: normalizedCode,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        clientCode: true,
      },
    });

    if (!client) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      client: {
        firstName: client.firstName,
        lastName: client.lastName,
        clientCode: client.clientCode,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error looking up client:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
