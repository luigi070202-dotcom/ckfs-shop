// src/app/admin/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  PlusCircle, 
  ExternalLink 
} from 'lucide-react';
import { LogoutButton } from './LogoutButton';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag, exact: false },
  { label: 'Inventory', href: '/admin/inventory', icon: Package, exact: false },
  { label: 'Add Kit', href: '/admin/new-kit', icon: PlusCircle, exact: false },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Exclude admin navigation on the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const isActiveRoute = (itemHref: string, exact: boolean) => {
    if (exact) {
      return pathname === itemHref;
    }
    return pathname.startsWith(itemHref);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Top Admin Header Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand / Store Switcher */}
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="font-black text-sm tracking-widest uppercase bg-zinc-950 text-white px-2 py-1 rounded">
                  CKFS
                </span>
                <span className="font-bold text-xs uppercase tracking-wider text-zinc-900 hidden sm:inline-block">
                  Admin Suite
                </span>
              </Link>

              {/* Desktop Nav Items */}
              <nav className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveRoute(item.href, item.exact);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                        active
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-950 transition-colors border border-zinc-200 rounded px-2 py-1 bg-zinc-50"
              >
                <span>Live Store</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

              {/* Render your existing Logout Button */}
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden border-t border-zinc-100 px-4 py-2 flex items-center justify-around bg-zinc-50/50">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1 text-[10px] font-medium transition-colors ${
                  active ? 'text-zinc-950 font-bold' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Page Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}