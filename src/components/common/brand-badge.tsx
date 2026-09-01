// src/components/common/brand-badge.tsx
import React from 'react';
import { cn } from '@/lib/utils';

const BRAND_STYLES: Record<string, string> = {
  Nike: 'bg-zinc-900 text-white border-zinc-700',
  Adidas: 'bg-blue-100 text-blue-900 border-blue-300',
  Puma: 'bg-red-100 text-red-800 border-red-300',
  Umbro: 'bg-amber-100 text-amber-900 border-amber-300',
  Kappa: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  Hummel: 'bg-orange-100 text-orange-900 border-orange-300',
  Macron: 'bg-cyan-100 text-cyan-900 border-cyan-300',
  Castore: 'bg-slate-900 text-slate-100 border-slate-700',
  Reebok: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  Lotto: 'bg-rose-100 text-rose-900 border-rose-300',
  Diadora: 'bg-teal-100 text-teal-900 border-teal-300',
  Asics: 'bg-sky-100 text-sky-900 border-sky-300',
  'New Balance': 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300',
};

interface BrandBadgeProps {
  brand?: string;
  className?: string;
}

export function BrandBadge({ brand = 'Nike', className }: BrandBadgeProps) {
  const style = BRAND_STYLES[brand] || 'bg-zinc-100 text-zinc-800 border-zinc-300';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold border shadow-xs transition-colors',
        style,
        className
      )}
    >
      {brand}
    </span>
  );
}