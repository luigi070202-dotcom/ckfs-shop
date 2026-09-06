// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { Product } from '@/app/models/Products';
import { getAdminSession } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

// Helper to escape regex special characters
function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim().slice(0, 100);
    const team = searchParams.get('team')?.trim().slice(0, 100);
    const year = searchParams.get('year')?.trim().slice(0, 10);
    const kitType = searchParams.get('kitType')?.trim();
    const condition = searchParams.get('condition');
    const brand = searchParams.get('brand')?.trim().slice(0, 50);

    // Pagination parameters with fallback defaults
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '12', 10)));
    const skip = (page - 1) * limit;

    // Build dynamic query filter
    const filter: Record<string, any> = {};

    // General keyword search across title, team, and brand
    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { team: { $regex: safeSearch, $options: 'i' } },
        { brand: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    if (team) {
      filter.team = { $regex: escapeRegex(team), $options: 'i' };
    }
    if (year) {
      filter.year = year;
    }
    if (kitType) {
      filter.kitType = kitType;
    }
    if (condition) {
      const parsedCondition = Number(condition);
      if (!isNaN(parsedCondition)) {
        filter.condition = parsedCondition;
      }
    }
    if (brand) {
      filter.brand = { $regex: escapeRegex(brand), $options: 'i' };
    }

    // Run query and total count in parallel
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Enforce Admin Session Authentication
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();

    const {
      title,
      team,
      brand,
      year,
      condition,
      kitType,
      spec,
      price,
      images,
      variants,
    } = body;

    // 2. Validate mandatory fields
    if (!title || !team || !brand || !year || !price || !images || !variants) {
      return NextResponse.json(
        { success: false, error: 'Missing required product fields' },
        { status: 400 }
      );
    }

    // Auto-generate URL-friendly slug if not provided
    const slug =
      body.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    // Check for duplicate slug
    const existing = await Product.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A kit with this title or slug already exists' },
        { status: 409 }
      );
    }

    // 3. Create product with sanitized numerical values
    const newProduct = await Product.create({
      title: title.trim(),
      slug,
      team: team.trim(),
      brand: brand.trim(),
      year: String(year).trim(),
      condition: (Number(condition) || 10) as 8 | 9 | 10,
      kitType: kitType || 'Home',
      spec: spec || 'Stadium',
      price: Math.max(0, Number(price) || 0),
      images: Array.isArray(images) ? images : [images],
      variants: Array.isArray(variants) ? variants : [],
      hasCustomPrinting: body.hasCustomPrinting ?? true,
      printingPrice: Math.max(0, Number(body.printingPrice) || 250),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}