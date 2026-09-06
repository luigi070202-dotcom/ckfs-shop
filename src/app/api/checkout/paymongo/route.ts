// src/app/api/checkout/paymongo/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { Product } from '@/app/models/Products';
import { Order } from '@/app/models/Order';

export const dynamic = 'force-dynamic';

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
    } = body;

    // 1. Validate required customer fields
    if (!customerName || !email || !phone || !shippingAddress || !city || !province) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required shipping details.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Your cart is empty.' },
        { status: 400 }
      );
    }

    // 2. Validate products, recalculate prices server-side, and deduct stock
    let serverSubtotal = 0;
    const validatedItems: any[] = [];
    const updatedProducts: { productId: string; size: string; quantity: number }[] = [];

    for (const item of items) {
      const quantity = Math.max(1, Number(item.quantity) || 1);

      // Verify product existence in DB
      const product = await Product.findById(item.productId || item.id);
      if (!product) {
        return NextResponse.json(
          { success: false, error: 'One or more kits in your cart no longer exist.' },
          { status: 400 }
        );
      }

      // Verify variant availability
      const variant = product.variants?.find((v: any) => v.size === item.size);
      if (!variant) {
        return NextResponse.json(
          { success: false, error: `Size ${item.size} is unavailable for ${product.title}.` },
          { status: 400 }
        );
      }

      // Atomic stock deduction
      const updated = await Product.findOneAndUpdate(
        {
          _id: product._id,
          'variants.size': item.size,
          'variants.stock': { $gte: quantity },
        } as any,
        {
          $inc: { 'variants.$.stock': -quantity },
        } as any,
        { new: true }
      );

      if (!updated) {
        // Rollback any earlier deductions in this batch
        for (const rollback of updatedProducts) {
          await Product.updateOne(
            { _id: rollback.productId, 'variants.size': rollback.size } as any,
            { $inc: { 'variants.$.stock': rollback.quantity } } as any
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: `Sorry, "${product.title}" (${item.size}) has insufficient stock.`,
          },
          { status: 400 }
        );
      }

      updatedProducts.push({
        productId: product._id.toString(),
        size: item.size,
        quantity,
      });

      // Price derived strictly from database record
      const actualUnitPrice = Number(product.price) || 0;
      serverSubtotal += actualUnitPrice * quantity;

      validatedItems.push({
        productId: product._id,
        title: product.title,
        price: actualUnitPrice,
        size: item.size,
        quantity,
        image: product.images?.[0] || '',
      });
    }

    // 3. Server-computed shipping fee and total
    const serverShippingFee = serverSubtotal > 0 ? 150 : 0;
    const serverTotal = serverSubtotal + serverShippingFee;

    // 4. Save pending order with tamper-proof server values
    const order = await Order.create({
      customerName,
      email: email.toLowerCase().trim(),
      phone,
      shippingAddress,
      city,
      province,
      postalCode: postalCode || '',
      notes: notes || '',
      paymentMethod: 'PAYMONGO',
      items: validatedItems,
      subtotal: serverSubtotal,
      shippingFee: serverShippingFee,
      total: serverTotal,
      status: 'PENDING',
    });

    // 5. Format verified line items for PayMongo (PHP to centavos)
    const lineItems = validatedItems.map((item: any) => ({
      name: `${item.title} (${item.size})`,
      amount: Math.round(item.price * 100),
      currency: 'PHP',
      quantity: item.quantity,
      images: item.image ? [item.image] : [],
    }));

    if (serverShippingFee > 0) {
      lineItems.push({
        name: 'Standard Courier Shipping',
        amount: Math.round(serverShippingFee * 100),
        currency: 'PHP',
        quantity: 1,
        images: [],
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYMONGO_SECRET_KEY is missing from environment variables.');
    }
    const authHeader = Buffer.from(`${secretKey}:`).toString('base64');

    // 6. Create PayMongo Checkout Session
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
            description: `CK Football Shirts - Order #${order._id.toString().slice(-6).toUpperCase()}`,
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
      // Rollback deducted stock if PayMongo API fails
      for (const rollback of updatedProducts) {
        await Product.updateOne(
          { _id: rollback.productId, 'variants.size': rollback.size } as any,
          { $inc: { 'variants.$.stock': rollback.quantity } } as any
        );
      }
      await Order.findByIdAndDelete(order._id);

      throw new Error(
        sessionData.errors?.[0]?.detail || 'Failed to create PayMongo payment session.'
      );
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