/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider } from './hooks/useStore';
import { ToastProvider } from './components/Toast';
import { useHashRouter } from './hooks/useHashRouter';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

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
    <div className="min-h-screen bg-warm-white flex flex-col text-pine-green antialiased font-sans relative overflow-hidden" id="omexo-app-layout">
      {/* Premium Minimalist Subtle Light Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,rgba(35,79,30,0.03),transparent_70%)] pointer-events-none z-0" />

      {/* Brand Header */}
      <Navbar />

      {/* Main Responsive Canvas container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:py-12 z-10 relative animate-in fade-in duration-300" id="omexo-app-main">
        {renderActivePage()}
      </main>

      {/* Elegant, modular, custom-styled multi-column footer */}
      <Footer />
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

