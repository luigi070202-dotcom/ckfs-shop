// src/app/products/[slug]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BrandBadge,
  TeamBadge,
  ConditionBadge,
  KitTypeBadge,
} from '@/components/common';
import { useCartStore } from '@/app/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { slug } = use(params);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Store Selection State
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  // Fetch Kit Details by Slug
  useEffect(() => {
    async function loadKit() {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        if (json.success) {
          const found = json.data.find((item: any) => item.slug === slug);
          if (found) {
            setProduct(found);
            setSelectedImage(found.images?.[0] || '');
            const firstInStock = found.variants?.find((v: any) => v.stock > 0);
            if (firstInStock) {
              setSelectedSize(firstInStock.size);
            }
          } else {
            setErrorMessage('Kit not found in vault archive.');
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error loading shirt details.');
      } finally {
        setLoading(false);
      }
    }

    loadKit();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <p className="text-xs font-mono text-zinc-500 animate-pulse">
          Retrieving kit from archive...
        </p>
      </div>
    );
  }

  if (errorMessage || !product) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 space-y-4">
        <AlertCircle className="w-10 h-10 text-zinc-400" />
        <h1 className="text-lg font-bold text-zinc-900">Kit Not Found</h1>
        <p className="text-xs text-zinc-500">{errorMessage || 'The requested kit does not exist.'}</p>
        <Link href="/">
          <Button variant="outline" size="sm" className="text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const selectedVariant = product.variants?.find((v: any) => v.size === selectedSize);
  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem({
      id: `${product._id}-${selectedSize}`,
      productId: product._id,
      title: product.title,
      price: product.price,
      size: selectedSize,
      image: product.images?.[0] || '',
      year: product.year,
      team: product.team,
      quantity: 1,
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 selection:bg-zinc-950 selection:text-white pb-24">
      {/* Top Header */}
      <header className="border-b border-zinc-200 sticky top-0 z-40 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="text-zinc-600 hover:text-black hover:bg-zinc-100 text-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
          </Button>

          <Link href="/" className="font-mono text-lg font-black tracking-tight">
            CKFS
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
        {/* Left Column: Interactive Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
        <div className="relative aspect-[4/5] bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
            <Image
            src={selectedImage || product.images?.[0]}
            alt={product.title}
            fill
            priority={true} // <-- Eagerly loads the primary image to optimize LCP
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
            <BrandBadge brand={product.brand} />
            <ConditionBadge condition={product.condition} />
            </div>
        </div>

        {/* Thumbnail Gallery Strip */}
        {product.images?.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2">
            {product.images.map((img: string, idx: number) => (
                <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`relative w-20 aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img
                    ? 'border-zinc-950 shadow-xs'
                    : 'border-zinc-200 opacity-60 hover:opacity-100'
                }`}
                >
                <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                />
                </button>
            ))}
            </div>
        )}
        </div>

          {/* Right Column: Shirt Spec & Sizing */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3 border-b border-zinc-200 pb-6">
              <div className="flex items-center justify-between gap-2">
                <TeamBadge team={product.team} />
                <span className="font-mono text-xs font-bold text-zinc-500">
                  {product.year} Season
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight leading-snug">
                {product.title}
              </h1>

              <div className="flex items-center gap-3 pt-1">
                <KitTypeBadge kitType={product.kitType} spec={product.spec} />
              </div>

              <div className="pt-2">
                <span className="text-3xl font-mono font-black text-zinc-950">
                  ₱{product.price?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Select Size
                </Label>
                {selectedVariant && (
                  <span className="text-xs font-mono text-zinc-500">
                    {selectedVariant.stock > 2 ? (
                      <span className="text-emerald-700 font-semibold">In Stock</span>
                    ) : selectedVariant.stock > 0 ? (
                      <span className="text-amber-700 font-semibold">Only {selectedVariant.stock} left</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">Sold Out</span>
                    )}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {product.variants?.map((v: any) => {
                  const outOfStock = v.stock === 0;
                  const isSelected = selectedSize === v.size;

                  return (
                    <button
                      key={v.size}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => setSelectedSize(v.size)}
                      className={`h-11 rounded-lg font-mono text-xs font-bold border transition-all ${
                        outOfStock
                          ? 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through cursor-not-allowed'
                          : isSelected
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                          : 'bg-white text-zinc-900 border-zinc-300 hover:border-zinc-950'
                      }`}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add to Bag Action */}
            <div className="space-y-2 pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full h-12 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2"
              >
                {addedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Added to Bag
                  </>
                ) : isOutOfStock ? (
                  'Sold Out'
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Bag • ₱{product.price?.toLocaleString()}
                  </>
                )}
              </Button>
            </div>

            {/* Store Guarantees */}
            <div className="pt-4 border-t border-zinc-200 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 space-y-1">
                <ShieldCheck className="w-4 h-4 text-zinc-700 mx-auto" />
                <p className="text-[10px] font-bold text-zinc-900">Verified</p>
                <p className="text-[9px] text-zinc-500">100% Authentic</p>
              </div>
              <div className="p-2 space-y-1">
                <Truck className="w-4 h-4 text-zinc-700 mx-auto" />
                <p className="text-[10px] font-bold text-zinc-900">Fast Shipping</p>
                <p className="text-[9px] text-zinc-500">Nationwide</p>
              </div>
              <div className="p-2 space-y-1">
                <RotateCcw className="w-4 h-4 text-zinc-700 mx-auto" />
                <p className="text-[10px] font-bold text-zinc-900">Condition</p>
                <p className="text-[9px] text-zinc-500">{product.condition}/10 Rated</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}