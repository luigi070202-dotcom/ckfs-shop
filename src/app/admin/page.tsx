// src/app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ShoppingBag, 
  Truck, 
  AlertTriangle, 
  ArrowUpRight, 
  Package, 
  CheckCircle2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      let res = await fetch('/api/admin/metrics');
      if (!res.ok) {
        res = await fetch('/admin/metrics');
      }

      if (!res.ok) {
        throw new Error(`Metrics endpoint returned status: ${res.status}`);
      }

      const json = await res.json();
      if (json.success) {
        setMetrics(json.data);
      }
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Title Bar & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <p className="text-xs text-zinc-500 font-mono mb-1">
            CK Football Shirts / Management Suite
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 uppercase">
            Store Overview
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={loading}
            className="text-xs border-zinc-300 hover:bg-zinc-100 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Link href="/admin/new-kit">
            <Button size="sm" className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs h-9 font-bold uppercase tracking-wider">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Kit
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <Card className="bg-white border-zinc-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-mono uppercase text-zinc-500">
              Gross Revenue
            </CardTitle>
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-950 font-mono">
              ₱{(metrics?.totalRevenue || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Paid & fulfilled orders</p>
          </CardContent>
        </Card>

        {/* Paid & Awaiting Dispatch */}
        <Card className="bg-white border-zinc-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-mono uppercase text-zinc-500">
              Paid & Awaiting Dispatch
            </CardTitle>
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-950 font-mono">
              {metrics?.paidOrdersCount || 0}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {(metrics?.paidOrdersCount || 0) === 1 ? '1 kit ready for waybill' : 'Kits ready for waybill'}
            </p>
          </CardContent>
        </Card>

        {/* Active Shipments */}
        <Card className="bg-white border-zinc-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-mono uppercase text-zinc-500">
              Active Shipments
            </CardTitle>
            <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-950 font-mono">
              {metrics?.dispatchedOrdersCount || 0}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">With couriers en route</p>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="bg-white border-zinc-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-mono uppercase text-zinc-500">
              Low Stock Alerts
            </CardTitle>
            <div className="w-8 h-8 rounded-md bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-950 font-mono">
              {metrics?.lowStockCount || 0}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Archive pieces with ≤ 1 left</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Row: Inventory Snapshot & Quick Orders Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Snapshot */}
        <Card className="bg-white border-zinc-200 shadow-xs lg:col-span-1">
          <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 pb-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Inventory Snapshot
            </CardTitle>
            <CardDescription className="text-[11px] text-zinc-500">
              Catalog distribution and unit counts.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-600">Listed Kit Models</span>
              </div>
              <span className="font-mono font-bold text-zinc-900 text-sm">
                {metrics?.totalKitsCount || 0}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-600">Total Physical Units</span>
              </div>
              <span className="font-mono font-bold text-zinc-900 text-sm">
                {metrics?.totalUnitsInStock || 0}
              </span>
            </div>

            <Link href="/admin/inventory" className="block pt-2">
              <Button variant="outline" className="w-full text-xs font-semibold h-9 border-zinc-300">
                View Full Inventory Archive
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Orders Stream */}
        <Card className="bg-white border-zinc-200 shadow-xs lg:col-span-2">
          <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                  Recent Purchases
                </CardTitle>
                <CardDescription className="text-[11px] text-zinc-500">
                  Latest checkout transactions submitted by customers.
                </CardDescription>
              </div>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm" className="text-xs text-zinc-600 hover:text-zinc-950">
                  Manage All Orders <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-10 text-center text-xs font-mono text-zinc-400">
                Refreshing transaction feed...
              </div>
            ) : metrics?.recentOrders?.length === 0 ? (
              <div className="p-10 text-center text-xs text-zinc-500">
                No orders recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 text-xs">
                {metrics?.recentOrders?.map((order: any) => (
                  <div
                    key={order._id}
                    className="p-4 flex items-center justify-between hover:bg-zinc-50/80 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-950">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-zinc-600 font-medium">
                          {order.customerName}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {order.items?.length || 0} kit(s) • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-zinc-950 text-right">
                        ₱{(order.total || 0).toLocaleString()}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : order.status === 'DISPATCHED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : order.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}