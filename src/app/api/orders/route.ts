// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db'; // Adjust path if needed
import { Product } from '@/app/models/Products';
import { Order } from '@/app/models/Order';
import { getAdminSession } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

// 1. GET /api/orders — Admin-only order registry fetch
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// 2. POST /api/orders — Secure order creation with server-side price validation
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
    } = body;

    // Validate required delivery details
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

    let calculatedSubtotal = 0;
    const validatedItems: any[] = [];
    const updatedProducts: { productId: string; size: string; quantity: number }[] = [];

    // Verify inventory, atomic decrement, and server-side price calculation
    for (const item of items) {
      const quantity = Math.max(1, Number(item.quantity) || 1);

      // 1. Fetch live product from DB to obtain official price
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product no longer exists in catalog.` },
          { status: 400 }
        );
      }

      // Check variant existence
      const variant = product.variants?.find((v: any) => v.size === item.size);
      if (!variant) {
        return NextResponse.json(
          { success: false, error: `Size ${item.size} is unavailable for ${product.title}.` },
          { status: 400 }
        );
      }

      // 2. Atomic stock decrement
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          'variants.size': item.size,
          'variants.stock': { $gte: quantity },
        } as any,
        {
          $inc: { 'variants.$.stock': -quantity },
        } as any,
        { new: true }
      );

      if (!updated) {
        // Rollback previous successful decrements
        for (const rollback of updatedProducts) {
          await Product.updateOne(
            { _id: rollback.productId, 'variants.size': rollback.size } as any,
            { $inc: { 'variants.$.stock': rollback.quantity } } as any
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: `Sorry, "${product.title}" (Size: ${item.size}) has insufficient stock.`,
          },
          { status: 400 }
        );
      }

      updatedProducts.push({
        productId: item.productId,
        size: item.size,
        quantity,
      });

      // Price taken strictly from database
      const itemPrice = Number(product.price) || 0;
      calculatedSubtotal += itemPrice * quantity;

      validatedItems.push({
        productId: product._id,
        title: product.title,
        price: itemPrice,
        size: item.size,
        quantity,
        image: product.images?.[0] || item.image || '',
      });
    }

    // Fixed server shipping fee rule
    const calculatedShippingFee = calculatedSubtotal > 0 ? 150 : 0;
    const calculatedTotal = calculatedSubtotal + calculatedShippingFee;

    // Persist verified order
    const order = await Order.create({
      customerName,
      email: email.toLowerCase().trim(),
      phone,
      shippingAddress,
      city,
      province,
      postalCode: postalCode || '',
      notes: notes || '',
      paymentMethod: paymentMethod || 'PAYMONGO',
      items: validatedItems,
      subtotal: calculatedSubtotal,
      shippingFee: calculatedShippingFee,
      total: calculatedTotal,
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

// 3. PATCH /api/orders — Admin-only status and tracking updates
export async function PATCH(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { orderId, status, courier, trackingNumber } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing orderId' },
        { status: 400 }
      );
    }

    const updateFields: Record<string, any> = {};

    if (status) {
      updateFields.status = status;
      if (status === 'DISPATCHED') {
        updateFields.dispatchedAt = new Date();
      }
    }

    if (courier !== undefined) {
      updateFields.courier = courier;
    }

    if (trackingNumber !== undefined) {
      updateFields.trackingNumber = trackingNumber;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}