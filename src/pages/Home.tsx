import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useHashRouter } from '../hooks/useHashRouter';
import { useToast } from '../components/Toast';
import {
  ShoppingCart,
  Star,
  Zap,
  Search,
  MessageCircle,
  Plus,
  X,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Product } from '../types';
import {
  buildProductWhatsAppUrl,
  getSiteBrandConfig,
} from '../config/categories';

export const Home: React.FC = () => {
  const {
    activeSite,
    siteProducts,
    addToCart,
    searchQuery,
    setSearchQuery,
    heroConfig,
    comboConfig,
    banners,
    reviews,
    addReview,
    storeSettings,
  } = useStore();

  const { siteSlug, navigate } = useHashRouter();
  const { toast } = useToast();
  const activeBrand = getSiteBrandConfig(siteSlug || activeSite);
  const storeDisplayName = storeSettings?.storeName || activeBrand.name;

  // Subcategory filter strictly within THIS standalone website
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Write Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [revCustomerName, setRevCustomerName] = useState('');
  const [revProductName, setRevProductName] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revText, setRevText] = useState('');

  useEffect(() => {
    setSelectedSubcategory('All');
    setOnlyInStock(false);
    setSortBy('featured');
  }, [siteSlug]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stockCount <= 0) {
      toast(`${product.title} is currently out of stock!`, 'error');
      return;
    }
    addToCart(product, 1, siteSlug);
    toast(`Added "${product.title}" to bag`, 'success');
  };

  const handleBuyNow = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stockCount <= 0) {
      toast(`${product.title} is currently out of stock!`, 'error');
      return;
    }
    addToCart(product, 1, siteSlug);
    navigate('checkout', undefined, siteSlug);
  };

  const handleGetCombo = () => {
    const comboProduct = siteProducts.find((p) => p.id === 'omexo-special-combo');
    if (comboProduct && comboProduct.stockCount > 0) {
      addToCart(comboProduct, 1, siteSlug);
      navigate('checkout', undefined, siteSlug);
      return;
    }

    const inStockItems = siteProducts.filter((p) => p.id !== 'omexo-special-combo' && p.stockCount > 0);
    if (inStockItems.length >= 2) {
      addToCart(inStockItems[0], 1, siteSlug);
      addToCart(inStockItems[1], 1, siteSlug);
      navigate('checkout', undefined, siteSlug);
    } else if (inStockItems.length === 1) {
      addToCart(inStockItems[0], 1, siteSlug);
      navigate('checkout', undefined, siteSlug);
    } else {
      toast(`Sorry, the ${storeDisplayName} bundle is currently out of stock!`, 'error');
    }
  };

  const catalogProducts = siteProducts.filter((p) => p.id !== 'omexo-special-combo');

  const filteredProducts = catalogProducts.filter((p) => {
    const subLower = selectedSubcategory.toLowerCase();
    const matchesSubcategory =
      selectedSubcategory === 'All' ||
      p.title.toLowerCase().includes(subLower.replace(/s$/, '')) ||
      p.description.toLowerCase().includes(subLower.replace(/s$/, '')) ||
      Object.values(p.specs || {}).some((val) =>
        String(val).toLowerCase().includes(subLower.replace(/s$/, ''))
      );

    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStock = !onlyInStock || p.stockCount > 0;

    return matchesSubcategory && matchesSearch && matchesStock;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.salePrice - b.salePrice;
    if (sortBy === 'price-high') return b.salePrice - a.salePrice;
    if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
    return 0;
  });

  const featuredPromoBanner = banners[0];
  const approvedReviews = reviews.filter((r) => r.status === 'Approved');

  return (
    <div className="space-y-10 pb-8 text-left" id="homepage-container">
      {/* 1. COMPACT HERO BANNER (Admin-Editable per store) */}
      <section
        className="rounded-3xl bg-pine-green text-warm-white p-6 sm:p-8 md:p-12 shadow-md"
        id="hero-banner"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="text-[11px] font-bold tracking-widest text-soft-beige uppercase">
              {heroConfig.badge} · Cash on Delivery Across India
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-warm-white whitespace-pre-line text-balance">
              {heroConfig.title}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-warm-white/80 max-w-lg leading-relaxed">
              {heroConfig.description}
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  document.getElementById('catalog-deck')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="px-6 py-3 min-h-[44px] bg-warm-white hover:bg-soft-beige text-pine-green font-extrabold rounded-full text-xs uppercase tracking-widest transition-colors cursor-pointer whitespace-nowrap"
              >
                {heroConfig.primaryCtaText}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (heroConfig.secondaryCtaText.toLowerCase().includes('track')) {
                    navigate('track-order', undefined, siteSlug);
                  } else {
                    document.getElementById('catalog-deck')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="px-5 py-3 min-h-[44px] bg-white/10 hover:bg-white/20 text-warm-white border border-white/20 font-bold rounded-full text-xs uppercase tracking-widest transition-colors cursor-pointer whitespace-nowrap"
              >
                {heroConfig.secondaryCtaText}
              </button>
            </div>
          </div>

          <div className="hidden md:flex md:col-span-5 justify-end">
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 w-full max-w-xs space-y-3">
              <img
                src={heroConfig.cardImage}
                alt={heroConfig.cardTitle}
                className="h-48 w-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-warm-white truncate">{heroConfig.cardTitle}</h4>
                  <p className="text-[11px] text-warm-white/70 truncate">{heroConfig.cardSubtitle}</p>
                </div>
                {heroConfig.cardPrice > 0 && (
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-soft-beige tabular-nums">
                      ₹{heroConfig.cardPrice}
                    </div>
                    {heroConfig.cardRegularPrice > 0 && (
                      <div className="text-[10px] line-through text-warm-white/50 tabular-nums">
                        ₹{heroConfig.cardRegularPrice}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FAST PRODUCT CATALOG (2-column mobile grid for quick shopping) */}
      <section className="space-y-4" id="catalog-deck">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-pine-green font-display">
              {selectedSubcategory === 'All'
                ? `${storeDisplayName} Products`
                : `${selectedSubcategory}`}
            </h2>
            {searchQuery && (
              <div className="mt-1 inline-flex items-center gap-2 text-xs text-pine-green/70 font-semibold">
                <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-pine-green underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setOnlyInStock(!onlyInStock)}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                onlyInStock
                  ? 'bg-pine-green text-warm-white border-pine-green'
                  : 'bg-white text-pine-green border-pine-green/15 hover:border-pine-green/35'
              }`}
              id="catalog-filter-toggle"
            >
              In Stock Only
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-h-[40px] px-3.5 py-2 text-xs font-bold text-pine-green bg-white rounded-lg border border-pine-green/15 focus:outline-none focus:border-pine-green cursor-pointer"
              id="catalog-sort-select"
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="alphabetical">A to Z</option>
            </select>
          </div>
        </div>

        {/* Clean Single-Row Scrollable Subcategory Tabs */}
        <div
          className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
          role="tablist"
          aria-label={`${storeDisplayName} Categories`}
          id="category-filter-tabs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedSubcategory === 'All'}
            onClick={() => setSelectedSubcategory('All')}
            className={`min-h-[40px] px-4 py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedSubcategory === 'All'
                ? 'bg-pine-green text-warm-white border-pine-green'
                : 'bg-white text-pine-green/80 border-pine-green/15 hover:border-pine-green/40'
            }`}
            id="tab-filter-all"
          >
            All ({catalogProducts.length})
          </button>

          {activeBrand.subcategories.map((sub) => {
            const active = selectedSubcategory === sub;
            return (
              <button
                key={sub}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedSubcategory(active ? 'All' : sub)}
                className={`min-h-[40px] px-4 py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-pine-green text-warm-white border-pine-green'
                    : 'bg-white text-pine-green/80 border-pine-green/15 hover:border-pine-green/40'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>

        {/* Product Grid: 2 Columns Mobile, 3 Tablet, 4 Desktop */}
        {sortedProducts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white border border-pine-green/10 rounded-3xl space-y-3"
            id="empty-search-state"
          >
            <Search className="w-6 h-6 text-pine-green/40" />
            <h3 className="text-sm font-bold text-pine-green">No matching products found</h3>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubcategory('All');
                setOnlyInStock(false);
              }}
              className="px-5 py-2.5 bg-pine-green text-warm-white text-xs font-bold rounded-full cursor-pointer"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5" id="products-grid">
            {sortedProducts.map((prod) => {
              const isSoldOut = prod.stockCount <= 0;
              const discountPercentage =
                prod.regularPrice > prod.salePrice
                  ? Math.round(((prod.regularPrice - prod.salePrice) / prod.regularPrice) * 100)
                  : 0;
              const whatsappOrderUrl = buildProductWhatsAppUrl(prod, storeSettings);

              return (
                <div
                  key={prod.id}
                  onClick={() => navigate('product', { id: prod.id }, siteSlug)}
                  className="group flex flex-col justify-between rounded-2xl bg-white border border-pine-green/10 hover:border-pine-green/35 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 p-2.5 sm:p-4 cursor-pointer shadow-sm"
                  id={`product-card-${prod.id}`}
                >
                  {/* Image */}
                  <div>
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-soft-beige/40 mb-2.5 sm:mb-3">
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.opacity = '0';
                        }}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-warm-white/85 flex items-center justify-center">
                          <span className="bg-pine-green text-warm-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Unboxed Metadata Line */}
                    <div className="text-[10px] sm:text-[11px] font-semibold text-pine-green/60 mb-1 truncate">
                      {discountPercentage > 0 ? (
                        <span className="text-pine-green font-bold">Save {discountPercentage}%</span>
                      ) : (
                        <span>{activeBrand.shortLabel}</span>
                      )}
                      {prod.stockCount > 0 && prod.stockCount < 5 && (
                        <span> · Only {prod.stockCount} left</span>
                      )}
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-pine-green line-clamp-2 leading-snug mb-1.5">
                      {prod.title}
                    </h3>
                  </div>

                  {/* Price & Fast Actions */}
                  <div className="space-y-2 pt-2 border-t border-pine-green/10 mt-auto">
                    <div className="flex items-baseline justify-between gap-1">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm sm:text-base font-extrabold text-pine-green tabular-nums">
                          ₹{prod.salePrice.toLocaleString('en-IN')}
                        </span>
                        {prod.regularPrice > prod.salePrice && (
                          <span className="text-[11px] text-pine-green/45 line-through tabular-nums">
                            ₹{prod.regularPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleBuyNow(prod, e)}
                          disabled={isSoldOut}
                          className="flex-1 min-h-[38px] sm:min-h-[40px] bg-pine-green hover:bg-pine-green-hover text-warm-white disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap px-2"
                          id={`card-buy-now-${prod.id}`}
                        >
                          <Zap className="w-3 h-3 fill-warm-white shrink-0" />
                          <span>Buy Now</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(prod, e)}
                          disabled={isSoldOut}
                          className="w-10 min-h-[38px] sm:min-h-[40px] bg-soft-beige/60 hover:bg-soft-beige text-pine-green border border-pine-green/15 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center cursor-pointer shrink-0 transition-colors"
                          id={`card-add-to-cart-${prod.id}`}
                          aria-label={`Add ${prod.title} to bag`}
                          title="Add to Bag"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>

                      <a
                        href={whatsappOrderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full min-h-[38px] sm:min-h-[40px] px-2 bg-[#1E8E3E] hover:bg-[#167330] text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                        id={`card-whatsapp-order-${prod.id}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. SPECIAL COMBO (Only rendered if enabled in THIS store's Admin Panel) */}
      {comboConfig.isActive && (
        <section id="combo-promo">
          <div className="rounded-3xl border border-pine-green/15 bg-soft-beige/65 p-5 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-3">
                <span className="text-[11px] font-bold tracking-widest text-pine-green uppercase">
                  {comboConfig.badge}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-pine-green font-display">
                  {comboConfig.title}
                </h2>
                <p className="text-xs sm:text-sm text-pine-green/75 leading-relaxed max-w-lg">
                  {comboConfig.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-pine-green tabular-nums">
                      ₹{comboConfig.price}
                    </div>
                    {comboConfig.valuePrice > 0 && (
                      <div className="text-xs text-pine-green/50 line-through tabular-nums">
                        Value ₹{comboConfig.valuePrice}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleGetCombo}
                    className="px-6 py-3 min-h-[44px] bg-pine-green hover:bg-pine-green-hover text-warm-white font-extrabold rounded-full text-xs uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    {comboConfig.ctaText}
                  </button>
                </div>
              </div>

              <div className="md:col-span-5 grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl p-3 border border-pine-green/10 text-center">
                  <img
                    src={comboConfig.card1Image}
                    alt={comboConfig.card1Title}
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-square object-cover rounded-xl mb-2"
                    referrerPolicy="no-referrer"
                  />
                  <h5 className="text-[11px] font-bold text-pine-green truncate">
                    {comboConfig.card1Title}
                  </h5>
                </div>
                <div className="bg-white rounded-2xl p-3 border border-pine-green/10 text-center">
                  <img
                    src={comboConfig.card2Image}
                    alt={comboConfig.card2Title}
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-square object-cover rounded-xl mb-2"
                    referrerPolicy="no-referrer"
                  />
                  <h5 className="text-[11px] font-bold text-pine-green truncate">
                    {comboConfig.card2Title}
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Optional Compact Admin Banner (if configured cleanly in Admin -> Slide Banners) */}
      {featuredPromoBanner && (
        <section className="rounded-2xl bg-white border border-pine-green/10 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 max-w-2xl">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-pine-green/60">
              {featuredPromoBanner.badge}
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-pine-green font-display">
              {featuredPromoBanner.title}
            </h3>
            <p className="text-xs text-pine-green/70">{featuredPromoBanner.description}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              document.getElementById('catalog-deck')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 min-h-[42px] bg-pine-green hover:bg-pine-green-hover text-warm-white font-bold rounded-full text-xs uppercase tracking-wider transition-colors shrink-0 self-start sm:self-center cursor-pointer"
          >
            <span>{featuredPromoBanner.primaryCta || `Shop ${activeBrand.shortLabel}`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* 4. COMPACT CUSTOMER REVIEWS (Strictly scoped to active store) */}
      <section className="space-y-4 pt-6 border-t border-pine-green/10" id="customer-reviews-section">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-pine-green/70">
              <Star className="w-3.5 h-3.5 fill-pine-green text-pine-green" />
              <span>4.9 / 5.0 Verified {storeDisplayName} Buyers</span>
            </div>
            <h2 className="text-xl font-extrabold text-pine-green font-display">
              Customer Feedback
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsReviewModalOpen(true);
              setRevRating(5);
              setRevCustomerName('');
              setRevProductName(catalogProducts[0]?.title || '');
              setRevText('');
            }}
            className="px-4 py-2 min-h-[40px] bg-pine-green hover:bg-pine-green-hover text-warm-white font-bold rounded-full text-xs uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write Review</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {approvedReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl p-4 sm:p-5 border border-pine-green/10 bg-white flex flex-col justify-between space-y-3 shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-medium text-pine-green/85 leading-relaxed">
                  &ldquo;{rev.reviewText}&rdquo;
                </p>
              </div>

              <div className="pt-2.5 border-t border-pine-green/10 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <div className="font-extrabold text-pine-green truncate">{rev.customerName}</div>
                  <div className="text-[11px] text-pine-green/55 truncate">{rev.productName}</div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-pine-green shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pine-green" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WRITE A REVIEW MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-pine-green/55 z-50 flex items-center justify-center p-4">
          <div className="bg-warm-white border border-pine-green/20 rounded-3xl max-w-md w-full p-5 sm:p-6 text-left space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-pine-green/10 pb-3">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-pine-green font-display">
                  Review {storeDisplayName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="text-pine-green/50 hover:text-pine-green p-1.5 cursor-pointer"
                aria-label="Close review modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!revCustomerName.trim() || !revText.trim()) {
                  toast('Please enter your name and review text.', 'error');
                  return;
                }
                await addReview(
                  {
                    customerName: revCustomerName.trim(),
                    productName: revProductName || catalogProducts[0]?.title || storeDisplayName,
                    rating: revRating,
                    reviewText: revText.trim(),
                    status: 'Pending',
                  },
                  siteSlug
                );
                toast(`Thank you! Your review will appear once verified.`, 'success');
                setIsReviewModalOpen(false);
              }}
              className="space-y-3 text-xs font-bold text-pine-green"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-pine-green/60 tracking-wider">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={revCustomerName}
                  onChange={(e) => setRevCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Varma"
                  className="w-full px-3.5 py-2.5 bg-white border border-pine-green/15 rounded-xl font-bold text-pine-green focus:outline-none focus:border-pine-green"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-pine-green/60 tracking-wider">
                  Product
                </label>
                <select
                  value={revProductName}
                  onChange={(e) => setRevProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-pine-green/15 rounded-xl font-bold text-pine-green focus:outline-none focus:border-pine-green"
                >
                  {catalogProducts.map((p) => (
                    <option key={p.id} value={p.title}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-pine-green/60 tracking-wider">
                  Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRevRating(star)}
                      className={`p-2 rounded-xl cursor-pointer ${
                        revRating >= star
                          ? 'bg-amber-100 text-amber-600 border border-amber-300'
                          : 'bg-zinc-100 text-zinc-400'
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${revRating >= star ? 'fill-amber-500 text-amber-500' : ''}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-pine-green/60 tracking-wider">
                  Your Feedback
                </label>
                <textarea
                  required
                  rows={3}
                  value={revText}
                  onChange={(e) => setRevText(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full px-3.5 py-2.5 bg-white border border-pine-green/15 rounded-xl font-bold text-pine-green focus:outline-none focus:border-pine-green resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-pine-green hover:bg-pine-green-hover text-warm-white font-extrabold uppercase tracking-wider text-xs rounded-full cursor-pointer"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-5 py-3 bg-pine-green/10 text-pine-green font-extrabold uppercase tracking-wider text-xs rounded-full cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
