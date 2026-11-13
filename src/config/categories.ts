import {
  BrandCategorySlug,
  CMSPage,
  Category,
  ComboConfig,
  CustomerReview,
  HeroConfig,
  OfferBanner,
  Order,
  Product,
  StoreSettings,
} from '../types';
import { OMEXO_MEDIA } from './media';

export const BRAND_SITES: BrandCategorySlug[] = ['lifestyle', 'decor', 'essentials'];

export interface BrandCategoryDefinition {
  id: string;
  slug: BrandCategorySlug;
  name: string;
  shortLabel: string;
  tagline: string;
  description: string;
  subcategories: string[];
  whatsappNumber: string;
  instagramHandle: string;
  instagramUrl: string;
  seoTitle: string;
  seoDescription: string;
  image: string;
}

export interface SiteBrandProfile {
  slug: BrandCategorySlug;
  name: string;
  shortLabel: string;
  storePrefix: string; // '' for lifestyle root, '/decor', '/essentials'
  adminPath: string; // '/lifestyle/admin', '/decor/admin', '/essentials/admin'
  tagline: string;
  description: string;
  subcategories: string[];
  whatsappNumber: string;
  instagramHandle: string;
  instagramUrl: string;
  accentBadgeClass: string;
  accentButtonClass: string;
  defaultStoreSettings: StoreSettings;
  defaultHeroConfig: HeroConfig;
  defaultComboConfig: ComboConfig;
  defaultOfferBanner: OfferBanner;
  defaultReviews: CustomerReview[];
  defaultCmsPages: CMSPage[];
}

export const WHATSAPP_NUMBERS = {
  DEFAULT: '919946597201',
  ESSENTIALS: '919946597203',
} as const;

export const ORDER_LABEL_SENDER = {
  name: 'Muhammed Sinan VK (Omexo)',
  address: 'Vennakkattil H, mappattukara, palliyaal thodi,kulukallur po',
  fullAddress: 'Muhammed Sinan VK (Omexo), Vennakkattil H, mappattukara, palliyaal thodi,kulukallur po',
  phone: '8590181381',
} as const;

