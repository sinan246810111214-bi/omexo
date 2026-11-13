import React, { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useHashRouter } from '../hooks/useHashRouter';
import {
  getProductShareUrl,
  getSiteBrandConfig,
  getSitePathPrefix,
  resolveCategorySlug,
} from '../config/categories';

const DEFAULT_KEYWORDS =
  'Omexo India, Omexo Decor, Omexo Essentials, Omexo Lifestyle, home decor online India, kitchen tools, smart gadgets COD';

function setMetaTag(selector: string, attrName: 'name' | 'property', attrValue: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export const SeoHead: React.FC = () => {
  const { products, getStoreSettingsForSite } = useStore();
  const { route, params, siteSlug } = useHashRouter();

  useEffect(() => {
    const origin = window.location.origin;
    const defaultOgImage = `${origin}/og-omexo.jpg`;
    const activeBrand = getSiteBrandConfig(siteSlug);
    const activeSettings = getStoreSettingsForSite(siteSlug);
    const prefix = getSitePathPrefix(siteSlug);

    let title = activeSettings?.seoTitle || activeBrand.defaultStoreSettings.seoTitle;
    let description = activeSettings?.seoDescription || activeBrand.defaultStoreSettings.seoDescription;
    let keywords = `${activeBrand.name}, ${activeBrand.subcategories.join(', ')}, ${DEFAULT_KEYWORDS}`;
    let ogImage = defaultOgImage;
    let ogType = 'website';
    let canonicalUrl = `${origin}${prefix || '/'}`;
    let robotsDirective = 'index, follow';

    if (route === 'product' && params.id) {
      const product = products.find((p) => p.id === params.id);
      if (product) {
        const prodSlug = resolveCategorySlug(product.categorySlug || product.category);
        const targetSlug = prodSlug && prodSlug !== 'All' ? prodSlug : siteSlug;
        const prodBrand = getSiteBrandConfig(targetSlug);
        title = `${product.title} | ${prodBrand.name}`;
        description = `${product.description} Price: ₹${product.salePrice}. Cash on Delivery available across India via ${prodBrand.name} or WhatsApp.`;
        keywords = `${product.title}, ${prodBrand.name}, Cash on Delivery, ${DEFAULT_KEYWORDS}`;
        ogType = 'product';
        canonicalUrl = getProductShareUrl(product.id, targetSlug);
        if (product.images?.[0]) {
          const img = product.images[0];
          ogImage = img.startsWith('http') ? img : `${origin}${img.startsWith('/') ? '' : '/'}${img}`;
        }
      }
    } else if (route === 'admin') {
      title = `${activeBrand.name} Admin Panel`;
      description = `Dedicated store management dashboard for ${activeBrand.name}.`;
      canonicalUrl = `${origin}${activeBrand.adminPath}`;
      robotsDirective = 'noindex, nofollow';
    } else if (route === 'track-order') {
      title = `Track Your Order | ${activeBrand.name}`;
      description = `Track your ${activeBrand.name} Cash on Delivery order in real time using your Order ID.`;
      canonicalUrl = `${origin}${prefix}/track-order`;
    } else if (route === 'checkout') {
      title = `Express COD Checkout | ${activeBrand.name}`;
      description = `Complete your ${activeBrand.name} order with free shipping and Cash on Delivery across India.`;
      canonicalUrl = `${origin}${prefix}/checkout`;
      robotsDirective = 'noindex, nofollow';
    } else if (route === 'contact-us') {
      title = `Contact Us | ${activeBrand.name}`;
      canonicalUrl = `${origin}${prefix}/contact-us`;
    } else if (
      route === 'shipping-policy' ||
      route === 'refund-policy' ||
      route === 'privacy-policy' ||
      route === 'terms'
    ) {
      const labelMap: Record<string, string> = {
        'shipping-policy': 'Shipping Policy',
        'refund-policy': 'Returns & Refunds',
        'privacy-policy': 'Privacy Policy',
        terms: 'Terms & Conditions',
      };
      title = `${labelMap[route]} | ${activeBrand.name}`;
      canonicalUrl = `${origin}${prefix}/${route}`;
    }

    document.title = title;
    setMetaTag('meta[name="robots"]', 'name', 'robots', robotsDirective);
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', activeBrand.name);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  }, [route, params.id, siteSlug, products, getStoreSettingsForSite]);

  return null;
};
