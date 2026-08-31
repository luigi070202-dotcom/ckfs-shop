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

// shadcn/ui Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Icons
import {
  Upload,
  X,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';

export default function NewKitPage() {
  const router = useRouter();

  // Basic Details State
  const [title, setTitle] = useState('');
  const [team, setTeam] = useState('');
  const [year, setYear] = useState('2024');
  const [condition, setCondition] = useState<number>(10);
  const [kitType, setKitType] = useState('Home');
  const [spec, setSpec] = useState('Stadium');
  const [price, setPrice] = useState<number | ''>('');

  // Cloudinary Images
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Size Stock Variants
  const [variants, setVariants] = useState<{ size: string; stock: number }[]>([
    { size: 'M', stock: 1 },
  ]);

  // Form State
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
        setErrorMessage(`File "${file.name}" exceeds 5MB size limit.`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (images.length === 0) {
      setErrorMessage('Please upload at least 1 image for this kit.');
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
        throw new Error(data.error || 'Failed to create kit listing.');
      }

      setSuccessMessage('Kit listing saved to vault successfully!');
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
    <div className="min-h-screen bg-zinc-100 text-zinc-900 pb-24 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Header Bar */}
      <header className="border-b border-zinc-200 sticky top-0 z-40 bg-white/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="text-zinc-600 hover:text-black hover:bg-zinc-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black tracking-widest text-black">CKFS</span>
            <Badge variant="outline" className="font-mono text-[10px] tracking-widest uppercase border-zinc-300 text-zinc-600">
              Admin Vault
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 pt-10 space-y-8">
        <div>
          <p className="text-xs text-zinc-500 font-mono mb-1">
            Admin / Inventory / New Drop
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
            Add Kit to Inventory
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Upload verified photos, specify provenance, and set variant stock quantities.
          </p>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-zinc-900 text-white font-bold rounded-lg text-xs flex items-center gap-2.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-white" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Photo Uploader Card */}
          <Card className="bg-white border-zinc-200 text-zinc-900 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-950">
                  1. Product Imagery
                </CardTitle>
                <Badge variant="secondary" className="bg-zinc-100 text-zinc-800 font-mono text-[11px]">
                  {images.length}/15 Photos
                </Badge>
              </div>
              <CardDescription className="text-xs text-zinc-500">
                Upload portrait kit photos (4:5 ratio recommended). Max 5MB per file.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/5] bg-zinc-100 border border-zinc-200 rounded-md overflow-hidden group shadow-xs"
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
                      className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-black text-white p-1 rounded-full transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <Badge className="absolute bottom-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0 h-4 bg-black text-white">
                        Cover
                      </Badge>
                    )}
                  </div>
                ))}

                {images.length < 15 && (
                  <label className="relative aspect-[4/5] border-2 border-dashed border-zinc-300 hover:border-zinc-800 bg-zinc-50 hover:bg-zinc-100/80 rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors group">
                    <Upload className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 mb-2 transition-colors" />
                    <span className="text-xs font-semibold text-zinc-600 group-hover:text-zinc-900 transition-colors">
                      {uploading ? 'Uploading...' : 'Add Photo'}
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5 font-mono">Max 5MB</span>
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
            </CardContent>
          </Card>

          {/* 2. Kit Specification Card */}
          <Card className="bg-white border-zinc-200 text-zinc-900 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-950">
                2. Kit Specification & Details
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Provide accurate kit metadata, condition rating, and pricing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold text-zinc-700">
                  Kit Listing Title *
                </Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g. Manchester United 1998/99 Treble Home Shirt"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white border-zinc-300 focus:border-zinc-900 text-zinc-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="team" className="text-xs font-semibold text-zinc-700">
                    Team / Country *
                  </Label>
                  <Input
                    id="team"
                    required
                    list="team-options"
                    placeholder="Type or select club..."
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="bg-white border-zinc-300 focus:border-zinc-900 text-zinc-900 text-xs"
                  />
                  <datalist id="team-options">
                    {TEAMS_AND_COUNTRIES.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">
                    Season / Year *
                  </Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="bg-white border-zinc-300 text-xs text-zinc-900">
                      <SelectValue placeholder="Select Year" />
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

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">
                    Kit Type *
                  </Label>
                  <Select value={kitType} onValueChange={setKitType}>
                    <SelectTrigger className="bg-white border-zinc-300 text-xs text-zinc-900">
                      <SelectValue placeholder="Select Kit Type" />
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

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">
                    Specification *
                  </Label>
                  <Select value={spec} onValueChange={setSpec}>
                    <SelectTrigger className="bg-white border-zinc-300 text-xs text-zinc-900">
                      <SelectValue placeholder="Select Spec" />
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

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">
                    Condition Rating *
                  </Label>
                  <Select
                    value={condition.toString()}
                    onValueChange={(val) => setCondition(Number(val))}
                  >
                    <SelectTrigger className="bg-white border-zinc-300 text-xs text-zinc-900">
                      <SelectValue placeholder="Select Condition" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                      {SHIRT_CONDITIONS.map((c) => (
                        <SelectItem key={c} value={c.toString()} className="text-xs">
                          {c}/10 — {c === 10 ? 'Mint' : c === 9 ? 'Excellent' : 'Good Vintage'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs font-semibold text-zinc-700">
                    Retail Price (PHP ₱) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    required
                    placeholder="3500"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="bg-white border-zinc-300 focus:border-zinc-900 text-zinc-950 font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Sizing & Stock Card */}
          <Card className="bg-white border-zinc-200 text-zinc-900 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-950">
                3. Size Inventory & Quantities
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Manage stock counts per individual size variant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5">
                {variants.map((v) => (
                  <div
                    key={v.size}
                    className="flex items-center gap-4 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2"
                  >
                    <span className="w-12 text-xs font-mono font-bold text-zinc-900">
                      {v.size}
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) =>
                          handleVariantStockChange(
                            v.size,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 bg-white border-zinc-300 text-center font-mono text-xs text-zinc-950 font-bold h-8"
                      />
                      <span className="text-xs text-zinc-500">units in stock</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(v.size)}
                      className="ml-auto text-zinc-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add Size Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-xs text-zinc-500 mr-1 font-mono">+ Add:</span>
                {SHIRT_SIZES.filter(
                  (sz) => !variants.some((v) => v.size === sz)
                ).map((sz) => (
                  <Button
                    key={sz}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addVariant(sz)}
                    className="h-7 px-2.5 text-xs font-mono bg-white border-zinc-300 text-zinc-700 hover:text-black hover:bg-zinc-100"
                  >
                    <Plus className="w-3 h-3 mr-1" /> {sz}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Action */}
          <Button
            type="submit"
            disabled={submitting || uploading}
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs uppercase tracking-wider py-6 cursor-pointer shadow-md active:scale-[0.99]"
          >
            {submitting ? 'Saving Kit to Inventory...' : 'Publish Kit to Vault'}
          </Button>
        </form>
      </main>
    </div>
  );
}