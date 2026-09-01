// src/components/store/product-card.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BrandBadge,
  TeamBadge,
  ConditionBadge,
  KitTypeBadge,
} from '@/components/common';

export interface ProductCardProps {
  product: any;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800';
  const secondaryImage = product.images?.[1] || primaryImage;

  const totalStock =
    product.variants?.reduce((acc: number, curr: any) => acc + (curr.stock || 0), 0) || 0;
  const isSoldOut = totalStock === 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/5] bg-zinc-100 overflow-hidden">
        <Image
          src={isHovered && product.images?.length > 1 ? secondaryImage : primaryImage}
          alt={product.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
          <BrandBadge brand={product.brand} />
          <ConditionBadge condition={product.condition} />
        </div>

        {isSoldOut && (
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-white text-zinc-950 text-xs font-mono font-black uppercase px-3 py-1 rounded shadow-md tracking-wider">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <TeamBadge team={product.team} className="text-[11px] py-0.5" />
            <span className="font-mono text-xs font-bold text-zinc-500">
              {product.year}
            </span>
          </div>

          <h3 className="font-bold text-zinc-950 text-sm leading-snug line-clamp-2 group-hover:text-zinc-700 transition-colors">
            {product.title}
          </h3>
        </div>

        <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <KitTypeBadge
              kitType={product.kitType}
              spec={product.spec}
              showSpec={false}
            />
            <p className="font-mono text-sm font-extrabold text-zinc-950">
              ₱{product.price?.toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-1 items-center pt-1">
            {product.variants?.map((v: any) => (
              <span
                key={v.size}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  v.stock > 0
                    ? 'bg-zinc-50 text-zinc-800 border-zinc-200'
                    : 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through'
                }`}
              >
                {v.size}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}