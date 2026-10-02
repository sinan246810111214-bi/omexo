import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useHashRouter } from '../hooks/useHashRouter';
import { useToast } from '../components/Toast';
import { 
  ShoppingCart, Flame, Star, Award, Zap, 
  ShieldCheck, Search, SlidersHorizontal, Check, RefreshCw, 
  Truck, Eye, ArrowRight, Sparkles, Filter
} from 'lucide-react';
import { Product } from '../types';

export const Home: React.FC = () => {
  const { 
    products, 
    addToCart, 
    categories, 
    brands, 
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    showCategoryBrands
  } = useStore();
  
  const { navigate } = useHashRouter();
  const { toast } = useToast();

  // Local sorting/filtering controls
  const [localPriceLimit, setLocalPriceLimit] = useState<number>(30000);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);

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

  // Add Special Combo directly to cart & proceed
  const handleGetCombo = () => {
    const comboProduct = products.find(p => p.id === 'omexo-special-combo');
    if (comboProduct && comboProduct.stockCount > 0) {
      addToCart(comboProduct, 1);
      toast('Omexo Special Combo added to cart!', 'success');
      navigate('checkout');
    } else {
      // Fallback if not loaded yet or combo item is out of stock: add keychain & stand individually
      const keychain = products.find(p => p.id === 'mechanical-switch-keychain');
      const stand = products.find(p => p.id === 'foldable-phone-stand');
      
      const keychainOk = keychain && keychain.stockCount > 0;
      const standOk = stand && stand.stockCount > 0;

      if (keychainOk && standOk) {
        addToCart(keychain!, 1);
        addToCart(stand!, 1);
        toast('Added Mechanical Switch Keychain & Foldable Phone Stand Combo!', 'success');
        navigate('checkout');
      } else {
        toast('Sorry, the Omexo Special Combo is currently out of stock!', 'error');
      }
    }
  };

  // CATALOG GRID: Filtering and sorting
  const filteredProducts = products.filter((p) => {
    // Hide the special combo item from the normal grid so it only appears in its custom section
    if (p.id === 'omexo-special-combo') return false;

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
    if (sortBy === 'rating') return b.salePrice - a.salePrice; // Simulated rating sort
    if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
    return 0; // default featured
  });

  // Max price for dynamic range
  const maxProductPrice = Math.max(...products.map(p => p.salePrice), 15000);

  // Custom visual categories with subtle glass cards
  const displayCategories = [
    { name: 'Tech Accessories', queryName: 'Tech Accessories', image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80' },
    { name: 'Desk Essentials', queryName: 'Desk Essentials', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=400&q=80' },
    { name: 'Lifestyle', queryName: 'Lifestyle', image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=400&q=80' },
    { name: 'Trending', queryName: 'Trending', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80' }
  ];

  return (
    <div className="space-y-16 pb-24 animate-in fade-in duration-300" id="homepage-container">
      
      {/* 2. HERO SECTION: Premium D2C Instagram Poster-Inspired */}
      <section className="relative overflow-hidden rounded-[32px] bg-pine-green text-warm-white min-h-[500px] flex items-center shadow-lg" id="hero-banner">
        {/* Abstract Soft Light Glow Element */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(232,224,210,0.12),transparent_70%)] pointer-events-none z-0" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(255,255,255,0.05),transparent_60%)] pointer-events-none z-0" />
        
        {/* Subtle grid mesh overlay */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#FAF9F4_1px,transparent_1px),linear-gradient(to_bottom,#FAF9F4_1px,transparent_1px)] [background-size:24px_24px] z-0" />

        <div className="relative z-10 w-full px-6 md:px-16 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Hero text */}
          <div className="md:col-span-6 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-soft-beige uppercase backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-soft-beige animate-pulse" />
              Omexo Design Lab
            </span>
            
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-warm-white text-balance">
                Small Things.<br />Big Joy.
              </h1>
              <p className="text-sm md:text-base text-warm-white/80 max-w-md leading-relaxed font-normal">
                Smart, useful products made for everyday life. Experience pure utility wrapped in luxury design.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('catalog-deck');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="px-6 py-3 bg-warm-white hover:bg-soft-beige text-pine-green font-extrabold rounded-full text-xs uppercase tracking-widest transition-all duration-200 hover:scale-[1.02] active:scale-100 shadow-md cursor-pointer"
              >
                SHOP NOW
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('categories-section');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-warm-white border border-white/20 font-extrabold rounded-full text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer"
              >
                EXPLORE PRODUCTS
              </button>
            </div>
          </div>

          {/* Clean product-hero composition on the right */}
          <div className="md:col-span-6 flex justify-center relative">
            <div className="relative p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-[32px] shadow-2xl max-w-sm w-full group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />
              <img 
                src="https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80" 
                alt="Mechanical Keychain" 
                className="max-h-[260px] w-full object-cover rounded-2xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.2)] transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="mt-4 flex items-center justify-between text-left">
                <div>
                  <h4 className="text-sm font-bold tracking-wide text-warm-white">Mechanical Switch Keychain</h4>
                  <p className="text-[10px] text-warm-white/60">An absolute sensory tactile joy.</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-soft-beige">₹199</div>
                  <div className="text-[9px] line-through text-warm-white/40">₹250</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST / BENEFITS BAR: Glassmorphism Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="premium-trust-badges">
        {[
          { title: 'ALL INDIA FREE DELIVERY', desc: 'Guaranteed air express dispatch.', icon: Truck },
          { title: 'COD AVAILABLE', desc: 'Zero advance payment required.', icon: ShieldCheck },
          { title: 'QUALITY PRODUCTS', desc: 'Handpicked and carefully tested.', icon: Award },
          { title: 'EASY SHOPPING', desc: 'WhatsApp support & quick replace.', icon: RefreshCw }
        ].map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <div 
              key={idx} 
              className="p-5 glass-card rounded-[20px] flex flex-col items-center text-center gap-3 transition-all duration-300 hover:border-pine-green/35"
            >
              <div className="w-10 h-10 bg-pine-green/5 rounded-full flex items-center justify-center text-pine-green border border-pine-green/10 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-extrabold text-pine-green uppercase tracking-widest">{badge.title}</h4>
                <p className="text-[9px] text-pine-green/60 font-semibold">{badge.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 6. PRODUCT CATEGORY SECTION: Minimal Glass Cards */}
      <section className="space-y-6 pt-4" id="categories-section">
        <div className="text-center space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-widest text-pine-green/50">CURATED SPACES</h2>
          <p className="text-xl font-extrabold text-pine-green font-display">Shop by Curated Collections</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {displayCategories.map((cat, idx) => {
            const isSelected = selectedCategory === cat.queryName;
            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedCategory(cat.queryName);
                  setSelectedBrand('All');
                  const el = document.getElementById('catalog-deck');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`group relative aspect-[4/3] rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 border ${
                  isSelected ? 'border-pine-green ring-1 ring-pine-green shadow-md' : 'border-pine-green/10 shadow-sm'
                }`}
              >
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pine-green via-pine-green/30 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute bottom-4 left-4 text-left">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-soft-beige block mb-0.5">COLLECTION</span>
                  <h4 className="text-sm font-bold tracking-wide uppercase text-warm-white">{cat.name}</h4>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. SPECIAL COMBO SECTION: Gorgeous Frosted Glass Composition */}
      <section className="pt-4" id="combo-promo">
        <div className="relative rounded-[32px] overflow-hidden border border-pine-green/15 bg-soft-beige/50 p-8 md:p-12 shadow-lg text-left">
          {/* Subtle grid mesh and radial backlight */}
          <div className="absolute top-[-50px] left-[-50px] w-80 h-80 bg-[radial-gradient(circle,rgba(35,79,30,0.06),transparent_70%)] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Combo info */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-flex items-center gap-1 bg-pine-green/10 border border-pine-green/10 px-3 py-1 rounded-full text-[9px] font-bold tracking-widest text-pine-green uppercase">
                🔥 MATCHED SET
              </span>
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-pine-green font-display">
                  SPECIAL COMBO
                </h2>
                <p className="text-sm font-bold text-pine-green/70">
                  Two useful picks. One special price.
                </p>
                <p className="text-xs text-pine-green/60 leading-relaxed max-w-md">
                  Get our premium mechanical switch clicky fidget keychain combined with the ultra-slim metal foldable phone stand. Everything you need to elevate your everyday workspace layout.
                </p>
              </div>

              {/* Combo Pricing and Button */}
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-3xl font-black text-pine-green">₹350</div>
                  <div className="text-xs text-pine-green/40 line-through">Value ₹580</div>
                </div>
                <button
                  onClick={handleGetCombo}
                  className="px-6 py-3 bg-pine-green hover:bg-pine-green-hover text-warm-white font-extrabold rounded-full text-xs uppercase tracking-widest transition-all duration-200 hover:scale-[1.02] shadow-md cursor-pointer"
                >
                  GET THE COMBO
                </button>
              </div>
            </div>

            {/* Premium glassmorphism composition show off */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="glass-card rounded-[24px] p-4 text-center">
                <img 
                  src="https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=300&q=80" 
                  alt="Switch Keychain" 
                  className="w-full aspect-square object-cover rounded-2xl mb-2"
                  referrerPolicy="no-referrer"
                />
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-pine-green">Keychain</h5>
              </div>
              <div className="glass-card rounded-[24px] p-4 text-center">
                <img 
                  src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=300&q=80" 
                  alt="Metal Phone Stand" 
                  className="w-full aspect-square object-cover rounded-2xl mb-2"
                  referrerPolicy="no-referrer"
                />
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-pine-green">Phone Stand</h5>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS: Responsive Glassmorphism Grid */}
      <section className="space-y-8 pt-4 border-t border-pine-green/10" id="catalog-deck">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 text-left">
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-pine-green/50">OMX CATALOG</h2>
            <p className="text-2xl font-extrabold text-pine-green font-display">Featured Products</p>
          </div>

          {/* Filtering and Search Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Search filter state info */}
            {searchQuery && (
              <span className="text-xs font-semibold text-pine-green/60 bg-pine-green/5 px-2.5 py-1.5 rounded-full border border-pine-green/10">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-1.5 hover:text-pine-green font-bold text-[10px]">✕</button>
              </span>
            )}
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-pine-green/5 text-pine-green border border-pine-green/15 text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm"
              id="catalog-filter-toggle"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {((selectedCategory !== 'All' ? 1 : 0) + (selectedBrand !== 'All' ? 1 : 0) + (onlyInStock ? 1 : 0)) > 0 && (
                <span className="bg-pine-green text-warm-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ml-1">
                  {((selectedCategory !== 'All' ? 1 : 0) + (selectedBrand !== 'All' ? 1 : 0) + (onlyInStock ? 1 : 0))}
                </span>
              )}
            </button>

            {/* Sorting Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 text-xs font-bold text-pine-green bg-white rounded-full border border-pine-green/15 focus:outline-none focus:border-pine-green cursor-pointer shadow-sm"
              id="catalog-sort-select"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Collapsible Filters Sheet */}
        {isFilterPanelOpen && (
          <div 
            className="p-6 bg-white/70 backdrop-blur-md border border-pine-green/10 rounded-[24px] space-y-4 animate-in slide-in-from-top-1 duration-150 text-left shadow-sm" 
            id="filter-panel"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-end">
              
              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-pine-green/45 tracking-wider">Select Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedBrand('All');
                  }}
                  className="w-full px-3 py-2 border border-pine-green/10 bg-white rounded-xl text-xs font-bold text-pine-green focus:outline-none focus:border-pine-green"
                >
                  <option value="All">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-pine-green/45 tracking-wider">Select Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-pine-green/10 bg-white rounded-xl text-xs font-bold text-pine-green focus:outline-none focus:border-pine-green"
                >
                  <option value="All">All Brands</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-pine-green/45 tracking-wider">
                  <span>Price Constraint</span>
                  <span className="text-pine-green font-bold">≤ ₹{localPriceLimit}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxProductPrice}
                  step="50"
                  value={localPriceLimit}
                  onChange={(e) => setLocalPriceLimit(Number(e.target.value))}
                  className="w-full h-1 bg-pine-green/10 rounded appearance-none cursor-pointer accent-pine-green"
                />
              </div>

              {/* In stock check */}
              <div className="flex items-center h-10">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-pine-green/70 hover:text-pine-green">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 rounded border-pine-green/25 text-pine-green focus:ring-pine-green"
                  />
                  <span>Exclude Out of Stock</span>
                </label>
              </div>

            </div>

            {/* Clear button */}
            <div className="flex items-center justify-between pt-3 border-t border-pine-green/5">
              <span className="text-[10px] font-semibold text-pine-green/40">
                Found {sortedProducts.length} premium results matching filters.
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
                className="px-3 py-1 bg-pine-green/5 hover:bg-pine-green/10 text-[9px] font-bold uppercase tracking-widest text-pine-green rounded-full transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Catalog Grid */}
        {sortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center glass-card rounded-[32px] space-y-4" id="empty-search-state">
            <div className="p-4 bg-pine-green/5 border border-pine-green/5 text-pine-green/40 rounded-full">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-pine-green uppercase tracking-wider">No matching products found</h3>
              <p className="text-xs text-pine-green/60 max-w-sm leading-relaxed">
                We couldn't locate any products matching the selected criteria. Try resetting active filters.
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
              className="px-5 py-2.5 bg-pine-green hover:bg-pine-green-hover text-warm-white text-xs font-bold rounded-full transition-all cursor-pointer uppercase tracking-wider"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="products-grid">
            {sortedProducts.map((prod) => {
              const isSoldOut = prod.stockCount <= 0;
              const discountPercentage = Math.round(((prod.regularPrice - prod.salePrice) / prod.regularPrice) * 100);
              
              return (
                <div
                  key={prod.id}
                  onClick={() => navigate('product', { id: prod.id })}
                  className="group flex flex-col justify-between rounded-[28px] glass-card overflow-hidden hover:border-pine-green/35 transition-all duration-300 p-4 relative cursor-pointer"
                  id={`product-card-${prod.id}`}
                >
                  {/* Media Aspect block */}
                  <div className="relative aspect-square rounded-[20px] overflow-hidden bg-white/40 mb-4 border border-white/30">
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Floating Labels */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                      {prod.isTrending && (
                        <span className="text-[8px] font-bold uppercase bg-pine-green text-warm-white px-2 py-0.5 rounded-full tracking-wider flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 fill-warm-white text-warm-white" /> Trending
                        </span>
                      )}
                      {discountPercentage > 0 && (
                        <span className="text-[8px] font-bold uppercase bg-soft-beige text-pine-green px-2 py-0.5 rounded-full tracking-wider">
                          Save {discountPercentage}%
                        </span>
                      )}
                    </div>

                    {/* Stock Overlays */}
                    {isSoldOut ? (
                      <div className="absolute inset-0 bg-warm-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                        <span className="bg-pine-green text-warm-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    ) : prod.stockCount < 5 ? (
                      <div className="absolute bottom-2 left-2 z-10">
                        <span className="bg-white/90 backdrop-blur-sm text-pine-green text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border border-pine-green/10">
                          Only {prod.stockCount} left
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Meta details */}
                  <div className="flex-1 flex flex-col justify-between text-left">
                    <div>
                      <span className="text-[9px] font-bold text-pine-green/40 tracking-wider uppercase mb-1 block">
                        {prod.category} {prod.brand ? `· ${prod.brand}` : ''}
                      </span>
                      <h4 className="text-xs font-bold text-pine-green line-clamp-2 leading-snug transition-colors mb-1.5 group-hover:text-pine-green-hover">
                        {prod.title}
                      </h4>
                      
                      {/* Short Description */}
                      <p className="text-[10px] text-pine-green/60 line-clamp-1 mb-2 font-medium">
                        {prod.description}
                      </p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 text-[10px] text-pine-green/60 mb-3">
                        <Star className="w-3 h-3 text-pine-green fill-pine-green" />
                        <span className="font-extrabold text-pine-green">4.9</span>
                        <span>· Verified</span>
                      </div>
                    </div>

                    {/* Prices and dynamic action buttons */}
                    <div className="space-y-3 pt-2 border-t border-pine-green/5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-extrabold text-pine-green">
                          ₹{prod.salePrice.toLocaleString('en-IN')}
                        </span>
                        {prod.regularPrice > prod.salePrice && (
                          <span className="text-[10px] text-pine-green/40 line-through">
                            ₹{prod.regularPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={(e) => handleAddToCart(prod, e)}
                          disabled={isSoldOut}
                          className="py-2.5 bg-white/50 hover:bg-white text-pine-green border border-pine-green/10 hover:border-pine-green/25 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl text-[9px] uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1"
                          id={`card-add-to-cart-${prod.id}`}
                        >
                          <ShoppingCart className="w-3 h-3 text-pine-green/60" />
                          Cart
                        </button>
                        <button
                          onClick={(e) => handleBuyNow(prod, e)}
                          disabled={isSoldOut}
                          className="py-2.5 bg-pine-green hover:bg-pine-green-hover text-warm-white disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl text-[9px] uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1"
                          id={`card-buy-now-${prod.id}`}
                        >
                          <Zap className="w-3 h-3 fill-warm-white" />
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
