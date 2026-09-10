import { useState, useEffect } from 'react';

export type AppRoute =
  | 'home'
  | 'product'
  | 'checkout'
  | 'track-order'
  | 'admin'
  | 'privacy-policy'
  | 'terms'
  | 'shipping-policy'
  | 'refund-policy'
  | 'contact-us';

interface RouteState {
  route: AppRoute;
  params: Record<string, string>;
}

export function parseHash(): RouteState {
  const hash = window.location.hash || '#/';
  const cleanHash = hash.replace(/^#/, '');

  if (cleanHash.startsWith('/product/')) {
    const id = cleanHash.substring('/product/'.length);
    return { route: 'product', params: { id } };
  }

  switch (cleanHash) {
    case '/checkout':
      return { route: 'checkout', params: {} };
    case '/track-order':
      return { route: 'track-order', params: {} };
    case '/admin':
      return { route: 'admin', params: {} };
    case '/privacy-policy':
      return { route: 'privacy-policy', params: {} };
    case '/terms':
      return { route: 'terms', params: {} };
    case '/shipping-policy':
      return { route: 'shipping-policy', params: {} };
    case '/refund-policy':
      return { route: 'refund-policy', params: {} };
    case '/contact-us':
      return { route: 'contact-us', params: {} };
    case '/':
    case '':
    default:
      return { route: 'home', params: {} };
  }
}

export function useHashRouter() {
  const [current, setCurrent] = useState<RouteState>(parseHash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrent(parseHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigate = (route: AppRoute, params?: Record<string, string>) => {
    let newHash = '#/';
    if (route === 'product' && params?.id) {
      newHash = `#/product/${params.id}`;
    } else if (route !== 'home') {
      newHash = `#/${route}`;
    }
    window.location.hash = newHash;
  };

  return {
    route: current.route,
    params: current.params,
    navigate,
  };
}
