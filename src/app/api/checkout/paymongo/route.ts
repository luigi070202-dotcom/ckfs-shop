import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { Product } from '@/app/models/Products';
import { Order } from '@/app/models/Order';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      customerName,
      email,
      phone,
      shippingAddress,
      city,
      province,
      postalCode,
      notes,
      items,
      subtotal,
      shippingFee,
      total,
    } = body;

    // Validate incoming customer details
    if (!customerName || !email || !phone || !shippingAddress || !city || !province) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required shipping details.' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Your cart is empty.' },
        { status: 400 }
      );
    }

    // 1. Atomically deduct inventory
    const updatedProducts: { productId: string; size: string; quantity: number }[] = [];

    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          'variants.size': item.size,
          'variants.stock': { $gte: item.quantity },
        } as any,
        {
          $inc: { 'variants.$.stock': -item.quantity },
        } as any,
        { new: true }
      );

      if (!updated) {
        // Rollback any items already deducted if one fails stock check
        for (const rollback of updatedProducts) {
          await Product.updateOne(
            { _id: rollback.productId, 'variants.size': rollback.size } as any,
            { $inc: { 'variants.$.stock': rollback.quantity } } as any
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: `Sorry, "${item.title}" (${item.size}) is no longer available in the requested quantity.`,
          },
          { status: 400 }
        );
      }

      updatedProducts.push({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      });
    }

    // 2. Save pending order in MongoDB
    const order = await Order.create({
      customerName,
      email,
      phone,
      shippingAddress,
      city,
      province,
      postalCode,
      notes,
      paymentMethod: 'PAYMONGO',
      items,
      subtotal,
      shippingFee,
      total,
      status: 'PENDING',
    });

    // 3. Format line items for PayMongo (Convert PHP ₱ to centavos: ₱1 = 100 centavos)
    const lineItems = items.map((item: any) => ({
      name: `${item.title} (${item.size})`,
      amount: Math.round(item.price * 100),
      currency: 'PHP',
      quantity: item.quantity,
      images: item.image ? [item.image] : [],
    }));

    if (shippingFee > 0) {
      lineItems.push({
        name: 'Standard Courier Shipping',
        amount: Math.round(shippingFee * 100),
        currency: 'PHP',
        quantity: 1,
        images: [],
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 4. Base64 encode Secret Key for Basic Auth
    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYMONGO_SECRET_KEY is missing from environment variables.');
    }
    const authHeader = Buffer.from(`${secretKey}:`).toString('base64');

    // 5. Create the Checkout Session
    const paymongoRes = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            description: `CK Football Shirts - Order #${order._id.toString().slice(-8).toUpperCase()}`,
            line_items: lineItems,
            payment_method_types: ['gcash', 'paymaya', 'card', 'dob', 'grab_pay'],
            success_url: `${appUrl}/checkout?success=${order._id}`,
            cancel_url: `${appUrl}/checkout?cancelled=${order._id}`,
            metadata: {
              orderId: order._id.toString(),
            },
          },
        },
      }),
    });

    const sessionData = await paymongoRes.json();

    if (!paymongoRes.ok || !sessionData.data) {
      throw new Error(sessionData.errors?.[0]?.detail || 'Failed to create PayMongo payment session.');
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: sessionData.data.attributes.checkout_url,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}