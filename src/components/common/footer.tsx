// src/components/common/footer.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // Hide the storefront footer on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="border-t border-zinc-200 bg-white text-zinc-950 mt-auto">
      {/* Trust & Guarantees Strip */}
      <div className="border-b border-zinc-100 bg-zinc-50/70 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-zinc-800" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-900">
                100% Authentic
              </h4>
              <p className="text-[11px] text-zinc-500">
                Every kit is verified original with official manufacturer product codes.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-zinc-800" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-900">
                Condition Graded
              </h4>
              <p className="text-[11px] text-zinc-500">
                Shirts inspected and condition-graded from 8/10 to 10/10 Mint.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-zinc-800" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-900">
                Secure Dispatch
              </h4>
              <p className="text-[11px] text-zinc-500">
                Tracked deliveries across the Philippines with J&T and LBC couriers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Col */}
          <div className="md:col-span-8 space-y-2 text-center sm:text-left">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded overflow-hidden">
                <Image
                  src="/logo.jpg"
                  alt="CK Football Shirts Logo"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-sm tracking-tight text-zinc-900">
                CK Football Shirts
              </span>
            </Link>
            <p className="text-xs text-zinc-500 font-mono max-w-sm">
              Dedicated collector archive for authentic vintage and modern football shirts.
            </p>
          </div>

          {/* Customer Navigation Col */}
          <div className="md:col-span-4 space-y-2 text-center sm:text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-mono">
              Quick Links
            </p>
            <ul className="space-y-2 text-xs text-zinc-600">
              <li>
                <Link href="/" className="hover:text-zinc-950 transition-colors">
                  Browse Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="hover:text-zinc-950 font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Truck className="w-3.5 h-3.5" /> Track Shipment
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-400 font-mono">
          <p>© {new Date().getFullYear()} CKFS Archive. All rights reserved.</p>
          <Link href="/track-order" className="hover:text-zinc-700 transition-colors">
            Waybill Tracking
          </Link>
        </div>
      </div>
    </footer>
  );
}