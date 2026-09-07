// src/app/api/checkout/confirm/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { Order } from '@/app/models/Order';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: 'PAID',
          paidAt: new Date(),
        },
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}