export interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export interface Brand {
  id: string;
  name: string;
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
