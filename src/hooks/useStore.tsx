import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, CartItem, OrderStatus, OrderItem, OfferBanner, Category, Brand } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc 
} from 'firebase/firestore';

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
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
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
  updateOrderStatus: (orderId: string, status: OrderStatus, consignmentNumber?: string) => Promise<void>;
  updateTelegramConfig: (config: TelegramConfig) => Promise<void>;
  updateOfferBanner: (banner: OfferBanner) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addBrand: (brand: Omit<Brand, 'id'>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  addBanner: (banner: OfferBanner) => Promise<void>;
  updateBanner: (idx: number, banner: OfferBanner) => Promise<void>;
  deleteBanner: (idx: number) => Promise<void>;
  showCategoryBrands: boolean;
  setShowCategoryBrands: (val: boolean) => void;
  showFeaturedGrids: boolean;
  setShowFeaturedGrids: (val: boolean) => void;
  isLoadingDb: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Chargers', subcategories: ['GaN Chargers', 'Wireless Chargers', 'Car Chargers'] },
  { id: 'cat-2', name: 'Audio', subcategories: ['Earbuds', 'Headphones', 'Bluetooth Speakers'] },
  { id: 'cat-3', name: 'Cases', subcategories: ['Tactical Cases', 'Clear Cases', 'Leather Sleeves'] },
  { id: 'cat-4', name: 'Adapters', subcategories: ['USB-C Hubs', 'OTG Adapters'] },
  { id: 'cat-5', name: 'Special', subcategories: ['Festive Deals', 'Exclusive Offers', 'Hot Items'] }
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

const DEFAULT_OFFER_BANNER: OfferBanner = {
  badge: '🔥 SPECIAL FESTIVE OFFERS LIVE',
  title: 'Engineered to Elevate your lifestyle.',
  description: 'Discover a curated collection of ultra-responsive wearables, GaN chargers, and military-grade gear. Crafted with tactical precision.',
  primaryCta: 'Explore Accessories',
  secondaryCta: 'Track Existing Order',
  imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  backgroundImageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1600&q=80',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // App states with local fallback
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('omexo_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('omexo_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem('omexo_brands');
    return saved ? JSON.parse(saved) : DEFAULT_BRANDS;
  });

  const [banners, setBanners] = useState<OfferBanner[]>(() => {
    const saved = localStorage.getItem('omexo_banners');
    return saved ? JSON.parse(saved) : DEFAULT_BANNERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('omexo_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('omexo_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => {
    const saved = localStorage.getItem('omexo_telegram_config');
    return saved ? JSON.parse(saved) : { botToken: '', chatId: '' };
  });

  const [offerBanner, setOfferBanner] = useState<OfferBanner>(() => {
    const saved = localStorage.getItem('omexo_offer_banner');
    return saved ? JSON.parse(saved) : DEFAULT_OFFER_BANNER;
  });

  const [showCategoryBrands, setShowCategoryBrands] = useState<boolean>(() => {
    const saved = localStorage.getItem('omexo_show_category_brands');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [showFeaturedGrids, setShowFeaturedGrids] = useState<boolean>(() => {
    const saved = localStorage.getItem('omexo_show_featured_grids');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // Global search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');

  // Load from Firebase Firestore on Mount
  useEffect(() => {
    const initDb = async () => {
      try {
        setIsLoadingDb(true);

        // 1. PRODUCTS
        const prodSnap = await getDocs(collection(db, 'products'));
        let finalProducts = products;
        if (prodSnap.empty) {
          // Seed initial products to cloud
          for (const p of INITIAL_PRODUCTS) {
            await setDoc(doc(db, 'products', p.id), p);
          }
        } else {
          finalProducts = prodSnap.docs.map(d => d.data() as Product);
          setProducts(finalProducts);
          localStorage.setItem('omexo_products', JSON.stringify(finalProducts));
        }

        // 2. CATEGORIES
        const catSnap = await getDocs(collection(db, 'categories'));
        let finalCategories = categories;
        if (catSnap.empty) {
          for (const c of DEFAULT_CATEGORIES) {
            await setDoc(doc(db, 'categories', c.id), c);
          }
          finalCategories = DEFAULT_CATEGORIES;
          setCategories(finalCategories);
          localStorage.setItem('omexo_categories', JSON.stringify(finalCategories));
        } else {
          finalCategories = catSnap.docs.map(d => d.data() as Category);
          const hasSpecial = finalCategories.some(c => c.name.toLowerCase() === 'special');
          if (!hasSpecial) {
            const specialCat = { id: 'cat-5', name: 'Special', subcategories: ['Festive Deals', 'Exclusive Offers', 'Hot Items'] };
            await setDoc(doc(db, 'categories', specialCat.id), specialCat);
            finalCategories.push(specialCat);
          }
          setCategories(finalCategories);
          localStorage.setItem('omexo_categories', JSON.stringify(finalCategories));
        }

        // 3. BRANDS
        const brandSnap = await getDocs(collection(db, 'brands'));
        let finalBrands = brands;
        if (brandSnap.empty) {
          for (const b of DEFAULT_BRANDS) {
            await setDoc(doc(db, 'brands', b.id), b);
          }
        } else {
          finalBrands = brandSnap.docs.map(d => d.data() as Brand);
          setBrands(finalBrands);
          localStorage.setItem('omexo_brands', JSON.stringify(finalBrands));
        }

        // 4. BANNERS
        const bannerSnap = await getDocs(collection(db, 'banners'));
        let finalBanners = banners;
        if (bannerSnap.empty) {
          for (const b of DEFAULT_BANNERS) {
            // we use index as id
            await setDoc(doc(db, 'banners', b.title.replace(/\s+/g, '_')), b);
          }
        } else {
          finalBanners = bannerSnap.docs.map(d => d.data() as OfferBanner);
          setBanners(finalBanners);
          localStorage.setItem('omexo_banners', JSON.stringify(finalBanners));
        }

        // 5. ORDERS
        const orderSnap = await getDocs(collection(db, 'orders'));
        if (!orderSnap.empty) {
          const loadedOrders = orderSnap.docs.map(d => d.data() as Order);
          // Sort by date newest first
          loadedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(loadedOrders);
          localStorage.setItem('omexo_orders', JSON.stringify(loadedOrders));
        }

        // 6. SETTINGS Docs
        const tgDoc = await getDoc(doc(db, 'settings', 'telegram'));
        if (tgDoc.exists()) {
          const tgData = tgDoc.data() as TelegramConfig;
          setTelegramConfig(tgData);
          localStorage.setItem('omexo_telegram_config', JSON.stringify(tgData));
        }

        const bannerDoc = await getDoc(doc(db, 'settings', 'offerBanner'));
        if (bannerDoc.exists()) {
          const bannerData = bannerDoc.data() as OfferBanner;
          setOfferBanner(bannerData);
          localStorage.setItem('omexo_offer_banner', JSON.stringify(bannerData));
        }

        const layoutDoc = await getDoc(doc(db, 'settings', 'layout'));
        if (layoutDoc.exists()) {
          const layoutData = layoutDoc.data() as { showCategoryBrands: boolean; showFeaturedGrids: boolean };
          setShowCategoryBrands(layoutData.showCategoryBrands ?? true);
          setShowFeaturedGrids(layoutData.showFeaturedGrids ?? true);
          localStorage.setItem('omexo_show_category_brands', JSON.stringify(layoutData.showCategoryBrands));
          localStorage.setItem('omexo_show_featured_grids', JSON.stringify(layoutData.showFeaturedGrids));
        }

      } catch (err) {
        console.error('Failed to initialize Firebase database:', err);
      } finally {
        setIsLoadingDb(false);
      }
    };

    initDb();
  }, []);

  // Sync cart to local Storage (always local)
  useEffect(() => {
    localStorage.setItem('omexo_cart', JSON.stringify(cart));
  }, [cart]);

  // Category Actions
  const addCategory = async (newCat: Omit<Category, 'id'>) => {
    const id = 'cat-' + Date.now();
    const payload = { ...newCat, id };
    setCategories((prev) => [...prev, payload]);
    localStorage.setItem('omexo_categories', JSON.stringify([...categories, payload]));
    await setDoc(doc(db, 'categories', id), payload);
  };

  const updateCategory = async (updatedCat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
    const nextCategories = categories.map((c) => (c.id === updatedCat.id ? updatedCat : c));
    localStorage.setItem('omexo_categories', JSON.stringify(nextCategories));
    await setDoc(doc(db, 'categories', updatedCat.id), updatedCat);
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    localStorage.setItem('omexo_categories', JSON.stringify(categories.filter((c) => c.id !== id)));
    await deleteDoc(doc(db, 'categories', id));
  };

  // Brand Actions
  const addBrand = async (newBrand: Omit<Brand, 'id'>) => {
    const id = 'brand-' + Date.now();
    const payload = { ...newBrand, id };
    setBrands((prev) => [...prev, payload]);
    localStorage.setItem('omexo_brands', JSON.stringify([...brands, payload]));
    await setDoc(doc(db, 'brands', id), payload);
  };

  const deleteBrand = async (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    localStorage.setItem('omexo_brands', JSON.stringify(brands.filter((b) => b.id !== id)));
    await deleteDoc(doc(db, 'brands', id));
  };

  // Banner Actions
  const addBanner = async (newBanner: OfferBanner) => {
    setBanners((prev) => [...prev, newBanner]);
    localStorage.setItem('omexo_banners', JSON.stringify([...banners, newBanner]));
    await setDoc(doc(db, 'banners', newBanner.title.replace(/\s+/g, '_')), newBanner);
  };

  const updateBanner = async (idx: number, updatedBanner: OfferBanner) => {
    const nextBanners = banners.map((b, i) => (i === idx ? updatedBanner : b));
    setBanners(nextBanners);
    localStorage.setItem('omexo_banners', JSON.stringify(nextBanners));
    await setDoc(doc(db, 'banners', updatedBanner.title.replace(/\s+/g, '_')), updatedBanner);
  };

  const deleteBanner = async (idx: number) => {
    const target = banners[idx];
    if (target) {
      setBanners((prev) => prev.filter((_, i) => i !== idx));
      localStorage.setItem('omexo_banners', JSON.stringify(banners.filter((_, i) => i !== idx)));
      await deleteDoc(doc(db, 'banners', target.title.replace(/\s+/g, '_')));
    }
  };

  // Product Actions
  const addProduct = async (newProduct: Omit<Product, 'id'>) => {
    const id = 'product-' + Date.now();
    const payload = { ...newProduct, id };
    setProducts((prev) => [...prev, payload]);
    localStorage.setItem('omexo_products', JSON.stringify([...products, payload]));
    await setDoc(doc(db, 'products', id), payload);
  };

  const updateProduct = async (updatedProduct: Product) => {
    const nextProducts = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    setProducts(nextProducts);
    localStorage.setItem('omexo_products', JSON.stringify(nextProducts));
    await setDoc(doc(db, 'products', updatedProduct.id), updatedProduct);
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    localStorage.setItem('omexo_products', JSON.stringify(products.filter((p) => p.id !== id)));
    await deleteDoc(doc(db, 'products', id));
  };

  // Cart actions (local memory only)
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
      console.log('Telegram Bot parameters not set. Skipping alert.');
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
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
      console.log('Telegram notification alert completed successfully.');
    } catch (err) {
      console.error('Failed to dispatch Telegram notification:', err);
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

    // Update Product stocks on Cloud Firestore
    const nextProducts = products.map((prod) => {
      const cartItem = cart.find((item) => item.product.id === prod.id);
      if (cartItem) {
        const nextStock = Math.max(0, prod.stockCount - cartItem.quantity);
        // update each product doc
        updateDoc(doc(db, 'products', prod.id), { stockCount: nextStock });
        return { ...prod, stockCount: nextStock };
      }
      return prod;
    });
    setProducts(nextProducts);
    localStorage.setItem('omexo_products', JSON.stringify(nextProducts));

    // Save Order to Firestore
    await setDoc(doc(db, 'orders', newOrder.id), newOrder);

    // Save locally
    setOrders((prev) => [newOrder, ...prev]);
    localStorage.setItem('omexo_orders', JSON.stringify([newOrder, ...orders]));

    // Clear Cart
    setCart([]);

    // Trigger Telegram notification
    sendTelegramAlert(newOrder);

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, consignmentNumber?: string) => {
    const nextOrders = orders.map((order) => {
      if (order.id === orderId) {
        const updated = { ...order, orderStatus: status };
        if (consignmentNumber !== undefined) {
          updated.consignmentNumber = consignmentNumber;
        }
        return updated;
      }
      return order;
    });
    setOrders(nextOrders);
    localStorage.setItem('omexo_orders', JSON.stringify(nextOrders));

    const fieldsToUpdate: Partial<Order> = { orderStatus: status };
    if (consignmentNumber !== undefined) {
      fieldsToUpdate.consignmentNumber = consignmentNumber;
    }
    await updateDoc(doc(db, 'orders', orderId), fieldsToUpdate);
  };

  const updateTelegramConfig = async (newConfig: TelegramConfig) => {
    setTelegramConfig(newConfig);
    localStorage.setItem('omexo_telegram_config', JSON.stringify(newConfig));
    await setDoc(doc(db, 'settings', 'telegram'), newConfig);
  };

  const updateOfferBanner = async (newBanner: OfferBanner) => {
    setOfferBanner(newBanner);
    localStorage.setItem('omexo_offer_banner', JSON.stringify(newBanner));
    await setDoc(doc(db, 'settings', 'offerBanner'), newBanner);
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
        showCategoryBrands,
        setShowCategoryBrands: handleSetShowCategoryBrands,
        showFeaturedGrids,
        setShowFeaturedGrids: handleSetShowFeaturedGrids,
        isLoadingDb,
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
