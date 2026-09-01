// src/components/common/kit-type-badge.tsx
import React from 'react';
import { cn } from '@/lib/utils';

const TYPE_STYLES: Record<string, string> = {
  Home: 'bg-blue-50 text-blue-700 border-blue-200',
  Away: 'bg-amber-50 text-amber-800 border-amber-200',
  Third: 'bg-purple-50 text-purple-700 border-purple-200',
  Fourth: 'bg-pink-50 text-pink-700 border-pink-200',
  Fifth: 'bg-rose-50 text-rose-700 border-rose-200',
  GK: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Jacket: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  Drill: 'bg-violet-50 text-violet-800 border-violet-200',
  Polo: 'bg-teal-50 text-teal-800 border-teal-200',
  'Pre-match': 'bg-orange-50 text-orange-800 border-orange-200',
};

interface KitTypeBadgeProps {
  kitType: string;
  spec?: string;
  showSpec?: boolean;
  className?: string;
}

export function KitTypeBadge({
  kitType,
  spec,
  showSpec = true,
  className,
}: KitTypeBadgeProps) {
  const style = TYPE_STYLES[kitType] || 'bg-zinc-50 text-zinc-700 border-zinc-200';

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span
        className={cn(
          'inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-mono font-bold border',
          style
        )}
      >
        {kitType} Kit
      </span>
      {showSpec && spec && (
        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
          {spec}
        </span>
      )}
    </div>
  );
}