/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { StoreProvider } from './hooks/useStore';
import { ToastProvider } from './components/Toast';
import { useHashRouter } from './hooks/useHashRouter';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SeoHead } from './components/SeoHead';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { Home } from './pages/Home';

const ProductDetails = lazy(() =>
  import('./pages/ProductDetails').then((m) => ({ default: m.ProductDetails }))
);
const Checkout = lazy(() =>
  import('./pages/Checkout').then((m) => ({ default: m.Checkout }))
);
const TrackOrder = lazy(() =>
  import('./pages/TrackOrder').then((m) => ({ default: m.TrackOrder }))
);
const Admin = lazy(() =>
  import('./pages/Admin').then((m) => ({ default: m.Admin }))
);
const Legal = lazy(() =>
  import('./pages/Legal').then((m) => ({ default: m.Legal }))
);

function RouteLoadingFallback() {
  return (
    <div className="py-16 flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-pine-green/20 border-t-pine-green rounded-full animate-spin" />
    </div>
  );
}

function MainAppContent() {
  const { route, params, siteSlug } = useHashRouter();

  const renderActivePage = () => {
    switch (route) {
      case 'product':
        return <ProductDetails productId={params.id || ''} />;
      case 'checkout':
        return <Checkout />;
      case 'track-order':
        return <TrackOrder />;
      case 'admin':
        return <Admin siteSlug={siteSlug} />;
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
    <div
      className="min-h-screen bg-warm-white flex flex-col text-pine-green antialiased font-sans"
      id="omexo-app-layout"
    >
      <SeoHead />

      {/* Brand Header */}
      <Navbar />

      {/* Main Responsive Canvas container */}
      <main
        className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8"
        id="omexo-app-main"
      >
        <Suspense fallback={<RouteLoadingFallback />}>
          {renderActivePage()}
        </Suspense>
      </main>

      {/* Compact Site-Scoped Footer */}
      <Footer />
      <WhatsAppFloatingButton />
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
