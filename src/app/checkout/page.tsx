// src/app/checkout/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/app/store/useCartStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const DEMO_CHECKOUT_DATA = {
  customerName: 'Juan Dela Cruz',
  email: 'juan.reviewer@example.com',
  phone: '09171234567',
  shippingAddress: 'Unit 4B, Emerald Tower, F. Estrella St.',
  city: 'Malolos',
  province: 'Bulacan',
  postalCode: '3000',
  notes: 'Portfolio review order. Please handle with care!',
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const orderSuccessId = searchParams.get('success');
  const orderCancelledId = searchParams.get('cancelled');

  const { items, getCartTotal, clearCart } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    shippingAddress: '',
    city: '',
    province: '',
    postalCode: '',
    notes: '',
  });

  // Auto-sync status from PENDING to PAID when PayMongo redirects back with ?success=...
  useEffect(() => {
    if (!orderSuccessId) return;

    fetch('/api/checkout/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: orderSuccessId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsConfirmed(true);
        }
      })
      .catch((err) => console.error('Failed to auto-confirm order:', err));
  }, [orderSuccessId]);

  const subtotal = getCartTotal();
  const shippingFee = subtotal > 0 ? 150 : 0;
  const total = subtotal + shippingFee;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFillDemo = () => {
    setFormData(DEMO_CHECKOUT_DATA);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        items,
        subtotal,
        shippingFee,
        total,
      };

      const res = await fetch('/api/checkout/paymongo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate payment.');
      }

      clearCart();
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during checkout.');
      setLoading(false);
    }
  };

  // State: Payment completed & returning from PayMongo
  if (orderSuccessId) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white border border-zinc-200 rounded-xl p-8 max-w-md w-full mx-auto text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-950">
              Payment Confirmed!
            </h1>
            <span className="inline-block mt-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {isConfirmed ? 'Database Status: PAID' : 'Processing Payment...'}
            </span>
          </div>

          <p className="text-xs text-zinc-500">
            Thank you for your purchase. Your order reference code is:
          </p>

          <p className="font-mono text-xs sm:text-sm font-bold bg-zinc-100 py-2 px-3 rounded-md text-zinc-900 inline-block border border-zinc-200">
            #{orderSuccessId.slice(-6).toUpperCase()}{' '}
            <span className="text-zinc-400 font-normal">({orderSuccessId})</span>
          </p>

          <p className="text-xs text-zinc-600 leading-relaxed">
            Your kit has been secured and moved into the dispatch fulfillment queue. Courier waybill tracking details will update once packaged.
          </p>

          <div className="flex flex-col gap-2 pt-3">
            <Link href={`/track-order?ref=${orderSuccessId}`}>
              <Button className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider h-11 cursor-pointer">
                Track Your Package
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full text-xs font-semibold h-11 border-zinc-200 cursor-pointer">
                Return to Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State: Payment cancelled or abandoned
  if (orderCancelledId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
          <RotateCcw className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-950">
          Checkout Incomplete
        </h1>
        <p className="text-xs text-zinc-600">
          The payment session was cancelled. You can review your items and try checking out again.
        </p>
        <Link href="/checkout">
          <Button className="mt-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider h-11 px-6 cursor-pointer">
            Try Checkout Again
          </Button>
        </Link>
      </div>
    );
  }

  // State: Empty Bag
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-zinc-400" />
        <h2 className="text-lg font-bold text-zinc-900">Your bag is empty</h2>
        <p className="text-xs text-zinc-500">
          Add shirts from the archive before checking out.
        </p>
        <Link href="/">
          <Button variant="outline" size="sm" className="text-xs cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Store
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950 mt-2">
          Checkout & Dispatch
        </h1>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Contact */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950">
                  1. Customer Details
                </h2>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Fill Demo Info
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Full Name</Label>
                  <Input
                    required
                    name="customerName"
                    placeholder="e.g. Juan Dela Cruz"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email Address</Label>
                  <Input
                    required
                    type="email"
                    name="email"
                    placeholder="juan@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Contact Number</Label>
                  <Input
                    required
                    name="phone"
                    placeholder="0917 123 4567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2 border-b border-zinc-100 pb-3">
                <Truck className="w-4 h-4 text-zinc-700" /> 2. Delivery Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Street Address / House No.</Label>
                  <Input
                    required
                    name="shippingAddress"
                    placeholder="Unit 12B, Rizal St., Brgy. San Antonio"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">City / Municipality</Label>
                  <Input
                    required
                    name="city"
                    placeholder="e.g. Malolos"
                    value={formData.city}
                    onChange={handleChange}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Province / Region</Label>
                  <Input
                    required
                    name="province"
                    placeholder="e.g. Bulacan"
                    value={formData.province}
                    onChange={handleChange}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Postal Code</Label>
                  <Input
                    required
                    name="postalCode"
                    placeholder="3000"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Delivery Notes (Optional)</Label>
                  <Input
                    name="notes"
                    placeholder="Landmarks, preferred delivery hours, etc."
                    value={formData.notes}
                    onChange={handleChange}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Notice */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2 border-b border-zinc-100 pb-3">
                <CreditCard className="w-4 h-4 text-zinc-700" /> 3. Payment Method
              </h2>
              <div className="p-4 rounded-lg border border-zinc-200 bg-zinc-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">
                    PayMongo Automated Checkout
                  </span>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold uppercase">
                    Test Mode
                  </span>
                </div>
                <p className="text-xs text-zinc-600">
                  You will be securely redirected to PayMongo to complete payment via <strong>GCash</strong>, <strong>Maya</strong>, <strong>Credit/Debit Card</strong>, or <strong>Online Banking</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs space-y-4 sticky top-24">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-100 pb-3">
                Order Summary ({items.length})
              </h2>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 text-xs">
                    <div className="relative w-12 h-14 rounded bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-zinc-950 truncate">{item.title}</p>
                      <p className="text-[11px] font-mono text-zinc-500">
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                      <p className="font-mono font-bold text-zinc-900 pt-0.5">
                        ₱{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 pt-3 border-t border-zinc-100 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium text-zinc-900">
                    ₱{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Nationwide Shipping</span>
                  <span className="font-mono font-medium text-zinc-900">
                    ₱{shippingFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-950 pt-2 border-t border-zinc-200">
                  <span>Total Amount</span>
                  <span className="font-mono text-base font-black">
                    ₱{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                {loading
                  ? 'Connecting to PayMongo...'
                  : `Proceed to Payment • ₱${total.toLocaleString()}`}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                <span>Verified original shirts • Secure test checkout</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs text-zinc-500">
          Loading checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}