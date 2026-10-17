export interface Category {
  id: string;
  name: string;
  subcategories: string[];
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
  brand?: string; // Add brand property
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
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
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
  badge: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
}

export interface CustomerReview {
  id: string;
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
  code: string;
  value: number;
  type: 'Percentage' | 'Fixed';
  minOrder: number;
  isActive: boolean;
}

export interface CMSPage {
  id: string;
  title: string;
  content: string;
}

export interface StoreSettings {
  storeName: string;
  supportNum: string;
  supportMail: string;
  address: string;
  seoTitle: string;
  seoDescription: string;
}

