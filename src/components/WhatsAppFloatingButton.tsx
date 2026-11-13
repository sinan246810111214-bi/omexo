import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useHashRouter } from '../hooks/useHashRouter';
import { buildSupportWhatsAppUrl, getSiteBrandConfig, resolveCategorySlug } from '../config/categories';

export const WhatsAppFloatingButton: React.FC = () => {
  const { products, getStoreSettingsForSite } = useStore();
  const { route, params, siteSlug } = useHashRouter();

  let effectiveSite = siteSlug;

  if (route === 'product' && params.id) {
    const activeProduct = products.find((p) => p.id === params.id);
    if (activeProduct) {
      const resolved = resolveCategorySlug(activeProduct.categorySlug || activeProduct.category);
      if (resolved && resolved !== 'All') {
        effectiveSite = resolved;
      }
    }
  }

  const effectiveSettings = getStoreSettingsForSite(effectiveSite);
  const brand = getSiteBrandConfig(effectiveSite);
  const whatsappUrl = buildSupportWhatsAppUrl(effectiveSite, effectiveSettings);

  // Hide on Admin Console so merchant workflow stays unobstructed
  if (route === 'admin') {
    return null;
  }

  const visibilityClass = route === 'product' ? 'hidden md:flex' : 'flex';

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${brand.name} on WhatsApp`}
      title={`${brand.name} WhatsApp Support`}
      id="floating-whatsapp-support"
      className={`fixed bottom-6 right-6 z-50 ${visibilityClass} items-center gap-2.5 bg-[#1E8E3E] hover:bg-[#167330] text-white px-4 py-3 rounded-full shadow-xl border border-white/20 transition-all duration-200 hover:scale-[1.03] active:scale-100 group`}
    >
      <MessageCircle className="w-5 h-5 fill-white/15 shrink-0" />
      <span className="text-xs font-extrabold tracking-wide whitespace-nowrap hidden sm:inline">
        {brand.shortLabel} WhatsApp
      </span>
    </a>
  );
};
