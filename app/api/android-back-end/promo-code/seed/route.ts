import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Pre-defined 10 promo codes (6 uppercase characters each)
const PROMO_CODES = [
  'NSC24A',
  'PRO30B',
  'NAIL5X',
  'SAL0NK',
  'FRE3PR',
  'VIP30D',
  'GLAM6Y',
  'BEAU7Z',
  'SPAR3K',
  'TOP10N',
];

// POST: Seed promo codes into the database (run once)
export async function POST() {
  try {
    // Check if codes already exist
    const existing = await prisma.promoCode.count();
    if (existing > 0) {
      return NextResponse.json(
        { message: `Promo codes already seeded (${existing} codes exist)` },
        { status: 200 }
      );
    }

    // Create all 10 promo codes
    const created = await prisma.promoCode.createMany({
      data: PROMO_CODES.map((code) => ({
        code,
        isUsed: false,
      })),
    });

    return NextResponse.json({
      message: `Successfully seeded ${created.count} promo codes`,
      codes: PROMO_CODES,
    }, { status: 201 });
  } catch (error) {
    console.error('Seed promo codes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
