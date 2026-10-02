import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useHashRouter, AppRoute } from '../hooks/useHashRouter';
import { CartDrawer } from './CartDrawer';
import { ShoppingBag, Menu, X, Search, ChevronDown, User, Heart } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    cart, 
    categories, 
    products, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory,
    setSelectedBrand
  } = useStore();
  
  const { route, navigate } = useHashRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Custom states for search & categories dropdown
  const [localSearch, setLocalSearch] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Close dropdowns on click outside
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

  const handleHomeClick = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSearchQuery('');
    setLocalSearch('');
    navigate('home');
    setIsMobileMenuOpen(false);
  };

  const handleShopClick = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSearchQuery('');
    setLocalSearch('');
    navigate('home');
    setIsMobileMenuOpen(false);
    
    setTimeout(() => {
      const el = document.getElementById('catalog-deck');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleOffersClick = () => {
    // Navigate to Special/Festive Deals category
    setSelectedCategory('Trending');
    setSelectedBrand('All');
    setSearchQuery('');
    setLocalSearch('');
    navigate('home');
    setIsMobileMenuOpen(false);

    setTimeout(() => {
      const el = document.getElementById('catalog-deck');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleAboutClick = () => {
    navigate('home');
    setIsMobileMenuOpen(false);
    
    setTimeout(() => {
      const el = document.getElementById('footer-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    setIsSearchFocused(false);
    navigate('home');
    
    setTimeout(() => {
      const el = document.getElementById('catalog-deck');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleSuggestionClick = (prodId: string) => {
    setLocalSearch('');
    setIsSearchFocused(false);
    setIsSearchActive(false);
    navigate('product', { id: prodId });
  };

  // Filter products for suggestion box (maximum 5 items)
  const suggestions = localSearch.trim()
    ? products
        .filter((p) =>
          p.title.toLowerCase().includes(localSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(localSearch.toLowerCase()) ||
          (p.brand && p.brand.toLowerCase().includes(localSearch.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-pine-green/10 bg-warm-white/95 backdrop-blur-md" id="global-navbar">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          
          {/* 1. Left Zone: Original omexo logo */}
          <div 
            onClick={handleHomeClick}
            className="flex items-center cursor-pointer group select-none shrink-0"
            id="nav-brand-logo"
          >
            <img 
              src="https://i.ibb.co/qY8X8qv1/Chat-GPT-Image-Sep-10-2026-11-28-10-AM.png" 
              alt="OMEXO Logo" 
              className="h-16 md:h-20 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* 2. Center Zone: Clean navigation links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold tracking-wider text-pine-green uppercase">
            <button 
              onClick={handleHomeClick} 
              className={`hover:underline hover:underline-offset-8 transition-all cursor-pointer ${route === 'home' && !searchQuery && selectedCategory === 'All' ? 'underline underline-offset-8 decoration-2' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={handleShopClick} 
              className="hover:underline hover:underline-offset-8 transition-all cursor-pointer"
            >
              Shop
            </button>
            <button 
              onClick={handleOffersClick} 
              className={`hover:underline hover:underline-offset-8 transition-all cursor-pointer ${selectedCategory === 'Trending' ? 'underline underline-offset-8 decoration-2' : ''}`}
            >
              Offers
            </button>
            <button 
              onClick={handleAboutClick} 
              className="hover:underline hover:underline-offset-8 transition-all cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* 3. Right Zone: CTAs (Search, Cart, Account/Admin) */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Desktop Slide-out Search Bar trigger */}
            <div className="relative flex items-center" ref={searchRef}>
              {isSearchActive ? (
                <form onSubmit={handleSearchSubmit} className="relative animate-in slide-in-from-right-3 duration-200">
                  <input
                    type="text"
                    placeholder="Search smart gear..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="pl-8 pr-4 py-1.5 border border-pine-green/20 bg-white/50 rounded-full text-xs font-medium text-pine-green placeholder-pine-green/40 focus:outline-none focus:ring-1 focus:ring-pine-green focus:border-pine-green w-48 md:w-64 transition-all duration-200"
                    id="navbar-search-input"
                    autoFocus
                  />
                  <Search className="w-3.5 h-3.5 text-pine-green/60 absolute left-3 top-2.5" />
                  {localSearch && (
                    <button 
                      type="button" 
                      onClick={() => { setLocalSearch(''); setIsSearchActive(false); }}
                      className="absolute right-3 top-2 text-[10px] font-bold text-pine-green/40 hover:text-pine-green"
                    >
                      ✕
                    </button>
                  )}
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchActive(true)}
                  className="p-2 text-pine-green hover:bg-pine-green/5 rounded-full transition-all"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Suggestions dropdown */}
              {isSearchFocused && suggestions.length > 0 && (
                <div 
                  className="absolute top-11 right-0 bg-white/95 backdrop-blur-md border border-pine-green/10 rounded-2xl shadow-xl overflow-hidden z-50 w-80 animate-in fade-in duration-100"
                  id="search-suggestions-box"
                >
                  <div className="px-4 py-2 bg-pine-green/5 border-b border-pine-green/5 text-[9px] font-bold text-pine-green/40 uppercase tracking-widest">
                    Suggested Accessories
                  </div>
                  <div className="divide-y divide-pine-green/5">
                    {suggestions.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSuggestionClick(p.id)}
                        className="p-3 flex items-center gap-3 hover:bg-pine-green/5 cursor-pointer transition-colors"
                        id={`suggestion-item-${p.id}`}
                      >
                        <img 
                          src={p.images[0]} 
                          alt={p.title} 
                          className="w-9 h-9 object-cover rounded-xl bg-white border border-pine-green/5 shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="text-xs font-bold text-pine-green truncate">{p.title}</h4>
                          <span className="text-[9px] text-pine-green/60 font-semibold uppercase">{p.category}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-pine-green">₹{p.salePrice}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-pine-green hover:bg-pine-green/5 rounded-full transition-all"
              id="nav-cart-trigger"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-pine-green text-warm-white font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-warm-white shadow-sm">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Account Icon (goes to Admin Panel) */}
            <button
              onClick={() => navigate('admin')}
              className="p-2 text-pine-green hover:bg-pine-green/5 rounded-full transition-all cursor-pointer"
              title="Admin Control Panel"
              id="nav-admin-trigger"
              aria-label="Admin Control"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Mobile Menu Toggle button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-pine-green hover:bg-pine-green/5 rounded-full lg:hidden transition-colors"
              id="nav-mobile-toggle"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden border-t border-pine-green/10 bg-warm-white p-4 space-y-4 absolute top-20 left-0 right-0 shadow-xl animate-in slide-in-from-top duration-200 z-50 text-left"
            id="nav-mobile-menu"
          >
            {/* Quick links */}
            <div className="space-y-1">
              <button
                onClick={handleHomeClick}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-pine-green/5 text-xs font-bold text-pine-green uppercase tracking-wider"
              >
                <span>Home</span>
              </button>
              <button
                onClick={handleShopClick}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-pine-green/5 text-xs font-bold text-pine-green uppercase tracking-wider"
              >
                <span>Shop Catalog</span>
              </button>
              <button
                onClick={handleOffersClick}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-pine-green/5 text-xs font-bold text-pine-green uppercase tracking-wider"
              >
                <span>Special Offers</span>
              </button>
              <button
                onClick={handleAboutClick}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-pine-green/5 text-xs font-bold text-pine-green uppercase tracking-wider"
              >
                <span>About Us</span>
              </button>
              <button
                onClick={() => { navigate('track-order'); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-pine-green/5 text-xs font-bold text-pine-green uppercase tracking-wider"
              >
                <span>Track Order</span>
              </button>
              <button
                onClick={() => { navigate('admin'); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-pine-green/5 text-xs font-bold text-pine-green uppercase tracking-wider"
              >
                <span>Admin Panel</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onNavigate={(targetRoute) => navigate(targetRoute)}
      />
    </>
  );
};
