import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Brand,
  BrandCategorySlug,
  CMSPage,
  CartItem,
  Category,
  ComboConfig,
  Coupon,
  CustomerReview,
  HeroConfig,
  OfferBanner,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  PromoOffer,
  StoreSettings,
} from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { auth, db, onAuthStateChanged, signOut, User } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocFromServer,
  query,
  where,
} from 'firebase/firestore';
import { trackAddToCart, trackPurchase } from '../lib/metaPixel';
import {
  BRAND_SITES,
  DEFAULT_BRAND_CATEGORIES,
  ORDER_LABEL_SENDER,
  SITE_BRAND_CONFIGS,
  getCanonicalCategoryName,
  getOrderBrandSlugs,
  getSiteBrandConfig,
  resolveCategorySlug,
} from '../config/categories';
import { parseHash } from './useHashRouter';
import { getAdminRoleForEmail, isAuthorizedAdminEmail, AdminRole } from '../lib/security';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

type SiteRecord<T> = Record<BrandCategorySlug, T>;

interface StoreContextType {
  activeSite: BrandCategorySlug;
  products: Product[];
  siteProducts: Product[];
  orders: Order[];
  siteOrders: Order[];
  cart: CartItem[];
  telegramConfig: TelegramConfig;
  offerBanner: OfferBanner;
  categories: Category[];
  brands: Brand[];
  banners: OfferBanner[];
  allBanners: OfferBanner[];
  heroConfig: HeroConfig;
  comboConfig: ComboConfig;
  reviews: CustomerReview[];
  allReviews: CustomerReview[];
  coupons: Coupon[];
  allCoupons: Coupon[];
  cmsPages: CMSPage[];
  allCmsPages: CMSPage[];
  promos: PromoOffer[];
  storeSettings: StoreSettings;
  getStoreSettingsForSite: (site: BrandCategorySlug) => StoreSettings;
  getHeroConfigForSite: (site: BrandCategorySlug) => HeroConfig;
  getComboConfigForSite: (site: BrandCategorySlug) => ComboConfig;
  getTelegramConfigForSite: (site: BrandCategorySlug) => TelegramConfig;
  getOfferBannerForSite: (site: BrandCategorySlug) => OfferBanner;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedBrand: string;
  setSelectedBrand: (b: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteProductsBulk: (ids: string[]) => Promise<void>;
  addToCart: (product: Product, quantity?: number, targetSite?: BrandCategorySlug) => void;
  removeFromCart: (productId: string, targetSite?: BrandCategorySlug) => void;
  updateCartQuantity: (productId: string, quantity: number, targetSite?: BrandCategorySlug) => void;
  clearCart: (targetSite?: BrandCategorySlug) => void;
  createOrder: (
    customerDetails: {
      name: string;
      email: string;
      phone: string;
      address: string;
      pincode: string;
      paymentType: 'COD' | 'Online';
    },
    discountAmount?: number,
    targetSite?: BrandCategorySlug
  ) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, consignmentNumber?: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  deleteOrdersBulk: (orderIds: string[]) => Promise<void>;
  updateTelegramConfig: (config: TelegramConfig, targetSite?: BrandCategorySlug) => Promise<void>;
  updateOfferBanner: (banner: OfferBanner, targetSite?: BrandCategorySlug) => Promise<void>;
  updateHeroConfig: (config: HeroConfig, targetSite?: BrandCategorySlug) => Promise<void>;
  updateComboConfig: (config: ComboConfig, targetSite?: BrandCategorySlug) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addBrand: (brand: Omit<Brand, 'id'>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  addBanner: (banner: OfferBanner, targetSite?: BrandCategorySlug) => Promise<void>;
  updateBanner: (bannerIdOrIdx: string | number, banner: OfferBanner, targetSite?: BrandCategorySlug) => Promise<void>;
  deleteBanner: (bannerIdOrIdx: string | number, targetSite?: BrandCategorySlug) => Promise<void>;
  addPromo: (promo: Omit<PromoOffer, 'id'> & { id?: string }, targetSite?: BrandCategorySlug) => Promise<void>;
  updatePromo: (promo: PromoOffer, targetSite?: BrandCategorySlug) => Promise<void>;
  deletePromo: (id: string, targetSite?: BrandCategorySlug) => Promise<void>;
  addReview: (review: Omit<CustomerReview, 'id' | 'date'>, targetSite?: BrandCategorySlug) => Promise<void>;
  updateReviewStatus: (id: string, status: 'Approved' | 'Pending') => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  addCoupon: (coupon: Omit<Coupon, 'id'>, targetSite?: BrandCategorySlug) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  updateCMSPage: (page: CMSPage) => Promise<void>;
  updateStoreSettings: (settings: StoreSettings, targetSite?: BrandCategorySlug) => Promise<void>;
  refreshStore: () => Promise<void>;
  showCategoryBrands: boolean;
  setShowCategoryBrands: (val: boolean) => void;
  showFeaturedGrids: boolean;
  setShowFeaturedGrids: (val: boolean) => void;
  isLoadingDb: boolean;
  authUser: User | null;
  isGoogleAdmin: boolean;
  isCredentialAdmin: boolean;
  isAdminUser: boolean;
  adminRole: AdminRole;
  adminDisplayName: string;
  serverAdminToken: string | null;
  isAuthReady: boolean;
  loginWithAdminCredentials: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Category[] = DEFAULT_BRAND_CATEGORIES;

const DEFAULT_BRANDS: Brand[] = [
  { id: 'brand-1', name: 'Omexo Decor' },
  { id: 'brand-2', name: 'Omexo Essentials' },
  { id: 'brand-3', name: 'Omexo Lifestyle' },
  { id: 'brand-4', name: 'Omexo Aesthetic' },
];

const DEFAULT_BANNERS: OfferBanner[] = BRAND_SITES.map((slug) => ({
  id: `banner-${slug}-default`,
  ...SITE_BRAND_CONFIGS[slug].defaultOfferBanner,
}));

const DEFAULT_REVIEWS: CustomerReview[] = BRAND_SITES.flatMap(
  (slug) => SITE_BRAND_CONFIGS[slug].defaultReviews
);

const DEFAULT_COUPONS: Coupon[] = [
  { id: 'coup-lifestyle-1', siteSlug: 'lifestyle', code: 'OMEXO10', value: 10, type: 'Percentage', minOrder: 300, isActive: true },
  { id: 'coup-lifestyle-2', siteSlug: 'lifestyle', code: 'WELCOME50', value: 50, type: 'Fixed', minOrder: 500, isActive: true },
  { id: 'coup-decor-1', siteSlug: 'decor', code: 'DECOR10', value: 10, type: 'Percentage', minOrder: 500, isActive: true },
  { id: 'coup-decor-2', siteSlug: 'decor', code: 'OMEXO10', value: 10, type: 'Percentage', minOrder: 300, isActive: true },
  { id: 'coup-essentials-1', siteSlug: 'essentials', code: 'ESSENTIALS10', value: 10, type: 'Percentage', minOrder: 300, isActive: true },
  { id: 'coup-essentials-2', siteSlug: 'essentials', code: 'OMEXO10', value: 10, type: 'Percentage', minOrder: 300, isActive: true },
  { id: 'coup-aesthetic-1', siteSlug: 'aesthetic', code: 'AESTHETIC10', value: 10, type: 'Percentage', minOrder: 300, isActive: true },
  { id: 'coup-aesthetic-2', siteSlug: 'aesthetic', code: 'OMEXO10', value: 10, type: 'Percentage', minOrder: 300, isActive: true },
];

const DEFAULT_CMS_PAGES: CMSPage[] = BRAND_SITES.flatMap(
  (slug) => SITE_BRAND_CONFIGS[slug].defaultCmsPages
);

function createDefaultSiteSettingsMap(): SiteRecord<StoreSettings> {
  return {
    lifestyle: { ...SITE_BRAND_CONFIGS.lifestyle.defaultStoreSettings },
    decor: { ...SITE_BRAND_CONFIGS.decor.defaultStoreSettings },
    essentials: { ...SITE_BRAND_CONFIGS.essentials.defaultStoreSettings },
    aesthetic: { ...SITE_BRAND_CONFIGS.aesthetic.defaultStoreSettings },
  };
}

function createDefaultHeroMap(): SiteRecord<HeroConfig> {
  return {
    lifestyle: { ...SITE_BRAND_CONFIGS.lifestyle.defaultHeroConfig },
    decor: { ...SITE_BRAND_CONFIGS.decor.defaultHeroConfig },
    essentials: { ...SITE_BRAND_CONFIGS.essentials.defaultHeroConfig },
    aesthetic: { ...SITE_BRAND_CONFIGS.aesthetic.defaultHeroConfig },
  };
}

function createDefaultComboMap(): SiteRecord<ComboConfig> {
  return {
    lifestyle: { ...SITE_BRAND_CONFIGS.lifestyle.defaultComboConfig },
    decor: { ...SITE_BRAND_CONFIGS.decor.defaultComboConfig },
    essentials: { ...SITE_BRAND_CONFIGS.essentials.defaultComboConfig },
    aesthetic: { ...SITE_BRAND_CONFIGS.aesthetic.defaultComboConfig },
  };
}

function createDefaultOfferBannerMap(): SiteRecord<OfferBanner> {
  return {
    lifestyle: { ...SITE_BRAND_CONFIGS.lifestyle.defaultOfferBanner },
    decor: { ...SITE_BRAND_CONFIGS.decor.defaultOfferBanner },
    essentials: { ...SITE_BRAND_CONFIGS.essentials.defaultOfferBanner },
    aesthetic: { ...SITE_BRAND_CONFIGS.aesthetic.defaultOfferBanner },
  };
}

function createDefaultTelegramMap(): SiteRecord<TelegramConfig> {
  return {
    lifestyle: { botToken: '', chatId: '' },
    decor: { botToken: '', chatId: '' },
    essentials: { botToken: '', chatId: '' },
    aesthetic: { botToken: '', chatId: '' },
  };
}

function createDefaultPromosMap(): SiteRecord<PromoOffer[]> {
  return {
    lifestyle: [
      {
        id: 'lifestyle-combo-1',
        siteSlug: 'lifestyle',
        title: SITE_BRAND_CONFIGS.lifestyle.defaultComboConfig.title,
        subheadline: SITE_BRAND_CONFIGS.lifestyle.defaultComboConfig.subheadline,
        price: SITE_BRAND_CONFIGS.lifestyle.defaultComboConfig.price,
        ctaText: SITE_BRAND_CONFIGS.lifestyle.defaultComboConfig.ctaText,
        bannerUrl: SITE_BRAND_CONFIGS.lifestyle.defaultComboConfig.card1Image,
        isActive: true,
      },
    ],
    decor: [
      {
        id: 'decor-combo-1',
        siteSlug: 'decor',
        title: SITE_BRAND_CONFIGS.decor.defaultComboConfig.title,
        subheadline: SITE_BRAND_CONFIGS.decor.defaultComboConfig.subheadline,
        price: SITE_BRAND_CONFIGS.decor.defaultComboConfig.price,
        ctaText: SITE_BRAND_CONFIGS.decor.defaultComboConfig.ctaText,
        bannerUrl: SITE_BRAND_CONFIGS.decor.defaultComboConfig.card1Image,
        isActive: true,
      },
    ],
    essentials: [
      {
        id: 'essentials-combo-1',
        siteSlug: 'essentials',
        title: SITE_BRAND_CONFIGS.essentials.defaultComboConfig.title,
        subheadline: SITE_BRAND_CONFIGS.essentials.defaultComboConfig.subheadline,
        price: SITE_BRAND_CONFIGS.essentials.defaultComboConfig.price,
        ctaText: SITE_BRAND_CONFIGS.essentials.defaultComboConfig.ctaText,
        bannerUrl: SITE_BRAND_CONFIGS.essentials.defaultComboConfig.card1Image,
        isActive: true,
      },
    ],
    aesthetic: [
      {
        id: 'aesthetic-combo-1',
        siteSlug: 'aesthetic',
        title: SITE_BRAND_CONFIGS.aesthetic.defaultComboConfig.title,
        subheadline: SITE_BRAND_CONFIGS.aesthetic.defaultComboConfig.subheadline,
        price: SITE_BRAND_CONFIGS.aesthetic.defaultComboConfig.price,
        ctaText: SITE_BRAND_CONFIGS.aesthetic.defaultComboConfig.ctaText,
        bannerUrl: SITE_BRAND_CONFIGS.aesthetic.defaultComboConfig.card1Image,
        isActive: true,
      },
    ],
  };
}

const SEED_FLAG_KEY = 'omexo_seed_v1';
const AESTHETIC_SEED_FLAG_KEY = 'omexo_aesthetic_seed_v1';

function hasSeedMarker(): boolean {
  try {
    return localStorage.getItem(SEED_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

function setLocalSeedMarker(): void {
  try {
    localStorage.setItem(SEED_FLAG_KEY, '1');
  } catch {
    // ignore storage errors
  }
}

function hasAestheticSeedMarker(): boolean {
  try {
    return localStorage.getItem(AESTHETIC_SEED_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

function setAestheticLocalSeedMarker(): void {
  try {
    localStorage.setItem(AESTHETIC_SEED_FLAG_KEY, '1');
  } catch {
    // ignore storage errors
  }
}

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      cleaned[k] = v;
    }
  }
  return cleaned as T;
}

function sanitizeBannerDocId(title: string, siteSlug?: BrandCategorySlug): string {
  const prefix = siteSlug ? `${siteSlug}_` : '';
  const cleaned = title.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '');
  return (`${prefix}${cleaned || 'banner_' + Date.now()}`).slice(0, 120);
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function logFirestoreError(
  error: unknown,
  operationType: OperationType | 'create' | 'update' | 'delete' | 'get' | 'write',
  path: string | null
) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

function isStaleDefaultAsset(url?: string): boolean {
  if (!url) return true;
  return (
    url.includes('images.unsplash.com') ||
    url.startsWith('/src/assets/') ||
    url.startsWith('/assets/')
  );
}

function normalizeProductRecord(prod: Product): Product {
  const rawSlug = (prod.categorySlug || '').trim().toLowerCase();
  const rawCat = (prod.category || '').trim().toLowerCase();

  let lockedSlug: BrandCategorySlug;
  if (rawSlug === 'lifestyle' || rawCat === 'omexo lifestyle' || rawCat === 'lifestyle') {
    lockedSlug = 'lifestyle';
  } else if (rawSlug === 'decor' || rawCat === 'omexo decor' || rawCat === 'decor') {
    lockedSlug = 'decor';
  } else if (rawSlug === 'essentials' || rawCat === 'omexo essentials' || rawCat === 'essentials') {
    lockedSlug = 'essentials';
  } else if (rawSlug === 'aesthetic' || rawCat === 'omexo aesthetic' || rawCat === 'aesthetic') {
    lockedSlug = 'aesthetic';
  } else {
    const resolved = resolveCategorySlug(prod.categorySlug || prod.category);
    lockedSlug = resolved && resolved !== 'All' ? resolved : 'lifestyle';
  }

  const canonicalCategory = getCanonicalCategoryName(lockedSlug);
  const initialMatch = INITIAL_PRODUCTS.find((p) => p.id === prod.id);
  const hasStaleImage = !prod.images?.length || prod.images.some(isStaleDefaultAsset);
  const fallbackImage = SITE_BRAND_CONFIGS[lockedSlug].defaultHeroConfig.cardImage;

  const base: Product = {
    id: prod.id,
    title: (prod.title || '').trim() || 'Omexo Product',
    category: canonicalCategory === 'All' ? 'Omexo Lifestyle' : canonicalCategory,
    categorySlug: lockedSlug,
    description: prod.description || '',
    salePrice: Math.max(0, Number(prod.salePrice) || 0),
    regularPrice: Math.max(0, Number(prod.regularPrice) || 0),
    stockCount: Math.max(0, Math.floor(Number(prod.stockCount) || 0)),
    images:
      hasStaleImage && initialMatch
        ? initialMatch.images
        : prod.images?.length
        ? prod.images
        : [fallbackImage],
    specs:
      prod.specs && typeof prod.specs === 'object' && Object.keys(prod.specs).length > 0
        ? prod.specs
        : { Origin: canonicalCategory === 'All' ? 'Omexo' : canonicalCategory },
  };

  if (typeof prod.brand === 'string' && prod.brand.trim()) {
    base.brand = prod.brand.trim();
  }
  if (typeof prod.isTrending === 'boolean') {
    base.isTrending = prod.isTrending;
  }

  return base;
}

function normalizeCategoryList(rawCategories: Category[]): Category[] {
  return rawCategories.map((c) => {
    const def = DEFAULT_BRAND_CATEGORIES.find(
      (d) =>
        d.id === c.id ||
        (c.slug && d.slug === c.slug) ||
        d.name.toLowerCase() === (c.name || '').toLowerCase()
    );
    if (!def) {
      return {
        ...c,
        subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
      };
    }
    return {
      ...c,
      subcategories:
        Array.isArray(c.subcategories) && c.subcategories.length > 0 ? c.subcategories : def.subcategories,
      image: isStaleDefaultAsset(c.image) ? def.image : c.image,
    };
  });
}

function inferReviewSiteSlug(rev: CustomerReview, allProducts: Product[]): BrandCategorySlug {
  if (
    rev.siteSlug === 'decor' ||
    rev.siteSlug === 'essentials' ||
    rev.siteSlug === 'lifestyle' ||
    rev.siteSlug === 'aesthetic'
  ) {
    return rev.siteSlug;
  }
  const prod = allProducts.find(
    (p) => p.id === rev.productId || p.title.toLowerCase() === rev.productName.toLowerCase()
  );
  if (prod) {
    const slug = resolveCategorySlug(prod.categorySlug || prod.category);
    if (slug && slug !== 'All') return slug;
  }
  const resolved = resolveCategorySlug(rev.productName);
  return resolved && resolved !== 'All' ? resolved : 'lifestyle';
}

function normalizeStoreSettings(
  raw: Partial<StoreSettings>,
  defaults: StoreSettings
): { merged: StoreSettings; migrated: boolean } {
  const merged: StoreSettings = {
    ...defaults,
    ...raw,
  };
  let migrated = false;

  const rawAddress = (merged.address || '').trim();
  const isLegacyAddress =
    !rawAddress ||
    /ozhukour|palekod|kondotty|673642/i.test(rawAddress) ||
    !/vennakkattil/i.test(rawAddress);

  if (isLegacyAddress && rawAddress !== ORDER_LABEL_SENDER.fullAddress) {
    merged.address = ORDER_LABEL_SENDER.fullAddress;
    migrated = true;
  }

  const rawSupport = (merged.supportNum || '').trim();
  const supportDigits = rawSupport.replace(/\D/g, '');
  if (!rawSupport || /9946597201|9946597203/.test(supportDigits)) {
    merged.supportNum = ORDER_LABEL_SENDER.phone;
    migrated = true;
  }

  return { merged, migrated };
}

function loadSiteMapFromStorage<T>(prefixKey: string, defaults: SiteRecord<T>): SiteRecord<T> {
  const result = { ...defaults };
  for (const slug of BRAND_SITES) {
    try {
      const saved = localStorage.getItem(`${prefixKey}_${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (prefixKey === 'omexo_store_settings') {
          const { merged } = normalizeStoreSettings(
            parsed as Partial<StoreSettings>,
            defaults[slug] as unknown as StoreSettings
          );
          result[slug] = merged as unknown as T;
        } else {
          result[slug] = { ...defaults[slug], ...parsed };
        }
      }
    } catch {
      // ignore malformed storage
    }
  }
  return result;
}

function loadListFromStorage<T>(key: string, fallback: T[], mapFn?: (items: T[]) => T[]): T[] {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return mapFn ? mapFn(parsed as T[]) : (parsed as T[]);
      }
    }
  } catch {
    // ignore malformed storage
  }
  return hasSeedMarker() ? [] : fallback;
}

function loadPromosMapFromStorage(): SiteRecord<PromoOffer[]> {
  const defaults = createDefaultPromosMap();
  const result: SiteRecord<PromoOffer[]> = {
    lifestyle: hasSeedMarker() ? [] : defaults.lifestyle,
    decor: hasSeedMarker() ? [] : defaults.decor,
    essentials: hasSeedMarker() ? [] : defaults.essentials,
    aesthetic: hasAestheticSeedMarker() ? [] : defaults.aesthetic,
  };
  for (const slug of BRAND_SITES) {
    try {
      const saved = localStorage.getItem(`omexo_promos_${slug}`);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          result[slug] = parsed as PromoOffer[];
        }
      }
    } catch {
      // ignore malformed storage
    }
  }
  return result;
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSite, setActiveSite] = useState<BrandCategorySlug>(() => parseHash().siteSlug);

  const [products, setProducts] = useState<Product[]>(() =>
    loadListFromStorage('omexo_products', INITIAL_PRODUCTS, (items) => items.map(normalizeProductRecord))
  );

  const [categories, setCategories] = useState<Category[]>(() =>
    loadListFromStorage('omexo_categories', DEFAULT_CATEGORIES, normalizeCategoryList)
  );

  const [brands, setBrands] = useState<Brand[]>(() =>
    loadListFromStorage('omexo_brands', DEFAULT_BRANDS)
  );

  const [allBanners, setAllBanners] = useState<OfferBanner[]>(() =>
    loadListFromStorage('omexo_banners_v2', DEFAULT_BANNERS)
  );

  const [promosMap, setPromosMap] = useState<SiteRecord<PromoOffer[]>>(loadPromosMapFromStorage);

  const [heroMap, setHeroMap] = useState<SiteRecord<HeroConfig>>(() =>
    loadSiteMapFromStorage('omexo_hero_config', createDefaultHeroMap())
  );

  const [comboMap, setComboMap] = useState<SiteRecord<ComboConfig>>(() =>
    loadSiteMapFromStorage('omexo_combo_config', createDefaultComboMap())
  );

  const [offerBannerMap, setOfferBannerMap] = useState<SiteRecord<OfferBanner>>(() =>
    loadSiteMapFromStorage('omexo_offer_banner', createDefaultOfferBannerMap())
  );

  const [siteSettingsMap, setSiteSettingsMap] = useState<SiteRecord<StoreSettings>>(() =>
    loadSiteMapFromStorage('omexo_store_settings', createDefaultSiteSettingsMap())
  );

  const [allReviews, setAllReviews] = useState<CustomerReview[]>(() =>
    loadListFromStorage('omexo_reviews', DEFAULT_REVIEWS)
  );

  const [allCoupons, setAllCoupons] = useState<Coupon[]>(() =>
    loadListFromStorage('omexo_coupons_v2', DEFAULT_COUPONS)
  );

  const [allCmsPages, setAllCmsPages] = useState<CMSPage[]>(() =>
    loadListFromStorage('omexo_cms_pages_v2', DEFAULT_CMS_PAGES)
  );

  const [orders, setOrders] = useState<Order[]>([]);

  const [cartsMap, setCartsMap] = useState<SiteRecord<CartItem[]>>(() => {
    const map: SiteRecord<CartItem[]> = { lifestyle: [], decor: [], essentials: [], aesthetic: [] };
    for (const slug of BRAND_SITES) {
      try {
        const saved = localStorage.getItem(`omexo_cart_${slug}`);
        if (saved) map[slug] = JSON.parse(saved);
      } catch {
        map[slug] = [];
      }
    }
    return map;
  });

  const [telegramMap, setTelegramMap] = useState<SiteRecord<TelegramConfig>>(createDefaultTelegramMap);

  const CREDENTIAL_TOKEN_STORAGE_KEY = 'omexo_admin_session_token';
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isFirebaseAuthReady, setIsFirebaseAuthReady] = useState(false);
  const [isCredentialSessionReady, setIsCredentialSessionReady] = useState(false);
  const [credentialSession, setCredentialSession] = useState<{
    authenticated: boolean;
    role: AdminRole;
    label: string;
    token: string | null;
  } | null>(null);

  const isGoogleAdmin = Boolean(
    authUser && authUser.emailVerified && isAuthorizedAdminEmail(authUser.email)
  );
  const isCredentialAdmin = Boolean(credentialSession?.authenticated);
  const isAdminUser = isGoogleAdmin || isCredentialAdmin;
  const adminRole: AdminRole = isGoogleAdmin
    ? getAdminRoleForEmail(authUser?.email)
    : isCredentialAdmin
    ? credentialSession?.role || 'Super Admin'
    : 'Staff';
  const adminDisplayName = isGoogleAdmin
    ? authUser?.displayName || authUser?.email || 'omexoofficial@gmail.com'
    : isCredentialAdmin
    ? credentialSession?.label || 'Omexo Super Admin'
    : 'Verified Admin';
  const serverAdminToken = credentialSession?.token || null;
  const isAuthReady = isFirebaseAuthReady && isCredentialSessionReady;

  const [showCategoryBrands, setShowCategoryBrands] = useState<boolean>(() => {
    const saved = localStorage.getItem('omexo_show_category_brands');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [showFeaturedGrids, setShowFeaturedGrids] = useState<boolean>(() => {
    const saved = localStorage.getItem('omexo_show_featured_grids');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // Global search & filter states scoped cleanly to active standalone site
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(() =>
    getCanonicalCategoryName(parseHash().siteSlug)
  );
  const [selectedBrand, setSelectedBrand] = useState('All');

  // Sync activeSite + selectedCategory on navigation between independent stores (/ | /decor | /essentials)
  useEffect(() => {
    const handleRouteSync = () => {
      const parsed = parseHash();
      setActiveSite((prev) => {
        if (prev !== parsed.siteSlug) {
          setSearchQuery('');
          setSelectedBrand('All');
        }
        return parsed.siteSlug;
      });
      setSelectedCategory(getCanonicalCategoryName(parsed.siteSlug));
    };
    window.addEventListener('popstate', handleRouteSync);
    window.addEventListener('hashchange', handleRouteSync);
    window.addEventListener('omexo:route-change', handleRouteSync);
    return () => {
      window.removeEventListener('popstate', handleRouteSync);
      window.removeEventListener('hashchange', handleRouteSync);
      window.removeEventListener('omexo:route-change', handleRouteSync);
    };
  }, []);

  // Track Firebase Auth + Server Credential Admin Session
  useEffect(() => {
    localStorage.removeItem('omexo_telegram_config');
    localStorage.removeItem('omexo_orders');
    localStorage.removeItem('omexo_admin_logged_in');
    localStorage.removeItem('omexo_admin_role');

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setIsFirebaseAuthReady(true);
      if (!user || !user.emailVerified || !isAuthorizedAdminEmail(user.email)) {
        setOrders([]);
        setTelegramMap(createDefaultTelegramMap());
      }
    });

    let cancelled = false;
    const hydrateCredentialSession = async () => {
      try {
        const storedToken =
          typeof window !== 'undefined' ? window.sessionStorage.getItem(CREDENTIAL_TOKEN_STORAGE_KEY) : null;
        const resp = await fetch('/api/admin/session', {
          method: 'GET',
          credentials: 'include',
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : undefined,
        });
        if (!resp.ok) {
          if (!cancelled) setCredentialSession(null);
          return;
        }
        const data = (await resp.json()) as {
          authenticated?: boolean;
          role?: AdminRole;
          label?: string;
        };
        if (!cancelled) {
          if (data.authenticated) {
            setCredentialSession({
              authenticated: true,
              role: data.role || 'Super Admin',
              label: data.label || 'Omexo Super Admin',
              token: storedToken,
            });
          } else {
            if (typeof window !== 'undefined') {
              window.sessionStorage.removeItem(CREDENTIAL_TOKEN_STORAGE_KEY);
            }
            setCredentialSession(null);
          }
        }
      } catch {
        if (!cancelled) setCredentialSession(null);
      } finally {
        if (!cancelled) setIsCredentialSessionReady(true);
      }
    };

    hydrateCredentialSession();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const loginWithAdminCredentials = useCallback(
    async (username: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const resp = await fetch('/api/admin/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = (await resp.json().catch(() => ({}))) as {
          authenticated?: boolean;
          role?: AdminRole;
          label?: string;
          token?: string;
          error?: string;
        };

        if (!resp.ok || !data.authenticated || !data.token) {
          return { ok: false, error: data.error || 'Invalid admin username or password.' };
        }

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(CREDENTIAL_TOKEN_STORAGE_KEY, data.token);
        }
        setCredentialSession({
          authenticated: true,
          role: data.role || 'Super Admin',
          label: data.label || 'Omexo Super Admin',
          token: data.token,
        });
        return { ok: true };
      } catch {
        return { ok: false, error: 'Unable to reach authentication server.' };
      }
    },
    []
  );

  const logoutAdmin = useCallback(async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore network logout failure
    }
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(CREDENTIAL_TOKEN_STORAGE_KEY);
    }
    setCredentialSession(null);
    setOrders([]);
    setTelegramMap(createDefaultTelegramMap());
    if (auth.currentUser) {
      await signOut(auth);
    }
  }, []);

  const safeStorageSet = useCallback((key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage quota / private-browsing errors
    }
  }, []);

  const markSeedInitialized = useCallback(() => {
    setLocalSeedMarker();
    setAestheticLocalSeedMarker();
    if (isGoogleAdmin) {
      setDoc(doc(db, 'settings', 'seed_v1'), { initialized: true }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'settings', 'seed_aesthetic_v1'), { initialized: true }, { merge: true }).catch(() => {});
    }
  }, [isGoogleAdmin]);

  const lastSyncRef = useRef<number>(0);

  const syncFromFirestore = useCallback(async () => {
    if (!isAuthReady) return;
    lastSyncRef.current = Date.now();

    try {
      setIsLoadingDb(false);

      const [
        _connResult,
        prodResult,
        catResult,
        brandResult,
        bannerResult,
        layoutResult,
        revResult,
        coupResult,
        cmsResult,
        seedResult,
        aestheticSeedResult,
        promoLifeResult,
        promoDecorResult,
        promoEssResult,
        promoAesthResult,
      ] = await Promise.allSettled([
        getDocFromServer(doc(db, 'test', 'connection')),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'brands')),
        getDocs(collection(db, 'banners')),
        getDoc(doc(db, 'settings', 'layout')),
        getDocs(
          isGoogleAdmin
            ? collection(db, 'reviews')
            : query(collection(db, 'reviews'), where('status', '==', 'Approved'))
        ),
        getDocs(
          isGoogleAdmin
            ? collection(db, 'coupons')
            : query(collection(db, 'coupons'), where('isActive', '==', true))
        ),
        getDocs(collection(db, 'cmsPages')),
        getDoc(doc(db, 'settings', 'seed_v1')),
        getDoc(doc(db, 'settings', 'seed_aesthetic_v1')),
        getDocs(collection(db, 'promos_lifestyle')),
        getDocs(collection(db, 'promos_decor')),
        getDocs(collection(db, 'promos_essentials')),
        getDocs(collection(db, 'promos_aesthetic')),
      ]);

      if (
        _connResult.status === 'rejected' &&
        _connResult.reason instanceof Error &&
        _connResult.reason.message.includes('the client is offline')
      ) {
        console.error('Please check your Firebase configuration.');
      }

      const seedDocExists = seedResult.status === 'fulfilled' && seedResult.value.exists();
      const aestheticSeedDocExists =
        aestheticSeedResult.status === 'fulfilled' && aestheticSeedResult.value.exists();
      const anyCollectionHasData =
        (prodResult.status === 'fulfilled' && !prodResult.value.empty) ||
        (catResult.status === 'fulfilled' && !catResult.value.empty) ||
        (brandResult.status === 'fulfilled' && !brandResult.value.empty) ||
        (bannerResult.status === 'fulfilled' && !bannerResult.value.empty) ||
        (cmsResult.status === 'fulfilled' && !cmsResult.value.empty) ||
        (promoLifeResult.status === 'fulfilled' && !promoLifeResult.value.empty) ||
        (promoDecorResult.status === 'fulfilled' && !promoDecorResult.value.empty) ||
        (promoEssResult.status === 'fulfilled' && !promoEssResult.value.empty) ||
        (promoAesthResult.status === 'fulfilled' && !promoAesthResult.value.empty);

      const alreadySeeded = seedDocExists || anyCollectionHasData || hasSeedMarker();
      const aestheticProductsSeed = INITIAL_PRODUCTS.filter((p) => p.categorySlug === 'aesthetic').map(
        normalizeProductRecord
      );
      const hasAnyExistingAestheticProducts =
        prodResult.status === 'fulfilled' &&
        prodResult.value.docs.some((d) => (d.data() as Product).categorySlug === 'aesthetic');
      const hasAnyExistingAestheticPromos =
        promoAesthResult.status === 'fulfilled' && !promoAesthResult.value.empty;
      const shouldBootstrapAesthetic =
        !aestheticSeedDocExists &&
        !hasAestheticSeedMarker() &&
        !hasAnyExistingAestheticProducts;

      if (alreadySeeded) {
        setLocalSeedMarker();
        if (isGoogleAdmin && !seedDocExists) {
          setDoc(doc(db, 'settings', 'seed_v1'), { initialized: true }, { merge: true }).catch(() => {});
        }
      } else if (isGoogleAdmin) {
        setLocalSeedMarker();
        setDoc(doc(db, 'settings', 'seed_v1'), { initialized: true }, { merge: true }).catch(() => {});
      }

      if (hasAnyExistingAestheticProducts || hasAnyExistingAestheticPromos || aestheticSeedDocExists) {
        setAestheticLocalSeedMarker();
        if (isGoogleAdmin && !aestheticSeedDocExists) {
          setDoc(doc(db, 'settings', 'seed_aesthetic_v1'), { initialized: true }, { merge: true }).catch(() => {});
        }
      } else if (shouldBootstrapAesthetic && isGoogleAdmin) {
        setAestheticLocalSeedMarker();
        setDoc(doc(db, 'settings', 'seed_aesthetic_v1'), { initialized: true }, { merge: true }).catch(() => {});
      }

      // 1. PRODUCTS (Respect deletions permanently once seeded)
      let loadedCatalog: Product[] = [];
      if (prodResult.status === 'fulfilled') {
        const prodSnap = prodResult.value;
        if (prodSnap.empty) {
          if (!alreadySeeded) {
            if (isGoogleAdmin) {
              Promise.allSettled(
                INITIAL_PRODUCTS.map((p) => setDoc(doc(db, 'products', p.id), stripUndefined(normalizeProductRecord(p))))
              );
            }
            loadedCatalog = INITIAL_PRODUCTS.map(normalizeProductRecord);
            setProducts(loadedCatalog);
            safeStorageSet('omexo_products', loadedCatalog);
          } else if (shouldBootstrapAesthetic) {
            if (isGoogleAdmin) {
              Promise.allSettled(
                aestheticProductsSeed.map((p) => setDoc(doc(db, 'products', p.id), stripUndefined(p)))
              );
            }
            loadedCatalog = aestheticProductsSeed;
            setProducts(loadedCatalog);
            safeStorageSet('omexo_products', loadedCatalog);
          } else {
            loadedCatalog = [];
            setProducts([]);
            safeStorageSet('omexo_products', []);
          }
        } else {
          loadedCatalog = prodSnap.docs.map((d) => normalizeProductRecord({ ...(d.data() as Product), id: d.id }));
          if (shouldBootstrapAesthetic) {
            const existingIds = new Set(loadedCatalog.map((p) => p.id));
            const missingAesthetic = aestheticProductsSeed.filter((p) => !existingIds.has(p.id));
            if (missingAesthetic.length > 0) {
              if (isGoogleAdmin) {
                Promise.allSettled(
                  missingAesthetic.map((p) => setDoc(doc(db, 'products', p.id), stripUndefined(p)))
                );
              }
              loadedCatalog = [...loadedCatalog, ...missingAesthetic];
            }
          }
          setProducts(loadedCatalog);
          safeStorageSet('omexo_products', loadedCatalog);
        }
      }

      // 2. CATEGORIES (Never overwrite or resurrect deleted categories)
      if (catResult.status === 'fulfilled') {
        const catSnap = catResult.value;
        if (catSnap.empty) {
          if (!alreadySeeded) {
            if (isGoogleAdmin) {
              Promise.allSettled(
                DEFAULT_CATEGORIES.map((c) => setDoc(doc(db, 'categories', c.id), stripUndefined(c)))
              );
            }
            setCategories(DEFAULT_CATEGORIES);
            safeStorageSet('omexo_categories', DEFAULT_CATEGORIES);
          } else {
            setCategories([]);
            safeStorageSet('omexo_categories', []);
          }
        } else {
          const rawLoaded = catSnap.docs.map((d) => ({ ...(d.data() as Category), id: d.id }));
          const aestheticDefaultCat = DEFAULT_CATEGORIES.find((c) => c.slug === 'aesthetic');
          if (
            shouldBootstrapAesthetic &&
            aestheticDefaultCat &&
            !rawLoaded.some((c) => c.slug === 'aesthetic' || c.id === aestheticDefaultCat.id)
          ) {
            if (isGoogleAdmin) {
              setDoc(doc(db, 'categories', aestheticDefaultCat.id), stripUndefined(aestheticDefaultCat)).catch(() => {});
            }
            rawLoaded.push(aestheticDefaultCat);
          }
          const finalCategories = normalizeCategoryList(rawLoaded);
          setCategories(finalCategories);
          safeStorageSet('omexo_categories', finalCategories);
        }
      }

      // 3. BRANDS
      if (brandResult.status === 'fulfilled') {
        const brandSnap = brandResult.value;
        if (brandSnap.empty) {
          if (!alreadySeeded) {
            if (isGoogleAdmin) {
              Promise.allSettled(
                DEFAULT_BRANDS.map((b) => setDoc(doc(db, 'brands', b.id), stripUndefined(b)))
              );
            }
            setBrands(DEFAULT_BRANDS);
            safeStorageSet('omexo_brands', DEFAULT_BRANDS);
          } else {
            setBrands([]);
            safeStorageSet('omexo_brands', []);
          }
        } else {
          const finalBrands = brandSnap.docs.map((d) => ({ ...(d.data() as Brand), id: d.id }));
          const aestheticBrand = DEFAULT_BRANDS.find((b) => b.name === 'Omexo Aesthetic');
          if (
            shouldBootstrapAesthetic &&
            aestheticBrand &&
            !finalBrands.some((b) => b.id === aestheticBrand.id || b.name === aestheticBrand.name)
          ) {
            if (isGoogleAdmin) {
              setDoc(doc(db, 'brands', aestheticBrand.id), stripUndefined(aestheticBrand)).catch(() => {});
            }
            finalBrands.push(aestheticBrand);
          }
          setBrands(finalBrands);
          safeStorageSet('omexo_brands', finalBrands);
        }
      }

      // 4. BANNERS (Never resurrect deleted default banners)
      if (bannerResult.status === 'fulfilled') {
        const bannerSnap = bannerResult.value;
        if (bannerSnap.empty) {
          if (!alreadySeeded) {
            if (isGoogleAdmin) {
              Promise.allSettled(
                DEFAULT_BANNERS.map((b) =>
                  setDoc(
                    doc(db, 'banners', b.id || sanitizeBannerDocId(b.title, b.siteSlug)),
                    stripUndefined(b)
                  )
                )
              );
            }
            setAllBanners(DEFAULT_BANNERS);
            safeStorageSet('omexo_banners_v2', DEFAULT_BANNERS);
          } else {
            setAllBanners([]);
            safeStorageSet('omexo_banners_v2', []);
          }
        } else {
          const loadedBanners: OfferBanner[] = bannerSnap.docs.map((d) => {
            const raw = d.data() as OfferBanner;
            const inferredSlug: BrandCategorySlug =
              raw.siteSlug === 'decor' ||
              raw.siteSlug === 'essentials' ||
              raw.siteSlug === 'lifestyle' ||
              raw.siteSlug === 'aesthetic'
                ? raw.siteSlug
                : d.id.startsWith('decor_')
                ? 'decor'
                : d.id.startsWith('essentials_')
                ? 'essentials'
                : d.id.startsWith('aesthetic_')
                ? 'aesthetic'
                : 'lifestyle';
            return { ...raw, id: raw.id || d.id, siteSlug: inferredSlug };
          });
          const aestheticBanner = DEFAULT_BANNERS.find((b) => b.siteSlug === 'aesthetic');
          if (
            shouldBootstrapAesthetic &&
            aestheticBanner &&
            !loadedBanners.some((b) => b.siteSlug === 'aesthetic')
          ) {
            if (isGoogleAdmin) {
              setDoc(doc(db, 'banners', aestheticBanner.id || 'banner-aesthetic-default'), stripUndefined(aestheticBanner)).catch(() => {});
            }
            loadedBanners.push(aestheticBanner);
          }
          setAllBanners(loadedBanners);
          safeStorageSet('omexo_banners_v2', loadedBanners);
        }
      }

      // 5. LAYOUT FLAGS
      if (layoutResult.status === 'fulfilled' && layoutResult.value.exists()) {
        const layoutData = layoutResult.value.data() as {
          showCategoryBrands: boolean;
          showFeaturedGrids: boolean;
        };
        setShowCategoryBrands(layoutData.showCategoryBrands ?? true);
        setShowFeaturedGrids(layoutData.showFeaturedGrids ?? true);
        safeStorageSet('omexo_show_category_brands', layoutData.showCategoryBrands ?? true);
        safeStorageSet('omexo_show_featured_grids', layoutData.showFeaturedGrids ?? true);
      }

      // 6. REVIEWS
      if (revResult.status === 'fulfilled') {
        const revSnap = revResult.value;
        if (revSnap.empty) {
          if (!alreadySeeded && isGoogleAdmin) {
            Promise.allSettled(DEFAULT_REVIEWS.map((r) => setDoc(doc(db, 'reviews', r.id), stripUndefined(r))));
            setAllReviews(DEFAULT_REVIEWS);
            safeStorageSet('omexo_reviews', DEFAULT_REVIEWS);
          } else {
            setAllReviews([]);
            safeStorageSet('omexo_reviews', []);
          }
        } else {
          const loadedRevs: CustomerReview[] = revSnap.docs.map((d) => {
            const raw = { ...(d.data() as CustomerReview), id: d.id };
            return { ...raw, siteSlug: inferReviewSiteSlug(raw, loadedCatalog) };
          });
          if (shouldBootstrapAesthetic && !loadedRevs.some((r) => r.siteSlug === 'aesthetic')) {
            const aesRevs = SITE_BRAND_CONFIGS.aesthetic.defaultReviews;
            if (isGoogleAdmin) {
              Promise.allSettled(aesRevs.map((r) => setDoc(doc(db, 'reviews', r.id), stripUndefined(r))));
            }
            loadedRevs.push(...aesRevs);
          }
          setAllReviews(loadedRevs);
          safeStorageSet('omexo_reviews', loadedRevs);
        }
      } else {
        logFirestoreError(revResult.reason, OperationType.LIST, 'reviews');
      }

      // 7. COUPONS
      if (coupResult.status === 'fulfilled') {
        const coupSnap = coupResult.value;
        if (coupSnap.empty) {
          if (!alreadySeeded && isGoogleAdmin) {
            Promise.allSettled(DEFAULT_COUPONS.map((c) => setDoc(doc(db, 'coupons', c.id), stripUndefined(c))));
            setAllCoupons(DEFAULT_COUPONS);
            safeStorageSet('omexo_coupons_v2', DEFAULT_COUPONS);
          } else {
            setAllCoupons([]);
            safeStorageSet('omexo_coupons_v2', []);
          }
        } else {
          const loadedCoups: Coupon[] = coupSnap.docs.map((d) => {
            const raw = { ...(d.data() as Coupon), id: d.id };
            const inferred: BrandCategorySlug =
              raw.siteSlug === 'decor' ||
              raw.siteSlug === 'essentials' ||
              raw.siteSlug === 'lifestyle' ||
              raw.siteSlug === 'aesthetic'
                ? raw.siteSlug
                : raw.code.includes('DECOR')
                ? 'decor'
                : raw.code.includes('ESSENTIAL')
                ? 'essentials'
                : raw.code.includes('AESTHETIC')
                ? 'aesthetic'
                : 'lifestyle';
            return { ...raw, siteSlug: inferred };
          });
          if (shouldBootstrapAesthetic && !loadedCoups.some((c) => c.siteSlug === 'aesthetic')) {
            const aesCoups = DEFAULT_COUPONS.filter((c) => c.siteSlug === 'aesthetic');
            if (isGoogleAdmin) {
              Promise.allSettled(aesCoups.map((c) => setDoc(doc(db, 'coupons', c.id), stripUndefined(c))));
            }
            loadedCoups.push(...aesCoups);
          }
          setAllCoupons(loadedCoups);
          safeStorageSet('omexo_coupons_v2', loadedCoups);
        }
      } else {
        logFirestoreError(coupResult.reason, OperationType.LIST, 'coupons');
      }

      // 8. CMS PAGES
      if (cmsResult.status === 'fulfilled') {
        const cmsSnap = cmsResult.value;
        if (cmsSnap.empty) {
          if (!alreadySeeded) {
            if (isGoogleAdmin) {
              Promise.allSettled(
                DEFAULT_CMS_PAGES.map((page) => setDoc(doc(db, 'cmsPages', page.id), stripUndefined(page)))
              );
            }
            setAllCmsPages(DEFAULT_CMS_PAGES);
            safeStorageSet('omexo_cms_pages_v2', DEFAULT_CMS_PAGES);
          } else {
            setAllCmsPages([]);
            safeStorageSet('omexo_cms_pages_v2', []);
          }
        } else {
          const loadedCms: CMSPage[] = cmsSnap.docs.map((d) => {
            const raw = { ...(d.data() as CMSPage), id: d.id };
            const inferred: BrandCategorySlug =
              raw.siteSlug === 'decor' ||
              raw.siteSlug === 'essentials' ||
              raw.siteSlug === 'lifestyle' ||
              raw.siteSlug === 'aesthetic'
                ? raw.siteSlug
                : raw.id.startsWith('decor_')
                ? 'decor'
                : raw.id.startsWith('essentials_')
                ? 'essentials'
                : raw.id.startsWith('aesthetic_')
                ? 'aesthetic'
                : 'lifestyle';
            return { ...raw, siteSlug: inferred };
          });
          if (shouldBootstrapAesthetic && !loadedCms.some((p) => p.siteSlug === 'aesthetic')) {
            const aesPages = SITE_BRAND_CONFIGS.aesthetic.defaultCmsPages;
            if (isGoogleAdmin) {
              Promise.allSettled(aesPages.map((page) => setDoc(doc(db, 'cmsPages', page.id), stripUndefined(page))));
            }
            loadedCms.push(...aesPages);
          }
          setAllCmsPages(loadedCms);
          safeStorageSet('omexo_cms_pages_v2', loadedCms);
        }
      }

      // 9. PER-SITE PROMOS & CAMPAIGNS (Synced to both Admin and Storefront)
      const defaultPromos = createDefaultPromosMap();
      const promoResultsBySlug: Record<BrandCategorySlug, PromiseSettledResult<any>> = {
        lifestyle: promoLifeResult,
        decor: promoDecorResult,
        essentials: promoEssResult,
        aesthetic: promoAesthResult,
      };
      const nextPromosMap: SiteRecord<PromoOffer[]> = {
        lifestyle: [],
        decor: [],
        essentials: [],
        aesthetic: [],
      };
      for (const slug of BRAND_SITES) {
        const pRes = promoResultsBySlug[slug];
        if (pRes.status === 'fulfilled') {
          const pSnap = pRes.value;
          if (pSnap.empty) {
            const allowPromoSeed =
              !alreadySeeded || (slug === 'aesthetic' && shouldBootstrapAesthetic);
            if (allowPromoSeed) {
              if (isGoogleAdmin) {
                Promise.allSettled(
                  defaultPromos[slug].map((p) =>
                    setDoc(doc(db, `promos_${slug}`, p.id), stripUndefined({ ...p, siteSlug: slug }))
                  )
                );
              }
              nextPromosMap[slug] = defaultPromos[slug];
            } else {
              nextPromosMap[slug] = [];
            }
          } else {
            nextPromosMap[slug] = pSnap.docs.map((d: any) => ({
              ...(d.data() as PromoOffer),
              id: d.id,
              siteSlug: slug,
            }));
          }
          safeStorageSet(`omexo_promos_${slug}`, nextPromosMap[slug]);
        }
      }
      setPromosMap(nextPromosMap);

      // 10. PER-SITE SETTINGS, HERO, COMBO, OFFER BANNER
      const siteDocsResults = await Promise.all(
        BRAND_SITES.map(async (slug) => {
          const [sSnap, hSnap, cSnap, obSnap, legGen, legHero, legCombo, legOb] =
            await Promise.allSettled([
              getDoc(doc(db, 'settings', `site_${slug}`)),
              getDoc(doc(db, 'settings', `hero_${slug}`)),
              getDoc(doc(db, 'settings', `combo_${slug}`)),
              getDoc(doc(db, 'settings', `offerBanner_${slug}`)),
              slug === 'lifestyle' ? getDoc(doc(db, 'settings', 'general')) : Promise.resolve(null),
              slug === 'lifestyle' ? getDoc(doc(db, 'settings', 'heroConfig')) : Promise.resolve(null),
              slug === 'lifestyle' ? getDoc(doc(db, 'settings', 'comboConfig')) : Promise.resolve(null),
              slug === 'lifestyle' ? getDoc(doc(db, 'settings', 'offerBanner')) : Promise.resolve(null),
            ]);
          return { slug, sSnap, hSnap, cSnap, obSnap, legGen, legHero, legCombo, legOb };
        })
      );

      const nextSettings = createDefaultSiteSettingsMap();
      const nextHero = createDefaultHeroMap();
      const nextCombo = createDefaultComboMap();
      const nextOfferBanner = createDefaultOfferBannerMap();

      for (const item of siteDocsResults) {
        const { slug, sSnap, hSnap, cSnap, obSnap, legGen, legHero, legCombo, legOb } = item;
        const profile = getSiteBrandConfig(slug);

        const primarySettings = sSnap.status === 'fulfilled' && sSnap.value.exists() ? sSnap.value : null;
        const fallbackSettings =
          !primarySettings && legGen.status === 'fulfilled' && legGen.value && legGen.value.exists()
            ? legGen.value
            : null;
        const settingsSnap = primarySettings || fallbackSettings;

        if (settingsSnap) {
          const { merged, migrated } = normalizeStoreSettings(
            settingsSnap.data() as Partial<StoreSettings>,
            profile.defaultStoreSettings
          );
          if (slug !== 'lifestyle' && merged.storeName === 'Omexo India') {
            merged.storeName = profile.defaultStoreSettings.storeName;
          }
          nextSettings[slug] = merged;
          safeStorageSet(`omexo_store_settings_${slug}`, merged);
          if (migrated && isGoogleAdmin) {
            setDoc(doc(db, 'settings', `site_${slug}`), stripUndefined(merged), { merge: true }).catch(() => {});
          }
        } else if (isGoogleAdmin && !alreadySeeded) {
          setDoc(doc(db, 'settings', `site_${slug}`), stripUndefined(profile.defaultStoreSettings)).catch(() => {});
        }

        const primaryHero = hSnap.status === 'fulfilled' && hSnap.value.exists() ? hSnap.value : null;
        const fallbackHero =
          !primaryHero && legHero.status === 'fulfilled' && legHero.value && legHero.value.exists()
            ? legHero.value
            : null;
        const heroSnap = primaryHero || fallbackHero;

        if (heroSnap) {
          const rawHero = heroSnap.data() as HeroConfig;
          nextHero[slug] = {
            ...profile.defaultHeroConfig,
            ...rawHero,
            cardImage: isStaleDefaultAsset(rawHero.cardImage)
              ? profile.defaultHeroConfig.cardImage
              : rawHero.cardImage,
          };
          safeStorageSet(`omexo_hero_config_${slug}`, nextHero[slug]);
        } else if (isGoogleAdmin && !alreadySeeded) {
          setDoc(doc(db, 'settings', `hero_${slug}`), stripUndefined(profile.defaultHeroConfig)).catch(() => {});
        }

        const primaryCombo = cSnap.status === 'fulfilled' && cSnap.value.exists() ? cSnap.value : null;
        const fallbackCombo =
          !primaryCombo && legCombo.status === 'fulfilled' && legCombo.value && legCombo.value.exists()
            ? legCombo.value
            : null;
        const comboSnap = primaryCombo || fallbackCombo;

        if (comboSnap) {
          const rawCombo = comboSnap.data() as ComboConfig;
          nextCombo[slug] = {
            ...profile.defaultComboConfig,
            ...rawCombo,
            card1Image: isStaleDefaultAsset(rawCombo.card1Image)
              ? profile.defaultComboConfig.card1Image
              : rawCombo.card1Image,
            card2Image: isStaleDefaultAsset(rawCombo.card2Image)
              ? profile.defaultComboConfig.card2Image
              : rawCombo.card2Image,
          };
          safeStorageSet(`omexo_combo_config_${slug}`, nextCombo[slug]);
        } else if (isGoogleAdmin && !alreadySeeded) {
          setDoc(doc(db, 'settings', `combo_${slug}`), stripUndefined(profile.defaultComboConfig)).catch(() => {});
        }

        const primaryOb = obSnap.status === 'fulfilled' && obSnap.value.exists() ? obSnap.value : null;
        const fallbackOb =
          !primaryOb && legOb.status === 'fulfilled' && legOb.value && legOb.value.exists()
            ? legOb.value
            : null;
        const obSnapFinal = primaryOb || fallbackOb;

        if (obSnapFinal) {
          const rawOb = obSnapFinal.data() as OfferBanner;
          nextOfferBanner[slug] = {
            ...profile.defaultOfferBanner,
            ...rawOb,
            siteSlug: slug,
            imageUrl: isStaleDefaultAsset(rawOb.imageUrl)
              ? profile.defaultOfferBanner.imageUrl
              : rawOb.imageUrl,
            backgroundImageUrl: isStaleDefaultAsset(rawOb.backgroundImageUrl)
              ? profile.defaultOfferBanner.backgroundImageUrl
              : rawOb.backgroundImageUrl,
          };
          safeStorageSet(`omexo_offer_banner_${slug}`, nextOfferBanner[slug]);
        }
      }

      setSiteSettingsMap(nextSettings);
      setHeroMap(nextHero);
      setComboMap(nextCombo);
      setOfferBannerMap(nextOfferBanner);

      // 11. ADMIN-ONLY DATA (Orders + Per-Site Telegram requires Google Auth omexoofficial@gmail.com)
      if (isGoogleAdmin) {
        const [ordersRes, ...tgResList] = await Promise.allSettled([
          getDocs(collection(db, 'orders')),
          ...BRAND_SITES.map((slug) => getDoc(doc(db, 'settings', `telegram_${slug}`))),
          getDoc(doc(db, 'settings', 'telegram')),
        ]);

        if (ordersRes.status === 'fulfilled') {
          const orderSnap = ordersRes.value;
          if (!orderSnap.empty) {
            const finalOrders = orderSnap.docs.map((d) => d.data() as Order);
            finalOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(finalOrders);
          } else {
            setOrders([]);
          }
        } else {
          logFirestoreError(ordersRes.reason, OperationType.LIST, 'orders');
        }

        const nextTelegram = createDefaultTelegramMap();
        BRAND_SITES.forEach((slug, idx) => {
          const res = tgResList[idx];
          if (res && res.status === 'fulfilled' && res.value.exists()) {
            nextTelegram[slug] = res.value.data() as TelegramConfig;
          }
        });
        const legacyTgRes = tgResList[BRAND_SITES.length];
        if (
          !nextTelegram.lifestyle.botToken &&
          legacyTgRes &&
          legacyTgRes.status === 'fulfilled' &&
          legacyTgRes.value.exists()
        ) {
          nextTelegram.lifestyle = legacyTgRes.value.data() as TelegramConfig;
        }
        setTelegramMap(nextTelegram);
      } else {
        setOrders([]);
        setTelegramMap(createDefaultTelegramMap());
      }
    } catch (err) {
      logFirestoreError(err, OperationType.GET, 'store-init');
    } finally {
      setIsLoadingDb(false);
    }
  }, [isAuthReady, isGoogleAdmin, safeStorageSet]);

  useEffect(() => {
    if (!isAuthReady) return;
    syncFromFirestore();
  }, [isAuthReady, syncFromFirestore]);

  // Cross-tab & focus synchronization so Admin edits immediately appear on open Storefront tabs
  useEffect(() => {
    const handleStorageSync = (e: StorageEvent) => {
      if (!e.key || e.newValue === null) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (e.key === 'omexo_products' && Array.isArray(parsed)) {
          setProducts(parsed.map(normalizeProductRecord));
        } else if (e.key === 'omexo_categories' && Array.isArray(parsed)) {
          setCategories(normalizeCategoryList(parsed));
        } else if (e.key === 'omexo_brands' && Array.isArray(parsed)) {
          setBrands(parsed);
        } else if (e.key === 'omexo_banners_v2' && Array.isArray(parsed)) {
          setAllBanners(parsed);
        } else if (e.key === 'omexo_reviews' && Array.isArray(parsed)) {
          setAllReviews(parsed);
        } else if (e.key === 'omexo_coupons_v2' && Array.isArray(parsed)) {
          setAllCoupons(parsed);
        } else if (e.key === 'omexo_cms_pages_v2' && Array.isArray(parsed)) {
          setAllCmsPages(parsed);
        } else {
          for (const slug of BRAND_SITES) {
            if (e.key === `omexo_promos_${slug}` && Array.isArray(parsed)) {
              setPromosMap((prev) => ({ ...prev, [slug]: parsed }));
            } else if (e.key === `omexo_hero_config_${slug}`) {
              setHeroMap((prev) => ({ ...prev, [slug]: parsed }));
            } else if (e.key === `omexo_combo_config_${slug}`) {
              setComboMap((prev) => ({ ...prev, [slug]: parsed }));
            } else if (e.key === `omexo_store_settings_${slug}`) {
              setSiteSettingsMap((prev) => ({ ...prev, [slug]: parsed }));
            } else if (e.key === `omexo_offer_banner_${slug}`) {
              setOfferBannerMap((prev) => ({ ...prev, [slug]: parsed }));
            }
          }
        }
      } catch {
        // ignore storage parse failure
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastSyncRef.current > 2000) {
        syncFromFirestore();
      }
    };

    window.addEventListener('storage', handleStorageSync);
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    return () => {
      window.removeEventListener('storage', handleStorageSync);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [syncFromFirestore]);

  // Persist per-site carts to localStorage
  useEffect(() => {
    for (const slug of BRAND_SITES) {
      try {
        localStorage.setItem(`omexo_cart_${slug}`, JSON.stringify(cartsMap[slug]));
      } catch {
        // Ignore storage quota errors
      }
    }
  }, [cartsMap]);

  // Active site scoped data views
  const siteProducts = useMemo(
    () => products.filter((p) => (p.categorySlug || resolveCategorySlug(p.category)) === activeSite),
    [products, activeSite]
  );

  const siteOrders = useMemo(
    () => orders.filter((o) => getOrderBrandSlugs(o, products).includes(activeSite)),
    [orders, products, activeSite]
  );

  const banners = useMemo(
    () => allBanners.filter((b) => (b.siteSlug || 'lifestyle') === activeSite),
    [allBanners, activeSite]
  );

  const reviews = useMemo(
    () => allReviews.filter((r) => (r.siteSlug || inferReviewSiteSlug(r, products)) === activeSite),
    [allReviews, products, activeSite]
  );

  const coupons = useMemo(
    () => allCoupons.filter((c) => (c.siteSlug || 'lifestyle') === activeSite),
    [allCoupons, activeSite]
  );

  const cmsPages = useMemo(
    () => allCmsPages.filter((p) => (p.siteSlug || 'lifestyle') === activeSite),
    [allCmsPages, activeSite]
  );

  const promos = useMemo(() => promosMap[activeSite] || [], [promosMap, activeSite]);

  const cart = cartsMap[activeSite] || [];
  const storeSettings = siteSettingsMap[activeSite];
  const heroConfig = heroMap[activeSite];
  const comboConfig = comboMap[activeSite];
  const offerBanner = offerBannerMap[activeSite];
  const telegramConfig = telegramMap[activeSite];

  // Category Actions
  const addCategory = async (newCat: Omit<Category, 'id'>) => {
    const id = 'cat-' + Date.now();
    const payload = stripUndefined({ ...newCat, id });
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'categories', id), payload);
      }
      setCategories((prev) => {
        const next = [...prev, payload];
        safeStorageSet('omexo_categories', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.CREATE, `categories/${id}`);
      throw err;
    }
  };

  const updateCategory = async (updatedCat: Category) => {
    const payload = stripUndefined(updatedCat);
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'categories', payload.id), payload);
      }
      setCategories((prev) => {
        const next = prev.map((c) => (c.id === payload.id ? payload : c));
        safeStorageSet('omexo_categories', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `categories/${payload.id}`);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await deleteDoc(doc(db, 'categories', id));
      }
      setCategories((prev) => {
        const next = prev.filter((c) => c.id !== id);
        safeStorageSet('omexo_categories', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `categories/${id}`);
      throw err;
    }
  };

  // Brand Actions
  const addBrand = async (newBrand: Omit<Brand, 'id'>) => {
    const id = 'brand-' + Date.now();
    const payload = stripUndefined({ ...newBrand, id });
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'brands', id), payload);
      }
      setBrands((prev) => {
        const next = [...prev, payload];
        safeStorageSet('omexo_brands', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.CREATE, `brands/${id}`);
      throw err;
    }
  };

  const deleteBrand = async (id: string) => {
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await deleteDoc(doc(db, 'brands', id));
      }
      setBrands((prev) => {
        const next = prev.filter((b) => b.id !== id);
        safeStorageSet('omexo_brands', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `brands/${id}`);
      throw err;
    }
  };

  // Banner Actions (strictly scoped by siteSlug)
  const addBanner = async (newBanner: OfferBanner, targetSite: BrandCategorySlug = activeSite) => {
    const docId = sanitizeBannerDocId(newBanner.title, targetSite);
    const payload = stripUndefined<OfferBanner>({ ...newBanner, id: docId, siteSlug: targetSite });
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'banners', docId), payload);
      }
      setAllBanners((prev) => {
        const next = [...prev, payload];
        safeStorageSet('omexo_banners_v2', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.CREATE, `banners/${docId}`);
      throw err;
    }
  };

  const updateBanner = async (
    bannerIdOrIdx: string | number,
    updatedBanner: OfferBanner,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    const siteList = allBanners.filter((b) => (b.siteSlug || 'lifestyle') === targetSite);
    const targetObj =
      typeof bannerIdOrIdx === 'number'
        ? siteList[bannerIdOrIdx]
        : allBanners.find((b) => b.id === bannerIdOrIdx);

    const docId = targetObj?.id || sanitizeBannerDocId(updatedBanner.title, targetSite);
    const payload = stripUndefined<OfferBanner>({ ...updatedBanner, id: docId, siteSlug: targetSite });
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'banners', docId), payload);
      }
      setAllBanners((prev) => {
        const next = prev.map((b) => (b.id === targetObj?.id || b === targetObj ? payload : b));
        safeStorageSet('omexo_banners_v2', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `banners/${docId}`);
      throw err;
    }
  };

  const deleteBanner = async (
    bannerIdOrIdx: string | number,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    const siteList = allBanners.filter((b) => (b.siteSlug || 'lifestyle') === targetSite);
    const targetObj =
      typeof bannerIdOrIdx === 'number'
        ? siteList[bannerIdOrIdx]
        : allBanners.find((b) => b.id === bannerIdOrIdx);

    if (targetObj) {
      const docId = targetObj.id || sanitizeBannerDocId(targetObj.title, targetSite);
      markSeedInitialized();
      try {
        if (isGoogleAdmin) {
          await deleteDoc(doc(db, 'banners', docId));
        }
        setAllBanners((prev) => {
          const next = prev.filter((b) => b !== targetObj && b.id !== targetObj.id);
          safeStorageSet('omexo_banners_v2', next);
          return next;
        });
      } catch (err) {
        logFirestoreError(err, OperationType.DELETE, `banners/${docId}`);
        throw err;
      }
    }
  };

  // Promo Campaign Actions (synced with promos_${siteSlug} + Storefront)
  const addPromo = async (
    newPromo: Omit<PromoOffer, 'id'> & { id?: string },
    targetSite: BrandCategorySlug = activeSite
  ) => {
    const promoId = newPromo.id || `${targetSite}-promo-${Date.now()}`;
    const payload = stripUndefined<PromoOffer>({ ...newPromo, id: promoId, siteSlug: targetSite });
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, `promos_${targetSite}`, promoId), payload);
      }
      setPromosMap((prev) => {
        const nextList = [payload, ...(prev[targetSite] || []).filter((p) => p.id !== promoId)];
        safeStorageSet(`omexo_promos_${targetSite}`, nextList);
        return { ...prev, [targetSite]: nextList };
      });
    } catch (err) {
      logFirestoreError(err, OperationType.CREATE, `promos_${targetSite}/${promoId}`);
      throw err;
    }
  };

  const updatePromo = async (
    updatedPromo: PromoOffer,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    const payload = stripUndefined<PromoOffer>({ ...updatedPromo, siteSlug: targetSite });
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, `promos_${targetSite}`, payload.id), payload);
      }
      setPromosMap((prev) => {
        const nextList = (prev[targetSite] || []).map((p) => (p.id === payload.id ? payload : p));
        safeStorageSet(`omexo_promos_${targetSite}`, nextList);
        return { ...prev, [targetSite]: nextList };
      });
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `promos_${targetSite}/${payload.id}`);
      throw err;
    }
  };

  const deletePromo = async (id: string, targetSite: BrandCategorySlug = activeSite) => {
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await deleteDoc(doc(db, `promos_${targetSite}`, id));
      }
      setPromosMap((prev) => {
        const nextList = (prev[targetSite] || []).filter((p) => p.id !== id);
        safeStorageSet(`omexo_promos_${targetSite}`, nextList);
        return { ...prev, [targetSite]: nextList };
      });
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `promos_${targetSite}/${id}`);
      throw err;
    }
  };

  // Product Actions
  const addProduct = async (newProduct: Omit<Product, 'id'>) => {
    const id = 'product-' + Date.now();
    const payload = stripUndefined(normalizeProductRecord({ ...newProduct, id }));
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'products', id), payload);
      }
      setProducts((prev) => {
        const next = [...prev, payload];
        safeStorageSet('omexo_products', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.CREATE, `products/${id}`);
      throw err;
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    const normalized = stripUndefined(normalizeProductRecord(updatedProduct));
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'products', normalized.id), normalized);
      }
      setProducts((prev) => {
        const next = prev.map((p) => (p.id === normalized.id ? normalized : p));
        safeStorageSet('omexo_products', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `products/${normalized.id}`);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await deleteDoc(doc(db, 'products', id));
      }
      setProducts((prev) => {
        const next = prev.filter((p) => p.id !== id);
        safeStorageSet('omexo_products', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `products/${id}`);
      throw err;
    }
  };

  const deleteProductsBulk = async (ids: string[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await Promise.all(ids.map((id) => deleteDoc(doc(db, 'products', id))));
      }
      setProducts((prev) => {
        const next = prev.filter((p) => !idSet.has(p.id));
        safeStorageSet('omexo_products', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `products/bulk`);
      throw err;
    }
  };

  // Cart actions (per-site cart isolation)
  const addToCart = (product: Product, quantity = 1, targetSite: BrandCategorySlug = activeSite) => {
    trackAddToCart(product, quantity);
    setCartsMap((prev) => {
      const currentCart = prev[targetSite] || [];
      const existing = currentCart.find((item) => item.product.id === product.id);
      const nextSiteCart = existing
        ? currentCart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: Math.min(product.stockCount, item.quantity + quantity) }
              : item
          )
        : [...currentCart, { product, quantity: Math.min(product.stockCount, quantity) }];
      return { ...prev, [targetSite]: nextSiteCart };
    });
  };

  const removeFromCart = (productId: string, targetSite: BrandCategorySlug = activeSite) => {
    setCartsMap((prev) => ({
      ...prev,
      [targetSite]: (prev[targetSite] || []).filter((item) => item.product.id !== productId),
    }));
  };

  const updateCartQuantity = (
    productId: string,
    quantity: number,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, targetSite);
      return;
    }
    setCartsMap((prev) => ({
      ...prev,
      [targetSite]: (prev[targetSite] || []).map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(item.product.stockCount, quantity) }
          : item
      ),
    }));
  };

  const clearCart = (targetSite: BrandCategorySlug = activeSite) => {
    setCartsMap((prev) => ({ ...prev, [targetSite]: [] }));
  };

  // Server-side Telegram Notifications
  const sendTelegramAlert = async (order: Order) => {
    try {
      await fetch('/api/notify/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          siteSlug: order.siteSlug,
          totalAmount: order.totalAmount,
          paymentType: order.paymentType,
          paymentStatus: order.paymentStatus,
          itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
        }),
      });
    } catch (err) {
      console.error('Failed to dispatch server Telegram notification:', err);
    }
  };

  // Order actions
  const createOrder = async (
    customerDetails: {
      name: string;
      email: string;
      phone: string;
      address: string;
      pincode: string;
      paymentType: 'COD' | 'Online';
    },
    discountAmount = 0,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    const siteCart = cartsMap[targetSite] || [];
    if (siteCart.length === 0) {
      throw new Error('Cart is empty');
    }

    const subtotal = siteCart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
    const totalAmount = Math.max(0, subtotal - discountAmount);
    const orderItems: OrderItem[] = siteCart.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      category: getCanonicalCategoryName(item.product.categorySlug || item.product.category),
      categorySlug: item.product.categorySlug || resolveCategorySlug(item.product.category) || targetSite,
      price: item.product.salePrice,
      quantity: item.quantity,
      image: item.product.images[0],
    }));

    const newOrder: Order = {
      id: 'OMX-' + Math.floor(100000 + Math.random() * 900000),
      siteSlug: targetSite,
      customerName: customerDetails.name.trim(),
      customerEmail: (customerDetails.email || 'customer@omexo.in').trim(),
      customerPhone: customerDetails.phone.trim(),
      address: customerDetails.address.trim(),
      pincode: customerDetails.pincode.trim(),
      items: orderItems,
      totalAmount,
      paymentType: customerDetails.paymentType,
      paymentStatus: customerDetails.paymentType === 'Online' ? 'Paid' : 'Pending',
      orderStatus: 'Pending',
      createdAt: new Date().toISOString(),
    };

    const trackingProjection = {
      id: newOrder.id,
      siteSlug: targetSite,
      orderStatus: newOrder.orderStatus,
      paymentType: newOrder.paymentType,
      paymentStatus: newOrder.paymentStatus,
      totalAmount: newOrder.totalAmount,
      createdAt: newOrder.createdAt,
      itemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
    };

    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
      await setDoc(doc(db, 'orderTracking', newOrder.id), trackingProjection);

      const nextProducts = products.map((prod) => {
        const cartItem = siteCart.find((item) => item.product.id === prod.id);
        if (cartItem) {
          const nextStock = Math.max(0, Math.floor(prod.stockCount - cartItem.quantity));
          updateDoc(doc(db, 'products', prod.id), { stockCount: nextStock }).catch((stockErr) => {
            logFirestoreError(stockErr, OperationType.UPDATE, `products/${prod.id}`);
          });
          return { ...prod, stockCount: nextStock };
        }
        return prod;
      });
      setProducts(nextProducts);
      localStorage.setItem('omexo_products', JSON.stringify(nextProducts));
    } catch (err) {
      logFirestoreError(err, OperationType.CREATE, `orders/${newOrder.id}`);
      throw err;
    }

    if (isAdminUser) {
      setOrders((prev) => [newOrder, ...prev]);
    }

    clearCart(targetSite);
    trackPurchase(newOrder.id, siteCart, totalAmount);
    sendTelegramAlert(newOrder);

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, consignmentNumber?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updated = { ...order, orderStatus: status };
          if (consignmentNumber !== undefined) {
            updated.consignmentNumber = consignmentNumber;
          }
          return updated;
        }
        return order;
      })
    );

    const fieldsToUpdate: Partial<Order> = { orderStatus: status };
    if (consignmentNumber !== undefined) {
      fieldsToUpdate.consignmentNumber = consignmentNumber;
    }
    try {
      if (isGoogleAdmin) {
        await updateDoc(doc(db, 'orders', orderId), fieldsToUpdate);
        await setDoc(doc(db, 'orderTracking', orderId), fieldsToUpdate, { merge: true });
      }
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      throw err;
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
    try {
      if (isGoogleAdmin) {
        await Promise.all([
          deleteDoc(doc(db, 'orders', orderId)),
          deleteDoc(doc(db, 'orderTracking', orderId)),
        ]);
      }
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
      throw err;
    }
  };

  const deleteOrdersBulk = async (orderIds: string[]) => {
    if (orderIds.length === 0) return;
    const idSet = new Set(orderIds);
    setOrders((prev) => prev.filter((order) => !idSet.has(order.id)));
    try {
      if (isGoogleAdmin) {
        await Promise.all(
          orderIds.flatMap((id) => [
            deleteDoc(doc(db, 'orders', id)),
            deleteDoc(doc(db, 'orderTracking', id)),
          ])
        );
      }
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `orders/bulk`);
      throw err;
    }
  };

  // Per-site Telegram config
  const updateTelegramConfig = async (
    newConfig: TelegramConfig,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    setTelegramMap((prev) => ({ ...prev, [targetSite]: newConfig }));
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'settings', `telegram_${targetSite}`), newConfig);
      }
    } catch (err) {
      logFirestoreError(err, OperationType.WRITE, `settings/telegram_${targetSite}`);
      throw err;
    }
  };

  const updateOfferBanner = async (
    newBanner: OfferBanner,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    const payload = stripUndefined({ ...newBanner, siteSlug: targetSite });
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'settings', `offerBanner_${targetSite}`), payload);
      }
      setOfferBannerMap((prev) => ({ ...prev, [targetSite]: payload }));
      safeStorageSet(`omexo_offer_banner_${targetSite}`, payload);
    } catch (err) {
      logFirestoreError(err, OperationType.WRITE, `settings/offerBanner_${targetSite}`);
      throw err;
    }
  };

  const updateHeroConfig = async (
    newHero: HeroConfig,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    const payload = stripUndefined(newHero);
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'settings', `hero_${targetSite}`), payload);
      }
      setHeroMap((prev) => ({ ...prev, [targetSite]: payload }));
      safeStorageSet(`omexo_hero_config_${targetSite}`, payload);
    } catch (err) {
      logFirestoreError(err, OperationType.WRITE, `settings/hero_${targetSite}`);
      throw err;
    }
  };

  const updateComboConfig = async (
    newCombo: ComboConfig,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    const payload = stripUndefined(newCombo);
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'settings', `combo_${targetSite}`), payload);
      }
      setComboMap((prev) => ({ ...prev, [targetSite]: payload }));
      safeStorageSet(`omexo_combo_config_${targetSite}`, payload);
    } catch (err) {
      logFirestoreError(err, OperationType.WRITE, `settings/combo_${targetSite}`);
      throw err;
    }
  };

  // Review Actions (public submissions tagged with siteSlug and Pending moderation)
  const addReview = async (
    newRev: Omit<CustomerReview, 'id' | 'date'>,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    const id = 'rev-' + Date.now();
    const dateStr = new Date().toLocaleDateString('en-GB');
    const payload = stripUndefined<CustomerReview>({
      ...newRev,
      id,
      siteSlug: newRev.siteSlug || targetSite,
      date: dateStr,
      status: isGoogleAdmin ? newRev.status : 'Pending',
    });
    markSeedInitialized();
    try {
      await setDoc(doc(db, 'reviews', id), payload);
      if (payload.status === 'Approved' || isGoogleAdmin) {
        setAllReviews((prev) => {
          const next = [payload, ...prev];
          safeStorageSet('omexo_reviews', next);
          return next;
        });
      }
    } catch (err) {
      logFirestoreError(err, OperationType.CREATE, `reviews/${id}`);
      throw err;
    }
  };

  const updateReviewStatus = async (id: string, status: 'Approved' | 'Pending') => {
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await updateDoc(doc(db, 'reviews', id), { status });
      }
      setAllReviews((prev) => {
        const next = prev.map((r) => (r.id === id ? { ...r, status } : r));
        safeStorageSet('omexo_reviews', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `reviews/${id}`);
      throw err;
    }
  };

  const deleteReview = async (id: string) => {
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await deleteDoc(doc(db, 'reviews', id));
      }
      setAllReviews((prev) => {
        const next = prev.filter((r) => r.id !== id);
        safeStorageSet('omexo_reviews', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `reviews/${id}`);
      throw err;
    }
  };

  // Coupon Actions (scoped per siteSlug)
  const addCoupon = async (newCoup: Omit<Coupon, 'id'>, targetSite: BrandCategorySlug = activeSite) => {
    const id = 'coup-' + Date.now();
    const payload = stripUndefined<Coupon>({ ...newCoup, siteSlug: newCoup.siteSlug || targetSite, id });
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'coupons', id), payload);
      }
      setAllCoupons((prev) => {
        const next = [...prev, payload];
        safeStorageSet('omexo_coupons_v2', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.CREATE, `coupons/${id}`);
      throw err;
    }
  };

  const deleteCoupon = async (id: string) => {
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await deleteDoc(doc(db, 'coupons', id));
      }
      setAllCoupons((prev) => {
        const next = prev.filter((c) => c.id !== id);
        safeStorageSet('omexo_coupons_v2', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `coupons/${id}`);
      throw err;
    }
  };

  // CMS Page Actions
  const updateCMSPage = async (updatedPage: CMSPage) => {
    const payload = stripUndefined(updatedPage);
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'cmsPages', payload.id), payload);
      }
      setAllCmsPages((prev) => {
        const exists = prev.some((p) => p.id === payload.id);
        const next = exists
          ? prev.map((p) => (p.id === payload.id ? payload : p))
          : [...prev, payload];
        safeStorageSet('omexo_cms_pages_v2', next);
        return next;
      });
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `cmsPages/${payload.id}`);
      throw err;
    }
  };

  // Store Settings Actions (strictly per siteSlug!)
  const updateStoreSettings = async (
    newSettings: StoreSettings,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    const defaults = getSiteBrandConfig(targetSite).defaultStoreSettings;
    const merged: StoreSettings = stripUndefined({ ...defaults, ...newSettings });
    markSeedInitialized();
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'settings', `site_${targetSite}`), merged, { merge: true });
      }
      setSiteSettingsMap((prev) => ({ ...prev, [targetSite]: merged }));
      safeStorageSet(`omexo_store_settings_${targetSite}`, merged);
    } catch (err) {
      logFirestoreError(err, 'write', `settings/site_${targetSite}`);
      throw err;
    }
  };

  // Layout Controls
  const handleSetShowCategoryBrands = async (val: boolean) => {
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'settings', 'layout'), { showCategoryBrands: val, showFeaturedGrids }, { merge: true });
      }
      setShowCategoryBrands(val);
      safeStorageSet('omexo_show_category_brands', val);
    } catch (err) {
      logFirestoreError(err, OperationType.WRITE, 'settings/layout');
      throw err;
    }
  };

  const handleSetShowFeaturedGrids = async (val: boolean) => {
    try {
      if (isGoogleAdmin) {
        await setDoc(doc(db, 'settings', 'layout'), { showCategoryBrands, showFeaturedGrids: val }, { merge: true });
      }
      setShowFeaturedGrids(val);
      safeStorageSet('omexo_show_featured_grids', val);
    } catch (err) {
      logFirestoreError(err, OperationType.WRITE, 'settings/layout');
      throw err;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        activeSite,
        products,
        siteProducts,
        orders,
        siteOrders,
        cart,
        telegramConfig,
        offerBanner,
        categories,
        brands,
        banners,
        allBanners,
        heroConfig,
        comboConfig,
        reviews,
        allReviews,
        coupons,
        allCoupons,
        cmsPages,
        allCmsPages,
        promos,
        storeSettings,
        getStoreSettingsForSite: (site) => siteSettingsMap[site],
        getHeroConfigForSite: (site) => heroMap[site],
        getComboConfigForSite: (site) => comboMap[site],
        getTelegramConfigForSite: (site) => telegramMap[site],
        getOfferBannerForSite: (site) => offerBannerMap[site],
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedBrand,
        setSelectedBrand,
        addProduct,
        updateProduct,
        deleteProduct,
        deleteProductsBulk,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        deleteOrdersBulk,
        updateTelegramConfig,
        updateOfferBanner,
        updateHeroConfig,
        updateComboConfig,
        addCategory,
        updateCategory,
        deleteCategory,
        addBrand,
        deleteBrand,
        addBanner,
        updateBanner,
        deleteBanner,
        addPromo,
        updatePromo,
        deletePromo,
        addReview,
        updateReviewStatus,
        deleteReview,
        addCoupon,
        deleteCoupon,
        updateCMSPage,
        updateStoreSettings,
        refreshStore: syncFromFirestore,
        showCategoryBrands,
        setShowCategoryBrands: handleSetShowCategoryBrands,
        showFeaturedGrids,
        setShowFeaturedGrids: handleSetShowFeaturedGrids,
        isLoadingDb,
        authUser,
        isGoogleAdmin,
        isCredentialAdmin,
        isAdminUser,
        adminRole,
        adminDisplayName,
        serverAdminToken,
        isAuthReady,
        loginWithAdminCredentials,
        logoutAdmin,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