export const SITE_BRAND_CONFIGS: Record<BrandCategorySlug, SiteBrandProfile> = {
  lifestyle: {
    slug: 'lifestyle',
    name: 'Omexo Lifestyle',
    shortLabel: 'Lifestyle',
    storePrefix: '',
    adminPath: '/lifestyle/admin',
    tagline: 'Earbuds, headsets, mobile holders, keychains & smart gadgets',
    description:
      'Wireless ANC earbuds, foldable aluminum mobile holders, tactile stress-free keychains, and smart everyday carry gadgets across India with Cash on Delivery.',
    subcategories: ['Earbuds', 'Headsets', 'Mobile Holders', 'Stress-Free Keychains', 'Gadgets'],
    whatsappNumber: WHATSAPP_NUMBERS.DEFAULT,
    instagramHandle: '@omexo_lifestyle',
    instagramUrl: 'https://www.instagram.com/omexo_lifestyle/',
    accentBadgeClass: 'bg-indigo-100 text-indigo-900 border border-indigo-200',
    accentButtonClass: 'bg-pine-green hover:bg-pine-green-hover text-warm-white',
    defaultStoreSettings: {
      storeName: 'Omexo Lifestyle',
      supportNum: '8590181381',
      defaultWhatsapp: WHATSAPP_NUMBERS.DEFAULT,
      essentialsWhatsapp: WHATSAPP_NUMBERS.ESSENTIALS,
      supportMail: 'omexoofficial@gmail.com',
      address: 'Muhammed Sinan VK (Omexo), Vennakkattil H, mappattukara, palliyaal thodi,kulukallur po',
      mapLocationUrl: 'https://maps.google.com/?q=Kulukkallur,+Palakkad,+Kerala',
      seoTitle: 'Omexo Lifestyle | Earbuds, Mobile Holders, Keychains & Smart Gadgets',
      seoDescription:
        'Shop wireless earbuds, headsets, foldable mobile holders, stress-free fidget keychains, and daily smart gadgets across India with Cash on Delivery.',
    },
    defaultHeroConfig: {
      badge: 'Omexo Lifestyle Store',
      title: 'Small Things.\nBig Joy.',
      description:
        'Earbuds, headsets, foldable mobile holders, tactile keychains & smart everyday carry gadgets with Cash on Delivery across India.',
      primaryCtaText: 'SHOP LIFESTYLE',
      secondaryCtaText: 'TRACK ORDER',
      cardTitle: 'Mechanical Switch Fidget Keychain',
      cardSubtitle: 'Omexo Lifestyle · Cash on Delivery',
      cardPrice: 199,
      cardRegularPrice: 299,
      cardImage: OMEXO_MEDIA.catLifestyle,
    },
    defaultComboConfig: {
      badge: '🔥 LIFESTYLE DESK SET',
      title: 'SPECIAL COMBO',
      subheadline: 'Two useful picks. One special price.',
      description:
        'Get our tactile mechanical switch fidget keychain combined with the ultra-slim foldable aluminum mobile holder stand. Everything you need to elevate your everyday desk setup.',
      price: 350,
      valuePrice: 580,
      ctaText: 'GET THE COMBO',
      card1Title: 'Fidget Keychain',
      card1Image: OMEXO_MEDIA.catLifestyle,
      card2Title: 'Mobile Stand',
      card2Image: OMEXO_MEDIA.catLifestyle,
      isActive: true,
    },
    defaultOfferBanner: {
      siteSlug: 'lifestyle',
      badge: '🔥 OMEXO LIFESTYLE DROPS',
      title: 'Smart Everyday Carry & Audio Gear.',
      description:
        'Trending ANC earbuds, pocket keychains, and desk accessories delivered across India with Cash on Delivery.',
      primaryCta: 'Explore Lifestyle Gear',
      secondaryCta: 'Track Existing Order',
      imageUrl: OMEXO_MEDIA.catLifestyle,
      backgroundImageUrl: OMEXO_MEDIA.catLifestyle,
    },
    defaultReviews: [
      {
        id: 'rev-1',
        siteSlug: 'lifestyle',
        customerName: 'Rohan Sharma',
        productName: 'Mechanical Switch Fidget Keychain',
        rating: 5,
        reviewText: 'Extremely satisfying click feeling! Best desk toy ever to kill stress while coding.',
        date: '01-10-2026',
        status: 'Approved',
      },
      {
        id: 'rev-5',
        siteSlug: 'lifestyle',
        customerName: 'Nikhil Varma',
        productName: 'Omexo AirBuds Max ANC',
        rating: 5,
        reviewText: 'Crisp sound and super quick WhatsApp COD confirmation. Arrived in 3 days!',
        date: '29-09-2026',
        status: 'Approved',
      },
    ],
    defaultCmsPages: [
      {
        id: 'lifestyle_home',
        siteSlug: 'lifestyle',
        title: 'Lifestyle Hero Content',
        content: 'Small Things. Big Joy. Everyday smart gadgets, audio wearables, and carry gear with Cash on Delivery.',
      },
      {
        id: 'lifestyle_about',
        siteSlug: 'lifestyle',
        title: 'About Omexo Lifestyle',
        content: 'Omexo Lifestyle curates precision earbuds, foldable mobile stands, and tactile everyday carry tools across India.',
      },
    ],
  },
  decor: {
    slug: 'decor',
    name: 'Omexo Decor',
    shortLabel: 'Decor',
    storePrefix: '/decor',
    adminPath: '/decor/admin',
    tagline: 'Wall stickers, fancy lights, ambient lamps & modern home decor',
    description:
      'Curated Nordic ambient lamps, minimalist geometric LED sconces, wall art stickers, and home appliances delivered across India with Cash on Delivery.',
    subcategories: ['Wall Stickers', 'Fancy Lights', 'Home Decor', 'Home Appliances'],
    whatsappNumber: WHATSAPP_NUMBERS.DEFAULT,
    instagramHandle: '@omexo_decor',
    instagramUrl: 'https://www.instagram.com/omexo_decor/',
    accentBadgeClass: 'bg-amber-100 text-amber-900 border border-amber-200',
    accentButtonClass: 'bg-pine-green hover:bg-pine-green-hover text-warm-white',
    defaultStoreSettings: {
      storeName: 'Omexo Decor',
      supportNum: '8590181381',
      defaultWhatsapp: WHATSAPP_NUMBERS.DEFAULT,
      essentialsWhatsapp: WHATSAPP_NUMBERS.DEFAULT,
      supportMail: 'omexoofficial@gmail.com',
      address: 'Muhammed Sinan VK (Omexo), Vennakkattil H, mappattukara, palliyaal thodi,kulukallur po',
      mapLocationUrl: 'https://maps.google.com/?q=Kulukkallur,+Palakkad,+Kerala',
      seoTitle: 'Omexo Decor | Wall Stickers, Fancy Lights & Home Decor India',
      seoDescription:
        'Shop modern wall stickers, ambient fancy lights, Nordic lamps, and home decor appliances across India with Cash on Delivery via Omexo Decor.',
    },
    defaultHeroConfig: {
      badge: 'Omexo Decor Studio',
      title: 'Warm Light.\nElevated Spaces.',
      description:
        'Curated Nordic touch lamps, fancy ambient lighting, wall stickers, and minimalist home decor delivered across India with Cash on Delivery.',
      primaryCtaText: 'SHOP DECOR',
      secondaryCtaText: 'TRACK ORDER',
      cardTitle: 'Nordic Ribbed Touch Ambient Lamp',
      cardSubtitle: 'Omexo Decor · Cash on Delivery',
      cardPrice: 899,
      cardRegularPrice: 1499,
      cardImage: OMEXO_MEDIA.prodAmbientLamp,
    },
    defaultComboConfig: {
      badge: '✨ AMBIENT ROOM PAIR',
      title: 'LIGHTING DUO',
      subheadline: 'Warm glow meets sculptural minimalism.',
      description:
        'Transform bedrooms and workspaces effortlessly with our Nordic ribbed touch table lamp paired with a geometric LED wall sconce.',
      price: 1799,
      valuePrice: 2799,
      ctaText: 'SHOP DECOR DUO',
      card1Title: 'Nordic Ambient Lamp',
      card1Image: OMEXO_MEDIA.prodAmbientLamp,
      card2Title: 'Geometric Wall Sconce',
      card2Image: OMEXO_MEDIA.catDecor,
      isActive: false,
    },
    defaultOfferBanner: {
      siteSlug: 'decor',
      badge: '✨ OMEXO DECOR STUDIO',
      title: 'Curated Lighting & Wall Aesthetics.',
      description:
        'Bring architectural warmth to every corner with cordless touch lamps, wall sconces, and modern home accents.',
      primaryCta: 'Explore Home Decor',
      secondaryCta: 'Track Existing Order',
      imageUrl: OMEXO_MEDIA.prodAmbientLamp,
      backgroundImageUrl: OMEXO_MEDIA.catDecor,
    },
    defaultReviews: [
      {
        id: 'rev-3',
        siteSlug: 'decor',
        customerName: 'Abhishek K.',
        productName: 'Nordic Ribbed Touch Ambient Lamp',
        rating: 5,
        reviewText: 'Warm glow looks amazing on our bedside table. Fast dispatch and solid packaging.',
        date: '28-09-2026',
        status: 'Approved',
      },
      {
        id: 'rev-6',
        siteSlug: 'decor',
        customerName: 'Sneha Nair',
        productName: 'Minimalist Geometric LED Wall Sconce',
        rating: 5,
        reviewText: 'Easy peel-and-stick mount and gorgeous evening ambiance in the hallway.',
        date: '24-09-2026',
        status: 'Approved',
      },
    ],
    defaultCmsPages: [
      {
        id: 'decor_home',
        siteSlug: 'decor',
        title: 'Decor Hero Content',
        content: 'Warm Light. Elevated Spaces. Ambient lighting, wall stickers, and minimalist home decor.',
      },
      {
        id: 'decor_about',
        siteSlug: 'decor',
        title: 'About Omexo Decor',
        content: 'Omexo Decor brings modern architectural lighting, wall art, and cozy home accents straight to your doorstep.',
      },
    ],
  },
  essentials: {
    slug: 'essentials',
    name: 'Omexo Essentials',
    shortLabel: 'Essentials',
    storePrefix: '/essentials',
    adminPath: '/essentials/admin',
    tagline: 'Knife sharpeners, mini mops, kitchen & smart cleaning tools',
    description:
      'High-utility daily kitchen tools, 3-stage precision knife sharpeners, and self-squeeze portable mini mops engineered for effortless home upkeep.',
    subcategories: ['Knife Sharpeners', 'Mini Mops', 'Kitchen Tools', 'Cleaning Tools'],
    whatsappNumber: WHATSAPP_NUMBERS.ESSENTIALS,
    instagramHandle: '@omexo_essentials',
    instagramUrl: 'https://www.instagram.com/omexo_essentials/',
    accentBadgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-200',
    accentButtonClass: 'bg-emerald-800 hover:bg-emerald-900 text-white',
    defaultStoreSettings: {
      storeName: 'Omexo Essentials',
      supportNum: '8590181381',
      defaultWhatsapp: WHATSAPP_NUMBERS.ESSENTIALS,
      essentialsWhatsapp: WHATSAPP_NUMBERS.ESSENTIALS,
      supportMail: 'omexoofficial@gmail.com',
      address: 'Muhammed Sinan VK (Omexo), Vennakkattil H, mappattukara, palliyaal thodi,kulukallur po',
      mapLocationUrl: 'https://maps.google.com/?q=Kulukkallur,+Palakkad,+Kerala',
      seoTitle: 'Omexo Essentials | Knife Sharpeners, Mini Mops & Kitchen Tools',
      seoDescription:
        'Order precision knife sharpeners, self-squeeze portable mini mops, and smart kitchen & cleaning tools across India with Cash on Delivery and direct WhatsApp ordering.',
    },
    defaultHeroConfig: {
      badge: 'Omexo Essentials Hub',
      title: 'Smart Kitchen.\nEffortless Clean.',
      description:
        'Precision 3-stage knife sharpeners, self-squeeze mini cleaning mops, and high-utility home & kitchen tools with Cash on Delivery.',
      primaryCtaText: 'SHOP ESSENTIALS',
      secondaryCtaText: 'TRACK ORDER',
      cardTitle: '3-Stage Precision Knife Sharpener',
      cardSubtitle: 'Omexo Essentials · Cash on Delivery',
      cardPrice: 349,
      cardRegularPrice: 699,
      cardImage: OMEXO_MEDIA.prodKnifeSharpener,
    },
    defaultComboConfig: {
      badge: '🧼 KITCHEN & CLEAN BUNDLE',
      title: 'UTILITY COMBO',
      subheadline: 'Prep faster. Clean in seconds.',
      description:
        'Bundle our 3-Stage Precision Knife Sharpener with the Self-Squeeze Portable Mini Cleaning Mop for spotless daily kitchen care.',
      price: 599,
      valuePrice: 1298,
      ctaText: 'ORDER UTILITY COMBO',
      card1Title: '3-Stage Knife Sharpener',
      card1Image: OMEXO_MEDIA.prodKnifeSharpener,
      card2Title: 'Mini Cleaning Mop',
      card2Image: OMEXO_MEDIA.catEssentials,
      isActive: false,
    },
    defaultOfferBanner: {
      siteSlug: 'essentials',
      badge: '🧼 OMEXO ESSENTIALS UTILITY',
      title: 'Built for Everyday Kitchens & Clean Homes.',
      description:
        'Razor-sharp knives, streak-free countertops, and smart space-saving cleaning essentials shipped fast across India.',
      primaryCta: 'Explore Essentials',
      secondaryCta: 'Track Existing Order',
      imageUrl: OMEXO_MEDIA.prodKnifeSharpener,
      backgroundImageUrl: OMEXO_MEDIA.catEssentials,
    },
    defaultReviews: [
      {
        id: 'rev-2',
        siteSlug: 'essentials',
        customerName: 'Anjali Menon',
        productName: 'Omexo 3-Stage Precision Knife Sharpener',
        rating: 5,
        reviewText: 'Sharpened all our kitchen knives in two minutes. Ordered directly via WhatsApp COD!',
        date: '30-09-2026',
        status: 'Approved',
      },
      {
        id: 'rev-4',
        siteSlug: 'essentials',
        customerName: 'Faisal Rahiman',
        productName: 'Self-Squeeze Portable Mini Cleaning Mop',
        rating: 5,
        reviewText: 'So handy for kitchen counters and glass! Received in Kerala within 2 days.',
        date: '25-09-2026',
        status: 'Approved',
      },
    ],
    defaultCmsPages: [
      {
        id: 'essentials_home',
        siteSlug: 'essentials',
        title: 'Essentials Hero Content',
        content: 'Smart Kitchen. Effortless Clean. Precision sharpeners, mini mops, and everyday cleaning tools.',
      },
      {
        id: 'essentials_about',
        siteSlug: 'essentials',
        title: 'About Omexo Essentials',
        content: 'Omexo Essentials delivers practical, durable kitchen and home cleaning innovations across India with COD.',
      },
    ],
  },
};

