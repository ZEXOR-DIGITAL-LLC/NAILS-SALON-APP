import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET - Fetch countries, cities, or salons based on query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const city = searchParams.get('city');

    // Base filter: only confirmed salons
    const baseFilter = { confirmed: true };

    // No params: return distinct countries
    if (!country) {
      const salons = await prisma.salon.findMany({
        where: baseFilter,
        select: { country: true },
        distinct: ['country'],
        orderBy: { country: 'asc' },
      });

      const countries = salons.map(s => s.country);

      return NextResponse.json({
        success: true,
        countries,
      });
    }

    // Country only: return distinct cities for that country
    if (country && !city) {
      const salons = await prisma.salon.findMany({
        where: { ...baseFilter, country },
        select: { city: true },
        distinct: ['city'],
        orderBy: { city: 'asc' },
      });

      const cities = salons.map(s => s.city);

      return NextResponse.json({
        success: true,
        cities,
      });
    }

    // Country + City: return matching salons
    const salons = await prisma.salon.findMany({
      where: {
        ...baseFilter,
        country: country,
        city: city!,
      },
      select: {
        id: true,
        businessName: true,
        businessImage: true,
        type: true,
        address: true,
        city: true,
        country: true,
        isOpen: true,
      },
      orderBy: { businessName: 'asc' },
    });

    return NextResponse.json({
      success: true,
      salons,
    });
  } catch (error) {
    console.error('Error in find-salon:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
