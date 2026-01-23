import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Helper to generate the next client code for a salon (CLT-0001, CLT-0002, etc.)
async function generateNextClientCode(salonId: string): Promise<string> {
  const lastClient = await prisma.salonClient.findFirst({
    where: { salonId, clientCode: { not: null } },
    orderBy: { clientCode: 'desc' },
    select: { clientCode: true },
  });

  let nextNumber = 1;
  if (lastClient?.clientCode) {
    const match = lastClient.clientCode.match(/CLT-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `CLT-${nextNumber.toString().padStart(4, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');
    const search = searchParams.get('search');
    const clientId = searchParams.get('clientId');
    const clientCode = searchParams.get('clientCode');

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    const salon = await prisma.salon.findUnique({ where: { id: salonId } });
    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Lookup by client code
    if (clientCode) {
      const client = await prisma.salonClient.findFirst({
        where: { salonId, clientCode: clientCode.toUpperCase() },
      });
      if (!client) {
        return NextResponse.json({ error: 'Client not found', found: false }, { status: 404 });
      }
      return NextResponse.json({ client, found: true }, { status: 200 });
    }

    // Single client detail with appointment history
    if (clientId) {
      const client = await prisma.salonClient.findFirst({
        where: { id: clientId, salonId },
      });
      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }

      const appointments = await prisma.ownerAppointment.findMany({
        where: { salonClientId: clientId, salonId },
        orderBy: [{ appointmentDate: 'desc' }, { appointmentHour: 'desc' }],
        include: {
          employee: { select: { id: true, name: true, color: true } },
        },
      });

      const totalSpent = appointments.reduce((sum, apt) => sum + (apt.amount || 0), 0);
      const completedCount = appointments.filter(a => a.status === 'Completed').length;

      return NextResponse.json({
        client,
        appointments,
        totalSpent,
        completedCount,
        appointmentCount: appointments.length,
      }, { status: 200 });
    }

    // Build where clause for list
    const whereClause: any = { salonId };
    if (search && search.trim()) {
      whereClause.OR = [
        { firstName: { contains: search.trim(), mode: 'insensitive' } },
        { lastName: { contains: search.trim(), mode: 'insensitive' } },
        { phone: { contains: search.trim(), mode: 'insensitive' } },
        { clientCode: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const clients = await prisma.salonClient.findMany({
      where: whereClause,
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      include: {
        appointments: {
          select: { id: true, appointmentDate: true, status: true, amount: true },
          orderBy: { appointmentDate: 'desc' },
        },
      },
    });

    // Transform to include computed fields
    const clientsWithStats = clients.map(client => {
      const completedAppointments = client.appointments.filter(a => a.status === 'Completed');
      const lastVisit = client.appointments.length > 0
        ? client.appointments[0].appointmentDate
        : null;
      const totalSpent = completedAppointments.reduce((sum, a) => sum + (a.amount || 0), 0);

      return {
        id: client.id,
        clientCode: client.clientCode,
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        email: client.email,
        notes: client.notes,
        createdAt: client.createdAt,
        appointmentCount: client.appointments.length,
        lastVisit,
        totalSpent,
      };
    });

    return NextResponse.json({
      clients: clientsWithStats,
      count: clientsWithStats.length,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching salon clients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { salonId, firstName, lastName, phone, email, notes } = body;

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }
    if (!firstName || firstName.trim() === '') {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }

    const salon = await prisma.salon.findUnique({ where: { id: salonId } });
    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Check for existing client with same name (case-insensitive)
    const trimmedFirst = firstName.trim();
    const trimmedLast = (lastName || '').trim();

    const existingClient = await prisma.salonClient.findFirst({
      where: {
        salonId,
        firstName: { equals: trimmedFirst, mode: 'insensitive' },
        lastName: { equals: trimmedLast, mode: 'insensitive' },
      },
    });

    if (existingClient) {
      // Backfill clientCode if missing (for clients created before this feature)
      if (!existingClient.clientCode) {
        const backfillCode = await generateNextClientCode(salonId);
        const updatedExisting = await prisma.salonClient.update({
          where: { id: existingClient.id },
          data: { clientCode: backfillCode },
        });
        return NextResponse.json({
          message: 'Client already exists',
          client: updatedExisting,
          existing: true,
        }, { status: 200 });
      }
      return NextResponse.json({
        message: 'Client already exists',
        client: existingClient,
        existing: true,
      }, { status: 200 });
    }

    // Generate the next client code for this salon
    const clientCode = await generateNextClientCode(salonId);

    const client = await prisma.salonClient.create({
      data: {
        salonId,
        clientCode,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json({
      message: 'Client created successfully',
      client,
      existing: false,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating salon client:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, salonId, firstName, lastName, phone, email, notes } = body;

    if (!id || !salonId) {
      return NextResponse.json({ error: 'ID and Salon ID are required' }, { status: 400 });
    }

    const existingClient = await prisma.salonClient.findFirst({
      where: { id, salonId },
    });
    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (firstName !== undefined) {
      if (firstName.trim() === '') {
        return NextResponse.json({ error: 'First name cannot be empty' }, { status: 400 });
      }
      updateData.firstName = firstName.trim();
    }
    if (lastName !== undefined) updateData.lastName = (lastName || '').trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const updatedClient = await prisma.salonClient.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Client updated successfully',
      client: updatedClient,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating salon client:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const salonId = searchParams.get('salonId');

    if (!id || !salonId) {
      return NextResponse.json({ error: 'Client ID and Salon ID are required' }, { status: 400 });
    }

    const client = await prisma.salonClient.findFirst({
      where: { id, salonId },
    });
    if (!client) {
      return NextResponse.json({ error: 'Client not found or access denied' }, { status: 404 });
    }

    await prisma.salonClient.delete({ where: { id } });

    return NextResponse.json({
      message: 'Client deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting salon client:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