export function getSiteBrandConfig(siteSlug?: string | null): SiteBrandProfile {
  if (siteSlug === 'decor') return SITE_BRAND_CONFIGS.decor;
  if (siteSlug === 'essentials') return SITE_BRAND_CONFIGS.essentials;
  return SITE_BRAND_CONFIGS.lifestyle;
}

export function getSitePathPrefix(siteSlug?: BrandCategorySlug | null): string {
  if (siteSlug === 'decor') return '/decor';
  if (siteSlug === 'essentials') return '/essentials';
  return '';
}

export const INSTAGRAM_ECOSYSTEM = [
  {
    name: 'Omexo India',
    label: 'Main Brand',
    handle: '@omexo.india',
    url: 'https://instagram.com/omexo.india',
  },
  {
    name: 'Omexo Decor',
    label: 'Decor & Lighting',
    handle: '@omexo_decor',
    url: 'https://www.instagram.com/omexo_decor/',
  },
  {
    name: 'Omexo Essentials',
    label: 'Kitchen & Cleaning',
    handle: '@omexo_essentials',
    url: 'https://www.instagram.com/omexo_essentials/',
  },
  {
    name: 'Omexo Lifestyle',
    label: 'Gadgets & Audio',
    handle: '@omexo_lifestyle',
    url: 'https://www.instagram.com/omexo_lifestyle/',
  },
] as const;

