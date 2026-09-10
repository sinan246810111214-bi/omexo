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
import { AIAssistant } from './components/AIAssistant';

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
    <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-900 antialiased font-sans relative overflow-hidden" id="omexo-app-layout">
      {/* Premium Minimalist Subtle Light Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.01),transparent_70%)] pointer-events-none z-0" />

      {/* Brand Header */}
      <Navbar />

      {/* Main Responsive Canvas container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:py-12 z-10 relative animate-in fade-in duration-300" id="omexo-app-main">
        {renderActivePage()}
      </main>

      {/* Elegant, multi-column footer containing all policy page links and the admin gear icon */}
      <footer className="mt-auto border-t border-zinc-200 bg-white z-10 relative" id="omexo-app-footer">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center select-none cursor-pointer" onClick={() => navigate('home')}>
              <img 
                src="https://i.ibb.co/qY8X8qv1/Chat-GPT-Image-Sep-10-2026-11-28-10-AM.png" 
                alt="OMEXO Logo" 
                className="h-[80px] md:h-[100px] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-sm">
              Discover a curated collection of ultra-premium smartwatches, high-fidelity hybrid audio earbuds, and ultra-fast GaN chargers. Engineered to elevate your modern digital lifestyle.
            </p>
            <div className="text-[11px] text-zinc-800 font-bold border border-zinc-200 bg-zinc-50 px-3 py-1.5 rounded w-fit">
              ✓ 100% Cash On Delivery • Guaranteed Free Shipping
            </div>
          </div>

          {/* Column 2: Customer Support */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Support Desk</h4>
            <ul className="space-y-2 text-xs font-semibold text-zinc-500">
              <li>
                <button onClick={() => navigate('contact-us')} className="hover:text-zinc-950 transition-colors cursor-pointer text-left">
                  Contact Us
                </button>
              </li>
              <li className="text-[11px] text-zinc-400 font-normal">
                Email: omexoofficial@gmail.com
              </li>
              <li className="text-[11px] text-zinc-400 font-normal">
                WhatsApp: +91 99465 97201
              </li>
            </ul>
          </div>

          {/* Column 3: Legal Policies */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Legal Policies</h4>
            <ul className="grid grid-cols-2 gap-2 text-xs font-semibold text-zinc-500">
              <li>
                <button onClick={() => navigate('privacy-policy')} className="hover:text-zinc-950 transition-colors cursor-pointer text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('terms')} className="hover:text-zinc-950 transition-colors cursor-pointer text-left">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate('shipping-policy')} className="hover:text-zinc-950 transition-colors cursor-pointer text-left">
                  Shipping Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('refund-policy')} className="hover:text-zinc-950 transition-colors cursor-pointer text-left">
                  Refund Policy
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright area with subtle Admin Gear */}
        <div className="border-t border-zinc-200 py-6 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400 font-semibold">
            <span>&copy; {new Date().getFullYear()} Omexo Premium Gadgets. All rights reserved.</span>
            
            <button
              onClick={() => navigate('admin')}
              className="p-1.5 text-zinc-300 hover:text-zinc-950 hover:bg-zinc-100 transition-all rounded cursor-pointer flex items-center"
              title="Admin Control"
              id="btn-footer-admin-gear"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
      <AIAssistant />
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

