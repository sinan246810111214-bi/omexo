import React from 'react';
import { useHashRouter, AppRoute } from '../hooks/useHashRouter';
import { useStore } from '../hooks/useStore';
import { Mail, MapPin, MessageCircle, Instagram, ExternalLink, ArrowUpRight, Phone } from 'lucide-react';
import {
  BRAND_SITES,
  ORDER_LABEL_SENDER,
  formatWhatsappDisplay,
  getSiteBrandConfig,
  getSitePathPrefix,
  getWhatsAppNumberForCategory,
} from '../config/categories';
import { BrandCategorySlug } from '../types';
import { sanitizeSafeUrl } from '../lib/security';

export const Footer: React.FC = () => {
  const { route, siteSlug, navigate } = useHashRouter();
  const { storeSettings, setSelectedCategory, setSelectedBrand, setSearchQuery } = useStore();

  // Keep Admin dashboard clean and unobstructed
  if (route === 'admin') {
    return null;
  }

  const activeBrand = getSiteBrandConfig(siteSlug);
  const storeDisplayName = storeSettings?.storeName || activeBrand.name;
  const activeWhatsapp = getWhatsAppNumberForCategory(siteSlug, storeSettings);
  const supportPhone = storeSettings?.supportNum || ORDER_LABEL_SENDER.phone;
  const supportEmail = storeSettings?.supportMail || 'omexoofficial@gmail.com';
  const storeAddress = storeSettings?.address || ORDER_LABEL_SENDER.fullAddress;
  const mapUrl = sanitizeSafeUrl(storeSettings?.mapLocationUrl);

  const handleSwitchStore = (targetSlug: BrandCategorySlug) => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSearchQuery('');
    navigate('home', undefined, targetSlug);
  };

  const pageLinks: { label: string; route: AppRoute }[] = [
    { label: 'Track Order', route: 'track-order' },
    { label: 'Contact', route: 'contact-us' },
    { label: 'Shipping', route: 'shipping-policy' },
    { label: 'Returns', route: 'refund-policy' },
    { label: 'Privacy', route: 'privacy-policy' },
    { label: 'Terms', route: 'terms' },
  ];

  return (
    <footer
      className="bg-pine-green text-warm-white/85 mt-auto border-t border-white/10"
      id="footer-container"
    >
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4 text-left">
        {/* Top Compact Row: Active Store Details Only */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="text-sm font-extrabold text-warm-white tracking-tight">
              {storeDisplayName}
            </div>
            <p className="text-xs text-warm-white/65 max-w-lg leading-relaxed">
              {activeBrand.tagline} · Cash on Delivery across India
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <a
              href={`tel:${supportPhone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1.5 text-warm-white hover:text-soft-beige font-semibold transition-colors"
              id="footer-support-phone"
            >
              <Phone className="w-3.5 h-3.5 text-soft-beige shrink-0" />
              <span>Support team: {supportPhone}</span>
            </a>

            <a
              href={`https://wa.me/${activeWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-warm-white hover:text-soft-beige font-semibold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-soft-beige shrink-0" />
              <span>{formatWhatsappDisplay(activeWhatsapp)}</span>
            </a>

            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex items-center gap-1.5 text-warm-white/80 hover:text-warm-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-soft-beige shrink-0" />
              <span>{supportEmail}</span>
            </a>

            <a
              href={activeBrand.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-warm-white/80 hover:text-soft-beige transition-colors"
              id={`footer-ig-${activeBrand.instagramHandle.replace(/^@/, '').replace(/[^a-z0-9]/gi, '-')}`}
            >
              <Instagram className="w-3.5 h-3.5 text-soft-beige shrink-0" />
              <span>{activeBrand.instagramHandle}</span>
            </a>
          </div>
        </div>

        {/* Store Address (only for this active site, synced with Admin) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-warm-white/65">
          <div className="flex items-start sm:items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-soft-beige shrink-0 mt-0.5 sm:mt-0" />
            <span className="leading-snug break-words">{storeAddress}</span>
          </div>
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-soft-beige hover:underline font-semibold shrink-0"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Interconnected Omexo Storefronts (3-way navigation across Lifestyle, Decor & Essentials) */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-warm-white/60 mr-1">
            Our Stores:
          </span>
          {BRAND_SITES.map((slug) => {
            const brand = getSiteBrandConfig(slug);
            const prefix = getSitePathPrefix(slug) || '/';
            const isCurrent = siteSlug === slug;
            return (
              <a
                key={slug}
                href={prefix}
                onClick={(e) => {
                  e.preventDefault();
                  handleSwitchStore(slug);
                }}
                aria-current={isCurrent ? 'page' : undefined}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-warm-white text-pine-green font-extrabold'
                    : 'bg-white/10 text-warm-white hover:bg-white/20 font-semibold'
                }`}
                id={`footer-store-link-${slug}`}
              >
                <span>{brand.name}</span>
                {!isCurrent && <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />}
              </a>
            );
          })}
        </div>

        {/* Bottom Single Links & Copyright Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-white/10 text-[11px] text-warm-white/65">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {pageLinks.map((link) => (
              <button
                key={link.route}
                type="button"
                onClick={() => navigate(link.route, undefined, siteSlug)}
                className="hover:text-warm-white transition-colors cursor-pointer font-medium"
                id={`footer-link-${link.route}`}
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => navigate('admin', undefined, siteSlug)}
              className="text-soft-beige/90 hover:text-soft-beige font-semibold cursor-pointer"
              id="btn-footer-admin-gear"
            >
              {activeBrand.shortLabel} Admin
            </button>
          </div>

          <span className="text-warm-white/50">
            © {new Date().getFullYear()} {storeDisplayName}
          </span>
        </div>
      </div>
    </footer>
  );
};
