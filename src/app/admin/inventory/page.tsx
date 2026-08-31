// src/app/admin/inventory/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  SHIRT_YEARS,
  SHIRT_CONDITIONS,
  SHIRT_SIZES,
  KIT_TYPES,
  KIT_SPECS,
  KIT_BRANDS,
  POPULAR_BRANDS,
  TEAMS_AND_COUNTRIES,
  POPULAR_TEAMS,
} from '@/app/lib/constants';

// shadcn/ui Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import {
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  Star,
  Search,
  FilterX,
} from 'lucide-react';

export default function AdminInventoryPage() {
  const router = useRouter();
  const [kits, setKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Delete State
  const [kitToDelete, setKitToDelete] = useState<{ slug: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');
  const [filterKitType, setFilterKitType] = useState('ALL');
  const [filterCondition, setFilterCondition] = useState('ALL');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Edit Modal State
  const [editingKit, setEditingKit] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [modalError, setModalError] = useState('');

  // Load Inventory from MongoDB
  const loadInventory = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setKits(json.data);
      } else {
        setErrorMessage(json.error || 'Failed to load catalog');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Filter & Search Logic
  const filteredKits = useMemo(() => {
    return kits.filter((kit) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        kit.title?.toLowerCase().includes(query) ||
        kit.team?.toLowerCase().includes(query) ||
        kit.brand?.toLowerCase().includes(query) ||
        kit.slug?.toLowerCase().includes(query);

      const matchesTeam = filterTeam === 'ALL' || kit.team === filterTeam;
      const matchesBrand =
        filterBrand === 'ALL' || (kit.brand || 'Nike') === filterBrand;
      const matchesYear = filterYear === 'ALL' || kit.year === filterYear;
      const matchesKitType =
        filterKitType === 'ALL' || kit.kitType === filterKitType;
      const matchesCondition =
        filterCondition === 'ALL' ||
        kit.condition?.toString() === filterCondition;

      const price = Number(kit.price);
      const matchesMinPrice =
        minPrice === '' || isNaN(Number(minPrice)) || price >= Number(minPrice);
      const matchesMaxPrice =
        maxPrice === '' || isNaN(Number(maxPrice)) || price <= Number(maxPrice);

      return (
        matchesSearch &&
        matchesTeam &&
        matchesBrand &&
        matchesYear &&
        matchesKitType &&
        matchesCondition &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });
  }, [
    kits,
    searchTerm,
    filterTeam,
    filterBrand,
    filterYear,
    filterKitType,
    filterCondition,
    minPrice,
    maxPrice,
  ]);

  const hasActiveFilters = Boolean(
    searchTerm ||
      filterTeam !== 'ALL' ||
      filterBrand !== 'ALL' ||
      filterYear !== 'ALL' ||
      filterKitType !== 'ALL' ||
      filterCondition !== 'ALL' ||
      minPrice !== '' ||
      maxPrice !== ''
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterTeam('ALL');
    setFilterBrand('ALL');
    setFilterYear('ALL');
    setFilterKitType('ALL');
    setFilterCondition('ALL');
    setMinPrice('');
    setMaxPrice('');
  };

  const handleSetPriceRange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  // Open Edit Modal
  const handleOpenEdit = (kit: any) => {
    setEditingKit({
      ...JSON.parse(JSON.stringify(kit)),
      brand: kit.brand || 'Nike',
    });
    setModalError('');
    setIsEditDialogOpen(true);
  };

  // Upload new image(s) to Cloudinary inside Modal
  const handleModalImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!editingKit) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (editingKit.images.length + files.length > 15) {
      setModalError('Maximum limit of 15 photos exceeded per kit.');
      return;
    }

    setUploadingImage(true);
    setModalError('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > 5 * 1024 * 1024) {
        setModalError(`File "${file.name}" exceeds 5MB size limit.`);
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
          setEditingKit((prev: any) => ({
            ...prev,
            images: [...prev.images, data.url],
          }));
        } else {
          setModalError(data.error || 'Image upload failed.');
        }
      } catch (err: any) {
        setModalError(err.message || 'Error uploading image');
      }
    }

    setUploadingImage(false);
    e.target.value = '';
  };

  // Remove photo from Modal
  const handleModalRemoveImage = (indexToRemove: number) => {
    if (!editingKit) return;
    if (editingKit.images.length <= 1) {
      setModalError('A kit must have at least 1 photo.');
      return;
    }
    setModalError('');
    setEditingKit({
      ...editingKit,
      images: editingKit.images.filter(
        (_: string, idx: number) => idx !== indexToRemove
      ),
    });
  };

  // Promote photo to cover thumbnail (index 0)
  const handleModalSetThumbnail = (indexToPromote: number) => {
    if (!editingKit || indexToPromote === 0) return;
    const images = [...editingKit.images];
    const [selectedImage] = images.splice(indexToPromote, 1);
    images.unshift(selectedImage);
    setEditingKit({ ...editingKit, images });
  };

  // Sizing Variant Handlers
  const handleModalStockChange = (size: string, newStock: number) => {
    if (!editingKit) return;
    setEditingKit({
      ...editingKit,
      variants: editingKit.variants.map((v: any) =>
        v.size === size ? { ...v, stock: Math.max(0, newStock) } : v
      ),
    });
  };

  const handleModalAddVariant = (size: string) => {
    if (!editingKit) return;
    if (!editingKit.variants.some((v: any) => v.size === size)) {
      setEditingKit({
        ...editingKit,
        variants: [...editingKit.variants, { size, stock: 1 }],
      });
    }
  };

  const handleModalRemoveVariant = (size: string) => {
    if (!editingKit) return;
    setEditingKit({
      ...editingKit,
      variants: editingKit.variants.filter((v: any) => v.size !== size),
    });
  };

  // Save Changes to MongoDB (PUT /api/products/[slug])
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKit) return;

    if (!editingKit.images || editingKit.images.length === 0) {
      setModalError('At least 1 product photo is required.');
      return;
    }

    if (!editingKit.variants || editingKit.variants.length === 0) {
      setModalError('Please configure at least one size variant.');
      return;
    }

    setSavingEdit(true);
    setModalError('');

    try {
      const payload = {
        title: editingKit.title,
        team: editingKit.team,
        brand: editingKit.brand,
        year: editingKit.year,
        condition: Number(editingKit.condition),
        kitType: editingKit.kitType,
        spec: editingKit.spec,
        price: Number(editingKit.price),
        images: editingKit.images,
        variants: editingKit.variants,
      };

      const res = await fetch(`/api/products/${editingKit.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setKits((prev) =>
          prev.map((k) => (k.slug === editingKit.slug ? json.data : k))
        );
        setIsEditDialogOpen(false);
        setSuccessMessage(`"${editingKit.title}" updated successfully.`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setModalError(json.error || 'Failed to update kit');
      }
    } catch (err: any) {
      setModalError(err.message || 'Error saving changes');
    } finally {
      setSavingEdit(false);
    }
  };

  // Confirm Delete using shadcn Dialog (replaces window.confirm & alert)
  const handleConfirmDelete = async () => {
    if (!kitToDelete) return;

    setIsDeleting(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/products/${kitToDelete.slug}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        setKits((prev) => prev.filter((k) => k.slug !== kitToDelete.slug));
        setSuccessMessage(`"${kitToDelete.title}" deleted successfully.`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(json.error || 'Failed to delete kit.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error deleting kit');
    } finally {
      setIsDeleting(false);
      setKitToDelete(null);
    }
  };

  // Helper 1: Color Badges for Kit Brands
  const renderBrandBadge = (brand: string) => {
    const b = brand || 'Nike';
    const brandStyles: Record<string, string> = {
      Nike: 'bg-zinc-900 text-white border-zinc-700',
      Adidas: 'bg-blue-100 text-blue-900 border-blue-300',
      Puma: 'bg-red-100 text-red-800 border-red-300',
      Umbro: 'bg-amber-100 text-amber-900 border-amber-300',
      Kappa: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      Hummel: 'bg-orange-100 text-orange-900 border-orange-300',
      Macron: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      Castore: 'bg-slate-900 text-slate-100 border-slate-700',
      Reebok: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      Lotto: 'bg-rose-100 text-rose-900 border-rose-300',
      Diadora: 'bg-teal-100 text-teal-900 border-teal-300',
      Asics: 'bg-sky-100 text-sky-900 border-sky-300',
      'New Balance': 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300',
    };

    const style = brandStyles[b] || 'bg-zinc-100 text-zinc-800 border-zinc-300';

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold border shadow-xs ${style}`}
      >
        {b}
      </span>
    );
  };

  // Helper 2: Color Badges for Kit Types
  const renderKitTypeBadge = (kitType: string, spec: string) => {
    const typeStyles: Record<string, string> = {
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

    const style = typeStyles[kitType] || 'bg-zinc-50 text-zinc-700 border-zinc-200';

    return (
      <div className="flex flex-col gap-1">
        <span
          className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${style}`}
        >
          {kitType} Kit
        </span>
        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
          {spec}
        </span>
      </div>
    );
  };

  // Helper 3: Color Badges for Club / Team Names
  const TEAM_COLOR_PALETTE = [
    'bg-red-50 text-red-900 border-red-200',
    'bg-blue-50 text-blue-900 border-blue-200',
    'bg-emerald-50 text-emerald-900 border-emerald-200',
    'bg-amber-50 text-amber-950 border-amber-200',
    'bg-purple-50 text-purple-900 border-purple-200',
    'bg-sky-50 text-sky-950 border-sky-200',
    'bg-teal-50 text-teal-900 border-teal-200',
    'bg-indigo-50 text-indigo-900 border-indigo-200',
    'bg-rose-50 text-rose-900 border-rose-200',
    'bg-orange-50 text-orange-950 border-orange-200',
  ];

  const renderTeamBadge = (team: string) => {
    let hash = 0;
    for (let i = 0; i < team.length; i++) {
      hash = team.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % TEAM_COLOR_PALETTE.length;
    const colorClass = TEAM_COLOR_PALETTE[colorIndex];

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${colorClass}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
        {team}
      </span>
    );
  };

  // Helper 4: Condition Badges
  const renderConditionBadge = (condition: number) => {
    if (condition === 10) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          10/10 Mint
        </span>
      );
    }
    if (condition === 9) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          9/10 Excellent
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        8/10 Good
      </span>
    );
  };

  // Helper 5: Size & Stock Badges
  const renderSizeStockBadge = (size: string, stock: number) => {
    if (stock === 0) {
      return (
        <span
          key={size}
          className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 line-through opacity-80"
          title="Out of stock"
        >
          {size}: 0
        </span>
      );
    }
    if (stock <= 2) {
      return (
        <span
          key={size}
          className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300 shadow-xs"
          title="Low stock"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {size}: <strong className="text-amber-950 font-black">{stock}</strong>
        </span>
      );
    }
    return (
      <span
        key={size}
        className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-50 text-zinc-800 border border-zinc-200"
      >
        <span className="font-bold text-zinc-900">{size}:</span>
        <span className="font-semibold">{stock}</span>
      </span>
    );
  };

  // Options prepared for Comboboxes
  const teamComboboxOptions = useMemo(() => {
    return [
      { value: 'ALL', label: 'All Teams & Nations' },
      ...TEAMS_AND_COUNTRIES.map((t) => ({ value: t, label: t })),
    ];
  }, []);

  const brandComboboxOptions = useMemo(() => {
    return [
      { value: 'ALL', label: 'All Brands' },
      ...KIT_BRANDS.map((b) => ({ value: b, label: b })),
    ];
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 font-sans pb-24 selection:bg-zinc-900 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-zinc-200 sticky top-0 z-40 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="text-zinc-600 hover:text-black hover:bg-zinc-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadInventory}
              disabled={loading}
              className="text-xs border-zinc-300 hover:bg-zinc-100"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Link href="/admin/new-kit">
              <Button
                size="sm"
                className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add New Kit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-zinc-200 pb-5">
          <div>
            <p className="text-xs text-zinc-500 font-mono mb-1">
              Admin / Catalog & Sizing Management
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
              Inventory Vault
            </h1>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            Showing <strong className="text-zinc-950">{filteredKits.length}</strong> of{' '}
            <strong className="text-zinc-950">{kits.length}</strong> kits
          </span>
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

        {/* Search & Multi-Filter Toolbar */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-xs space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-center">
            {/* 1. Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs bg-zinc-50 border-zinc-200 text-zinc-900 h-9"
              />
            </div>

            {/* 2. Searchable Team / Club Combobox */}
            <Combobox
              options={teamComboboxOptions}
              featuredOptions={POPULAR_TEAMS}
              value={filterTeam}
              onChange={setFilterTeam}
              placeholder="Team: All"
              searchPlaceholder="Search club or nation..."
            />

            {/* 3. Searchable Brand Combobox */}
            <Combobox
              options={brandComboboxOptions}
              featuredOptions={POPULAR_BRANDS}
              value={filterBrand}
              onChange={setFilterBrand}
              placeholder="Brand: All"
              searchPlaceholder="Search brand..."
            />

            {/* 4. Season Year Filter */}
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="text-xs bg-zinc-50 border-zinc-200 h-9">
                <SelectValue placeholder="Season: All" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                <SelectItem value="ALL" className="text-xs">
                  All Seasons
                </SelectItem>
                {SHIRT_YEARS.map((y) => (
                  <SelectItem key={y} value={y} className="text-xs">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 5. Kit Type Filter */}
            <Select value={filterKitType} onValueChange={setFilterKitType}>
              <SelectTrigger className="text-xs bg-zinc-50 border-zinc-200 h-9">
                <SelectValue placeholder="Type: All" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                <SelectItem value="ALL" className="text-xs">
                  All Kit Types
                </SelectItem>
                {KIT_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    {t} Kit
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 6. Condition Filter */}
            <Select value={filterCondition} onValueChange={setFilterCondition}>
              <SelectTrigger className="text-xs bg-zinc-50 border-zinc-200 h-9">
                <SelectValue placeholder="Condition: All" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                <SelectItem value="ALL" className="text-xs">
                  All Conditions
                </SelectItem>
                {SHIRT_CONDITIONS.map((c) => (
                  <SelectItem key={c} value={c.toString()} className="text-xs">
                    {c}/10 Condition
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Inputs + Quick Filter Presets */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-600 font-mono">
                Price (PHP ₱):
              </span>
              <Input
                type="number"
                min="0"
                placeholder="Min ₱"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-24 h-8 text-xs font-mono bg-zinc-50 border-zinc-200 text-zinc-900"
              />
              <span className="text-xs text-zinc-400">–</span>
              <Input
                type="number"
                min="0"
                placeholder="Max ₱"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-24 h-8 text-xs font-mono bg-zinc-50 border-zinc-200 text-zinc-900"
              />

              {/* Quick Preset Buttons */}
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={() => handleSetPriceRange('', '2000')}
                  className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                    minPrice === '' && maxPrice === '2000'
                      ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  &lt; ₱2k
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPriceRange('2000', '3500')}
                  className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                    minPrice === '2000' && maxPrice === '3500'
                      ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  ₱2k–₱3.5k
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPriceRange('3500', '5000')}
                  className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                    minPrice === '3500' && maxPrice === '5000'
                      ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  ₱3.5k–₱5k
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPriceRange('5000', '')}
                  className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                    minPrice === '5000' && maxPrice === ''
                      ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  ₱5k+
                </button>
              </div>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                <FilterX className="w-3.5 h-3.5 mr-1" /> Clear All Filters
              </Button>
            )}
          </div>
        </div>

        {/* Inventory Table Card */}
        <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-950">
              Listed Football Shirts
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Filtered inventory view with separated columns for Product, Club/Nation, Brand, Season, Spec, Condition, and Size Stock.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-20 text-xs font-mono text-zinc-500">
                Fetching catalog records from MongoDB...
              </div>
            ) : filteredKits.length === 0 ? (
              <div className="text-center py-20 text-xs text-zinc-500 space-y-2">
                <p>No football shirts match your search/filter criteria.</p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-xs"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50/70 hover:bg-zinc-50/70 text-[11px] uppercase font-mono text-zinc-600">
                      <TableHead className="w-[220px]">Product Name</TableHead>
                      <TableHead className="w-[140px]">Club / Nation</TableHead>
                      <TableHead className="w-[100px]">Brand</TableHead>
                      <TableHead className="w-[90px]">Season</TableHead>
                      <TableHead className="w-[130px]">Kit Type & Spec</TableHead>
                      <TableHead className="w-[120px]">Condition</TableHead>
                      <TableHead className="w-[100px]">Price (PHP)</TableHead>
                      <TableHead className="min-w-[190px]">Size & Stock Status</TableHead>
                      <TableHead className="text-right w-[90px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKits.map((kit) => (
                      <TableRow
                        key={kit._id}
                        className="hover:bg-zinc-50/80 transition-colors text-xs"
                      >
                        {/* 1. Image & Product Name */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-14 rounded bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                              <Image
                                src={
                                  kit.images?.[0] ||
                                  'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800'
                                }
                                alt={kit.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p
                                className="font-bold text-zinc-950 truncate max-w-[150px]"
                                title={kit.title}
                              >
                                {kit.title}
                              </p>
                              <p className="text-[10px] font-mono text-zinc-400">
                                {kit.slug}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* 2. Color-Coded Club / Country */}
                        <TableCell>
                          {renderTeamBadge(kit.team)}
                        </TableCell>

                        {/* 3. Color-Coded Brand */}
                        <TableCell>
                          {renderBrandBadge(kit.brand)}
                        </TableCell>

                        {/* 4. Season / Year */}
                        <TableCell>
                          <span className="inline-block px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 font-mono text-xs font-bold text-zinc-900">
                            {kit.year}
                          </span>
                        </TableCell>

                        {/* 5. Color-Coded Kit Type & Spec */}
                        <TableCell className="whitespace-nowrap">
                          {renderKitTypeBadge(kit.kitType, kit.spec)}
                        </TableCell>

                        {/* 6. Color-Coded Condition Rating */}
                        <TableCell className="whitespace-nowrap">
                          {renderConditionBadge(kit.condition)}
                        </TableCell>

                        {/* 7. Price */}
                        <TableCell className="font-mono font-bold text-zinc-950 whitespace-nowrap">
                          ₱{kit.price?.toLocaleString()}
                        </TableCell>

                        {/* 8. Color-Coded Size Stock */}
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {kit.variants?.map((v: any) =>
                              renderSizeStockBadge(v.size, v.stock)
                            )}
                          </div>
                        </TableCell>

                        {/* 9. Actions */}
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(kit)}
                              className="h-8 text-xs border-zinc-300 hover:bg-zinc-100 text-zinc-800"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isDeleting && kitToDelete?.slug === kit.slug}
                              onClick={() => setKitToDelete({ slug: kit.slug, title: kit.title })}
                              className="text-zinc-400 hover:text-red-600 hover:bg-red-50 p-2 h-8"
                              title="Delete Kit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(kitToDelete)} onOpenChange={(open) => !open && setKitToDelete(null)}>
        <AlertDialogContent className="bg-white border-zinc-200 text-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Delete football shirt?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-600">
              Are you sure you want to remove <strong className="text-zinc-900">&quot;{kitToDelete?.title}&quot;</strong>? This will permanently delete the item and remove its hosted media assets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="text-xs border-zinc-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
            >
              {isDeleting ? 'Deleting...' : 'Delete Kit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Kit Focus Dialog / Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white border-zinc-200 text-zinc-900 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-950 uppercase tracking-tight">
              Edit Kit Listing
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Modify kit details, brand, photos, or adjust stock counts per size.
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {editingKit && (
            <form onSubmit={handleSaveEdit} className="space-y-6 pt-2">
              {/* Image Gallery */}
              <div className="space-y-3 border-b border-zinc-200 pb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                      Product Photos ({editingKit.images?.length || 0}/15)
                    </Label>
                    <p className="text-[11px] text-zinc-500">
                      Hover over any image to set it as the primary cover or remove it.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                  {editingKit.images?.map((imgUrl: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative aspect-[4/5] bg-zinc-100 border border-zinc-200 rounded-md overflow-hidden group shadow-xs"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        fill
                        sizes="(max-width: 640px) 33vw, 25vw"
                        className="object-cover"
                      />

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleModalRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-black/75 hover:bg-red-600 text-white p-1 rounded-full transition-colors z-10"
                        title="Remove Image"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      {/* Cover Badge or Button */}
                      {idx === 0 ? (
                        <span className="absolute bottom-1 left-1 bg-zinc-950 text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleModalSetThumbnail(idx)}
                          className="absolute bottom-1 left-1 right-1 bg-black/75 hover:bg-black text-white text-[9px] uppercase font-semibold py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity text-center"
                        >
                          Set Cover
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add Photo Button */}
                  {editingKit.images?.length < 15 && (
                    <label className="relative aspect-[4/5] border-2 border-dashed border-zinc-300 hover:border-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors group">
                      <Upload className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 mb-1 transition-colors" />
                      <span className="text-[11px] font-semibold text-zinc-600 group-hover:text-zinc-900">
                        {uploadingImage ? 'Uploading...' : '+ Add'}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        multiple
                        disabled={uploadingImage}
                        onChange={handleModalImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-title" className="text-xs font-semibold text-zinc-700">
                    Kit Title
                  </Label>
                  <Input
                    id="edit-title"
                    required
                    value={editingKit.title}
                    onChange={(e) =>
                      setEditingKit({ ...editingKit, title: e.target.value })
                    }
                    className="bg-white border-zinc-300 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Searchable Team with Top Picks */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">Team / Country</Label>
                    <Combobox
                      options={TEAMS_AND_COUNTRIES}
                      featuredOptions={POPULAR_TEAMS}
                      value={editingKit.team}
                      onChange={(val) => setEditingKit({ ...editingKit, team: val })}
                      placeholder="Select team..."
                      searchPlaceholder="Search club or nation..."
                    />
                  </div>

                  {/* Searchable Brand with Top Picks */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">Brand</Label>
                    <Combobox
                      options={KIT_BRANDS}
                      featuredOptions={POPULAR_BRANDS}
                      value={editingKit.brand || 'Nike'}
                      onChange={(val) => setEditingKit({ ...editingKit, brand: val })}
                      placeholder="Select brand..."
                      searchPlaceholder="Search brand..."
                    />
                  </div>

                  {/* Season */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Season / Year
                    </Label>
                    <Select
                      value={editingKit.year}
                      onValueChange={(val) =>
                        setEditingKit({ ...editingKit, year: val })
                      }
                    >
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
                    <Select
                      value={editingKit.kitType}
                      onValueChange={(val) =>
                        setEditingKit({ ...editingKit, kitType: val })
                      }
                    >
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
                    <Select
                      value={editingKit.spec}
                      onValueChange={(val) =>
                        setEditingKit({ ...editingKit, spec: val })
                      }
                    >
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

                  {/* Condition */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">
                      Condition
                    </Label>
                    <Select
                      value={editingKit.condition?.toString()}
                      onValueChange={(val) =>
                        setEditingKit({ ...editingKit, condition: Number(val) })
                      }
                    >
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
                    <Label htmlFor="edit-price" className="text-xs font-semibold text-zinc-700">
                      Price (PHP ₱)
                    </Label>
                    <Input
                      id="edit-price"
                      type="number"
                      min="0"
                      required
                      value={editingKit.price}
                      onChange={(e) =>
                        setEditingKit({
                          ...editingKit,
                          price: e.target.value === '' ? '' : Number(e.target.value),
                        })
                      }
                      className="bg-white border-zinc-300 font-mono text-xs font-bold text-zinc-950"
                    />
                  </div>
                </div>
              </div>

              {/* Size Variants */}
              <div className="pt-3 border-t border-zinc-200 space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Size Inventory Stock
                </Label>

                <div className="space-y-2">
                  {editingKit.variants?.map((v: any) => (
                    <div
                      key={v.size}
                      className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded px-3 py-1.5"
                    >
                      <span className="w-10 text-xs font-mono font-bold text-zinc-900">
                        {v.size}
                      </span>
                      <Input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) =>
                          handleModalStockChange(
                            v.size,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 bg-white border-zinc-300 text-center font-mono text-xs font-bold h-8"
                      />
                      <span className="text-xs text-zinc-500">units in stock</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleModalRemoveVariant(v.size)}
                        className="ml-auto text-zinc-400 hover:text-red-600 hover:bg-red-50 h-7 px-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add Size Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-zinc-500 mr-1 font-mono">+ Add:</span>
                  {SHIRT_SIZES.filter(
                    (sz) => !editingKit.variants.some((v: any) => v.size === sz)
                  ).map((sz) => (
                    <Button
                      key={sz}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleModalAddVariant(sz)}
                      className="h-7 px-2 text-xs font-mono bg-white border-zinc-300 text-zinc-700 hover:text-black hover:bg-zinc-100"
                    >
                      <Plus className="w-3 h-3 mr-1" /> {sz}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <DialogFooter className="pt-4 border-t border-zinc-200 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="text-xs border-zinc-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingEdit || uploadingImage}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold"
                >
                  {savingEdit ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}