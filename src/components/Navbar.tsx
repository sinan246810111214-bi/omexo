import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useHashRouter } from '../hooks/useHashRouter';
import { CartDrawer } from './CartDrawer';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import {
  getSiteBrandConfig,
  getSitePathPrefix,
} from '../config/categories';

export const Navbar: React.FC = () => {
  const {
    cart,
    siteProducts,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    setSelectedBrand,
    storeSettings,
  } = useStore();

  const { route, siteSlug, navigate } = useHashRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [localSearch, setLocalSearch] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeBrand = getSiteBrandConfig(siteSlug);
  const storeDisplayName = storeSettings?.storeName || activeBrand.name;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
        if (localSearch.trim() === '') {
          setIsSearchActive(false);
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [localSearch]);

  const handleGoHome = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSearchQuery('');
    setLocalSearch('');
    navigate('home', undefined, siteSlug);
    setIsMobileMenuOpen(false);
  };

  const handleScrollToCatalog = () => {
    setIsMobileMenuOpen(false);
    if (route !== 'home') {
      navigate('home', undefined, siteSlug);
      setTimeout(() => {
        document.getElementById('catalog-deck')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }
    document.getElementById('catalog-deck')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    setIsSearchFocused(false);
    navigate('home', undefined, siteSlug);

    setTimeout(() => {
      document.getElementById('catalog-deck')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSuggestionClick = (prodId: string) => {
    setLocalSearch('');
    setIsSearchFocused(false);
    setIsSearchActive(false);
    navigate('product', { id: prodId }, siteSlug);
  };

  const suggestions = localSearch.trim()
    ? siteProducts
        .filter(
          (p) =>
            p.id !== 'omexo-special-combo' &&
            (p.title.toLowerCase().includes(localSearch.toLowerCase()) ||
              p.description.toLowerCase().includes(localSearch.toLowerCase()) ||
              (p.brand && p.brand.toLowerCase().includes(localSearch.toLowerCase())))
        )
        .slice(0, 5)
    : [];

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full border-b border-pine-green/10 bg-warm-white"
        id="global-navbar"
      >
        {/* Main Compact Navbar Row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-3">
          {/* Left: Brand Typographic Wordmark Logo */}
          <a
            href={getSitePathPrefix(siteSlug) || '/'}
            onClick={(e) => {
              e.preventDefault();
              handleGoHome();
            }}
            className="flex items-center cursor-pointer select-none shrink-0"
            id="nav-brand-logo"
          >
            <span className="font-logo text-lg sm:text-2xl font-bold uppercase text-pine-green tracking-wider leading-none whitespace-nowrap">
              {storeDisplayName}
            </span>
          </a>

          {/* Center: Clean Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-7 text-xs font-bold tracking-wider text-pine-green uppercase"
            aria-label={`${storeDisplayName} Navigation`}
          >
            <a
              href={getSitePathPrefix(siteSlug) || '/'}
              onClick={(e) => {
                e.preventDefault();
                handleGoHome();
              }}
              className={`whitespace-nowrap shrink-0 hover:underline hover:underline-offset-8 cursor-pointer ${
                route === 'home' && !searchQuery ? 'underline underline-offset-8 decoration-2' : ''
              }`}
              id="nav-link-home"
            >
              Shop
            </a>

            <button
              type="button"
              onClick={handleScrollToCatalog}
              className="whitespace-nowrap shrink-0 hover:underline hover:underline-offset-8 cursor-pointer uppercase"
              id="nav-link-catalog"
            >
              Catalog
            </button>

            <a
              href={`${getSitePathPrefix(siteSlug)}/track-order`}
              onClick={(e) => {
                e.preventDefault();
                navigate('track-order', undefined, siteSlug);
              }}
              className={`whitespace-nowrap shrink-0 hover:underline hover:underline-offset-8 cursor-pointer ${
                route === 'track-order' ? 'underline underline-offset-8 decoration-2' : ''
              }`}
              id="nav-link-track"
            >
              Track Order
            </a>

            <a
              href={`${getSitePathPrefix(siteSlug)}/contact-us`}
              onClick={(e) => {
                e.preventDefault();
                navigate('contact-us', undefined, siteSlug);
              }}
              className={`whitespace-nowrap shrink-0 hover:underline hover:underline-offset-8 cursor-pointer ${
                route === 'contact-us' ? 'underline underline-offset-8 decoration-2' : ''
              }`}
              id="nav-link-contact"
            >
              Contact
            </a>
          </nav>

          {/* Right: Search, Cart, Admin, Mobile Menu */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="relative flex items-center" ref={searchRef}>
              {isSearchActive ? (
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder={`Search ${activeBrand.shortLabel}...`}
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="pl-8 pr-7 py-1.5 border border-pine-green/20 bg-white rounded-full text-xs font-medium text-pine-green placeholder-pine-green/45 focus:outline-none focus:border-pine-green w-36 sm:w-56"
                    id="navbar-search-input"
                    autoFocus
                  />
                  <Search className="w-3.5 h-3.5 text-pine-green/60 absolute left-2.5 top-2" />
                  {localSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalSearch('');
                        setIsSearchActive(false);
                      }}
                      className="absolute right-2.5 top-1.5 text-[10px] font-bold text-pine-green/50 hover:text-pine-green"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchActive(true)}
                  className="w-10 h-10 flex items-center justify-center text-pine-green hover:bg-pine-green/5 rounded-full transition-colors cursor-pointer"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {isSearchFocused && suggestions.length > 0 && (
                <div
                  className="absolute top-11 right-0 bg-white border border-pine-green/15 rounded-2xl shadow-xl overflow-hidden z-50 w-72 sm:w-80"
                  id="search-suggestions-box"
                >
                  <div className="divide-y divide-pine-green/5">
                    {suggestions.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => handleSuggestionClick(p.id)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-pine-green/5 cursor-pointer text-left"
                        id={`suggestion-item-${p.id}`}
                      >
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-9 h-9 object-cover rounded-lg bg-white border border-pine-green/10 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-pine-green truncate">{p.title}</h4>
                        </div>
                        <div className="text-xs font-extrabold text-pine-green tabular-nums shrink-0">
                          ₹{p.salePrice}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 flex items-center justify-center text-pine-green hover:bg-pine-green/5 rounded-full transition-colors cursor-pointer"
              id="nav-cart-trigger"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-1 right-1 bg-pine-green text-warm-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                  {cartItemsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center text-pine-green hover:bg-pine-green/5 rounded-full lg:hidden transition-colors cursor-pointer"
              id="nav-mobile-toggle"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Clean Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden border-t border-pine-green/10 bg-warm-white p-3 space-y-1.5 absolute top-full left-0 right-0 shadow-lg z-50 text-left"
            id="nav-mobile-menu"
          >
            <button
              type="button"
              onClick={handleGoHome}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider ${
                route === 'home' ? 'bg-pine-green text-warm-white' : 'text-pine-green hover:bg-pine-green/5'
              }`}
            >
              <span>{storeDisplayName} Home</span>
            </button>

            <button
              type="button"
              onClick={handleScrollToCatalog}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold text-pine-green hover:bg-pine-green/5 uppercase tracking-wider"
            >
              <span>Shop Catalog</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigate('track-order', undefined, siteSlug);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-pine-green/5 text-xs font-bold text-pine-green uppercase tracking-wider"
            >
              <span>Track Order</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigate('contact-us', undefined, siteSlug);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-pine-green/5 text-xs font-bold text-pine-green uppercase tracking-wider"
            >
              <span>Contact Us</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigate('admin', undefined, siteSlug);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-pine-green/10 text-xs font-extrabold text-pine-green uppercase tracking-wider"
            >
              <span>{activeBrand.shortLabel} Admin Panel</span>
            </button>
          </div>
        )}
      </header>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onNavigate={(targetRoute) => navigate(targetRoute, undefined, siteSlug)}
      />
    </>
  );
};
