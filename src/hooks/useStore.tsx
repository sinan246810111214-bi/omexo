import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  StoreSettings,
} from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { auth, db, onAuthStateChanged, User } from '../lib/firebase';
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
  addReview: (review: Omit<CustomerReview, 'id' | 'date'>, targetSite?: BrandCategorySlug) => Promise<void>;
  updateReviewStatus: (id: string, status: 'Approved' | 'Pending') => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  addCoupon: (coupon: Omit<Coupon, 'id'>, targetSite?: BrandCategorySlug) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  updateCMSPage: (page: CMSPage) => Promise<void>;
  updateStoreSettings: (settings: StoreSettings, targetSite?: BrandCategorySlug) => Promise<void>;
  showCategoryBrands: boolean;
  setShowCategoryBrands: (val: boolean) => void;
  showFeaturedGrids: boolean;
  setShowFeaturedGrids: (val: boolean) => void;
  isLoadingDb: boolean;
  authUser: User | null;
  isAdminUser: boolean;
  adminRole: AdminRole;
  isAuthReady: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Category[] = DEFAULT_BRAND_CATEGORIES;

const DEFAULT_BRANDS: Brand[] = [
  { id: 'brand-1', name: 'Omexo Decor' },
  { id: 'brand-2', name: 'Omexo Essentials' },
  { id: 'brand-3', name: 'Omexo Lifestyle' },
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
];

const DEFAULT_CMS_PAGES: CMSPage[] = BRAND_SITES.flatMap(
  (slug) => SITE_BRAND_CONFIGS[slug].defaultCmsPages
);

function createDefaultSiteSettingsMap(): SiteRecord<StoreSettings> {
  return {
    lifestyle: { ...SITE_BRAND_CONFIGS.lifestyle.defaultStoreSettings },
    decor: { ...SITE_BRAND_CONFIGS.decor.defaultStoreSettings },
    essentials: { ...SITE_BRAND_CONFIGS.essentials.defaultStoreSettings },
  };
}

function createDefaultHeroMap(): SiteRecord<HeroConfig> {
  return {
    lifestyle: { ...SITE_BRAND_CONFIGS.lifestyle.defaultHeroConfig },
    decor: { ...SITE_BRAND_CONFIGS.decor.defaultHeroConfig },
    essentials: { ...SITE_BRAND_CONFIGS.essentials.defaultHeroConfig },
  };
}

function createDefaultComboMap(): SiteRecord<ComboConfig> {
  return {
    lifestyle: { ...SITE_BRAND_CONFIGS.lifestyle.defaultComboConfig },
    decor: { ...SITE_BRAND_CONFIGS.decor.defaultComboConfig },
    essentials: { ...SITE_BRAND_CONFIGS.essentials.defaultComboConfig },
  };
}

function createDefaultOfferBannerMap(): SiteRecord<OfferBanner> {
  return {
    lifestyle: { ...SITE_BRAND_CONFIGS.lifestyle.defaultOfferBanner },
    decor: { ...SITE_BRAND_CONFIGS.decor.defaultOfferBanner },
    essentials: { ...SITE_BRAND_CONFIGS.essentials.defaultOfferBanner },
  };
}

function createDefaultTelegramMap(): SiteRecord<TelegramConfig> {
  return {
    lifestyle: { botToken: '', chatId: '' },
    decor: { botToken: '', chatId: '' },
    essentials: { botToken: '', chatId: '' },
  };
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
  } else {
    const resolved = resolveCategorySlug(prod.categorySlug || prod.category);
    lockedSlug = resolved && resolved !== 'All' ? resolved : 'lifestyle';
  }

  const canonicalCategory = getCanonicalCategoryName(lockedSlug);
  const initialMatch = INITIAL_PRODUCTS.find((p) => p.id === prod.id);
  const hasStaleImage = !prod.images?.length || prod.images.some(isStaleDefaultAsset);

  return {
    ...prod,
    category: canonicalCategory === 'All' ? 'Omexo Lifestyle' : canonicalCategory,
    categorySlug: lockedSlug,
    images: hasStaleImage && initialMatch ? initialMatch.images : prod.images,
  };
}

