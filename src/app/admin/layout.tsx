'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, PlusCircle, ShoppingBag, ExternalLink, Shield } from 'lucide-react';
import { LogoutButton } from './LogoutButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Keep the login page clean by disabling the admin shell on /admin/login
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navLinks = [
    { label: 'Inventory', href: '/admin/inventory', icon: Package },
    { label: 'Add New Kit', href: '/admin/new-kit', icon: PlusCircle },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/inventory" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-zinc-950 flex items-center justify-center text-white font-black text-xs">
                CK
              </div>
              <span className="font-black text-sm tracking-tight uppercase">
                Admin Console
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-zinc-950 text-white'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 font-medium transition-colors"
            >
              Storefront
              <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

            <LogoutButton />
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation */}
        <div className="md:hidden flex items-center gap-2 px-4 py-2 border-t border-zinc-100 bg-zinc-50 overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-600 hover:text-zinc-950 bg-white border border-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-zinc-400" />
            <span>CK Football Shirts Internal Administrative System</span>
          </div>
          <p className="font-mono text-[11px]">Authorized Personnel Only</p>
        </div>
      </footer>
    </div>
  );
}