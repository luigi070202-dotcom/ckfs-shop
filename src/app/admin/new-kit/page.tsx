// src/app/admin/new-kit/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SHIRT_YEARS,
  SHIRT_CONDITIONS,
  KIT_TYPES,
  KIT_SPECS,
  KIT_BRANDS,
  POPULAR_BRANDS,
  TEAMS_AND_COUNTRIES,
  POPULAR_TEAMS,
} from '@/app/lib/constants';

import {
  ImageUploadGallery,
  SizeStockManager,
  SizeVariant,
} from '@/components/common';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function NewKitPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [team, setTeam] = useState('');
  const [brand, setBrand] = useState('Nike');
  const [year, setYear] = useState('2026');
  const [kitType, setKitType] = useState('Home');
  const [spec, setSpec] = useState('Stadium');
  const [condition, setCondition] = useState('10');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<SizeVariant[]>([
    { size: 'M', stock: 1 },
    { size: 'L', stock: 1 },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setErrorMessage('Please upload at least 1 product photo.');
      return;
    }
    if (variants.length === 0) {
      setErrorMessage('Please configure at least one size variant.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        title,
        team,
        brand,
        year,
        kitType,
        spec,
        condition: Number(condition),
        price: Number(price),
        images,
        variants,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        router.push('/admin/inventory');
      } else {
        setErrorMessage(json.error || 'Failed to list new football shirt.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting kit listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 pb-20">
      <header className="border-b border-zinc-200 sticky top-0 z-40 bg-white/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/inventory')}
            className="text-zinc-600 hover:text-black hover:bg-zinc-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inventory
          </Button>
          <span className="text-xs font-mono text-zinc-500">Admin Vault</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-8 space-y-6">
        <Card className="bg-white border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
            <CardTitle className="text-xl font-extrabold text-zinc-950 uppercase tracking-tight">
              List New Football Shirt
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Add a new kit to the store catalog with Cloudinary photos and sizing breakdown.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {errorMessage && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 1. Reusable Image Gallery */}
              <ImageUploadGallery
                images={images}
                onChange={setImages}
                onError={setErrorMessage}
              />

              {/* 2. Kit Attributes */}
              <div className="space-y-4 pt-4 border-t border-zinc-200">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold text-zinc-700">
                    Product Title
                  </Label>
                  <Input
                    id="title"
                    required
                    placeholder="e.g. Arsenal 2005/06 Highbury Farewell Home Kit"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Searchable Team */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Team / Country
                    </Label>
                    <Combobox
                      options={TEAMS_AND_COUNTRIES}
                      featuredOptions={POPULAR_TEAMS}
                      value={team}
                      onChange={setTeam}
                      placeholder="Select club or country..."
                      searchPlaceholder="Search team..."
                    />
                  </div>

                  {/* Searchable Brand */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Brand
                    </Label>
                    <Combobox
                      options={KIT_BRANDS}
                      featuredOptions={POPULAR_BRANDS}
                      value={brand}
                      onChange={setBrand}
                      placeholder="Select brand..."
                      searchPlaceholder="Search brand..."
                    />
                  </div>

                  {/* Season Year */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Season / Year
                    </Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className="bg-white border-zinc-300 text-xs text-zinc-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-zinc-200 text-zinc-900 max-h-56">
                        {SHIRT_YEARS.map((y) => (
                          <SelectItem key={y} value={y} className="text-xs">
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Kit Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Kit Type
                    </Label>
                    <Select value={kitType} onValueChange={setKitType}>
                      <SelectTrigger className="bg-white border-zinc-300 text-xs text-zinc-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                        {KIT_TYPES.map((t) => (
                          <SelectItem key={t} value={t} className="text-xs">
                            {t} Kit
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Specification */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Specification
                    </Label>
                    <Select value={spec} onValueChange={setSpec}>
                      <SelectTrigger className="bg-white border-zinc-300 text-xs text-zinc-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                        {KIT_SPECS.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Condition Rating */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Condition Rating
                    </Label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger className="bg-white border-zinc-300 text-xs text-zinc-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                        {SHIRT_CONDITIONS.map((c) => (
                          <SelectItem key={c} value={c.toString()} className="text-xs">
                            {c}/10 Condition
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price */}
                  <div className="space-y-1.5 sm:col-span-2 md:col-span-3">
                    <Label htmlFor="price" className="text-xs font-semibold text-zinc-700">
                      Price (PHP ₱)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      required
                      placeholder="e.g. 3500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="bg-white border-zinc-300 font-mono text-xs font-bold text-zinc-950"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Reusable Size Inventory Manager */}
              <div className="pt-4 border-t border-zinc-200">
                <SizeStockManager
                  variants={variants}
                  onChange={setVariants}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-zinc-200 flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold px-6 py-2.5"
                >
                  {submitting ? 'Saving Kit...' : 'Publish to Catalog'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}