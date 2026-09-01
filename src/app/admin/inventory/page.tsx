// src/app/admin/inventory/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

// Reusable Common Components
import {
  BrandBadge,
  TeamBadge,
  ConditionBadge,
  KitTypeBadge,
  SizeStockBadge,
  ImageUploadGallery,
  SizeStockManager,
} from '@/components/common';

// shadcn/ui Components
import { Button } from '@/components/ui/button';
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

  // Save Changes to MongoDB
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

  // Confirm Delete using shadcn Dialog
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

                        {/* 2. Reusable Team / Club Badge */}
                        <TableCell>
                          <TeamBadge team={kit.team} />
                        </TableCell>

                        {/* 3. Reusable Brand Badge */}
                        <TableCell>
                          <BrandBadge brand={kit.brand} />
                        </TableCell>

                        {/* 4. Season / Year */}
                        <TableCell>
                          <span className="inline-block px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 font-mono text-xs font-bold text-zinc-900">
                            {kit.year}
                          </span>
                        </TableCell>

                        {/* 5. Reusable Kit Type & Spec Badge */}
                        <TableCell className="whitespace-nowrap">
                          <KitTypeBadge kitType={kit.kitType} spec={kit.spec} />
                        </TableCell>

                        {/* 6. Reusable Condition Badge */}
                        <TableCell className="whitespace-nowrap">
                          <ConditionBadge condition={kit.condition} />
                        </TableCell>

                        {/* 7. Price */}
                        <TableCell className="font-mono font-bold text-zinc-950 whitespace-nowrap">
                          ₱{kit.price?.toLocaleString()}
                        </TableCell>

                        {/* 8. Reusable Size Stock Badges */}
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {kit.variants?.map((v: any) => (
                              <SizeStockBadge
                                key={v.size}
                                size={v.size}
                                stock={v.stock}
                              />
                            ))}
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
              {/* 1. Reusable Image Gallery Component */}
              <div className="border-b border-zinc-200 pb-5">
                <ImageUploadGallery
                  images={editingKit.images || []}
                  onChange={(updatedImages) =>
                    setEditingKit({ ...editingKit, images: updatedImages })
                  }
                  onError={setModalError}
                />
              </div>

              {/* 2. Kit Attributes */}
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

              {/* 3. Reusable Size Inventory Manager Component */}
              <div className="pt-3 border-t border-zinc-200">
                <SizeStockManager
                  variants={editingKit.variants || []}
                  onChange={(updatedVariants) =>
                    setEditingKit({ ...editingKit, variants: updatedVariants })
                  }
                />
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
                  disabled={savingEdit}
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