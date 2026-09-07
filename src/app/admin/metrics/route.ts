// src/app/api/admin/metrics/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/db'; // adjust path to your lib/db if needed[cite: 1]
import { Product } from '@/app/models/Products';
import { Order } from '@/app/models/Order';
import { getAdminSession } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Verify Admin JWT before executing any queries
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Valid admin session required' },
        { status: 401 }
      );
    }

    await connectDB();

    // 2. Query Orders
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    const totalRevenue = orders
      .filter((o: any) => ['PAID', 'DISPATCHED', 'DELIVERED'].includes(o.status))
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    // Filter order counts by status
    const paidOrdersCount = orders.filter((o: any) => o.status === 'PAID').length;
    const pendingOrdersCount = orders.filter((o: any) => o.status === 'PENDING').length;
    const dispatchedOrdersCount = orders.filter((o: any) => o.status === 'DISPATCHED').length;

    // 3. Query Kit Inventory
    const products = await Product.find({}).lean();

    const totalKitsCount = products.length;
    let totalUnitsInStock = 0;
    let lowStockCount = 0;

    products.forEach((prod: any) => {
      let kitStock = 0;
      if (Array.isArray(prod.variants)) {
        prod.variants.forEach((v: any) => {
          kitStock += Number(v.stock) || 0;
        });
      } else if (typeof prod.stock === 'number') {
        kitStock += prod.stock;
      }

      totalUnitsInStock += kitStock;

      if (kitStock <= 1) {
        lowStockCount += 1;
      }
    });

    const recentOrders = orders.slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        ordersCount: orders.length,
        paidOrdersCount,
        pendingOrdersCount,
        dispatchedOrdersCount,
        totalKitsCount,
        totalUnitsInStock,
        lowStockCount,
        recentOrders,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to aggregate store metrics' },
      { status: 500 }
    );
  }
}