export const OMEXO_CATEGORIES: BrandCategoryDefinition[] = [
  {
    id: 'cat-decor',
    slug: 'decor',
    name: 'Omexo Decor',
    shortLabel: 'Decor',
    tagline: SITE_BRAND_CONFIGS.decor.tagline,
    description: SITE_BRAND_CONFIGS.decor.description,
    subcategories: SITE_BRAND_CONFIGS.decor.subcategories,
    whatsappNumber: WHATSAPP_NUMBERS.DEFAULT,
    instagramHandle: '@omexo_decor',
    instagramUrl: 'https://www.instagram.com/omexo_decor/',
    seoTitle: SITE_BRAND_CONFIGS.decor.defaultStoreSettings.seoTitle,
    seoDescription: SITE_BRAND_CONFIGS.decor.defaultStoreSettings.seoDescription,
    image: OMEXO_MEDIA.catDecor,
  },
  {
    id: 'cat-essentials',
    slug: 'essentials',
    name: 'Omexo Essentials',
    shortLabel: 'Essentials',
    tagline: SITE_BRAND_CONFIGS.essentials.tagline,
    description: SITE_BRAND_CONFIGS.essentials.description,
    subcategories: SITE_BRAND_CONFIGS.essentials.subcategories,
    whatsappNumber: WHATSAPP_NUMBERS.ESSENTIALS,
    instagramHandle: '@omexo_essentials',
    instagramUrl: 'https://www.instagram.com/omexo_essentials/',
    seoTitle: SITE_BRAND_CONFIGS.essentials.defaultStoreSettings.seoTitle,
    seoDescription: SITE_BRAND_CONFIGS.essentials.defaultStoreSettings.seoDescription,
    image: OMEXO_MEDIA.catEssentials,
  },
  {
    id: 'cat-lifestyle',
    slug: 'lifestyle',
    name: 'Omexo Lifestyle',
    shortLabel: 'Lifestyle',
    tagline: SITE_BRAND_CONFIGS.lifestyle.tagline,
    description: SITE_BRAND_CONFIGS.lifestyle.description,
    subcategories: SITE_BRAND_CONFIGS.lifestyle.subcategories,
    whatsappNumber: WHATSAPP_NUMBERS.DEFAULT,
    instagramHandle: '@omexo_lifestyle',
    instagramUrl: 'https://www.instagram.com/omexo_lifestyle/',
    seoTitle: SITE_BRAND_CONFIGS.lifestyle.defaultStoreSettings.seoTitle,
    seoDescription: SITE_BRAND_CONFIGS.lifestyle.defaultStoreSettings.seoDescription,
    image: OMEXO_MEDIA.catLifestyle,
  },
];

