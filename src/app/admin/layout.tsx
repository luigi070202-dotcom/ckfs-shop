// src/app/admin/layout.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  ArrowUpRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import { LogoutButton } from './LogoutButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [paidCount, setPaidCount] = useState(0);
  const [newPaidAlert, setNewPaidAlert] = useState(false);
  const prevPaidRef = useRef<number | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') return;

    const checkPaidOrders = async () => {
      try {
        const res = await fetch('/api/admin/metrics');
        if (!res.ok) return;
        const json = await res.json();

        if (json.success && json.data) {
          const currentPaid = json.data.paidOrdersCount || 0;

          // Alert if a new paid order arrives while on dashboard
          if (prevPaidRef.current !== null && currentPaid > prevPaidRef.current) {
            setNewPaidAlert(true);
          }

          prevPaidRef.current = currentPaid;
          setPaidCount(currentPaid);
        }
      } catch (err) {
        console.error('Paid order alert sync error:', err);
      }
    };

    checkPaidOrders();
    const interval = setInterval(checkPaidOrders, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [pathname]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navLinks = [
    {
      label: 'Metrics',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
      badge: paidCount > 0 ? `${paidCount} PAID` : null,
    },
    {
      label: 'Inventory',
      href: '/admin/inventory',
      icon: Package,
    },
    {
      label: 'New Kit',
      href: '/admin/new-kit',
      icon: PlusCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Real-time Order Paid Alert Banner */}
      {newPaidAlert && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold shadow-sm transition-all animate-in fade-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>
                <strong>Payment Received!</strong> A new order has been confirmed as <strong>PAID</strong> and is ready for waybill assignment.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/admin/orders"
                onClick={() => setNewPaidAlert(false)}
                className="font-mono text-[11px] bg-white text-emerald-950 px-2.5 py-1 rounded font-bold uppercase hover:bg-emerald-50 transition-colors"
              >
                Fulfill Order &rarr;
              </Link>
              <button
                type="button"
                onClick={() => setNewPaidAlert(false)}
                className="text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tighter uppercase text-zinc-950">
                CKFS Admin
              </span>
              <span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-200">
                HQ
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      if (link.href === '/admin/orders') setNewPaidAlert(false);
                    }}
                    className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                    {link.badge && (
                      <span
                        className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-tight ${
                          isActive
                            ? 'bg-emerald-400 text-zinc-950'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 font-medium transition-colors"
            >
              Live Store
              <ArrowUpRight className="w-3 h-3" />
            </Link>

            <div className="h-4 w-px bg-zinc-200 hidden sm:block" />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Admin Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}