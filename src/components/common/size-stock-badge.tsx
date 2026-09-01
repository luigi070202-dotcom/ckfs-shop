// src/components/common/size-stock-badge.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface SizeStockBadgeProps {
  size: string;
  stock: number;
  className?: string;
}

export function SizeStockBadge({ size, stock, className }: SizeStockBadgeProps) {
  if (stock === 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 line-through opacity-80',
          className
        )}
        title="Out of stock"
      >
        {size}: 0
      </span>
    );
  }

  if (stock <= 2) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300 shadow-xs',
          className
        )}
        title="Low stock"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {size}: <strong className="text-amber-950 font-black">{stock}</strong>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-50 text-zinc-800 border border-zinc-200',
        className
      )}
    >
      <span className="font-bold text-zinc-900">{size}:</span>
      <span className="font-semibold">{stock}</span>
    </span>
  );
}