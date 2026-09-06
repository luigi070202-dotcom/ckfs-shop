// src/app/api/orders/track/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { Order } from '@/app/models/Order';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    const cleanQuery = (query || '').trim();

    if (!cleanQuery) {
      return NextResponse.json(
        { success: false, error: 'Please provide an Order ID or Email address.' },
        { status: 400 }
      );
    }

    await connectDB();

    const searchConditions: any[] = [
      { email: cleanQuery.toLowerCase() },
    ];

    // If it's a full 24-character Mongo hex ID
    if (mongoose.Types.ObjectId.isValid(cleanQuery) && cleanQuery.length === 24) {
      searchConditions.push({ _id: cleanQuery });
    }

    // If it's a 6-character short reference
    if (cleanQuery.length === 6 && /^[a-fA-F0-9]{6}$/.test(cleanQuery)) {
      searchConditions.push({
        $expr: {
          $regexMatch: {
            input: { $toString: '$_id' },
            regex: `${cleanQuery}$`,
            options: 'i',
          },
        },
      });
    }

    const orders = await Order.find({ $or: searchConditions })
      .select('status items total shippingAddress city province postalCode customerName courier trackingNumber createdAt')
      .sort({ createdAt: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No orders found matching that Reference ID or Email address.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Unable to look up order details.' },
      { status: 500 }
    );
  }
}