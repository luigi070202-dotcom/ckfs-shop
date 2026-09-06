// src/app/admin/orders/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  RefreshCw, 
  Search, 
  FilterX, 
  AlertCircle, 
  ShoppingBag, 
  Eye, 
  CheckCircle2,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Modal & status update state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  // Dispatch fields state for modal
  const [courierInput, setCourierInput] = useState('J&T Express');
  const [trackingInput, setTrackingInput] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      } else {
        setErrorMessage(json.error || 'Failed to load orders.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Synchronize modal inputs when an order is opened
  useEffect(() => {
    if (selectedOrder) {
      setCourierInput(selectedOrder.courier || 'J&T Express');
      setTrackingInput(selectedOrder.trackingNumber || '');
    }
  }, [selectedOrder]);

  const handleUpdateStatus = async (
    orderId: string, 
    updates: { status?: string; courier?: string; trackingNumber?: string }
  ) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ...updates }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? json.data : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(json.data);
        }
        setSuccessMessage('Order record successfully updated.');
        setTimeout(() => setSuccessMessage(''), 2500);
      } else {
        alert(json.error || 'Failed to update order status');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating order');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order._id?.toLowerCase().includes(q) ||
        order.email?.toLowerCase().includes(q) ||
        order.customerName?.toLowerCase().includes(q) ||
        order.phone?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || (order.status || 'PENDING') === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'ALL';

  return (
    <div className="space-y-6 pb-16">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <p className="text-xs text-zinc-500 font-mono mb-1">
            Admin / Order Processing & Fulfillment
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 uppercase">
              Customer Orders
            </h1>
            <span className="text-xs text-zinc-500 font-mono bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
              {filteredOrders.length} of {orders.length} orders
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          disabled={loading}
          className="text-xs border-zinc-300 hover:bg-zinc-100 h-9"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-zinc-900 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search by ID, name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-xs bg-zinc-50 border-zinc-200 text-zinc-900 h-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] text-xs bg-zinc-50 border-zinc-200 h-9">
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
            <SelectItem value="PENDING" className="text-xs">Pending</SelectItem>
            <SelectItem value="PAID" className="text-xs">Paid</SelectItem>
            <SelectItem value="DISPATCHED" className="text-xs">Dispatched</SelectItem>
            <SelectItem value="DELIVERED" className="text-xs">Delivered</SelectItem>
            <SelectItem value="CANCELLED" className="text-xs">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
            }}
            className="h-9 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <FilterX className="w-3.5 h-3.5 mr-1" /> Clear Filters
          </Button>
        )}
      </div>

      {/* Orders Table */}
      <Card className="bg-white border-zinc-200 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-950">
            Order Registry
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Real-time customer transactions, courier details, and dispatch status.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-20 text-xs font-mono text-zinc-500">
              Fetching orders from MongoDB...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 text-xs text-zinc-500 space-y-2">
              <ShoppingBag className="w-8 h-8 text-zinc-300 mx-auto" />
              <p>No customer orders match your search or filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50/70 hover:bg-zinc-50/70 text-[11px] uppercase font-mono text-zinc-600">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Courier / Waybill</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const status = order.status || 'PENDING';
                    const isPaid = status === 'PAID' || status === 'DELIVERED';
                    const isDispatched = status === 'DISPATCHED';

                    return (
                      <TableRow key={order._id} className="text-xs hover:bg-zinc-50/80 transition-colors">
                        <TableCell className="font-mono text-[11px] font-bold text-zinc-900">
                          #{order._id.slice(-6).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-zinc-950">{order.customerName || 'Customer'}</p>
                            <p className="text-[11px] text-zinc-500 font-mono">{order.email || order.phone || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-zinc-950">
                          ₱{(order.total || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {order.trackingNumber ? (
                            <div>
                              <p className="font-semibold text-zinc-900 text-[11px]">{order.courier || 'Courier'}</p>
                              <p className="text-[10px] font-mono text-zinc-500">{order.trackingNumber}</p>
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-mono italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={status}
                            onValueChange={(val) => handleUpdateStatus(order._id, { status: val })}
                            disabled={updating}
                          >
                            <SelectTrigger 
                              className={`h-7 w-[125px] text-[10px] font-mono font-bold uppercase border ${
                                isDispatched
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : isPaid
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : status === 'PENDING'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING" className="text-xs">PENDING</SelectItem>
                              <SelectItem value="PAID" className="text-xs">PAID</SelectItem>
                              <SelectItem value="DISPATCHED" className="text-xs">DISPATCHED</SelectItem>
                              <SelectItem value="DELIVERED" className="text-xs">DELIVERED</SelectItem>
                              <SelectItem value="CANCELLED" className="text-xs">CANCELLED</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-zinc-500 font-mono text-[11px]">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="h-7 text-xs border-zinc-200 hover:bg-zinc-100"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Order & Dispatch Modal */}
      <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="bg-white border-zinc-200 text-zinc-900 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold uppercase tracking-tight">
              Order #{selectedOrder?._id?.slice(-6).toUpperCase()} Details
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 font-mono">
              Placed on {selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Shipping Information */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 space-y-1.5">
                <p className="font-bold text-zinc-900 uppercase text-[11px] font-mono">Shipping & Contact</p>
                <div className="grid grid-cols-2 gap-2 pt-1 text-zinc-700">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">RECIPIENT</span>
                    <span className="font-semibold text-zinc-900">{selectedOrder.customerName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">PHONE</span>
                    <span>{selectedOrder.phone || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400 block text-[10px]">EMAIL</span>
                    <span className="font-mono">{selectedOrder.email || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400 block text-[10px]">ADDRESS</span>
                    <span>
                      {selectedOrder.shippingAddress}, {selectedOrder.city}, {selectedOrder.province} {selectedOrder.postalCode}
                    </span>
                  </div>
                  {selectedOrder.notes && (
                    <div className="col-span-2 border-t border-zinc-200 pt-1.5 mt-1">
                      <span className="text-zinc-400 block text-[10px]">ORDER NOTES</span>
                      <span className="italic text-zinc-600">{selectedOrder.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <p className="font-bold text-zinc-900 uppercase text-[11px] font-mono mb-2">Purchased Items</p>
                <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 overflow-hidden">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-zinc-950">{item.title}</p>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          Size: <strong className="text-zinc-800">{item.size}</strong> × {item.quantity}
                        </p>
                      </div>
                      <p className="font-mono font-bold text-zinc-900">
                        ₱{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Courier & Tracking Waybill Assignment */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 space-y-3">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-zinc-700" />
                  <p className="font-bold text-zinc-900 uppercase text-[11px] font-mono">
                    Logistics & Waybill Assignment
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                      Courier
                    </label>
                    <Select value={courierInput} onValueChange={setCourierInput}>
                      <SelectTrigger className="h-8 text-xs bg-white border-zinc-200">
                        <SelectValue placeholder="Select Courier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="J&T Express" className="text-xs">J&T Express</SelectItem>
                        <SelectItem value="LBC Express" className="text-xs">LBC Express</SelectItem>
                        <SelectItem value="Flash Express" className="text-xs">Flash Express</SelectItem>
                        <SelectItem value="Grab / Lalamove" className="text-xs">Same-day (Grab/Lalamove)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                      Tracking / Waybill No.
                    </label>
                    <Input
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="e.g. 782910384912"
                      className="h-8 text-xs bg-white border-zinc-200 font-mono"
                    />
                  </div>
                </div>

                <Button
                  size="sm"
                  disabled={updating}
                  onClick={() =>
                    handleUpdateStatus(selectedOrder._id, {
                      status: 'DISPATCHED',
                      courier: courierInput,
                      trackingNumber: trackingInput,
                    })
                  }
                  className="w-full h-8 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Save & Mark as Dispatched
                </Button>
              </div>

              {/* Order Status Dropdown */}
              <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-zinc-500 font-mono text-[11px]">Current Status:</span>
                <Select
                  value={selectedOrder.status || 'PENDING'}
                  onValueChange={(val) => handleUpdateStatus(selectedOrder._id, { status: val })}
                  disabled={updating}
                >
                  <SelectTrigger className="h-8 w-[140px] text-xs bg-white border-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING" className="text-xs">PENDING</SelectItem>
                    <SelectItem value="PAID" className="text-xs">PAID</SelectItem>
                    <SelectItem value="DISPATCHED" className="text-xs">DISPATCHED</SelectItem>
                    <SelectItem value="DELIVERED" className="text-xs">DELIVERED</SelectItem>
                    <SelectItem value="CANCELLED" className="text-xs">CANCELLED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}