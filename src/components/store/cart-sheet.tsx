// src/components/store/cart-sheet.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/app/store/useCartStore';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export function CartSheet() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getCartTotal } =
    useCartStore();

  const total = getCartTotal();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex flex-col w-full sm:max-w-md bg-white p-0 border-l border-zinc-200 text-zinc-950">
        {/* Header */}
        <SheetHeader className="p-6 border-b border-zinc-100">
          <SheetTitle className="flex items-center gap-2 text-base font-bold uppercase tracking-tight">
            <ShoppingBag className="w-4 h-4" /> Your Shopping Bag ({items.length})
          </SheetTitle>
        </SheetHeader>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-zinc-900">Your bag is empty</p>
              <p className="text-xs text-zinc-500 max-w-xs">
                Explore our catalog archive to add authentic football shirts.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={closeCart}
                className="text-xs mt-2"
              >
                Browse Catalog
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded-xl"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-20 rounded-lg bg-white border border-zinc-200 overflow-hidden shrink-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
                        {item.year} • {item.team}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                        title="Remove shirt"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-zinc-950 truncate" title={item.title}>
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-zinc-200">
                        Size: {item.size}
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-zinc-300 rounded bg-white h-7">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 text-zinc-600 hover:text-black"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-mono text-xs font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 text-zinc-600 hover:text-black"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-mono text-xs font-black text-zinc-950">
                      ₱{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout */}
        {items.length > 0 && (
          <SheetFooter className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex flex-col gap-4">
            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-between text-xs text-zinc-600">
                <span>Shipping</span>
                <span className="font-mono text-zinc-900">Calculated at checkout</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-zinc-950 pt-1 border-t border-zinc-200">
                <span>Subtotal</span>
                <span className="font-mono text-base font-black">
                  ₱{total.toLocaleString()}
                </span>
              </div>
            </div>

            <Link href="/checkout" onClick={closeCart} className="w-full">
              <Button className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}