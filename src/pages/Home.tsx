import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useHashRouter } from '../hooks/useHashRouter';
import { useToast } from '../components/Toast';
import { 
  ShoppingCart, Flame, Star, Award, ChevronLeft, ChevronRight, Zap, 
  Shield, Sparkles, Search, SlidersHorizontal, Check, RefreshCw, 
  Truck, CheckCircle2, ShieldCheck, Heart, Filter, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

export const Home: React.FC = () => {
  const { 
    products, 
    addToCart, 
    categories, 
    brands, 
    offerBanner,
    banners,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand
  } = useStore();
  
  const { navigate } = useHashRouter();
  const { toast } = useToast();

  // Combined banners list (primary offerBanner + extra secondary banners)
  const allBanners = [offerBanner, ...banners].filter(Boolean);

  // Local sorting/filtering controls
  const [localPriceLimit, setLocalPriceLimit] = useState<number>(30000);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);

  // Banner carousel state
  const [bannerIndex, setBannerIndex] = useState(0);

  // Auto-rotate carousel banners every 6 seconds
  useEffect(() => {
    if (allBanners.length <= 1) return;
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % allBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [allBanners]);

  const handleNextBanner = () => {
    setBannerIndex((prev) => (prev + 1) % allBanners.length);
  };

  const handlePrevBanner = () => {
    setBannerIndex((prev) => (prev - 1 + allBanners.length) % allBanners.length);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stockCount <= 0) {
      toast(`${product.title} is currently out of stock!`, 'error');
      return;
    }
    addToCart(product, 1);
    toast(`Added "${product.title}" to your cart!`, 'success');
  };

  const handleBuyNow = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stockCount <= 0) {
      toast(`${product.title} is currently out of stock!`, 'error');
      return;
    }
    addToCart(product, 1);
    navigate('checkout');
  };

  // 1. BEST SELLERS: Products with isTrending or high score
  const bestSellers = products.filter(p => p.isTrending || p.regularPrice < p.salePrice + 1000).slice(0, 4);

  // 2. NEW ARRIVALS: Last 4 items from database list
  const newArrivals = [...products].reverse().slice(0, 4);

  // 3. CATALOG GRID: Filtering and sorting
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = p.salePrice <= localPriceLimit;
    const matchesStock = !onlyInStock || p.stockCount > 0;
    
    return matchesCategory && matchesBrand && matchesSearch && matchesPrice && matchesStock;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.salePrice - b.salePrice;
    if (sortBy === 'price-high') return b.salePrice - a.salePrice;
    if (sortBy === 'rating') return 5.0 - 4.8; // Simulated: best rated first
    if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
    return 0; // default featured
  });

  // Max price for dynamic range
  const maxProductPrice = Math.max(...products.map(p => p.salePrice), 15000);

  const activeSlide = allBanners[bannerIndex];

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-300" id="homepage-container">
      
      {/* 1. Dynamic Hero Carousel / Banner System */}
      {allBanners.length > 0 && (
        <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white min-h-[400px] flex items-center" id="hero-carousel">
          {/* Active Banner Slideshow */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={activeSlide.backgroundImageUrl ? {
              backgroundImage: `url(${activeSlide.backgroundImageUrl})`,
            } : {
              backgroundImage: 'url(https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1600&q=80)'
            }}
          />
          {/* High-quality dark scrim overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/30 z-10" />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2DD4BF_1px,transparent_1px)] [background-size:20px_20px] z-10" />

          {/* Grid layout supporting text and floating poster image */}
          <div className="relative z-20 w-full px-6 md:px-12 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-1 bg-teal-500/10 border border-teal-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-teal-400">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                {activeSlide.badge || 'MEGA OFFERS LIVE'}
              </span>
              
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
                {activeSlide.title}
              </h1>
              
              <p className="text-xs md:text-sm text-slate-300 max-w-lg leading-relaxed font-medium">
                {activeSlide.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('catalog-deck');
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-all hover:scale-[1.02] shadow-lg shadow-teal-500/20 active:scale-100 cursor-pointer text-center"
                >
                  {activeSlide.primaryCta || 'Explore Gear'}
                </button>
                <button
                  onClick={() => navigate('track-order')}
                  className="px-6 py-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer text-center"
                >
                  {activeSlide.secondaryCta || 'Track Order'}
                </button>
              </div>
            </div>

            {/* Poster image aligned right */}
            {activeSlide.imageUrl && (
              <div className="hidden md:flex md:col-span-5 justify-center">
                <img 
                  src={activeSlide.imageUrl} 
                  alt="Promo Highlight" 
                  className="max-h-[280px] w-auto object-contain rounded-2xl drop-shadow-[0_15px_15px_rgba(45,212,191,0.2)]"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          {/* Carousel Arrows */}
          {allBanners.length > 1 && (
            <div className="absolute right-4 bottom-4 z-20 flex gap-2">
              <button
                onClick={handlePrevBanner}
                className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-white transition-colors border border-slate-800"
                id="carousel-prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextBanner}
                className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-white transition-colors border border-slate-800"
                id="carousel-next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Carousel Indicators */}
          {allBanners.length > 1 && (
            <div className="absolute left-6 md:left-12 bottom-4 z-20 flex gap-1.5">
              {allBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setBannerIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    bannerIndex === i ? 'w-6 bg-teal-400' : 'w-1.5 bg-slate-500/50'
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. Premium Trust Badges Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4" id="premium-trust-badges">
        <div className="p-4 bg-white border border-zinc-200 rounded flex items-center gap-4 hover:border-black transition-all duration-150">
          <div className="w-10 h-10 border border-zinc-200 bg-zinc-50 rounded flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider">Cash on Delivery Available</h4>
            <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">No advance pay needed. Hand over cash on express delivery doorstep.</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-zinc-200 rounded flex items-center gap-4 hover:border-black transition-all duration-150">
          <div className="w-10 h-10 border border-zinc-200 bg-zinc-50 rounded flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider">Fast Express Delivery</h4>
            <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">Guaranteed courier drops across 19,000+ Indian PIN Codes.</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-zinc-200 rounded flex items-center gap-4 hover:border-black transition-all duration-150">
          <div className="w-10 h-10 border border-zinc-200 bg-zinc-50 rounded flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider">100% Quality Assured</h4>
            <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">Rigorous checks before dispatch. Hassle-free replacements.</p>
          </div>
        </div>
      </section>

      {/* 3. Category Grid & Brand Quick-Links */}
      <section className="space-y-4" id="category-brands-anchors">
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase text-zinc-400 tracking-widest">Shop By Department</h2>
          <p className="text-xs text-zinc-500 font-medium">Instant shortcuts to filter our tactical gear collections</p>
        </div>

        {/* Categories Grid (Bento style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const productCount = products.filter(p => p.category === cat.name).length;
            // Aesthetic cover image pairings based on name
            let imageSrc = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80';
            if (cat.name.toLowerCase().includes('audio') || cat.name.toLowerCase().includes('earbuds')) {
              imageSrc = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80';
            } else if (cat.name.toLowerCase().includes('charger') || cat.name.toLowerCase().includes('gan')) {
              imageSrc = 'https://images.unsplash.com/photo-1619134778706-7015533a6150?auto=format&fit=crop&w=300&q=80';
            } else if (cat.name.toLowerCase().includes('case') || cat.name.toLowerCase().includes('phone')) {
              imageSrc = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=300&q=80';
            } else if (cat.name.toLowerCase().includes('adapter') || cat.name.toLowerCase().includes('hub')) {
              imageSrc = 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=300&q=80';
            }

            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setSelectedBrand('All');
                  const el = document.getElementById('catalog-deck');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`relative aspect-[4/3] rounded overflow-hidden group cursor-pointer border ${
                  selectedCategory === cat.name ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200'
                }`}
              >
                <img 
                  src={imageSrc} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <h4 className="text-[11px] font-bold tracking-wide uppercase">{cat.name}</h4>
                  <span className="text-[9px] text-zinc-300 font-semibold uppercase">{productCount} Products</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Brands Horizontal Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider mr-2">Top Brands:</span>
          <button
            onClick={() => {
              setSelectedBrand('All');
              const el = document.getElementById('catalog-deck');
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`px-3 py-1.5 border rounded text-[10px] font-bold uppercase transition-all duration-150 ${
              selectedBrand === 'All'
                ? 'bg-black text-white border-black'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-black hover:text-black'
            }`}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setSelectedBrand(b.name);
                const el = document.getElementById('catalog-deck');
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`px-3 py-1.5 border rounded text-[10px] font-bold uppercase transition-all duration-150 ${
                selectedBrand === b.name
                  ? 'bg-black text-white border-black shadow-xs'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-black hover:text-black'
              }`}
              id={`brand-tag-${b.id}`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </section>

      {/* 4. Dual Tab Featured Grids: 'Best Sellers' vs 'New Arrivals' */}
      <section className="space-y-6 pt-4 border-t border-zinc-200" id="featured-grids-tabbed">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Best Sellers Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-zinc-900 fill-zinc-950" />
              <h3 className="text-xs font-bold uppercase text-zinc-900 tracking-wider">Best Sellers</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {bestSellers.map((p) => {
                const discount = Math.round(((p.regularPrice - p.salePrice) / p.regularPrice) * 100);
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate('product', { id: p.id })}
                    className="p-3 bg-white border border-zinc-200 hover:border-black rounded flex flex-col justify-between cursor-pointer group transition-all duration-150"
                  >
                    <div className="aspect-square rounded bg-zinc-50 border border-zinc-100 overflow-hidden relative mb-2">
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200" referrerPolicy="no-referrer" />
                      {discount > 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-black text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    <h4 className="text-[11px] font-bold text-zinc-850 leading-snug line-clamp-2 truncate-line">{p.title}</h4>
                    <div className="flex items-baseline gap-1.5 mt-1.5 justify-between">
                      <span className="text-xs font-black text-zinc-950">₹{p.salePrice.toLocaleString('en-IN')}</span>
                      <span className="text-[9px] text-zinc-600 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-zinc-800 fill-zinc-800" /> 4.9
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* New Arrivals Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-900" />
              <h3 className="text-xs font-bold uppercase text-zinc-900 tracking-wider">New Arrivals</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {newArrivals.map((p) => {
                const discount = Math.round(((p.regularPrice - p.salePrice) / p.regularPrice) * 100);
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate('product', { id: p.id })}
                    className="p-3 bg-white border border-zinc-200 hover:border-black rounded flex flex-col justify-between cursor-pointer group transition-all duration-150"
                  >
                    <div className="aspect-square rounded bg-zinc-50 border border-zinc-100 overflow-hidden relative mb-2">
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200" referrerPolicy="no-referrer" />
                      <span className="absolute top-1.5 left-1.5 bg-black text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">
                        NEW
                      </span>
                    </div>
                    <h4 className="text-[11px] font-bold text-zinc-850 leading-snug line-clamp-2 truncate-line">{p.title}</h4>
                    <div className="flex items-baseline gap-1.5 mt-1.5 justify-between">
                      <span className="text-xs font-black text-zinc-950">₹{p.salePrice.toLocaleString('en-IN')}</span>
                      <span className="text-[9px] text-zinc-500 font-medium">Just Landed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 5. Precision Shop Catalog Deck (Robust Filtering, Pricing Range, Stock Availability, and Sorting) */}
      <section className="space-y-6 pt-6 border-t border-zinc-200" id="catalog-deck">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Elite Catalog Deck</h2>
            <p className="text-xs text-zinc-500 font-medium">Discover ultra-responsive premium smart devices and tools</p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-xs font-bold rounded transition-all"
              id="catalog-filter-toggle"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
              <span>Catalog Filters</span>
              {((selectedCategory !== 'All' ? 1 : 0) + (selectedBrand !== 'All' ? 1 : 0) + (searchQuery ? 1 : 0) + (onlyInStock ? 1 : 0)) > 0 && (
                <span className="bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {((selectedCategory !== 'All' ? 1 : 0) + (selectedBrand !== 'All' ? 1 : 0) + (searchQuery ? 1 : 0) + (onlyInStock ? 1 : 0))}
                </span>
              )}
            </button>

            {/* Sorting Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-50 rounded border border-zinc-200 focus:outline-none focus:border-black"
              id="catalog-sort-select"
            >
              <option value="featured">Featured Deck</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rating</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Collapsible filter configuration sheet */}
        {isFilterPanelOpen && (
          <div 
            className="p-5 bg-white border border-zinc-200 rounded shadow-xs space-y-4 animate-in slide-in-from-top-1 duration-150" 
            id="filter-panel"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-end">
              
              {/* Category Filter selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Select Department</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedBrand('All');
                  }}
                  className="w-full px-3 py-1.5 border border-zinc-200 bg-white rounded text-xs font-bold text-zinc-700 focus:outline-none focus:border-black"
                >
                  <option value="All">All Departments</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Select Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-200 bg-white rounded text-xs font-bold text-zinc-700 focus:outline-none focus:border-black"
                >
                  <option value="All">All Brands</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                  <span>Price Constraint</span>
                  <span className="text-zinc-900 font-bold">≤ ₹{localPriceLimit.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxProductPrice}
                  step="50"
                  value={localPriceLimit}
                  onChange={(e) => setLocalPriceLimit(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-200 rounded appearance-none cursor-pointer accent-black"
                />
              </div>

              {/* In stock check */}
              <div className="flex items-center h-10">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-zinc-600 hover:text-black">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black"
                  />
                  <span>Exclude Out of Stock Items</span>
                </label>
              </div>

            </div>

            {/* Clear filters panel trigger */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
              <span className="text-[10px] font-semibold text-zinc-400">
                Found {sortedProducts.length} responsive results matching your settings.
              </span>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedBrand('All');
                  setSearchQuery('');
                  setLocalPriceLimit(30000);
                  setOnlyInStock(false);
                  setSortBy('featured');
                }}
                className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-[10px] font-bold uppercase tracking-wider text-zinc-800 rounded transition-colors duration-100"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Global search feedback indicator */}
        {searchQuery && (
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded flex items-center justify-between text-xs font-bold text-zinc-700">
            <span>Showing results for search query: <span className="text-black font-extrabold">"{searchQuery}"</span></span>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-[10px] font-bold uppercase text-zinc-400 hover:text-black"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Dynamic Catalog Grid */}
        {sortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-zinc-200 rounded space-y-4" id="empty-search-state">
            <div className="p-4 bg-zinc-50 border border-zinc-100 text-zinc-400 rounded">
              <Search className="w-6 h-6 text-zinc-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">No matching smart gadgets found</h3>
              <p className="text-[11px] text-zinc-500 max-w-sm leading-relaxed">
                We couldn't locate any products with the active criteria. Try adjusting the price constraints or clearing active selectors.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedBrand('All');
                setLocalPriceLimit(30000);
                setOnlyInStock(false);
              }}
              className="px-5 py-2.5 bg-black hover:bg-zinc-900 text-white text-xs font-bold rounded transition-all duration-100 cursor-pointer uppercase tracking-wider"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="products-grid">
            {sortedProducts.map((prod) => {
              const isSoldOut = prod.stockCount <= 0;
              const discountPercentage = Math.round(((prod.regularPrice - prod.salePrice) / prod.regularPrice) * 100);
              
              return (
                <div
                  key={prod.id}
                  onClick={() => navigate('product', { id: prod.id })}
                  className="group flex flex-col justify-between rounded border border-zinc-200 bg-white overflow-hidden hover:border-black transition-all duration-150 p-3.5 relative"
                  id={`product-card-${prod.id}`}
                >
                  {/* Media Aspect block */}
                  <div className="relative aspect-square rounded overflow-hidden bg-zinc-50 mb-3.5 border border-zinc-100">
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Floating Labels */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                      {prod.isTrending && (
                        <span className="text-[8px] font-bold uppercase bg-black text-white px-2 py-0.5 rounded tracking-wider flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 fill-white text-white" /> Trending
                        </span>
                      )}
                      {discountPercentage > 0 && (
                        <span className="text-[8px] font-bold uppercase bg-black text-white px-2 py-0.5 rounded tracking-wider">
                          Save {discountPercentage}%
                        </span>
                      )}
                    </div>

                    {/* Interactive Preview Overlay */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-10">
                      <button className="p-2.5 bg-white text-zinc-900 border border-zinc-200 rounded hover:border-black hover:text-black transition-all shadow-xs flex items-center justify-center">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Stock Overlays */}
                    {isSoldOut ? (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-10">
                        <span className="bg-black text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded">
                          Out of Stock
                        </span>
                      </div>
                    ) : prod.stockCount < 5 ? (
                      <div className="absolute bottom-2 left-2 z-10">
                        <span className="bg-zinc-100 text-zinc-900 text-[8px] font-bold uppercase px-2 py-0.5 rounded border border-zinc-200">
                          Only {prod.stockCount} left
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Meta details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase mb-1 block">
                        {prod.category} {prod.brand ? `• ${prod.brand}` : ''}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 line-clamp-2 leading-snug transition-colors mb-1.5 group-hover:text-black">
                        {prod.title}
                      </h4>
                      
                      {/* Rating details */}
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-3">
                        <Star className="w-3 h-3 text-zinc-900 fill-zinc-950" />
                        <span className="font-bold">4.9 / 5.0</span>
                        <span className="text-zinc-400">• Verified</span>
                      </div>
                    </div>

                    {/* Prices and dynamic action buttons */}
                    <div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xs font-extrabold text-zinc-950">
                          ₹{prod.salePrice.toLocaleString('en-IN')}
                        </span>
                        {prod.regularPrice > prod.salePrice && (
                          <span className="text-[10px] text-zinc-400 line-through">
                            ₹{prod.regularPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Tactile buttons */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={(e) => handleAddToCart(prod, e)}
                          disabled={isSoldOut}
                          className="py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-800 rounded text-[9px] font-bold uppercase tracking-wider transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                          id={`card-add-to-cart-${prod.id}`}
                        >
                          <ShoppingCart className="w-3 h-3 text-zinc-600" />
                          Add
                        </button>
                        <button
                          onClick={(e) => handleBuyNow(prod, e)}
                          disabled={isSoldOut}
                          className="py-2 bg-black hover:bg-zinc-900 text-white rounded text-[9px] font-bold uppercase tracking-wider transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 shadow-xs"
                          id={`card-buy-now-${prod.id}`}
                        >
                          <Zap className="w-3 h-3 fill-white" />
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
