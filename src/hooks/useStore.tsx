import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, CartItem, OrderStatus, OrderItem, OfferBanner, Category, Brand } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

interface StoreContextType {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  telegramConfig: TelegramConfig;
  offerBanner: OfferBanner;
  categories: Category[];
  brands: Brand[];
  banners: OfferBanner[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedBrand: string;
  setSelectedBrand: (b: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (customerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    pincode: string;
    paymentType: 'COD' | 'Online';
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, consignmentNumber?: string) => void;
  updateTelegramConfig: (config: TelegramConfig) => void;
  updateOfferBanner: (banner: OfferBanner) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addBrand: (brand: Omit<Brand, 'id'>) => void;
  deleteBrand: (id: string) => void;
  addBanner: (banner: OfferBanner) => void;
  updateBanner: (idx: number, banner: OfferBanner) => void;
  deleteBanner: (idx: number) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Chargers', subcategories: ['GaN Chargers', 'Wireless Chargers', 'Car Chargers'] },
  { id: 'cat-2', name: 'Audio', subcategories: ['Earbuds', 'Headphones', 'Bluetooth Speakers'] },
  { id: 'cat-3', name: 'Cases', subcategories: ['Tactical Cases', 'Clear Cases', 'Leather Sleeves'] },
  { id: 'cat-4', name: 'Adapters', subcategories: ['USB-C Hubs', 'OTG Adapters'] }
];

const DEFAULT_BRANDS: Brand[] = [
  { id: 'brand-1', name: 'Apple' },
  { id: 'brand-2', name: 'Anker' },
  { id: 'brand-3', name: 'Samsung' },
  { id: 'brand-4', name: 'Spigen' },
  { id: 'brand-5', name: 'Omexo' }
];

const DEFAULT_BANNERS: OfferBanner[] = [
  {
    badge: '🔥 SPECIAL FESTIVE OFFERS LIVE',
    title: 'Engineered to Elevate your lifestyle.',
    description: 'Discover a curated collection of ultra-responsive wearables, GaN chargers, and military-grade gear. Crafted with tactical precision.',
    primaryCta: 'Explore Accessories',
    secondaryCta: 'Track Existing Order',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1600&q=80',
  }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('omexo_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Categories State
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('omexo_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  // Brands State
  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem('omexo_brands');
    return saved ? JSON.parse(saved) : DEFAULT_BRANDS;
  });

  // Banners list State
  const [banners, setBanners] = useState<OfferBanner[]>(() => {
    const saved = localStorage.getItem('omexo_banners');
    return saved ? JSON.parse(saved) : DEFAULT_BANNERS;
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('omexo_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('omexo_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Telegram Config
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => {
    const saved = localStorage.getItem('omexo_telegram_config');
    return saved ? JSON.parse(saved) : { botToken: '', chatId: '' };
  });

  // Default Offer Banner Setup
  const DEFAULT_OFFER_BANNER: OfferBanner = {
    badge: '🔥 SPECIAL FESTIVE OFFERS LIVE',
    title: 'Engineered to Elevate your lifestyle.',
    description: 'Discover a curated collection of ultra-responsive wearables, GaN chargers, and military-grade gear. Crafted with tactical precision.',
    primaryCta: 'Explore Accessories',
    secondaryCta: 'Track Existing Order',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1600&q=80',
  };

  // Offer Banner State
  const [offerBanner, setOfferBanner] = useState<OfferBanner>(() => {
    const saved = localStorage.getItem('omexo_offer_banner');
    return saved ? JSON.parse(saved) : DEFAULT_OFFER_BANNER;
  });

  // Global search and filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('omexo_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('omexo_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('omexo_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('omexo_telegram_config', JSON.stringify(telegramConfig));
  }, [telegramConfig]);

  useEffect(() => {
    localStorage.setItem('omexo_offer_banner', JSON.stringify(offerBanner));
  }, [offerBanner]);

  useEffect(() => {
    localStorage.setItem('omexo_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('omexo_brands', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('omexo_banners', JSON.stringify(banners));
  }, [banners]);

  // Category CRUD actions
  const addCategory = (newCat: Omit<Category, 'id'>) => {
    const id = 'cat-' + Date.now();
    setCategories((prev) => [...prev, { ...newCat, id }]);
  };

  const updateCategory = (updatedCat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Brand CRUD actions
  const addBrand = (newBrand: Omit<Brand, 'id'>) => {
    const id = 'brand-' + Date.now();
    setBrands((prev) => [...prev, { ...newBrand, id }]);
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  // Banner CRUD actions
  const addBanner = (newBanner: OfferBanner) => {
    setBanners((prev) => [...prev, newBanner]);
  };

  const updateBanner = (idx: number, updatedBanner: OfferBanner) => {
    setBanners((prev) => prev.map((b, i) => (i === idx ? updatedBanner : b)));
  };

  const deleteBanner = (idx: number) => {
    setBanners((prev) => prev.filter((_, i) => i !== idx));
  };

  // Product actions
  const addProduct = (newProduct: Omit<Product, 'id'>) => {
    const id = 'product-' + Date.now();
    setProducts((prev) => [...prev, { ...newProduct, id }]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Cart actions
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stockCount, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stockCount, quantity) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stockCount;
          return { ...item, quantity: Math.min(maxStock, quantity) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Real-time Telegram Notifications Bot API Call
  const sendTelegramAlert = async (order: Order) => {
    const { botToken, chatId } = telegramConfig;
    if (!botToken || !chatId) {
      console.log('Telegram Bot parameters not set. Skipping real-time alert.');
      return;
    }

    const itemsText = order.items
      .map((item) => `• ${item.title} (x${item.quantity}) - ₹${item.price}`)
      .join('\n');

    const message = `🛍️ *NEW OMEXO ORDER ALERT!*\n\n` +
      `*Order ID:* \`${order.id}\`\n` +
      `*Customer:* ${order.customerName}\n` +
      `*Phone:* ${order.customerPhone}\n` +
      `*Email:* ${order.customerEmail}\n` +
      `*Address:* ${order.address}, ${order.pincode}\n\n` +
      `*Items Ordered:*\n${itemsText}\n\n` +
      `*Total Amount:* ₹${order.totalAmount}\n` +
      `*Payment Mode:* ${order.paymentType} (${order.paymentStatus})\n` +
      `*Status:* ${order.orderStatus}`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        throw new Error('Telegram response not OK');
      }
      console.log('Telegram real-time order push alert completed successfully.');
    } catch (err) {
      console.error('Failed to dispatch real-time Telegram notification:', err);
    }
  };

  // Order actions
  const createOrder = async (customerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    pincode: string;
    paymentType: 'COD' | 'Online';
  }) => {
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
    const orderItems: OrderItem[] = cart.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      price: item.product.salePrice,
      quantity: item.quantity,
      image: item.product.images[0],
    }));

    const newOrder: Order = {
      id: 'OMX-' + Math.floor(100000 + Math.random() * 900000),
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone,
      address: customerDetails.address,
      pincode: customerDetails.pincode,
      items: orderItems,
      totalAmount,
      paymentType: customerDetails.paymentType,
      paymentStatus: customerDetails.paymentType === 'Online' ? 'Paid' : 'Pending',
      orderStatus: 'Pending',
      createdAt: new Date().toISOString(),
    };

    // Update Product stocks
    setProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const cartItem = cart.find((item) => item.product.id === prod.id);
        if (cartItem) {
          return {
            ...prod,
            stockCount: Math.max(0, prod.stockCount - cartItem.quantity),
          };
        }
        return prod;
      })
    );

    // Add Order
    setOrders((prev) => [newOrder, ...prev]);
    // Clear Cart
    setCart([]);

    // Trigger asynchronous webhook notification
    sendTelegramAlert(newOrder);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, consignmentNumber?: string) => {
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
  };

  const updateTelegramConfig = (newConfig: TelegramConfig) => {
    setTelegramConfig(newConfig);
  };

  const updateOfferBanner = (newBanner: OfferBanner) => {
    setOfferBanner(newBanner);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        cart,
        telegramConfig,
        offerBanner,
        categories,
        brands,
        banners,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedBrand,
        setSelectedBrand,
        addProduct,
        updateProduct,
        deleteProduct,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createOrder,
        updateOrderStatus,
        updateTelegramConfig,
        updateOfferBanner,
        addCategory,
        updateCategory,
        deleteCategory,
        addBrand,
        deleteBrand,
        addBanner,
        updateBanner,
        deleteBanner,
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
