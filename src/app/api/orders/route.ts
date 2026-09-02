// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/db';
import { Product } from '../../models/Products';
import { Order } from '../../models/Order';

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
      paymentMethod,
      items,
      subtotal,
      shippingFee,
      total,
    } = body;

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

    const updatedProducts: { productId: string; size: string; quantity: number }[] = [];

    for (const item of items) {
      // Cast the query and update objects as any to satisfy Mongoose strict type constraints
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
        // Rollback previous successful decrements if any shirt variant fails
        for (const rollback of updatedProducts) {
          await Product.updateOne(
            { _id: rollback.productId, 'variants.size': rollback.size } as any,
            { $inc: { 'variants.$.stock': rollback.quantity } } as any
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: `Sorry, "${item.title}" (Size: ${item.size}) is no longer available in the requested quantity.`,
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

    // Persist the order in MongoDB
    const order = await Order.create({
      customerName,
      email,
      phone,
      shippingAddress,
      city,
      province,
      postalCode,
      notes,
      paymentMethod,
      items,
      subtotal,
      shippingFee,
      total,
      status: 'PENDING',
    });

    return NextResponse.json({ success: true, orderId: order._id });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process order.' },
      { status: 500 }
    );
  }
}