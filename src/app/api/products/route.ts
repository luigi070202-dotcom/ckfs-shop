// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { Product } from '@/app/models/Products';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const team = searchParams.get('team');
    const year = searchParams.get('year');
    const kitType = searchParams.get('kitType');
    const condition = searchParams.get('condition');
    const brand = searchParams.get('brand');

    // Build dynamic query filter
    const filter: Record<string, any> = {};

    if (team) {
      filter.team = { $regex: new RegExp(team, 'i') }; // Case-insensitive search
    }
    if (year) {
      filter.year = year;
    }
    if (kitType) {
      filter.kitType = kitType;
    }
    if (condition) {
      filter.condition = Number(condition);
    }
    if (brand) {
      filter.brand = { $regex: new RegExp(brand, 'i') };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
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

    // Validate mandatory fields
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

    // Create the product
    const newProduct = await Product.create({
      title,
      slug,
      team,
      brand,
      year,
      condition: condition || 10,
      kitType: kitType || 'Home',
      spec: spec || 'Stadium',
      price,
      images,
      variants,
      hasCustomPrinting: body.hasCustomPrinting ?? true,
      printingPrice: body.printingPrice ?? 250,
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