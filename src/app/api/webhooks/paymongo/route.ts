import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { Order } from '@/app/models/Order';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const eventType = body?.data?.attributes?.type;

    // Listen for paid checkout session events
    if (eventType === 'checkout_session.payment.paid') {
      const checkoutSession = body.data.attributes.data;
      const orderId = checkoutSession?.attributes?.metadata?.orderId;

      if (orderId) {
        // Automatically update order status to PAID
        await Order.findByIdAndUpdate(orderId, {
          status: 'PAID',
        });
        console.log(`[PayMongo Webhook] Order ${orderId} marked as PAID`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[PayMongo Webhook Error]:', error.message);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}