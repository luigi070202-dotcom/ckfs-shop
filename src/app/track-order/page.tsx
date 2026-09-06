// src/app/track-order/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Home, 
  ArrowLeft,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STAGES = [
  { key: 'PENDING', label: 'Placed', icon: Clock },
  { key: 'PAID', label: 'Payment Confirmed', icon: CheckCircle2 },
  { key: 'DISPATCHED', label: 'Dispatched', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

const ITEMS_PER_PAGE = 3;

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [query, setQuery] = useState(initialRef);
  const [matchedOrders, setMatchedOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const executeSearch = async (searchTarget: string) => {
    if (!searchTarget.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setMatchedOrders([]);
    setCurrentPage(1);

    try {
      const res = await fetch('/api/orders');
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Unable to retrieve tracking details.');
      }

      const cleanQuery = searchTarget.trim().toLowerCase();

      const matches = json.data.filter(
        (o: any) =>
          o._id.toLowerCase() === cleanQuery ||
          o._id.slice(-6).toLowerCase() === cleanQuery ||
          o.email?.toLowerCase() === cleanQuery
      );

      if (matches.length > 0) {
        setMatchedOrders(matches);
      } else {
        setErrorMsg('No orders found matching that Reference ID or Email address.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error looking up tracking details.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if reference ID is in the query params
  useEffect(() => {
    if (initialRef) {
      executeSearch(initialRef);
    }
  }, [initialRef]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const getStageIndex = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'CANCELLED') return -1;
    const index = STAGES.findIndex((st) => st.key === s);
    return index !== -1 ? index : 0;
  };

  const totalPages = Math.ceil(matchedOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = matchedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Store
      </Link>

      <div className="text-center space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950">
          Track Your Shipment
        </h1>
        <p className="text-xs text-zinc-500">
          Enter your Order ID, reference code, or checkout email address.
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 6a9d38... or your email"
            className="pl-9 text-xs bg-zinc-50 border-zinc-200 h-10 font-mono"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="h-10 px-6 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider"
        >
          {loading ? 'Searching...' : 'Track'}
        </Button>
      </form>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {matchedOrders.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>
              Showing <strong className="text-zinc-900">{startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, matchedOrders.length)}</strong> of <strong className="text-zinc-900">{matchedOrders.length}</strong> orders
            </span>
            {totalPages > 1 && (
              <span>Page {currentPage} of {totalPages}</span>
            )}
          </div>

          <div className="space-y-6">
            {paginatedOrders.map((order) => {
              const currentStageIndex = getStageIndex(order.status);

              return (
                <Card key={order._id} className="bg-white border-zinc-200 shadow-xs overflow-hidden">
                  <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                          Order Reference
                        </span>
                        <CardTitle className="text-sm font-mono font-bold text-zinc-950">
                          #{order._id.slice(-6).toUpperCase()}
                        </CardTitle>
                      </div>
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : order.status === 'DISPATCHED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : order.status === 'PAID'
                            ? 'bg-zinc-100 text-zinc-800 border-zinc-200'
                            : order.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-6">
                    <div className="py-2">
                      <div className="flex items-center justify-between relative">
                        {STAGES.map((st, i) => {
                          const Icon = st.icon;
                          const isDone = i <= currentStageIndex;
                          return (
                            <div key={st.key} className="flex flex-col items-center relative z-10">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                                  isDone
                                    ? 'bg-zinc-950 border-zinc-950 text-white'
                                    : 'bg-white border-zinc-200 text-zinc-400'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-mono text-zinc-600 mt-1.5 text-center max-w-[70px]">
                                {st.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {order.trackingNumber ? (
                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-mono text-zinc-400 uppercase">Courier Service</p>
                          <p className="text-xs font-bold text-zinc-900">{order.courier || 'Standard Courier'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-mono text-zinc-400 uppercase">Tracking Number</p>
                          <p className="text-xs font-mono font-bold text-zinc-900">{order.trackingNumber}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                        Your package is being verified and prepared for dispatch. Waybill details will appear here once assigned to a courier.
                      </div>
                    )}

                    <div className="text-xs space-y-1.5">
                      <p className="font-bold text-zinc-900 uppercase text-[10px] font-mono">Ordered Kits</p>
                      <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg overflow-hidden">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="p-2.5 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-semibold text-zinc-950">{item.title}</p>
                              <p className="text-[11px] text-zinc-500 font-mono">
                                Size: {item.size} × {item.quantity}
                              </p>
                            </div>
                            <span className="font-mono font-bold text-zinc-900">
                              ₱{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-zinc-600 border-t border-zinc-100 pt-3">
                      <p className="font-bold text-zinc-900 uppercase text-[10px] font-mono">Shipping Details</p>
                      <p className="font-medium text-zinc-900">{order.customerName}</p>
                      <p>{order.shippingAddress}, {order.city}, {order.province} {order.postalCode}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-xs h-8"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </Button>

              <span className="text-xs font-mono text-zinc-600">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-xs h-8"
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono text-zinc-400">Loading tracking system...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}