function normalizeCategoryList(rawCategories: Category[]): Category[] {
  const legacyIds = new Set(['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5']);
  const customCategories = rawCategories.filter(
    (c) =>
      !legacyIds.has(c.id) &&
      !DEFAULT_BRAND_CATEGORIES.some(
        (def) => def.id === c.id || def.name.toLowerCase() === c.name.toLowerCase()
      )
  );
  const mergedDefaults = DEFAULT_BRAND_CATEGORIES.map((def) => {
    const existing = rawCategories.find(
      (c) => c.id === def.id || c.name.toLowerCase() === def.name.toLowerCase()
    );
    if (existing) {
      return {
        ...def,
        ...existing,
        name: def.name,
        slug: def.slug,
        image: isStaleDefaultAsset(existing.image) ? def.image : existing.image,
      };
    }
    return def;
  });
  return [...mergedDefaults, ...customCategories];
}

function inferReviewSiteSlug(rev: CustomerReview, allProducts: Product[]): BrandCategorySlug {
  if (rev.siteSlug === 'decor' || rev.siteSlug === 'essentials' || rev.siteSlug === 'lifestyle') {
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

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSite, setActiveSite] = useState<BrandCategorySlug>(() => parseHash().siteSlug);

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('omexo_products');
    if (saved) {
      const parsed = (JSON.parse(saved) as Product[]).map(normalizeProductRecord);
      const missingInitials = INITIAL_PRODUCTS.filter((init) => !parsed.some((p) => p.id === init.id));
      return [...parsed, ...missingInitials];
    }
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('omexo_categories');
    return saved ? normalizeCategoryList(JSON.parse(saved)) : DEFAULT_CATEGORIES;
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem('omexo_brands');
    return saved ? JSON.parse(saved) : DEFAULT_BRANDS;
  });

  const [allBanners, setAllBanners] = useState<OfferBanner[]>(() => {
    const saved = localStorage.getItem('omexo_banners_v2');
    return saved ? JSON.parse(saved) : DEFAULT_BANNERS;
  });

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

  const [allReviews, setAllReviews] = useState<CustomerReview[]>(() => {
    const saved = localStorage.getItem('omexo_reviews');
    return saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
  });

  const [allCoupons, setAllCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('omexo_coupons_v2');
    return saved ? JSON.parse(saved) : DEFAULT_COUPONS;
  });

  const [allCmsPages, setAllCmsPages] = useState<CMSPage[]>(() => {
    const saved = localStorage.getItem('omexo_cms_pages_v2');
    return saved ? JSON.parse(saved) : DEFAULT_CMS_PAGES;
  });

  const [orders, setOrders] = useState<Order[]>([]);

  const [cartsMap, setCartsMap] = useState<SiteRecord<CartItem[]>>(() => {
    const map: SiteRecord<CartItem[]> = { lifestyle: [], decor: [], essentials: [] };
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

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const isAdminUser = Boolean(authUser && authUser.emailVerified && isAuthorizedAdminEmail(authUser.email));
  const adminRole: AdminRole = isAdminUser ? getAdminRoleForEmail(authUser?.email) : 'Staff';

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

  // Track Firebase Auth state and clear sensitive caches when unauthenticated
  useEffect(() => {
    localStorage.removeItem('omexo_telegram_config');
    localStorage.removeItem('omexo_orders');
    localStorage.removeItem('omexo_admin_logged_in');
    localStorage.removeItem('omexo_admin_role');

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setIsAuthReady(true);
      if (!user || !user.emailVerified || !isAuthorizedAdminEmail(user.email)) {
        setOrders([]);
        setTelegramMap(createDefaultTelegramMap());
      }
    });
    return () => unsubscribe();
  }, []);

  // Load Public Storefront & Admin-Protected Collections from Firebase Firestore in parallel
  useEffect(() => {
    if (!isAuthReady) return;
    let isCancelled = false;

    const safeStorageSet = (key: string, value: unknown) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Ignore storage quota / private-browsing errors
      }
    };

    const initDb = async () => {
      try {
        // Immediate UI hydration from localStorage/defaults is already ready; keep background sync fast
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
        ] = await Promise.allSettled([
          getDocFromServer(doc(db, 'test', 'connection')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'categories')),
          getDocs(collection(db, 'brands')),
          getDocs(collection(db, 'banners')),
          getDoc(doc(db, 'settings', 'layout')),
          getDocs(
            isAdminUser
              ? collection(db, 'reviews')
              : query(collection(db, 'reviews'), where('status', '==', 'Approved'))
          ),
          getDocs(
            isAdminUser
              ? collection(db, 'coupons')
              : query(collection(db, 'coupons'), where('isActive', '==', true))
          ),
          getDocs(collection(db, 'cmsPages')),
        ]);

        if (isCancelled) return;

        if (
          _connResult.status === 'rejected' &&
          _connResult.reason instanceof Error &&
          _connResult.reason.message.includes('the client is offline')
        ) {
          console.error('Please check your Firebase configuration.');
        }

        // 1. PRODUCTS
        let loadedCatalog = INITIAL_PRODUCTS;
        if (prodResult.status === 'fulfilled') {
          const prodSnap = prodResult.value;
          if (prodSnap.empty) {
            if (isAdminUser) {
              Promise.allSettled(
                INITIAL_PRODUCTS.map((p) => setDoc(doc(db, 'products', p.id), p))
              );
            }
            setProducts(INITIAL_PRODUCTS);
            safeStorageSet('omexo_products', INITIAL_PRODUCTS);
          } else {
            const loadedProducts = prodSnap.docs.map((d) => normalizeProductRecord(d.data() as Product));
            const missingFlagships = INITIAL_PRODUCTS.filter(
              (init) => !loadedProducts.some((p) => p.id === init.id)
            );
            if (isAdminUser && missingFlagships.length > 0) {
              Promise.allSettled(
                missingFlagships.map((missing) => setDoc(doc(db, 'products', missing.id), missing))
              );
            }
            loadedCatalog = [...loadedProducts, ...missingFlagships];
            setProducts(loadedCatalog);
            safeStorageSet('omexo_products', loadedCatalog);
          }
        }

        // 2. CATEGORIES
        if (catResult.status === 'fulfilled') {
          const catSnap = catResult.value;
          if (catSnap.empty) {
            if (isAdminUser) {
              Promise.allSettled(DEFAULT_CATEGORIES.map((c) => setDoc(doc(db, 'categories', c.id), c)));
            }
            setCategories(DEFAULT_CATEGORIES);
            safeStorageSet('omexo_categories', DEFAULT_CATEGORIES);
          } else {
            const rawLoaded = catSnap.docs.map((d) => d.data() as Category);
            const finalCategories = normalizeCategoryList(rawLoaded);
            if (isAdminUser) {
              Promise.allSettled(
                DEFAULT_BRAND_CATEGORIES.map((def) => setDoc(doc(db, 'categories', def.id), def, { merge: true }))
              );
            }
            setCategories(finalCategories);
            safeStorageSet('omexo_categories', finalCategories);
          }
        }

        // 3. BRANDS
        if (brandResult.status === 'fulfilled') {
          const brandSnap = brandResult.value;
          if (brandSnap.empty) {
            if (isAdminUser) {
              Promise.allSettled(DEFAULT_BRANDS.map((b) => setDoc(doc(db, 'brands', b.id), b)));
            }
            setBrands(DEFAULT_BRANDS);
            safeStorageSet('omexo_brands', DEFAULT_BRANDS);
          } else {
            const finalBrands = brandSnap.docs.map((d) => d.data() as Brand);
            setBrands(finalBrands);
            safeStorageSet('omexo_brands', finalBrands);
          }
        }

        // 4. BANNERS
        if (bannerResult.status === 'fulfilled') {
          const bannerSnap = bannerResult.value;
          if (bannerSnap.empty) {
            if (isAdminUser) {
              Promise.allSettled(
                DEFAULT_BANNERS.map((b) =>
                  setDoc(doc(db, 'banners', b.id || sanitizeBannerDocId(b.title, b.siteSlug)), b)
                )
              );
            }
            setAllBanners(DEFAULT_BANNERS);
            safeStorageSet('omexo_banners_v2', DEFAULT_BANNERS);
          } else {
            const loadedBanners = bannerSnap.docs.map((d) => {
              const raw = d.data() as OfferBanner;
              const inferredSlug: BrandCategorySlug =
                raw.siteSlug === 'decor' || raw.siteSlug === 'essentials' || raw.siteSlug === 'lifestyle'
                  ? raw.siteSlug
                  : d.id.startsWith('decor_')
                  ? 'decor'
                  : d.id.startsWith('essentials_')
                  ? 'essentials'
                  : 'lifestyle';
              return { ...raw, id: raw.id || d.id, siteSlug: inferredSlug };
            });
            const missingDefaultBanners = DEFAULT_BANNERS.filter(
              (def) => !loadedBanners.some((b) => b.siteSlug === def.siteSlug)
            );
            const finalBanners = [...loadedBanners, ...missingDefaultBanners];
            setAllBanners(finalBanners);
            safeStorageSet('omexo_banners_v2', finalBanners);
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
            if (isAdminUser) {
              Promise.allSettled(DEFAULT_REVIEWS.map((r) => setDoc(doc(db, 'reviews', r.id), r)));
            }
            setAllReviews(DEFAULT_REVIEWS);
            safeStorageSet('omexo_reviews', DEFAULT_REVIEWS);
          } else {
            const loadedRevs = revSnap.docs.map((d) => {
              const raw = d.data() as CustomerReview;
              return { ...raw, siteSlug: inferReviewSiteSlug(raw, loadedCatalog) };
            });
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
            if (isAdminUser) {
              Promise.allSettled(DEFAULT_COUPONS.map((c) => setDoc(doc(db, 'coupons', c.id), c)));
            }
            setAllCoupons(DEFAULT_COUPONS);
            safeStorageSet('omexo_coupons_v2', DEFAULT_COUPONS);
          } else {
            const loadedCoups = coupSnap.docs.map((d) => {
              const raw = d.data() as Coupon;
              const inferred: BrandCategorySlug =
                raw.siteSlug === 'decor' || raw.siteSlug === 'essentials' || raw.siteSlug === 'lifestyle'
                  ? raw.siteSlug
                  : raw.code.includes('DECOR')
                  ? 'decor'
                  : raw.code.includes('ESSENTIAL')
                  ? 'essentials'
                  : 'lifestyle';
              return { ...raw, siteSlug: inferred };
            });
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
            if (isAdminUser) {
              Promise.allSettled(DEFAULT_CMS_PAGES.map((page) => setDoc(doc(db, 'cmsPages', page.id), page)));
            }
            setAllCmsPages(DEFAULT_CMS_PAGES);
            safeStorageSet('omexo_cms_pages_v2', DEFAULT_CMS_PAGES);
          } else {
            const loadedCms = cmsSnap.docs.map((d) => {
              const raw = d.data() as CMSPage;
              const inferred: BrandCategorySlug =
                raw.siteSlug === 'decor' || raw.siteSlug === 'essentials' || raw.siteSlug === 'lifestyle'
                  ? raw.siteSlug
                  : raw.id.startsWith('decor_')
                  ? 'decor'
                  : raw.id.startsWith('essentials_')
                  ? 'essentials'
                  : 'lifestyle';
              return { ...raw, siteSlug: inferred };
            });
            const missingDefaultCms = DEFAULT_CMS_PAGES.filter(
              (def) => !loadedCms.some((p) => p.id === def.id)
            );
            if (isAdminUser && missingDefaultCms.length > 0) {
              Promise.allSettled(
                missingDefaultCms.map((page) => setDoc(doc(db, 'cmsPages', page.id), page))
              );
            }
            const finalCms = [...loadedCms, ...missingDefaultCms];
            setAllCmsPages(finalCms);
            safeStorageSet('omexo_cms_pages_v2', finalCms);
          }
        }

        // 9. PER-SITE SETTINGS, HERO, COMBO, OFFER BANNER (Parallelized across all 3 sites)
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

        if (isCancelled) return;

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
            if (migrated && isAdminUser) {
              setDoc(doc(db, 'settings', `site_${slug}`), merged, { merge: true }).catch(() => {});
            }
          } else if (isAdminUser) {
            setDoc(doc(db, 'settings', `site_${slug}`), profile.defaultStoreSettings).catch(() => {});
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
          } else if (isAdminUser) {
            setDoc(doc(db, 'settings', `hero_${slug}`), profile.defaultHeroConfig).catch(() => {});
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
          } else if (isAdminUser) {
            setDoc(doc(db, 'settings', `combo_${slug}`), profile.defaultComboConfig).catch(() => {});
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

        // 10. ADMIN-ONLY DATA (Orders + Per-Site Telegram in parallel)
        if (isAdminUser) {
          const [ordersRes, ...tgResList] = await Promise.allSettled([
            getDocs(collection(db, 'orders')),
            ...BRAND_SITES.map((slug) => getDoc(doc(db, 'settings', `telegram_${slug}`))),
            getDoc(doc(db, 'settings', 'telegram')),
          ]);

          if (isCancelled) return;

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
        if (!isCancelled) {
          setIsLoadingDb(false);
        }
      }
    };

    initDb();
    return () => {
      isCancelled = true;
    };
  }, [isAuthReady, isAdminUser]);

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

  const cart = cartsMap[activeSite] || [];
  const storeSettings = siteSettingsMap[activeSite];
  const heroConfig = heroMap[activeSite];
  const comboConfig = comboMap[activeSite];
  const offerBanner = offerBannerMap[activeSite];
  const telegramConfig = telegramMap[activeSite];

  // Category Actions
  const addCategory = async (newCat: Omit<Category, 'id'>) => {
    const id = 'cat-' + Date.now();
    const payload = { ...newCat, id };
    setCategories((prev) => {
      const next = [...prev, payload];
      localStorage.setItem('omexo_categories', JSON.stringify(next));
      return next;
    });
    await setDoc(doc(db, 'categories', id), payload);
  };

  const updateCategory = async (updatedCat: Category) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === updatedCat.id ? updatedCat : c));
      localStorage.setItem('omexo_categories', JSON.stringify(next));
      return next;
    });
    await setDoc(doc(db, 'categories', updatedCat.id), updatedCat);
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem('omexo_categories', JSON.stringify(next));
      return next;
    });
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `categories/${id}`);
      throw err;
    }
  };

  // Brand Actions
  const addBrand = async (newBrand: Omit<Brand, 'id'>) => {
    const id = 'brand-' + Date.now();
    const payload = { ...newBrand, id };
    setBrands((prev) => {
      const next = [...prev, payload];
      localStorage.setItem('omexo_brands', JSON.stringify(next));
      return next;
    });
    await setDoc(doc(db, 'brands', id), payload);
  };

  const deleteBrand = async (id: string) => {
    setBrands((prev) => {
      const next = prev.filter((b) => b.id !== id);
      localStorage.setItem('omexo_brands', JSON.stringify(next));
      return next;
    });
    try {
      await deleteDoc(doc(db, 'brands', id));
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `brands/${id}`);
      throw err;
    }
  };

  // Banner Actions (strictly scoped by siteSlug)
  const addBanner = async (newBanner: OfferBanner, targetSite: BrandCategorySlug = activeSite) => {
    const docId = sanitizeBannerDocId(newBanner.title, targetSite);
    const payload: OfferBanner = { ...newBanner, id: docId, siteSlug: targetSite };
    setAllBanners((prev) => {
      const next = [...prev, payload];
      localStorage.setItem('omexo_banners_v2', JSON.stringify(next));
      return next;
    });
    await setDoc(doc(db, 'banners', docId), payload);
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
    const payload: OfferBanner = { ...updatedBanner, id: docId, siteSlug: targetSite };

    setAllBanners((prev) => {
      const next = prev.map((b) => (b.id === targetObj?.id || b === targetObj ? payload : b));
      localStorage.setItem('omexo_banners_v2', JSON.stringify(next));
      return next;
    });
    await setDoc(doc(db, 'banners', docId), payload);
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
      setAllBanners((prev) => {
        const next = prev.filter((b) => b !== targetObj && b.id !== targetObj.id);
        localStorage.setItem('omexo_banners_v2', JSON.stringify(next));
        return next;
      });
      try {
        await deleteDoc(doc(db, 'banners', docId));
      } catch (err) {
        logFirestoreError(err, OperationType.DELETE, `banners/${docId}`);
        throw err;
      }
    }
  };

  // Product Actions
  const addProduct = async (newProduct: Omit<Product, 'id'>) => {
    const id = 'product-' + Date.now();
    const payload = normalizeProductRecord({ ...newProduct, id });
    setProducts((prev) => {
      const next = [...prev, payload];
      localStorage.setItem('omexo_products', JSON.stringify(next));
      return next;
    });
    await setDoc(doc(db, 'products', id), payload);
  };

  const updateProduct = async (updatedProduct: Product) => {
    const normalized = normalizeProductRecord(updatedProduct);
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === normalized.id ? normalized : p));
      localStorage.setItem('omexo_products', JSON.stringify(next));
      return next;
    });
    await setDoc(doc(db, 'products', normalized.id), normalized);
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem('omexo_products', JSON.stringify(next));
      return next;
    });
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `products/${id}`);
      throw err;
    }
  };

  const deleteProductsBulk = async (ids: string[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setProducts((prev) => {
      const next = prev.filter((p) => !idSet.has(p.id));
      localStorage.setItem('omexo_products', JSON.stringify(next));
      return next;
    });
    try {
      await Promise.all(ids.map((id) => deleteDoc(doc(db, 'products', id))));
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
      await updateDoc(doc(db, 'orders', orderId), fieldsToUpdate);
      await setDoc(doc(db, 'orderTracking', orderId), fieldsToUpdate, { merge: true });
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      throw err;
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
    try {
      await Promise.all([
        deleteDoc(doc(db, 'orders', orderId)),
        deleteDoc(doc(db, 'orderTracking', orderId)),
      ]);
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
      await Promise.all(
        orderIds.flatMap((id) => [
          deleteDoc(doc(db, 'orders', id)),
          deleteDoc(doc(db, 'orderTracking', id)),
        ])
      );
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
      await setDoc(doc(db, 'settings', `telegram_${targetSite}`), newConfig);
    } catch (err) {
      logFirestoreError(err, OperationType.WRITE, `settings/telegram_${targetSite}`);
      throw err;
    }
  };

  const updateOfferBanner = async (
    newBanner: OfferBanner,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    const payload = { ...newBanner, siteSlug: targetSite };
    setOfferBannerMap((prev) => ({ ...prev, [targetSite]: payload }));
    localStorage.setItem(`omexo_offer_banner_${targetSite}`, JSON.stringify(payload));
    await setDoc(doc(db, 'settings', `offerBanner_${targetSite}`), payload);
  };

  const updateHeroConfig = async (
    newHero: HeroConfig,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    setHeroMap((prev) => ({ ...prev, [targetSite]: newHero }));
    localStorage.setItem(`omexo_hero_config_${targetSite}`, JSON.stringify(newHero));
    await setDoc(doc(db, 'settings', `hero_${targetSite}`), newHero);
  };

  const updateComboConfig = async (
    newCombo: ComboConfig,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    setComboMap((prev) => ({ ...prev, [targetSite]: newCombo }));
    localStorage.setItem(`omexo_combo_config_${targetSite}`, JSON.stringify(newCombo));
    await setDoc(doc(db, 'settings', `combo_${targetSite}`), newCombo);
  };

  // Review Actions (public submissions tagged with siteSlug and Pending moderation)
  const addReview = async (
    newRev: Omit<CustomerReview, 'id' | 'date'>,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    const id = 'rev-' + Date.now();
    const dateStr = new Date().toLocaleDateString('en-GB');
    const payload: CustomerReview = {
      ...newRev,
      id,
      siteSlug: newRev.siteSlug || targetSite,
      date: dateStr,
      status: isAdminUser ? newRev.status : 'Pending',
    };
    try {
      await setDoc(doc(db, 'reviews', id), payload);
      if (payload.status === 'Approved' || isAdminUser) {
        setAllReviews((prev) => [payload, ...prev]);
      }
    } catch (err) {
      logFirestoreError(err, OperationType.CREATE, `reviews/${id}`);
      throw err;
    }
  };

  const updateReviewStatus = async (id: string, status: 'Approved' | 'Pending') => {
    setAllReviews((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, status } : r));
      localStorage.setItem('omexo_reviews', JSON.stringify(next));
      return next;
    });
    await updateDoc(doc(db, 'reviews', id), { status });
  };

  const deleteReview = async (id: string) => {
    setAllReviews((prev) => {
      const next = prev.filter((r) => r.id !== id);
      localStorage.setItem('omexo_reviews', JSON.stringify(next));
      return next;
    });
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `reviews/${id}`);
      throw err;
    }
  };

  // Coupon Actions (scoped per siteSlug)
  const addCoupon = async (newCoup: Omit<Coupon, 'id'>, targetSite: BrandCategorySlug = activeSite) => {
    const id = 'coup-' + Date.now();
    const payload: Coupon = { ...newCoup, siteSlug: newCoup.siteSlug || targetSite, id };
    setAllCoupons((prev) => {
      const next = [...prev, payload];
      localStorage.setItem('omexo_coupons_v2', JSON.stringify(next));
      return next;
    });
    await setDoc(doc(db, 'coupons', id), payload);
  };

  const deleteCoupon = async (id: string) => {
    setAllCoupons((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem('omexo_coupons_v2', JSON.stringify(next));
      return next;
    });
    try {
      await deleteDoc(doc(db, 'coupons', id));
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `coupons/${id}`);
      throw err;
    }
  };

  // CMS Page Actions
  const updateCMSPage = async (updatedPage: CMSPage) => {
    setAllCmsPages((prev) => {
      const next = prev.map((p) => (p.id === updatedPage.id ? updatedPage : p));
      localStorage.setItem('omexo_cms_pages_v2', JSON.stringify(next));
      return next;
    });
    await setDoc(doc(db, 'cmsPages', updatedPage.id), updatedPage);
  };

  // Store Settings Actions (strictly per siteSlug!)
  const updateStoreSettings = async (
    newSettings: StoreSettings,
    targetSite: BrandCategorySlug = activeSite
  ) => {
    const defaults = getSiteBrandConfig(targetSite).defaultStoreSettings;
    const merged: StoreSettings = { ...defaults, ...newSettings };
    setSiteSettingsMap((prev) => ({ ...prev, [targetSite]: merged }));
    localStorage.setItem(`omexo_store_settings_${targetSite}`, JSON.stringify(merged));
    try {
      await setDoc(doc(db, 'settings', `site_${targetSite}`), merged, { merge: true });
    } catch (err) {
      logFirestoreError(err, 'write', `settings/site_${targetSite}`);
      throw err;
    }
  };

  // Layout Controls
  const handleSetShowCategoryBrands = async (val: boolean) => {
    setShowCategoryBrands(val);
    localStorage.setItem('omexo_show_category_brands', JSON.stringify(val));
    await setDoc(doc(db, 'settings', 'layout'), { showCategoryBrands: val, showFeaturedGrids }, { merge: true });
  };

  const handleSetShowFeaturedGrids = async (val: boolean) => {
    setShowFeaturedGrids(val);
    localStorage.setItem('omexo_show_featured_grids', JSON.stringify(val));
    await setDoc(doc(db, 'settings', 'layout'), { showCategoryBrands, showFeaturedGrids: val }, { merge: true });
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
        addReview,
        updateReviewStatus,
        deleteReview,
        addCoupon,
        deleteCoupon,
        updateCMSPage,
        updateStoreSettings,
        showCategoryBrands,
        setShowCategoryBrands: handleSetShowCategoryBrands,
        showFeaturedGrids,
        setShowFeaturedGrids: handleSetShowFeaturedGrids,
        isLoadingDb,
        authUser,
        isAdminUser,
        adminRole,
        isAuthReady,
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
