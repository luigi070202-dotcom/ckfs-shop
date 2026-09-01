// src/components/common/condition-badge.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ConditionBadgeProps {
  condition: number;
  className?: string;
}

export function ConditionBadge({ condition, className }: ConditionBadgeProps) {
  if (condition === 10) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200',
          className
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        10/10 Mint
      </span>
    );
  }

  if (condition === 9) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200',
          className
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
        9/10 Excellent
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200',
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      8/10 Good
    </span>
  );
}