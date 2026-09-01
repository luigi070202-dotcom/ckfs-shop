// src/components/common/size-stock-manager.tsx
'use client';

import React from 'react';
import { SHIRT_SIZES } from '@/app/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

export interface SizeVariant {
  size: string;
  stock: number;
}

interface SizeStockManagerProps {
  variants: SizeVariant[];
  onChange: (variants: SizeVariant[]) => void;
}

export function SizeStockManager({ variants, onChange }: SizeStockManagerProps) {
  const handleStockChange = (size: string, stock: number) => {
    onChange(
      variants.map((v) =>
        v.size === size ? { ...v, stock: Math.max(0, stock) } : v
      )
    );
  };

  const handleAddVariant = (size: string) => {
    if (!variants.some((v) => v.size === size)) {
      onChange([...variants, { size, stock: 1 }]);
    }
  };

  const handleRemoveVariant = (size: string) => {
    onChange(variants.filter((v) => v.size !== size));
  };

  const availableToAdd = SHIRT_SIZES.filter(
    (sz) => !variants.some((v) => v.size === sz)
  );

  return (
    <div className="space-y-3">
      <Label className="text-xs font-bold uppercase tracking-wider text-zinc-900">
        Size Inventory & Stock
      </Label>

      {variants.length === 0 ? (
        <p className="text-xs text-zinc-500 italic">
          No sizes added yet. Click an available size below to add stock.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {variants.map((v) => (
            <div
              key={v.size}
              className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded px-3 py-1.5 shadow-2xs"
            >
              <span className="w-10 text-xs font-mono font-bold text-zinc-900">
                {v.size}
              </span>
              <Input
                type="number"
                min="0"
                value={v.stock}
                onChange={(e) =>
                  handleStockChange(v.size, parseInt(e.target.value) || 0)
                }
                className="w-20 bg-white border-zinc-300 text-center font-mono text-xs font-bold h-8"
              />
              <span className="text-xs text-zinc-500">in stock</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveVariant(v.size)}
                className="ml-auto text-zinc-400 hover:text-red-600 hover:bg-red-50 h-7 px-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {availableToAdd.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-zinc-500 mr-1 font-mono">+ Add:</span>
          {availableToAdd.map((sz) => (
            <Button
              key={sz}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddVariant(sz)}
              className="h-7 px-2 text-xs font-mono bg-white border-zinc-300 text-zinc-700 hover:text-black hover:bg-zinc-100"
            >
              <Plus className="w-3 h-3 mr-1" /> {sz}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}