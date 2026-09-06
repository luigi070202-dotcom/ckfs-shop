// src/components/common/header.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/app/store/useCartStore';
import { ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

// Added Track Order to main navigation
const NAV_LINKS = [
  { label: 'Catalog', href: '/' },
  { label: 'Vintage Kits', href: '/?condition=10' },
  { label: 'Popular Clubs', href: '/#catalog' },
  { label: 'Track Order', href: '/track-order', icon: Truck },
];

export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const toggleCart = useCartStore((state) => state.toggleCart);
  const itemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
      {/* Top Banner */}
      <div className="bg-zinc-950 text-white text-[11px] font-mono py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>100% Guaranteed Authentic Match & Retro Football Shirts</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 overflow-hidden rounded">
            <Image
              src="/ckfs-logo.jpg"
              alt="CK Football Shirts Logo"
              fill
              priority
              sizes="40px"
              className="object-contain"
            />
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-900 hidden sm:inline">
            CK Football Shirts
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 transition-colors',
                  isActive && 'text-zinc-950 font-bold'
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Track Link (Mobile shortcut) + Shopping Bag */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/track-order"
            className={cn(
              'md:hidden p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors',
              pathname === '/track-order' && 'text-zinc-950 font-bold bg-zinc-100'
            )}
            aria-label="Track Order"
          >
            <Truck className="w-5 h-5" />
          </Link>

          <button
            type="button"
            onClick={toggleCart}
            className="relative p-2.5 rounded-lg text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors flex items-center gap-2"
            aria-label="Shopping bag"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs font-mono font-bold hidden sm:inline">Bag</span>
            {mounted && itemCount > 0 && (
              <span className="absolute top-1 right-1 sm:static bg-zinc-950 text-white text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}