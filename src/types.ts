export type BrandCategorySlug = 'decor' | 'essentials' | 'lifestyle' | 'aesthetic';

export interface Category {
  id: string;
  name: string;
  slug?: BrandCategorySlug | string;
  subcategories: string[];
  description?: string;
  image?: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface HeroConfig {
  badge: string;
  title: string;
  description: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  cardTitle: string;
  cardSubtitle: string;
  cardPrice: number;
  cardRegularPrice: number;
  cardImage: string;
}

export interface ComboConfig {
  badge: string;
  title: string;
  subheadline: string;
  description: string;
  price: number;
  valuePrice: number;
  ctaText: string;
  card1Title: string;
  card1Image: string;
  card2Title: string;
  card2Image: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  categorySlug?: BrandCategorySlug | string;
  brand?: string;
  description: string;
  salePrice: number;
  regularPrice: number;
  stockCount: number;
  images: string[];
  specs: { [key: string]: string };
  isTrending?: boolean;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  title: string;
  category?: string;
  categorySlug?: BrandCategorySlug | string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  siteSlug?: BrandCategorySlug;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  pincode: string;
  items: OrderItem[];
  totalAmount: number;
  paymentType: 'COD' | 'Online';
  paymentStatus: 'Pending' | 'Paid';
  orderStatus: OrderStatus;
  consignmentNumber?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OfferBanner {
  id?: string;
  siteSlug?: BrandCategorySlug;
  badge: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
}

export interface PromoOffer {
  id: string;
  siteSlug?: BrandCategorySlug;
  title: string;
  subheadline: string;
  price: number;
  ctaText: string;
  bannerUrl: string;
  isActive: boolean;
}

export interface CustomerReview {
  id: string;
  siteSlug?: BrandCategorySlug;
  customerName: string;
  productName: string;
  productId?: string;
  rating: number;
  reviewText: string;
  date: string;
  status: 'Approved' | 'Pending';
}

export interface Coupon {
  id: string;
  siteSlug?: BrandCategorySlug;
  code: string;
  value: number;
  type: 'Percentage' | 'Fixed';
  minOrder: number;
  isActive: boolean;
}

export interface CMSPage {
  id: string;
  siteSlug?: BrandCategorySlug;
  title: string;
  content: string;
}

export interface StoreSettings {
  storeName: string;
  supportNum: string;
  defaultWhatsapp?: string;
  essentialsWhatsapp?: string;
  supportMail: string;
  address: string;
  mapLocationUrl?: string;
  seoTitle: string;
  seoDescription: string;
}
