// src/app/api/seed/route.ts
import { NextResponse } from 'next/server';
import { seedProducts } from '@/app/lib/seed';

export async function GET() {
  try {
    const products = await seedProducts();
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with sample kits!',
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed database' },
      { status: 500 }
    );
  }
}