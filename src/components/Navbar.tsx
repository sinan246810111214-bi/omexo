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
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white" id="global-navbar">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={() => {
              setSelectedCategory('All');
              setSelectedBrand('All');
              setSearchQuery('');
              setLocalSearch('');
              handleNavClick('home');
            }}
            className="flex items-center cursor-pointer group select-none shrink-0"
            id="nav-brand-logo"
          >
            <img 
              src="https://i.ibb.co/qY8X8qv1/Chat-GPT-Image-Sep-10-2026-11-28-10-AM.png" 
              alt="OMEXO Logo" 
              className="h-[96px] md:h-[120px] w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Desktop Categories Dropdown & Menu */}
          <div className="hidden lg:flex items-center gap-4 shrink-0" ref={categoryDropdownRef}>
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center gap-1 px-3 py-2 text-zinc-600 hover:text-black font-bold text-xs tracking-wide uppercase transition-all duration-150 relative"
              id="desktop-category-dropdown-btn"
            >
              <span>Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Category Dropdown Floating Menu */}
            {isCategoryDropdownOpen && (
              <div 
                className="absolute top-16 bg-white border border-zinc-200 rounded shadow-md py-2 w-52 animate-in fade-in slide-in-from-top-1 duration-100 z-50"
                id="desktop-category-menu"
              >
                <button
                  onClick={() => handleCategorySelect('All')}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 hover:text-black transition-colors duration-100"
                >
                  All Categories
                </button>
                <div className="border-t border-zinc-100 my-1" />
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.name)}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black transition-colors duration-100"
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
                className="w-full pl-9 pr-4 py-2 border border-zinc-200 bg-white rounded text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all duration-150"
                id="navbar-search-input"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            </form>

            {/* Search Suggestions Floating Panel */}
            {isSearchFocused && suggestions.length > 0 && (
              <div 
                className="absolute top-10 left-0 right-0 bg-white border border-zinc-200 rounded shadow-lg overflow-hidden z-50 animate-in fade-in duration-100"
                id="search-suggestions-box"
              >
                <div className="px-4 py-1.5 bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Suggested Gadgets
                </div>
                <div className="divide-y divide-zinc-100">
                  {suggestions.map((p) => {
                    const discount = Math.round(((p.regularPrice - p.salePrice) / p.regularPrice) * 100);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSuggestionClick(p.id)}
                        className="p-3 flex items-center gap-3 hover:bg-zinc-50 cursor-pointer transition-colors duration-100"
                        id={`suggestion-item-${p.id}`}
                      >
                        <img 
                          src={p.images[0]} 
                          alt={p.title} 
                          className="w-9 h-9 object-cover rounded bg-zinc-50 border border-zinc-100 shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-zinc-950 truncate">{p.title}</h4>
                          <span className="text-[9px] text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            {p.category}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-zinc-950">₹{p.salePrice.toLocaleString('en-IN')}</div>
                          {discount > 0 && (
                            <span className="text-[9px] font-bold text-zinc-500 uppercase">-{discount}%</span>
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                    }`}
                    id={`nav-link-desktop-${item.route}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-zinc-800 hover:text-black hover:bg-zinc-100 rounded transition-all duration-150"
              id="nav-cart-trigger"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-800 hover:text-black hover:bg-zinc-100 rounded md:hidden transition-colors"
              id="nav-mobile-toggle"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden border-t border-zinc-200 bg-white p-4 space-y-4 absolute top-20 left-0 right-0 shadow-lg animate-in slide-in-from-top duration-200 z-50"
            id="nav-mobile-menu"
          >
            {/* Quick Category links for Mobile */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase block px-1.5 mb-1">
                Shop By Category
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCategorySelect('All')}
                  className="px-3 py-2 text-left bg-zinc-50 border border-zinc-100 rounded text-xs font-bold text-zinc-800 hover:bg-zinc-100 hover:text-black"
                >
                  All Gadgets
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.name)}
                    className="px-3 py-2 text-left bg-zinc-50 border border-zinc-100 rounded text-xs font-bold text-zinc-600 hover:bg-zinc-100 hover:text-black"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-100 my-2" />

            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = route === item.route;
                return (
                  <button
                    key={item.route}
                    onClick={() => handleNavClick(item.route)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-left text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                    }`}
                    id={`nav-link-mobile-${item.route}`}
                  >
                    <Icon className="w-4 h-4" />
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
