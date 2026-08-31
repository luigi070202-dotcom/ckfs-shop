// src/app/admin/new-kit/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  SHIRT_YEARS,
  SHIRT_CONDITIONS,
  SHIRT_SIZES,
  KIT_TYPES,
  KIT_SPECS,
  TEAMS_AND_COUNTRIES,
} from '@/app/lib/constants';
import {
  Upload,
  X,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function NewKitPage() {
  const router = useRouter();

  // Basic Information State
  const [title, setTitle] = useState('');
  const [team, setTeam] = useState('');
  const [year, setYear] = useState('2024');
  const [condition, setCondition] = useState<number>(10);
  const [kitType, setKitType] = useState('Home');
  const [spec, setSpec] = useState('Stadium');
  const [price, setPrice] = useState<number | ''>('');

  // Cloudinary Images (Max 15)
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Sizing & Stock
  const [variants, setVariants] = useState<{ size: string; stock: number }[]>([
    { size: 'M', stock: 1 },
  ]);

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Photo Upload to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 15) {
      setErrorMessage('Maximum of 15 photos allowed per shirt.');
      return;
    }

    setUploading(true);
    setErrorMessage('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`File "${file.name}" exceeds the 5MB size limit.`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (data.success && data.url) {
          setImages((prev) => [...prev, data.url]);
        } else {
          setErrorMessage(data.error || 'Upload failed.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Image upload error.');
      }
    }

    setUploading(false);
    e.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleVariantStockChange = (size: string, stock: number) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.size === size ? { ...v, stock: Math.max(0, stock) } : v
      )
    );
  };

  const addVariant = (size: string) => {
    if (!variants.some((v) => v.size === size)) {
      setVariants((prev) => [...prev, { size, stock: 1 }]);
    }
  };

  const removeVariant = (size: string) => {
    setVariants((prev) => prev.filter((v) => v.size !== size));
  };

  // Submit to MongoDB (/api/products)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (images.length === 0) {
      setErrorMessage('Please upload at least 1 photo for this kit.');
      return;
    }

    if (variants.length === 0) {
      setErrorMessage('Please configure at least one size variant.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title,
        team,
        year,
        condition,
        kitType,
        spec,
        price: Number(price),
        images,
        variants,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save kit listing.');
      }

      setSuccessMessage('Kit listing saved to vault successfully.');
      setTimeout(() => {
        router.push('/');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 font-sans selection:bg-emerald-400 selection:text-black pb-24">
      {/* 1. Top Navigation Bar */}
      <header className="border-b border-zinc-800/80 sticky top-0 z-40 bg-[#0a0a0c]/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Admin Portal
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Form Container */}
      <main className="max-w-4xl mx-auto px-6 pt-10 space-y-8">
        
        {/* Breadcrumb & Heading */}
        <div className="border-b border-zinc-800/80 pb-6">
          <p className="text-xs font-mono text-zinc-500 mb-1">
            Admin / Inventory Management / New Kit Listing
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Add Kit to Vault
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure jersey provenance, condition rating, pricing, and size stock levels.
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Section 1: Photos */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>1. Product Imagery</span>
                  <span className="text-[10px] text-zinc-500 font-mono font-normal">
                    (Cloudinary CDN)
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Upload up to 15 portrait photos (4:5 ratio recommended).
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {images.length}/15 photos
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[4/5] bg-[#141416] border border-zinc-800 hover:border-zinc-600 rounded-lg overflow-hidden group transition-all"
                >
                  <Image
                    src={imgUrl}
                    alt={`Upload ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 bg-black/80 hover:bg-rose-600 text-white p-1 rounded-full transition-colors"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] uppercase font-bold tracking-wider bg-emerald-500 text-neutral-950 px-1.5 py-0.5 rounded font-mono">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {images.length < 15 && (
                <label className="relative aspect-[4/5] border border-dashed border-zinc-800 hover:border-emerald-400/60 bg-[#141416]/50 hover:bg-[#141416] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all group">
                  <Upload className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 mb-2 transition-colors" />
                  <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
                    {uploading ? 'Uploading...' : 'Add Photo'}
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-0.5 font-mono">Max 5MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    multiple
                    disabled={uploading}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </section>

          {/* Section 2: Core Details */}
          <section className="space-y-4">
            <div className="border-b border-zinc-800/60 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Kit Specification & Origin
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Accurately tag the club, season year, kit category, and condition grade.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Kit Listing Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arsenal 2003/04 Invincibles Home Shirt"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#141416] border border-zinc-800 focus:border-emerald-400 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Team / Nation *
                </label>
                <input
                  type="text"
                  required
                  list="team-options"
                  placeholder="Select or type team..."
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="w-full bg-[#141416] border border-zinc-800 focus:border-emerald-400 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
                />
                <datalist id="team-options">
                  {TEAMS_AND_COUNTRIES.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Season / Year *
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-[#141416] border border-zinc-800 focus:border-emerald-400 rounded-lg px-3 py-2.5 text-xs text-zinc-100 outline-none transition-colors"
                >
                  {SHIRT_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Kit Type *
                </label>
                <select
                  value={kitType}
                  onChange={(e) => setKitType(e.target.value)}
                  className="w-full bg-[#141416] border border-zinc-800 focus:border-emerald-400 rounded-lg px-3 py-2.5 text-xs text-zinc-100 outline-none transition-colors"
                >
                  {KIT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t} Kit
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Specification *
                </label>
                <select
                  value={spec}
                  onChange={(e) => setSpec(e.target.value)}
                  className="w-full bg-[#141416] border border-zinc-800 focus:border-emerald-400 rounded-lg px-3 py-2.5 text-xs text-zinc-100 outline-none transition-colors"
                >
                  {KIT_SPECS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Condition Rating *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(Number(e.target.value))}
                  className="w-full bg-[#141416] border border-zinc-800 focus:border-emerald-400 rounded-lg px-3 py-2.5 text-xs text-zinc-100 outline-none transition-colors font-medium"
                >
                  {SHIRT_CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}/10 — {c === 10 ? 'Mint' : c === 9 ? 'Excellent' : 'Good Vintage'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Retail Price (PHP ₱) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="3500"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full bg-[#141416] border border-zinc-800 focus:border-emerald-400 rounded-lg px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-400 placeholder-zinc-600 outline-none transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Sizing & Inventory */}
          <section className="space-y-4">
            <div className="border-b border-zinc-800/60 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                3. Size Inventory & Quantities
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Set unit stock levels for each size variant.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {variants.map((v) => (
                <div
                  key={v.size}
                  className="flex items-center gap-4 bg-[#141416] border border-zinc-800/80 rounded-lg px-4 py-2.5"
                >
                  <span className="w-12 text-xs font-mono font-bold text-white bg-zinc-900 border border-zinc-800 text-center py-1 rounded">
                    {v.size}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={v.stock}
                      onChange={(e) =>
                        handleVariantStockChange(
                          v.size,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-20 bg-[#0a0a0c] border border-zinc-800 focus:border-emerald-400 rounded text-center text-xs font-mono text-emerald-400 font-bold py-1.5 outline-none"
                    />
                    <span className="text-xs text-zinc-400">units in stock</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(v.size)}
                    className="ml-auto text-zinc-500 hover:text-rose-400 transition-colors p-1"
                    title="Remove Size"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Size Pill Selectors */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs text-zinc-500 mr-1 font-mono">+ Add:</span>
              {SHIRT_SIZES.filter(
                (sz) => !variants.some((v) => v.size === sz)
              ).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => addVariant(sz)}
                  className="text-xs px-2.5 py-1 font-mono rounded bg-[#141416] hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> {sz}
                </button>
              ))}
            </div>
          </section>

          {/* Submit Action */}
          <div className="pt-6 border-t border-zinc-800">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full bg-white hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black hover:text-black font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition-all cursor-pointer shadow-lg active:scale-[0.99]"
            >
              {submitting ? 'Saving Kit to Inventory...' : 'Publish Kit to Vault'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}