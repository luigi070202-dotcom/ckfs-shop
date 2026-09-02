// src/app/checkout/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/app/store/useCartStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  CreditCard,
  Building2,
  Banknote,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    shippingAddress: '',
    city: '',
    province: '',
    postalCode: '',
    notes: '',
    paymentMethod: 'GCASH',
  });

  const subtotal = getCartTotal();
  const shippingFee = subtotal > 0 ? 150 : 0; // Flat-rate nationwide shipping (₱150)
  const total = subtotal + shippingFee;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to place order.');
      }

      clearCart();
      setOrderComplete(data.orderId);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-950">
          Order Confirmed!
        </h1>
        <p className="text-xs font-mono text-zinc-500">
          Reference Number:{' '}
          <span className="font-bold text-zinc-900">{orderComplete}</span>
        </p>
        <p className="text-sm text-zinc-600 max-w-md">
          Thank you for securing your kit with CK Football Shirts. We have logged
          your delivery details and will process your order promptly.
        </p>
        <Link href="/">
          <Button className="mt-4 bg-zinc-950 hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider">
            Return to Store
          </Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-zinc-400" />
        <h2 className="text-lg font-bold text-zinc-900">Your bag is empty</h2>
        <p className="text-xs text-zinc-500">
          Add shirts from the archive before checking out.
        </p>
        <Link href="/">
          <Button variant="outline" size="sm" className="text-xs">
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
          {/* Shipping & Payment Fields */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Contact */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-100 pb-3">
                1. Customer Details
              </h2>
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

            {/* Delivery Details */}
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
                    placeholder="e.g. Quezon City"
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
                    placeholder="e.g. Metro Manila"
                    value={formData.province}
                    onChange={handleChange}
                    className="text-xs"
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

            {/* Payment Selector */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2 border-b border-zinc-100 pb-3">
                <CreditCard className="w-4 h-4 text-zinc-700" /> 3. Payment Method
              </h2>
              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, paymentMethod: val }))
                }
                className="space-y-2"
              >
                <label className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg cursor-pointer hover:border-zinc-400 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <RadioGroupItem value="GCASH" id="gcash" />
                    <span className="text-xs font-bold text-zinc-900">
                      GCash E-Wallet
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    QR / Manual
                  </span>
                </label>

                <label className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg cursor-pointer hover:border-zinc-400 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <RadioGroupItem value="BANK_TRANSFER" id="bank" />
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-zinc-600" />
                      <span className="text-xs font-bold text-zinc-900">
                        Bank Transfer (BDO / BPI)
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    InstaPay
                  </span>
                </label>

                <label className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg cursor-pointer hover:border-zinc-400 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <RadioGroupItem value="COD" id="cod" />
                    <div className="flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-zinc-600" />
                      <span className="text-xs font-bold text-zinc-900">
                        Cash on Delivery
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Upon Arrival
                  </span>
                </label>
              </RadioGroup>
            </div>
          </div>

          {/* Order Summary & Placement */}
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
                className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider"
              >
                {loading
                  ? 'Processing Order...'
                  : `Place Order • ₱${total.toLocaleString()}`}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                <span>Verified original shirts • Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}