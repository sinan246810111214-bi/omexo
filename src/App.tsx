/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider } from './hooks/useStore';
import { ToastProvider } from './components/Toast';
import { useHashRouter } from './hooks/useHashRouter';
import { Navbar } from './components/Navbar';
import { Settings } from 'lucide-react';

// Page Views
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import { Checkout } from './pages/Checkout';
import { TrackOrder } from './pages/TrackOrder';
import { Admin } from './pages/Admin';
import { Legal } from './pages/Legal';

function MainAppContent() {
  const { route, params, navigate } = useHashRouter();

  const renderActivePage = () => {
    switch (route) {
      case 'product':
        return <ProductDetails productId={params.id || ''} />;
      case 'checkout':
        return <Checkout />;
      case 'track-order':
        return <TrackOrder />;
      case 'admin':
        return <Admin />;
      case 'privacy-policy':
      case 'terms':
      case 'shipping-policy':
      case 'refund-policy':
      case 'contact-us':
        return <Legal policyType={route} />;
      case 'home':
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800 antialiased font-sans relative overflow-hidden" id="omexo-app-layout">
      {/* Premium Ambient Background Texture */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,rgba(217,104,70,0.04),transparent_70%)] pointer-events-none z-0" />
      <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_bottom_left,rgba(89,98,53,0.02),transparent_70%)] pointer-events-none z-0" />

      {/* Brand Header */}
      <Navbar />

      {/* Main Responsive Canvas container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:py-12 z-10 relative animate-in fade-in duration-300" id="omexo-app-main">
        {renderActivePage()}
      </main>

      {/* Elegant, multi-column footer containing all policy page links and the admin gear icon */}
      <footer className="mt-auto border-t border-slate-100 bg-white/95 backdrop-blur-md z-10 relative" id="omexo-app-footer">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2 select-none">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-white text-base tracking-wider">
                O
              </div>
              <span className="text-lg font-black text-slate-800 tracking-tight leading-none">OMEXO</span>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
              Discover a curated collection of ultra-premium smartwatches, high-fidelity hybrid audio earbuds, and ultra-fast GaN chargers. Engineered to elevate your modern digital lifestyle.
            </p>
            <div className="text-[11px] text-teal-600 font-bold bg-teal-50 px-3 py-1.5 rounded-lg w-fit">
              ✓ 100% Cash On Delivery • Guaranteed Free Shipping
            </div>
          </div>

          {/* Column 2: Customer Support */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Support Desk</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-500">
              <li>
                <button onClick={() => navigate('contact-us')} className="hover:text-teal-600 transition-colors cursor-pointer text-left">
                  Contact Us
                </button>
              </li>
              <li className="text-[11px] text-slate-400 font-normal">
                Email: omexoofficial@gmail.com
              </li>
              <li className="text-[11px] text-slate-400 font-normal">
                WhatsApp: +91 99465 97201
              </li>
            </ul>
          </div>

          {/* Column 3: Legal Policies */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Legal Policies</h4>
            <ul className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
              <li>
                <button onClick={() => navigate('privacy-policy')} className="hover:text-teal-600 transition-colors cursor-pointer text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('terms')} className="hover:text-teal-600 transition-colors cursor-pointer text-left">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate('shipping-policy')} className="hover:text-teal-600 transition-colors cursor-pointer text-left">
                  Shipping Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('refund-policy')} className="hover:text-teal-600 transition-colors cursor-pointer text-left">
                  Refund Policy
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright area with subtle Admin Gear */}
        <div className="border-t border-slate-100 py-6 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-semibold">
            <span>&copy; {new Date().getFullYear()} Omexo Premium Gadgets. All rights reserved.</span>
            
            <button
              onClick={() => navigate('admin')}
              className="p-1.5 text-slate-300 hover:text-teal-600 hover:bg-slate-100 transition-all rounded-lg cursor-pointer flex items-center"
              title="Admin Control"
              id="btn-footer-admin-gear"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <MainAppContent />
      </StoreProvider>
    </ToastProvider>
  );
}

