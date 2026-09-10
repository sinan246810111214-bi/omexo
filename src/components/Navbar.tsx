import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useHashRouter, AppRoute } from '../hooks/useHashRouter';
import { CartDrawer } from './CartDrawer';
import { ShoppingBag, Menu, X, Compass, Truck, Settings, Search, ChevronDown, Sparkles } from 'lucide-react';

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
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const navItems: { label: string; icon: any; route: AppRoute }[] = [
    { label: 'Shop Catalog', icon: Compass, route: 'home' },
    { label: 'Track Order', icon: Truck, route: 'track-order' },
  ];

  const handleNavClick = (targetRoute: AppRoute) => {
    navigate(targetRoute);
    setIsMobileMenuOpen(false);
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedBrand('All');
    setSearchQuery('');
    setLocalSearch('');
    setIsCategoryDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('home');
    
    // Smooth scroll to catalog anchor
    setTimeout(() => {
      const el = document.getElementById('catalog-deck');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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
    }, 100);
  };

  const handleSuggestionClick = (prodId: string) => {
    setLocalSearch('');
    setIsSearchFocused(false);
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
      <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md" id="global-navbar">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={() => {
              setSelectedCategory('All');
              setSelectedBrand('All');
              setSearchQuery('');
              setLocalSearch('');
              handleNavClick('home');
            }}
            className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
            id="nav-brand-logo"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-white text-lg tracking-wider shadow-md shadow-teal-600/10 transition-transform group-hover:scale-105">
              O
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-800 tracking-tight leading-none">OMEXO</span>
              <span className="text-[9px] font-bold text-teal-600 tracking-widest uppercase">Elite Gadgets</span>
            </div>
          </div>

          {/* Desktop Categories Dropdown & Menu */}
          <div className="hidden lg:flex items-center gap-4 shrink-0" ref={categoryDropdownRef}>
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-800 font-bold text-sm transition-all relative"
              id="desktop-category-dropdown-btn"
            >
              <span>Categories</span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Category Dropdown Floating Menu */}
            {isCategoryDropdownOpen && (
              <div 
                className="absolute top-14 bg-white border border-slate-100 rounded-2xl shadow-xl py-3 w-56 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                id="desktop-category-menu"
              >
                <button
                  onClick={() => handleCategorySelect('All')}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition-colors"
                >
                  All Categories
                </button>
                <div className="border-t border-slate-50 my-1.5" />
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.name)}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    id={`dropdown-category-${cat.id}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Real-Time Search Bar with Suggestions */}
          <div className="flex-1 max-w-md relative" ref={searchRef} id="nav-search-container">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search premium smart gear..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-4 py-2 border border-slate-100 bg-slate-50 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/10 focus:border-teal-500 transition-all"
                id="navbar-search-input"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </form>

            {/* Search Suggestions Floating Panel */}
            {isSearchFocused && suggestions.length > 0 && (
              <div 
                className="absolute top-11 left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150"
                id="search-suggestions-box"
              >
                <div className="px-4 py-2 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Suggested Gadgets
                </div>
                <div className="divide-y divide-slate-50">
                  {suggestions.map((p) => {
                    const discount = Math.round(((p.regularPrice - p.salePrice) / p.regularPrice) * 100);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSuggestionClick(p.id)}
                        className="p-3 flex items-center gap-3 hover:bg-slate-50/80 cursor-pointer transition-colors"
                        id={`suggestion-item-${p.id}`}
                      >
                        <img 
                          src={p.images[0]} 
                          alt={p.title} 
                          className="w-10 h-10 object-cover rounded-lg bg-slate-100 border border-slate-100 shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{p.title}</h4>
                          <span className="text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            {p.category}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-slate-800">₹{p.salePrice.toLocaleString('en-IN')}</div>
                          {discount > 0 && (
                            <span className="text-[9px] font-black text-emerald-600 uppercase">-{discount}%</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Nav Right CTAs */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 mr-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = route === item.route;
                return (
                  <button
                    key={item.route}
                    onClick={() => handleNavClick(item.route)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                    id={`nav-link-desktop-${item.route}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-700 hover:text-teal-600 hover:bg-slate-50 rounded-xl transition-all"
              id="nav-cart-trigger"
            >
              <ShoppingBag className="w-5.5 h-5.5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-teal-600 hover:bg-slate-50 rounded-xl md:hidden transition-colors"
              id="nav-mobile-toggle"
            >
              {isMobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md p-4 space-y-4 absolute top-16 left-0 right-0 shadow-xl animate-in slide-in-from-top duration-200 z-50"
            id="nav-mobile-menu"
          >
            {/* Quick Category links for Mobile */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block px-1.5 mb-1">
                Shop By Category
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCategorySelect('All')}
                  className="px-3 py-2 text-left bg-slate-50 rounded-lg text-xs font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                >
                  All Gadgets
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.name)}
                    className="px-3 py-2 text-left bg-slate-50 rounded-lg text-xs font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 my-2" />

            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = route === item.route;
                return (
                  <button
                    key={item.route}
                    onClick={() => handleNavClick(item.route)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/10'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                    id={`nav-link-mobile-${item.route}`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
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
