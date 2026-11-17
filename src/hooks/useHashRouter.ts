import { useState, useEffect, useCallback } from 'react';
import { BrandCategorySlug } from '../types';
import { getSitePathPrefix, resolveCategorySlug } from '../config/categories';

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

export interface RouteState {
  route: AppRoute;
  params: Record<string, string>;
  siteSlug: BrandCategorySlug;
  categorySlug: BrandCategorySlug | null;
}

const ROUTE_CHANGE_EVENT = 'omexo:route-change';

function parseNormalizedPath(rawPath: string, queryString = ''): RouteState {
  const cleaned = rawPath.replace(/\/+$/, '') || '/';
  const searchParams = new URLSearchParams(queryString);
  const querySite = searchParams.get('site') || searchParams.get('category');

  let siteSlug: BrandCategorySlug = 'lifestyle';
  let subPath = cleaned;

  // Explicit admin shortcuts: /admin/decor, /admin/essentials, /admin/lifestyle, /admin/aesthetic
  if (cleaned === '/admin/decor') {
    return { route: 'admin', params: {}, siteSlug: 'decor', categorySlug: 'decor' };
  }
  if (cleaned === '/admin/essentials') {
    return { route: 'admin', params: {}, siteSlug: 'essentials', categorySlug: 'essentials' };
  }
  if (cleaned === '/admin/lifestyle') {
    return { route: 'admin', params: {}, siteSlug: 'lifestyle', categorySlug: 'lifestyle' };
  }
  if (cleaned === '/admin/aesthetic') {
    return { route: 'admin', params: {}, siteSlug: 'aesthetic', categorySlug: 'aesthetic' };
  }

  // Standalone website prefixes
  if (cleaned === '/decor' || cleaned.startsWith('/decor/')) {
    siteSlug = 'decor';
    subPath = cleaned.slice('/decor'.length) || '/';
  } else if (cleaned === '/essentials' || cleaned.startsWith('/essentials/')) {
    siteSlug = 'essentials';
    subPath = cleaned.slice('/essentials'.length) || '/';
  } else if (cleaned === '/aesthetic' || cleaned.startsWith('/aesthetic/')) {
    siteSlug = 'aesthetic';
    subPath = cleaned.slice('/aesthetic'.length) || '/';
  } else if (cleaned === '/lifestyle' || cleaned.startsWith('/lifestyle/')) {
    siteSlug = 'lifestyle';
    subPath = cleaned.slice('/lifestyle'.length) || '/';
  } else if (querySite) {
    const resolved = resolveCategorySlug(querySite);
    if (resolved && resolved !== 'All') {
      siteSlug = resolved;
    }
  }

  if (subPath.startsWith('/product/')) {
    const id = decodeURIComponent(subPath.substring('/product/'.length));
    return { route: 'product', params: { id }, siteSlug, categorySlug: siteSlug };
  }

  switch (subPath) {
    case '/checkout':
      return { route: 'checkout', params: {}, siteSlug, categorySlug: siteSlug };
    case '/track-order':
      return { route: 'track-order', params: {}, siteSlug, categorySlug: siteSlug };
    case '/admin':
      return { route: 'admin', params: {}, siteSlug, categorySlug: siteSlug };
    case '/privacy-policy':
      return { route: 'privacy-policy', params: {}, siteSlug, categorySlug: siteSlug };
    case '/terms':
      return { route: 'terms', params: {}, siteSlug, categorySlug: siteSlug };
    case '/shipping-policy':
      return { route: 'shipping-policy', params: {}, siteSlug, categorySlug: siteSlug };
    case '/refund-policy':
      return { route: 'refund-policy', params: {}, siteSlug, categorySlug: siteSlug };
    case '/contact-us':
      return { route: 'contact-us', params: {}, siteSlug, categorySlug: siteSlug };
    case '/':
    default:
      return { route: 'home', params: { site: siteSlug }, siteSlug, categorySlug: siteSlug };
  }
}

export function parseHash(): RouteState {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const rawHash = window.location.hash || '';
  const cleanHash = rawHash.replace(/^#/, '');

  if (cleanHash && cleanHash !== '/') {
    const [hashPath, hashQuery = ''] = cleanHash.split('?');
    const normalizedHashPath = hashPath.startsWith('/') ? hashPath : `/${hashPath}`;
    return parseNormalizedPath(normalizedHashPath, hashQuery || window.location.search.replace(/^\?/, ''));
  }

  return parseNormalizedPath(pathname, window.location.search.replace(/^\?/, ''));
}

export function useHashRouter() {
  const [current, setCurrent] = useState<RouteState>(parseHash);

  useEffect(() => {
    const syncRoute = () => {
      setCurrent(parseHash());
    };

    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    window.addEventListener(ROUTE_CHANGE_EVENT, syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener(ROUTE_CHANGE_EVENT, syncRoute);
    };
  }, []);

  const navigate = useCallback(
    (route: AppRoute, params?: Record<string, string>, targetSiteOverride?: BrandCategorySlug) => {
      const currentParsed = parseHash();
      const paramSite = params?.site || params?.category;
      const resolvedParamSite = paramSite ? resolveCategorySlug(paramSite) : null;

      const targetSite: BrandCategorySlug =
        targetSiteOverride ||
        (resolvedParamSite && resolvedParamSite !== 'All' ? resolvedParamSite : currentParsed.siteSlug);

      const prefix = getSitePathPrefix(targetSite);

      let nextPath = '/';
      if (route === 'product' && params?.id) {
        nextPath = `${prefix}/product/${encodeURIComponent(params.id)}`;
      } else if (route === 'admin') {
        nextPath = targetSite === 'lifestyle' ? '/lifestyle/admin' : `${prefix}/admin`;
      } else if (route === 'home') {
        nextPath = prefix || '/';
      } else {
        nextPath = `${prefix}/${route}`;
      }

      window.history.pushState({}, '', nextPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrent(parseHash());
      window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT));
    },
    []
  );

  return {
    route: current.route,
    params: current.params,
    siteSlug: current.siteSlug,
    categorySlug: current.categorySlug,
    navigate,
  };
}