export const DEFAULT_BRAND_CATEGORIES: Category[] = OMEXO_CATEGORIES.map((c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  subcategories: c.subcategories,
  description: c.description,
  image: c.image,
}));

/**
 * Sanitizes a raw phone number into a WhatsApp-compatible digit string (e.g. 919946597201).
 */
export function sanitizeWhatsappNumber(input?: string | null, fallback: string = WHATSAPP_NUMBERS.DEFAULT): string {
  const digits = (input || '').replace(/\D/g, '');
  if (!digits) return fallback;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/**
 * Formats a WhatsApp number cleanly for UI display (e.g. +91 99465 97201).
 */
export function formatWhatsappDisplay(input?: string | null, fallback: string = WHATSAPP_NUMBERS.DEFAULT): string {
  const digits = sanitizeWhatsappNumber(input, fallback);
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}

/**
 * Normalizes any category name, legacy category name, or slug into one of the three
 * canonical slugs ('decor' | 'essentials' | 'lifestyle') when applicable, or 'All'.
 */
export function resolveCategorySlug(input?: string | null): BrandCategorySlug | 'All' | null {
  if (!input) return 'All';
  const normalized = input.trim().toLowerCase();
  if (normalized === 'all' || normalized === 'all products') return 'All';

  // 1. Exact canonical matches always take absolute precedence (prevents Lifestyle items from ever shifting to Decor/Essentials)
  if (normalized === 'lifestyle' || normalized === 'omexo lifestyle') return 'lifestyle';
  if (normalized === 'decor' || normalized === 'omexo decor') return 'decor';
  if (normalized === 'essentials' || normalized === 'omexo essentials') return 'essentials';

  // 2. Legacy category fallbacks only when no canonical category matched
  if (
    normalized.includes('lifestyle') ||
    normalized.includes('tech') ||
    normalized.includes('trending') ||
    normalized.includes('special') ||
    normalized.includes('gadget') ||
    normalized.includes('audio') ||
    normalized.includes('keychain') ||
    normalized.includes('stand') ||
    normalized.includes('buds')
  ) {
    return 'lifestyle';
  }

  if (
    normalized.includes('decor') ||
    normalized.includes('lamp') ||
    normalized.includes('light') ||
    normalized.includes('wall')
  ) {
    return 'decor';
  }

  if (
    normalized.includes('essential') ||
    normalized.includes('kitchen') ||
    normalized.includes('clean') ||
    normalized.includes('mop') ||
    normalized.includes('knife')
  ) {
    return 'essentials';
  }

  return null;
}

/**
 * Maps legacy or slugged category values to canonical display name ('Omexo Decor', etc.)
 */
export function getCanonicalCategoryName(input?: string | null): string {
  if (!input) return 'All';
  const slug = resolveCategorySlug(input);
  if (slug === 'All') return 'All';
  const found = OMEXO_CATEGORIES.find((c) => c.slug === slug);
  return found ? found.name : input;
}

/**
 * Returns color-coded badge classes and canonical labels for Admin & Storefront UI.
 */
export function getCategoryBadgeStyle(categoryOrSlug?: string | null): {
  slug: BrandCategorySlug;
  label: string;
  shortLabel: string;
  badgeClass: string;
} {
  const slug = resolveCategorySlug(categoryOrSlug);
  if (slug === 'decor') {
    return {
      slug: 'decor',
      label: 'Omexo Decor',
      shortLabel: 'Decor',
      badgeClass: 'bg-amber-100 text-amber-900 border border-amber-200',
    };
  }
  if (slug === 'essentials') {
    return {
      slug: 'essentials',
      label: 'Omexo Essentials',
      shortLabel: 'Essentials',
      badgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-200',
    };
  }
  return {
    slug: 'lifestyle',
    label: 'Omexo Lifestyle',
    shortLabel: 'Lifestyle',
    badgeClass: 'bg-indigo-100 text-indigo-900 border border-indigo-200',
  };
}

/**
 * Checks whether a product belongs to a selected category / standalone site (strict brand isolation:
 * Lifestyle, Decor, and Essentials items never cross into each other).
 */
export function doesProductMatchCategory(product: Product, selectedCategory: string): boolean {
  if (!selectedCategory || selectedCategory === 'All') return true;
  const targetSlug = resolveCategorySlug(selectedCategory);
  const rawSlug = (product.categorySlug || '').trim().toLowerCase();
  const productSlug =
    rawSlug === 'decor' || rawSlug === 'essentials' || rawSlug === 'lifestyle'
      ? (rawSlug as BrandCategorySlug)
      : resolveCategorySlug(product.category);

  // Strict guard: Lifestyle, Decor, and Essentials never cross-pollinate
  if (
    targetSlug &&
    targetSlug !== 'All' &&
    productSlug &&
    productSlug !== 'All'
  ) {
    return targetSlug === productSlug;
  }

  return product.category.toLowerCase() === selectedCategory.toLowerCase();
}

/**
 * Resolves all unique brand slugs associated with an order's line items.
 */
export function getOrderBrandSlugs(order: Order, products: Product[] = []): BrandCategorySlug[] {
  if (order.siteSlug === 'decor' || order.siteSlug === 'essentials' || order.siteSlug === 'lifestyle') {
    return [order.siteSlug];
  }
  const slugs = new Set<BrandCategorySlug>();
  for (const item of order.items) {
    const matchedProd = products.find((p) => p.id === item.productId);
    const resolved = resolveCategorySlug(
      item.categorySlug ||
        item.category ||
        matchedProd?.categorySlug ||
        matchedProd?.category ||
        item.title
    );
    if (resolved && resolved !== 'All') {
      slugs.add(resolved);
    } else {
      slugs.add('lifestyle');
    }
  }
  return Array.from(slugs);
}

/**
 * Conditional WhatsApp Phone Number Routing:
 * - Omexo Essentials ('essentials') -> StoreSettings.essentialsWhatsapp or 919946597203
 * - Omexo Decor, Omexo Lifestyle -> StoreSettings.defaultWhatsapp or 919946597201
 */
export function getWhatsAppNumberForCategory(
  categoryOrSlug?: string | null,
  settings?: Partial<StoreSettings> | null
): string {
  const slug = resolveCategorySlug(categoryOrSlug);
  if (slug === 'essentials') {
    return sanitizeWhatsappNumber(
      settings?.essentialsWhatsapp || settings?.defaultWhatsapp,
      WHATSAPP_NUMBERS.ESSENTIALS
    );
  }
  return sanitizeWhatsappNumber(settings?.defaultWhatsapp, WHATSAPP_NUMBERS.DEFAULT);
}

/**
 * Generates the official product URL scoped to the product's standalone brand site.
 */
export function getProductShareUrl(productId: string, siteSlug?: BrandCategorySlug | string | null): string {
  const resolved = resolveCategorySlug(siteSlug);
  const prefix = resolved && resolved !== 'All' ? getSitePathPrefix(resolved) : '';
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${prefix}/product/${productId}`;
  }
  return `https://omexo.in${prefix}/product/${productId}`;
}

/**
 * Builds the exact pre-filled WhatsApp order link for a product.
 */
export function buildProductWhatsAppUrl(
  product: Product,
  settings?: Partial<StoreSettings> | null
): string {
  const categoryName = getCanonicalCategoryName(product.categorySlug || product.category);
  const slug = resolveCategorySlug(product.categorySlug || product.category);
  const phone = getWhatsAppNumberForCategory(product.categorySlug || product.category, settings);
  const productUrl = getProductShareUrl(product.id, slug);

  const message =
    `Hi ${categoryName}, I would like to place an order (Cash on Delivery): \n` +
    `• Product: ${product.title} \n` +
    `• Category: ${categoryName} \n` +
    `• Price: ₹${product.salePrice} \n` +
    `• Link: ${productUrl}`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds the floating WhatsApp support chat URL routed to the active standalone site.
 */
export function buildSupportWhatsAppUrl(
  categoryOrSlug?: string | null,
  settings?: Partial<StoreSettings> | null
): string {
  const phone = getWhatsAppNumberForCategory(categoryOrSlug, settings);
  const slug = resolveCategorySlug(categoryOrSlug);
  const catLabel =
    slug === 'essentials'
      ? 'Omexo Essentials'
      : slug === 'decor'
      ? 'Omexo Decor'
      : 'Omexo Lifestyle';

  const message = `Hi ${catLabel}, I have an inquiry regarding your products and Cash on Delivery ordering.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a quick Admin -> Customer WhatsApp message link for COD verification & dispatch updates.
 */
export function buildCustomerOrderWhatsAppUrl(order: Order, storeName = 'Omexo India'): string {
  const customerPhone = sanitizeWhatsappNumber(order.customerPhone, '');
  const itemsList = order.items.map((item) => `${item.title} (×${item.quantity})`).join(', ');
  const message =
    `Hi ${order.customerName}, greetings from ${storeName}! \n` +
    `Regarding your order *${order.id}*: \n` +
    `• Items: ${itemsList} \n` +
    `• Amount: ₹${order.totalAmount.toLocaleString('en-IN')} (${order.paymentType}) \n` +
    `• Status: ${order.orderStatus} \n` +
    `Please confirm your delivery address (${order.address}, PIN: ${order.pincode}) so we can process your dispatch quickly.`;

  return `https://wa.me/${customerPhone}?text=${encodeURIComponent(message)}`;
}
