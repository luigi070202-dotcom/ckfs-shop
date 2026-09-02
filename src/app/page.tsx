// src/app/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  SHIRT_YEARS,
  SHIRT_CONDITIONS,
  SHIRT_SIZES,
  KIT_TYPES,
  KIT_BRANDS,
  POPULAR_BRANDS,
  TEAMS_AND_COUNTRIES,
  POPULAR_TEAMS,
} from '@/app/lib/constants';

import { ProductCard } from '@/components/store';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// 1. Import useCartStore
import { useCartStore } from '@/app/store/useCartStore';

import {
  Search,
  FilterX,
  Package,
  Sparkles,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default function StoreCatalogPage() {
  // 2. Connect Zustand Cart hooks
  const toggleCart = useCartStore((state) => state.toggleCart);
  const itemCount = useCartStore((state) => state.getItemCount());

  const [kits, setKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');
  const [filterKitType, setFilterKitType] = useState('ALL');
  const [filterCondition, setFilterCondition] = useState('ALL');
  const [filterSize, setFilterSize] = useState('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Load Catalog
  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        if (json.success) {
          setKits(json.data);
        } else {
          setErrorMessage(json.error || 'Failed to fetch catalog.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error loading football shirts.');
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Filter & Search Evaluation
  const filteredKits = useMemo(() => {
    let result = kits.filter((kit) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        kit.title?.toLowerCase().includes(query) ||
        kit.team?.toLowerCase().includes(query) ||
        kit.brand?.toLowerCase().includes(query);

      const matchesTeam = filterTeam === 'ALL' || kit.team === filterTeam;
      const matchesBrand =
        filterBrand === 'ALL' || (kit.brand || 'Nike') === filterBrand;
      const matchesYear = filterYear === 'ALL' || kit.year === filterYear;
      const matchesKitType =
        filterKitType === 'ALL' || kit.kitType === filterKitType;
      const matchesCondition =
        filterCondition === 'ALL' || kit.condition?.toString() === filterCondition;

      const matchesSize =
        filterSize === 'ALL' ||
        kit.variants?.some((v: any) => v.size === filterSize && v.stock > 0);

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
        matchesSize &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'year-desc') {
      result.sort((a, b) => b.year.localeCompare(a.year));
    } else {
      result.sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    return result;
  }, [
    kits,
    searchTerm,
    filterTeam,
    filterBrand,
    filterYear,
    filterKitType,
    filterCondition,
    filterSize,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  // Reset to Page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    filterTeam,
    filterBrand,
    filterYear,
    filterKitType,
    filterCondition,
    filterSize,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  // Calculate Paginated Slices
  const totalPages = Math.ceil(filteredKits.length / ITEMS_PER_PAGE);

  const paginatedKits = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredKits.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredKits, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const catalogElement = document.getElementById('catalog-top');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper for generating page numbers with ellipsis (1, 2, 3, 4)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
      filterTeam !== 'ALL' ||
      filterBrand !== 'ALL' ||
      filterYear !== 'ALL' ||
      filterKitType !== 'ALL' ||
      filterCondition !== 'ALL' ||
      filterSize !== 'ALL' ||
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
    setFilterSize('ALL');
    setMinPrice('');
    setMaxPrice('');
  };

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
    <div className="min-h-screen bg-zinc-50 text-zinc-950 selection:bg-zinc-950 selection:text-white">
      {/* 2. Hero Section */}
      <section className="bg-zinc-950 text-white py-14 sm:py-20 px-4 sm:px-6 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-xs font-mono text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Authentic Vintage & Modern Kits
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase max-w-2xl leading-none">
            The Pitch Archive
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl">
            Curated vintage match shirts, retro editions, and modern authentic football kits. Verified 8/10 to 10/10 condition.
          </p>
        </div>
      </section>

      {/* 3. Catalog & Faceted Filters */}
      <main id="catalog-top" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          {/* Top Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search club, year, brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs bg-zinc-50 border-zinc-200 text-zinc-900 h-9"
              />
            </div>

            <Combobox
              options={teamComboboxOptions}
              featuredOptions={POPULAR_TEAMS}
              value={filterTeam}
              onChange={setFilterTeam}
              placeholder="All Clubs & Nations"
              searchPlaceholder="Search club..."
            />

            <Combobox
              options={brandComboboxOptions}
              featuredOptions={POPULAR_BRANDS}
              value={filterBrand}
              onChange={setFilterBrand}
              placeholder="All Brands"
              searchPlaceholder="Search brand..."
            />

            <Select value={filterSize} onValueChange={setFilterSize}>
              <SelectTrigger className="text-xs bg-zinc-50 border-zinc-200 h-9">
                <SelectValue placeholder="Size: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">
                  All Sizes
                </SelectItem>
                {SHIRT_SIZES.map((sz) => (
                  <SelectItem key={sz} value={sz} className="text-xs font-mono">
                    Size {sz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="text-xs bg-zinc-50 border-zinc-200 h-9 font-medium">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest" className="text-xs">
                  Latest Added
                </SelectItem>
                <SelectItem value="year-desc" className="text-xs">
                  Season Year (Newest)
                </SelectItem>
                <SelectItem value="price-asc" className="text-xs">
                  Price: Low to High
                </SelectItem>
                <SelectItem value="price-desc" className="text-xs">
                  Price: High to Low
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Secondary Filter Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="text-xs bg-zinc-50 border-zinc-200 h-8 w-28">
                  <SelectValue placeholder="Season" />
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

              <Select value={filterKitType} onValueChange={setFilterKitType}>
                <SelectTrigger className="text-xs bg-zinc-50 border-zinc-200 h-8 w-28">
                  <SelectValue placeholder="Kit Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">
                    All Types
                  </SelectItem>
                  {KIT_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {t} Kit
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterCondition} onValueChange={setFilterCondition}>
                <SelectTrigger className="text-xs bg-zinc-50 border-zinc-200 h-8 w-32">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
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

              <div className="flex items-center gap-1.5 pl-2">
                <span className="text-zinc-500 font-mono text-[11px]">₱:</span>
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-16 h-8 text-xs font-mono bg-zinc-50 border-zinc-200"
                />
                <span className="text-zinc-400">–</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-16 h-8 text-xs font-mono bg-zinc-50 border-zinc-200"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                <FilterX className="w-3.5 h-3.5 mr-1" /> Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>
            Showing{' '}
            <strong className="text-zinc-950">
              {filteredKits.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
              –{Math.min(currentPage * ITEMS_PER_PAGE, filteredKits.length)}
            </strong>{' '}
            of <strong className="text-zinc-950">{filteredKits.length}</strong> available shirts
          </span>
          {totalPages > 1 && (
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
          )}
        </div>

        {/* 4. Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-12">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-zinc-200 rounded-xl aspect-4/6 animate-pulse p-4 space-y-3"
              >
                <div className="w-full h-3/4 bg-zinc-100 rounded-lg" />
                <div className="w-2/3 h-4 bg-zinc-100 rounded" />
                <div className="w-1/3 h-4 bg-zinc-100 rounded" />
              </div>
            ))}
          </div>
        ) : filteredKits.length === 0 ? (
          <div className="text-center py-24 bg-white border border-zinc-200 rounded-xl space-y-3">
            <Package className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="font-bold text-zinc-900 text-base">No shirts match your criteria</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your team, brand, or price filters to browse the catalog archive.
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs border-zinc-300 mt-2"
              >
                Reset All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {paginatedKits.map((kit, index) => (
              <ProductCard
                key={kit._id}
                product={kit}
                priority={index < 4}
              />
            ))}
          </div>
        )}

        {/* 5. Numbered Pagination Controls (1, 2, 3, 4) */}
        {totalPages > 1 && (
          <nav
            role="navigation"
            aria-label="Pagination"
            className="flex items-center justify-center gap-1.5 pt-8 border-t border-zinc-200"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-9 px-3 text-xs font-mono"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Prev</span>
            </Button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((p, idx) => {
                if (p === '...') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-9 h-9 flex items-center justify-center text-xs font-mono text-zinc-400 select-none"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = Number(p);
                const isActive = currentPage === pageNum;

                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 p-0 text-xs font-mono font-bold transition-all ${
                      isActive
                        ? 'bg-zinc-950 text-white hover:bg-zinc-800'
                        : 'text-zinc-700 hover:bg-zinc-100 border-zinc-200'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-9 px-3 text-xs font-mono"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </nav>
        )}
      </main>
    </div>
  );
}