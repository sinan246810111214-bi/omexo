import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useToast } from '../components/Toast';
import { Order, Product, OrderStatus, Category, Brand, OfferBanner } from '../types';
import { ImageUploader } from '../components/ImageUploader';
import { Settings, LogIn, LineChart, Package, ShoppingBag, Plus, Trash2, Edit, Save, CheckCircle, FileText, Bot, Send, ArrowRight, Printer, AlertTriangle, X, Sparkles, Users, Award, Eye, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Admin: React.FC = () => {
  const {
    products,
    orders,
    telegramConfig,
    offerBanner,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    updateTelegramConfig,
    updateOfferBanner,
    categories,
    brands,
    banners,
    addCategory,
    updateCategory,
    deleteCategory,
    addBrand,
    deleteBrand,
    addBanner,
    updateBanner,
    deleteBanner,
  } = useStore();

  const { toast } = useToast();

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // active tab
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'telegram' | 'banner' | 'crm' | 'categories_brands'>('orders');

  // Bulk Label Selections
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBulkPrinting, setIsBulkPrinting] = useState(false);

  // CRM Module State
  const [crmSearchQuery, setCrmSearchQuery] = useState('');
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);

  // Categories & Brands State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategories, setNewSubcategories] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Multi-Banner Management fields
  const [newBannerBadge, setNewBannerBadge] = useState('');
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerDesc, setNewBannerDesc] = useState('');
  const [newBannerPrimaryCta, setNewBannerPrimaryCta] = useState('');
  const [newBannerSecondaryCta, setNewBannerSecondaryCta] = useState('');
  const [newBannerImageUrl, setNewBannerImageUrl] = useState('');
  const [newBannerBgImageUrl, setNewBannerBgImageUrl] = useState('');
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBannerIdx, setEditingBannerIdx] = useState<number | null>(null);

  // Banner config state
  const [bannerBadge, setBannerBadge] = useState(offerBanner.badge);
  const [bannerTitle, setBannerTitle] = useState(offerBanner.title);
  const [bannerDesc, setBannerDesc] = useState(offerBanner.description);
  const [bannerPrimaryCta, setBannerPrimaryCta] = useState(offerBanner.primaryCta);
  const [bannerSecondaryCta, setBannerSecondaryCta] = useState(offerBanner.secondaryCta);
  const [bannerImageUrl, setBannerImageUrl] = useState(offerBanner.imageUrl || '');
  const [bannerBgImageUrl, setBannerBgImageUrl] = useState(offerBanner.backgroundImageUrl || '');

  // Product actions states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form Fields for Products
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodSalePrice, setProdSalePrice] = useState('');
  const [prodRegularPrice, setProdRegularPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);

  // India post input state mapping
  const [consignmentInputs, setConsignmentInputs] = useState<Record<string, string>>({});

  // Printable Invoice slip state
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // Telegram bot configurations states
  const [tgToken, setTgToken] = useState(telegramConfig.botToken);
  const [tgChatId, setTgChatId] = useState(telegramConfig.chatId);

  // Authentication Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'omexoofficial@gmail.com' && password === 'omexo246') {
      setIsAuthenticated(true);
      toast('Welcome back, Chief! Omexo console loaded.', 'success');
    } else {
      toast('Incorrect Credentials! Please use omexoofficial@gmail.com', 'error');
    }
  };

  // Product CRUD Handlers
  const handleAddNewProductClick = () => {
    setIsAddingNew(true);
    setEditingProduct(null);
    setProdTitle('');
    setProdCategory(categories[0]?.name || 'Smartwatches');
    setProdBrand(brands[0]?.name || '');
    setProdDescription('');
    setProdSalePrice('');
    setProdRegularPrice('');
    setProdStock('');
    setProdImages(['https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80']);
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setIsAddingNew(false);
    setProdTitle(prod.title);
    setProdCategory(prod.category);
    setProdBrand(prod.brand || '');
    setProdDescription(prod.description);
    setProdSalePrice(prod.salePrice.toString());
    setProdRegularPrice(prod.regularPrice.toString());
    setProdStock(prod.stockCount.toString());
    setProdImages(prod.images || []);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = prodImages.filter(Boolean);

    const productPayload = {
      title: prodTitle,
      category: prodCategory,
      brand: prodBrand,
      description: prodDescription,
      salePrice: parseFloat(prodSalePrice) || 0,
      regularPrice: parseFloat(prodRegularPrice) || 0,
      stockCount: parseInt(prodStock) || 0,
      images: imagesArray.length > 0 ? imagesArray : ['https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80'],
      specs: editingProduct ? editingProduct.specs : {
        'Display': '1.9" OLED Color screen',
        'Material': 'Military grade ABS',
        'In Box': '1 Unit, 1 charging cord'
      },
    };

    if (editingProduct) {
      updateProduct({ ...productPayload, id: editingProduct.id });
      toast('Product updated successfully!', 'success');
    } else {
      addProduct(productPayload);
      toast('New product added to catalog live!', 'success');
    }

    setIsAddingNew(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    setDeletingProductId(id);
  };

  // Telegram Configuration
  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    updateTelegramConfig({ botToken: tgToken, chatId: tgChatId });
    toast('Telegram notification settings synchronized!', 'success');
  };

  const handleSendTestTelegram = async () => {
    if (!tgToken || !tgChatId) {
      toast('Please enter Bot Token & Chat ID first.', 'error');
      return;
    }

    const testMsg = `🔔 *OMEXO MONITORING AGENT*\n\n` +
      `Test alert successfully dispatched! Your webhook is fully operational. Real-time order checkouts will show up here instantly.`;

    try {
      const res = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: testMsg,
          parse_mode: 'Markdown',
        }),
      });

      if (res.ok) {
        toast('Test alert ping dispatched successfully!', 'success');
      } else {
        throw new Error('Telegram bot error');
      }
    } catch (err) {
      toast('Test alert dispatch failed. Check credentials.', 'error');
    }
  };

  // Save Consignment Number
  const handleSaveConsignment = (orderId: string, currentStatus: OrderStatus) => {
    const consignment = consignmentInputs[orderId] || '';
    updateOrderStatus(orderId, currentStatus, consignment);
    toast(`Consignment number updated for ${orderId}!`, 'success');
  };

  // Print slip trigger
  const handlePrintSlip = (order: Order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Key stats computations
  const totalSalesRevenue = orders
    .filter((o) => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const lowStockCount = products.filter((p) => p.stockCount < 10).length;

  if (!isAuthenticated) {
    // 1. Authenticated Secure Login Screen
    return (
      <div className="max-w-md mx-auto py-16 animate-in zoom-in duration-150" id="admin-login-screen">
        <div className="bg-white border border-zinc-200 p-6 rounded space-y-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-zinc-50 text-zinc-900 rounded border border-zinc-200 flex items-center justify-center mx-auto">
              <LogIn className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 leading-none">Omexo Owner Panel</h2>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Restricted secure authentication. Authenticate to modify products.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Owner Email</label>
              <input
                type="email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin email"
                className="w-full px-3 py-2 text-xs border border-zinc-200 bg-white rounded focus:outline-none focus:border-black font-semibold text-zinc-800"
                id="admin-login-email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Console Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs border border-zinc-200 bg-white rounded focus:outline-none focus:border-black font-semibold text-zinc-800"
                id="admin-login-password"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-black hover:bg-zinc-900 text-white font-bold rounded text-xs uppercase tracking-widest transition-colors"
              id="admin-login-submit"
            >
              Verify Credentials
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-150" id="admin-root-dashboard">
      
      {/* 2. Top Banner / Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-zinc-900 leading-none">Console Command HQ</h1>
          <p className="text-xs text-zinc-500 mt-1.5 font-medium">Manage global product listings, order pipelines, and bot alerts.</p>
        </div>

        {/* tab selection list */}
        <div className="flex bg-zinc-100 p-1 rounded shrink-0 gap-1 overflow-x-auto scrollbar-none" id="admin-tab-bar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer rounded ${
              activeTab === 'orders' ? 'bg-black text-white' : 'text-zinc-500 hover:text-black'
            }`}
            id="tab-btn-orders"
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer rounded ${
              activeTab === 'products' ? 'bg-black text-white' : 'text-zinc-500 hover:text-black'
            }`}
            id="tab-btn-products"
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer rounded ${
              activeTab === 'telegram' ? 'bg-black text-white' : 'text-zinc-500 hover:text-black'
            }`}
            id="tab-btn-telegram"
          >
            Alerts Bot
          </button>
          <button
            onClick={() => {
              setActiveTab('banner');
              setBannerBadge(offerBanner.badge);
              setBannerTitle(offerBanner.title);
              setBannerDesc(offerBanner.description);
              setBannerPrimaryCta(offerBanner.primaryCta);
              setBannerSecondaryCta(offerBanner.secondaryCta);
              setBannerImageUrl(offerBanner.imageUrl || '');
              setBannerBgImageUrl(offerBanner.backgroundImageUrl || '');
            }}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer rounded ${
              activeTab === 'banner' ? 'bg-black text-white' : 'text-zinc-500 hover:text-black'
            }`}
            id="tab-btn-banner"
          >
            Promo Banner
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer rounded ${
              activeTab === 'crm' ? 'bg-black text-white' : 'text-zinc-500 hover:text-black'
            }`}
            id="tab-btn-crm"
          >
            CRM
          </button>
          <button
            onClick={() => setActiveTab('categories_brands')}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer rounded ${
              activeTab === 'categories_brands' ? 'bg-black text-white' : 'text-zinc-500 hover:text-black'
            }`}
            id="tab-btn-categories-brands"
          >
            Categories & Brands
          </button>
        </div>
      </div>

      {/* 3. Global Analytical Cards Deck */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="admin-analytics-grid">
        <div className="bg-white border border-zinc-200 p-4 rounded shadow-xs">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Total Revenue</div>
          <div className="text-sm font-bold text-zinc-900">₹{totalSalesRevenue.toLocaleString('en-IN')}</div>
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5">COD & Prepaid settled</div>
        </div>

        <div className="bg-white border border-zinc-200 p-4 rounded shadow-xs">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Lifetime Orders</div>
          <div className="text-sm font-bold text-zinc-900">{orders.length} units</div>
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5">Processed in system</div>
        </div>

        <div className="bg-white border border-zinc-200 p-4 rounded shadow-xs">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Low Inventory Alert</div>
          <div className="text-sm font-bold text-zinc-900">{lowStockCount} items</div>
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5">Requires restock priority</div>
        </div>

        <div className="bg-white border border-zinc-200 p-4 rounded shadow-xs">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Bot Status</div>
          <div className="text-sm font-bold text-zinc-900">
            {telegramConfig.botToken ? 'Connected' : 'Disconnected'}
          </div>
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5">Telegram webhook link</div>
        </div>
      </div>

      {/* Real-Time Low Stock Alert Panel Widget */}
      {products.some((p) => p.stockCount < 5) && (
        <div className="bg-zinc-50 border border-zinc-200 p-5 rounded flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-150" id="admin-low-stock-warning">
          <div className="flex gap-3">
            <div className="p-2 bg-white text-zinc-900 border border-zinc-200 rounded shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">⚠️ Critical Inventory Warning</h4>
              <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed font-bold uppercase tracking-wider">
                The following premium premium gadgets have fallen below the critical threshold (less than 5 units remaining):
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {products.filter((p) => p.stockCount < 5).map((p) => (
                  <span
                    key={p.id}
                    className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded border border-black"
                  >
                    {p.title} ({p.stockCount === 0 ? 'OUT OF STOCK' : `${p.stockCount} units left`})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab Screens */}

      {/* TAB: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6" id="admin-orders-tab">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 border border-zinc-200 rounded">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-zinc-900" />
              Incoming Store Orders ({orders.length})
            </h3>
            
            {orders.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedOrderIds.length === orders.length) {
                      setSelectedOrderIds([]);
                    } else {
                      setSelectedOrderIds(orders.map(o => o.id));
                    }
                  }}
                  className="px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-bold rounded text-[10px] uppercase tracking-wider transition-all"
                >
                  {selectedOrderIds.length === orders.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  type="button"
                  disabled={selectedOrderIds.length === 0}
                  onClick={() => setIsBulkPrinting(true)}
                  className="px-3.5 py-1.5 bg-black hover:bg-zinc-900 disabled:opacity-50 text-white font-bold rounded text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print A4 Labels ({selectedOrderIds.length})
                </button>
              </div>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center bg-white border border-zinc-200 rounded" id="admin-no-orders">
              <AlertTriangle className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">No active customer checkouts</h4>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider max-w-xs mx-auto mt-1">Orders placed by customers on frontend will show up here immediately with real-time sync.</p>
            </div>
          ) : (
            <div className="space-y-4" id="admin-orders-list">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-zinc-200 rounded p-5 space-y-4 hover:border-black transition-colors"
                  id={`admin-order-card-${order.id}`}
                >
                  {/* Top order metadata */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-zinc-200 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                           type="checkbox"
                           checked={selectedOrderIds.includes(order.id)}
                           onChange={(e) => {
                             if (e.target.checked) {
                               setSelectedOrderIds(prev => [...prev, order.id]);
                             } else {
                               setSelectedOrderIds(prev => prev.filter(id => id !== order.id));
                             }
                           }}
                           className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black cursor-pointer"
                        />
                        <span className="text-xs font-bold text-zinc-900 font-mono tracking-tight">{order.id}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          order.paymentType === 'Online' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                        }`}>
                          {order.paymentType} ({order.paymentStatus})
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Placed: {new Date(order.createdAt).toLocaleString('en-IN')}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* One-click Packaging Slip Invoice */}
                      <button
                        onClick={() => handlePrintSlip(order)}
                        className="px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-bold rounded text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1.5"
                        id={`print-slip-${order.id}`}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Invoice
                      </button>

                      {/* Status pipeline selector */}
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="px-3 py-1.5 border border-zinc-200 rounded text-xs font-bold text-zinc-900 focus:outline-none focus:border-black bg-white"
                        id={`order-status-select-${order.id}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Recipient details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-zinc-400 block uppercase tracking-wider text-[9px]">Customer Details</span>
                      <p className="font-bold text-zinc-900">{order.customerName}</p>
                      <p className="text-zinc-500 font-medium">{order.customerPhone}</p>
                      <p className="text-zinc-500 font-medium">{order.customerEmail}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-zinc-400 block uppercase tracking-wider text-[9px]">Delivery Directions</span>
                      <p className="text-zinc-600 leading-relaxed font-medium">{order.address}</p>
                      <p className="font-bold text-zinc-900">PIN: {order.pincode}</p>
                    </div>

                    <div className="space-y-1.5 bg-zinc-50 p-3 rounded border border-zinc-200">
                      <span className="font-bold text-zinc-400 block uppercase tracking-wider text-[9px]">India Post Consignment</span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. EP910849204IN"
                          value={consignmentInputs[order.id] !== undefined ? consignmentInputs[order.id] : (order.consignmentNumber || '')}
                          onChange={(e) => setConsignmentInputs({
                            ...consignmentInputs,
                            [order.id]: e.target.value.toUpperCase()
                          })}
                          className="flex-1 px-2.5 py-1 text-xs border border-zinc-200 rounded bg-white font-mono focus:outline-none focus:border-black"
                          id={`consignment-input-${order.id}`}
                        />
                        <button
                          onClick={() => handleSaveConsignment(order.id, order.orderStatus)}
                          className="p-1 px-2.5 bg-black hover:bg-zinc-900 text-white rounded text-[10px] font-bold uppercase tracking-wider"
                          id={`consignment-save-${order.id}`}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items list summary */}
                  <div className="p-3.5 bg-zinc-50 rounded border border-zinc-200 divide-y divide-zinc-200">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1.5 last:pb-0 first:pt-0 text-xs font-medium">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                          <span className="font-bold text-zinc-900">{item.title}</span>
                          <span className="text-zinc-400 font-bold">×{item.quantity}</span>
                        </div>
                        <span className="font-bold text-zinc-700">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2.5 mt-2.5 text-xs font-bold text-zinc-900 border-t border-zinc-200">
                      <span>Total Invoice Amount</span>
                      <span className="text-sm font-bold text-zinc-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6" id="admin-products-tab">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-zinc-900" />
              Omexo Active Gadget Inventory ({products.length})
            </h3>
            
            {!isAddingNew && !editingProduct && (
              <button
                onClick={handleAddNewProductClick}
                className="px-4 py-2 bg-black hover:bg-zinc-900 text-white font-bold rounded text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1.5 shrink-0"
                id="btn-admin-add-product"
              >
                <Plus className="w-4 h-4" />
                Add New Gadget
              </button>
            )}
          </div>

          {/* New / Edit Product Form Panel */}
          {(isAddingNew || editingProduct) && (
            <div className="bg-zinc-50 border border-zinc-200 p-6 rounded" id="product-form-panel">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                  {editingProduct ? `Modify: ${editingProduct.title}` : 'Introduce New Tech Gadget'}
                </h4>
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingProduct(null);
                  }}
                  className="p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 rounded"
                  id="btn-close-form"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Product Title</label>
                    <input
                      type="text"
                      required
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      placeholder="e.g. Omexo Wave Pro"
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded focus:outline-none focus:border-black font-semibold text-zinc-800"
                      id="form-title"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Category</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded font-semibold text-zinc-800 focus:outline-none focus:border-black"
                      id="form-category"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Brand Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Brand (Optional)</label>
                    <select
                      value={prodBrand}
                      onChange={(e) => setProdBrand(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded font-semibold text-zinc-800 focus:outline-none focus:border-black"
                      id="form-brand"
                    >
                      <option value="">No specific brand</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Description (Features & details)</label>
                  <textarea
                    required
                    rows={3}
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    placeholder="Provide aerospace quality description details..."
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded focus:outline-none focus:border-black font-semibold text-zinc-800"
                    id="form-description"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Sale Price */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Sale Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={prodSalePrice}
                      onChange={(e) => setProdSalePrice(e.target.value)}
                      placeholder="3499"
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded focus:outline-none focus:border-black font-semibold text-zinc-800"
                      id="form-sale-price"
                    />
                  </div>

                  {/* Regular Price */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Regular Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={prodRegularPrice}
                      onChange={(e) => setProdRegularPrice(e.target.value)}
                      placeholder="5999"
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded focus:outline-none focus:border-black font-semibold text-zinc-800"
                      id="form-regular-price"
                    />
                  </div>

                  {/* Stock Count */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Stock Units</label>
                    <input
                      type="number"
                      required
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      placeholder="45"
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded focus:outline-none focus:border-black font-semibold text-zinc-800"
                      id="form-stock"
                    />
                  </div>
                </div>

                {/* Multi-Image Upload & Visual Thumbnail List */}
                <div className="space-y-3 bg-white p-4 rounded border border-zinc-200">
                  <ImageUploader 
                    label="Upload Product Images"
                    helperText="Select or drag product photos to upload instantly"
                    onUploadSuccess={(base64) => {
                      if (prodImages.length === 1 && prodImages[0] === 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80') {
                        setProdImages([base64]);
                      } else {
                        setProdImages(prev => [...prev, base64]);
                      }
                      toast('Product image uploaded!', 'success');
                    }}
                  />
                  
                  {prodImages.filter(Boolean).length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider block">Uploaded Product Gallery (Hover to remove)</label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {prodImages.filter(Boolean).map((img, i) => (
                          <div key={i} className="relative aspect-square border border-zinc-200 rounded overflow-hidden group bg-zinc-50">
                            <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = prodImages.filter((_, idx) => idx !== i);
                                setProdImages(updated);
                                toast('Image removed from gallery', 'info');
                              }}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer animate-in fade-in duration-100"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold rounded text-xs uppercase tracking-widest transition-colors flex items-center gap-1.5"
                  id="form-submit-btn"
                >
                  <Save className="w-4 h-4" />
                  Save Product Configuration
                </button>
              </form>
            </div>
          )}

          {/* Active catalog grid items list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="admin-inventory-list">
            {products.map((p) => {
              const isLow = p.stockCount < 10;
              return (
                <div
                  key={p.id}
                  className="bg-white border border-zinc-200 rounded p-4 flex gap-4 hover:border-black transition-colors"
                  id={`admin-product-item-${p.id}`}
                >
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-16 h-16 object-cover rounded bg-zinc-50 border border-zinc-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-zinc-900 truncate leading-none pr-2">{p.title}</h4>
                        <span className="text-[9px] bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                          {p.category}
                        </span>
                      </div>
                      
                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="text-xs font-bold text-zinc-900">₹{p.salePrice.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-zinc-400 line-through">₹{p.regularPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 pt-2 mt-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${isLow ? 'text-black font-extrabold' : 'text-zinc-400'}`}>
                        Stock: {p.stockCount} left
                      </span>

                      {/* edit / delete triggers */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEditProductClick(p)}
                          className="p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-50 rounded border border-transparent hover:border-zinc-200 transition-colors"
                          id={`edit-prod-btn-${p.id}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-50 rounded border border-transparent hover:border-zinc-200 transition-colors"
                          id={`delete-prod-btn-${p.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: TELEGRAM SETUP */}
      {activeTab === 'telegram' && (
        <div className="max-w-xl mx-auto space-y-6" id="admin-telegram-tab">
          <div className="bg-white border border-zinc-200 p-6 rounded space-y-6">
            
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-zinc-900" />
                Telegram Webhook Configuration
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                Connect your Telegram Bot to enable instant pushes. Whenever a customer completes an express checkout, a summary gets piped straight to your chat room.
              </p>
            </div>

            <form onSubmit={handleSaveTelegram} className="space-y-4">
              {/* Bot Token */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Telegram Bot Token</label>
                <input
                  type="text"
                  value={tgToken}
                  onChange={(e) => setTgToken(e.target.value)}
                  placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded bg-white focus:outline-none focus:border-black font-semibold text-zinc-800"
                  id="telegram-bot-token"
                />
              </div>

              {/* Chat ID */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Your Telegram Chat ID</label>
                <input
                  type="text"
                  value={tgChatId}
                  onChange={(e) => setTgChatId(e.target.value)}
                  placeholder="e.g. 987654321"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded bg-white focus:outline-none focus:border-black font-semibold text-zinc-800"
                  id="telegram-chat-id"
                />
              </div>

              {/* Telegram bot setup guide */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded text-[10px] text-zinc-500 space-y-2 leading-relaxed font-medium">
                <span className="font-bold text-zinc-900 block text-xs uppercase tracking-wider">🚀 3-Step Setup Instructions:</span>
                <p>1. Open Telegram, search for <strong>@BotFather</strong>, send <code>/newbot</code>, and copy your HTTP API token.</p>
                <p>2. Message your new bot or search for <strong>@userinfobot</strong> to obtain your numeric Chat ID.</p>
                <p>3. Paste credentials above, click Synchronize and dispatch a "Test Alert" to confirm pairing!</p>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold rounded text-xs uppercase tracking-widest transition-colors"
                  id="telegram-config-save"
                >
                  Synchronize Setup
                </button>
                <button
                  type="button"
                  onClick={handleSendTestTelegram}
                  className="px-4 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-bold rounded text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 shrink-0"
                  id="telegram-config-test"
                >
                  <Send className="w-3.5 h-3.5" />
                  Test Alert
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* TAB: BANNER CONTROL */}
      {activeTab === 'banner' && (
        <div className="max-w-xl mx-auto space-y-6" id="admin-banner-tab">
          <div className="bg-white border border-zinc-200 p-6 rounded space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-150">
            
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-zinc-900" />
                Customize Homepage Offer Banner
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                Update the hero promo banner on your store front in real-time. Extremely easy-to-use controls to announce daily flash sales, festive discounts, or new arrivals.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateOfferBanner({
                  badge: bannerBadge,
                  title: bannerTitle,
                  description: bannerDesc,
                  primaryCta: bannerPrimaryCta,
                  secondaryCta: bannerSecondaryCta,
                  imageUrl: bannerImageUrl,
                  backgroundImageUrl: bannerBgImageUrl,
                });
                toast('Homepage Promo Banner updated successfully!', 'success');
              }}
              className="space-y-4"
            >
              {/* Badge Text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Offer Badge / Highlight Ribbon</label>
                <input
                  type="text"
                  required
                  value={bannerBadge}
                  onChange={(e) => setBannerBadge(e.target.value)}
                  placeholder="e.g. 🔥 MEGA FESTIVE OFFERS LIVE"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded bg-white font-bold text-zinc-800 focus:outline-none focus:border-black"
                  id="banner-badge-input"
                />
              </div>

              {/* Title Text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Headline / Catchy Title</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="e.g. Engineered to Elevate your lifestyle."
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded bg-white font-bold text-zinc-800 focus:outline-none focus:border-black"
                  id="banner-title-input"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Subheading Description / Offer details</label>
                <textarea
                  required
                  rows={3}
                  value={bannerDesc}
                  onChange={(e) => setBannerDesc(e.target.value)}
                  placeholder="e.g. Get flat 20% off plus free express delivery across Kerala..."
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded bg-white font-semibold text-zinc-800 focus:outline-none focus:border-black leading-relaxed"
                  id="banner-desc-input"
                />
              </div>

              {/* Poster Image (Right Side Graphic) */}
              <div className="space-y-3 bg-white p-4 rounded border border-zinc-200">
                <ImageUploader 
                  label="Upload Offer Poster Image (Right Side Graphic)"
                  helperText="Select or drag an image to display on the home screen banner poster"
                  onUploadSuccess={(base64) => {
                    setBannerImageUrl(base64);
                    toast('Offer poster graphic uploaded successfully!', 'success');
                  }}
                />
                {bannerImageUrl && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider block">Uploaded Poster (Hover to remove)</span>
                    <div className="relative w-16 h-16 border border-zinc-200 rounded overflow-hidden group bg-zinc-50">
                      <img src={bannerImageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                      <button
                        type="button"
                        onClick={() => {
                          setBannerImageUrl('');
                          toast('Poster image cleared', 'info');
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Background Image URL and Uploader */}
              <div className="space-y-3 bg-white p-4 rounded border border-zinc-200">
                <ImageUploader 
                  label="Upload Banner Background Poster Image"
                  helperText="Choose or drag an image to set as the entire promo hero banner background"
                  onUploadSuccess={(base64) => {
                    setBannerBgImageUrl(base64);
                    toast('Banner background poster uploaded successfully!', 'success');
                  }}
                />
                {bannerBgImageUrl && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider block">Uploaded Background (Hover to remove)</span>
                    <div className="relative w-24 h-12 border border-zinc-200 rounded overflow-hidden group bg-zinc-50">
                      <img src={bannerBgImageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                      <button
                        type="button"
                        onClick={() => {
                          setBannerBgImageUrl('');
                          toast('Background image cleared', 'info');
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Primary Action Button</label>
                  <input
                    type="text"
                    required
                    value={bannerPrimaryCta}
                    onChange={(e) => setBannerPrimaryCta(e.target.value)}
                    placeholder="Explore Accessories"
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded bg-white font-bold text-zinc-800 focus:outline-none focus:border-black"
                    id="banner-primary-cta-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Secondary Action Button</label>
                  <input
                    type="text"
                    required
                    value={bannerSecondaryCta}
                    onChange={(e) => setBannerSecondaryCta(e.target.value)}
                    placeholder="Track Order"
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded bg-white font-bold text-zinc-800 focus:outline-none focus:border-black"
                    id="banner-secondary-cta-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-black hover:bg-zinc-900 text-white font-bold rounded text-xs uppercase tracking-widest transition-colors cursor-pointer"
                id="banner-save-submit"
              >
                Apply Live Offer Banner
              </button>
            </form>

            {/* 2. Promo Banners Catalog Stack Manager */}
            <div className="border-t border-zinc-200 pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900">🗂️ Promo Banners Catalog Stack</h4>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Manage additional promotion cards, campaign links, and background headers.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingBanner(!isAddingBanner);
                    setEditingBannerIdx(null);
                    setNewBannerBadge('');
                    setNewBannerTitle('');
                    setNewBannerDesc('');
                    setNewBannerPrimaryCta('');
                    setNewBannerSecondaryCta('');
                    setNewBannerImageUrl('');
                    setNewBannerBgImageUrl('');
                  }}
                  className="px-2.5 py-1 bg-black hover:bg-zinc-900 text-white font-bold rounded text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Add Campaign Banner
                </button>
              </div>

              {/* Add / Edit Campaign Banner Form */}
              {isAddingBanner && (
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded space-y-4 animate-in fade-in duration-150">
                  <h5 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">
                    {editingBannerIdx !== null ? '📝 Edit Campaign Banner' : '✨ New Campaign Banner'}
                  </h5>
                  
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider block">Offer Badge</label>
                        <input
                          type="text"
                          value={newBannerBadge}
                          onChange={(e) => setNewBannerBadge(e.target.value)}
                          placeholder="e.g. FLASH DEALS"
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded bg-white font-semibold text-zinc-800 focus:outline-none focus:border-black"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider block">Title Headline</label>
                        <input
                          type="text"
                          value={newBannerTitle}
                          onChange={(e) => setNewBannerTitle(e.target.value)}
                          placeholder="e.g. Pure Titanium Edition"
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded bg-white font-semibold text-zinc-800 focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider block">Subheading / Description</label>
                      <textarea
                        value={newBannerDesc}
                        onChange={(e) => setNewBannerDesc(e.target.value)}
                        placeholder="e.g. Built for adventurers and audiophiles."
                        rows={2}
                        className="w-full px-3 py-1.5 border border-zinc-200 rounded bg-white font-semibold text-zinc-800 focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="space-y-3 bg-white p-3 rounded border border-zinc-200">
                      <ImageUploader
                        label="Upload Promo Graphic (Product Card / Poster)"
                        helperText="Upload or drag Campaign images"
                        onUploadSuccess={(url) => {
                          setNewBannerImageUrl(url);
                          toast('Graphic uploaded successfully!', 'success');
                        }}
                      />
                      {newBannerImageUrl && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider block">Uploaded Graphic (Hover to remove)</span>
                          <div className="relative w-16 h-16 border border-zinc-200 rounded overflow-hidden group bg-zinc-50">
                            <img src={newBannerImageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                            <button
                              type="button"
                              onClick={() => {
                                setNewBannerImageUrl('');
                                toast('Graphic cleared', 'info');
                              }}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider block">Primary Action Button Text</label>
                        <input
                          type="text"
                          value={newBannerPrimaryCta}
                          onChange={(e) => setNewBannerPrimaryCta(e.target.value)}
                          placeholder="Shop Now"
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded bg-white font-semibold text-zinc-800 focus:outline-none focus:border-black"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider block">Direct Destination Target URL</label>
                        <input
                          type="url"
                          value={newBannerSecondaryCta}
                          onChange={(e) => setNewBannerSecondaryCta(e.target.value)}
                          placeholder="e.g. /#products"
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded bg-white font-mono text-zinc-800 focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingBanner(false)}
                        className="px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-bold rounded text-[10px] uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newBannerTitle || !newBannerImageUrl) {
                            toast('Headline and image are required!', 'error');
                            return;
                          }
                          const payload: OfferBanner = {
                            badge: newBannerBadge,
                            title: newBannerTitle,
                            description: newBannerDesc,
                            primaryCta: newBannerPrimaryCta || 'Learn More',
                            secondaryCta: newBannerSecondaryCta || '',
                            imageUrl: newBannerImageUrl,
                          };

                          if (editingBannerIdx !== null) {
                            updateBanner(editingBannerIdx, payload);
                            toast('Campaign banner updated!', 'success');
                          } else {
                            addBanner(payload);
                            toast('Campaign banner saved to stack!', 'success');
                          }
                          setIsAddingBanner(false);
                        }}
                        className="px-3.5 py-1.5 bg-black hover:bg-zinc-900 text-white font-bold rounded text-[10px] uppercase tracking-wider"
                      >
                        {editingBannerIdx !== null ? 'Save Changes' : 'Create Campaign Card'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Banners catalog items list */}
              {banners.length === 0 ? (
                <div className="py-8 text-center bg-zinc-50 border border-zinc-200 rounded">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">No additional Campaign banners in catalog.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {banners.map((b, idx) => (
                    <div key={idx} className="bg-white border border-zinc-200 p-3 rounded flex gap-3 hover:border-black transition-colors">
                      <img
                        src={b.imageUrl}
                        alt={b.title}
                        className="w-12 h-12 object-cover rounded bg-zinc-50 border border-zinc-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <span className="text-[8px] bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {b.badge || 'PROMO'}
                          </span>
                          <h6 className="text-[11px] font-bold text-zinc-900 truncate mt-1">{b.title}</h6>
                        </div>
                        <div className="flex items-center justify-between border-t border-zinc-100 pt-1.5 mt-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              // Make this campaign active on homepage
                              setBannerBadge(b.badge);
                              setBannerTitle(b.title);
                              setBannerDesc(b.description);
                              setBannerPrimaryCta(b.primaryCta);
                              setBannerSecondaryCta(b.secondaryCta);
                              setBannerImageUrl(b.imageUrl || '');
                              toast(`Campaign "${b.title}" selected! Click "Apply Live Offer Banner" above to publish.`, 'info');
                            }}
                            className="text-[9px] font-bold uppercase tracking-wider text-zinc-900 hover:underline"
                          >
                            Use as Hero
                          </button>
                          
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBannerIdx(idx);
                                setIsAddingBanner(true);
                                setNewBannerBadge(b.badge);
                                setNewBannerTitle(b.title);
                                setNewBannerDesc(b.description);
                                setNewBannerPrimaryCta(b.primaryCta);
                                setNewBannerSecondaryCta(b.secondaryCta || '');
                                setNewBannerImageUrl(b.imageUrl || '');
                              }}
                              className="p-1 text-zinc-400 hover:text-zinc-900"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteBanner(idx);
                                toast('Campaign banner removed from catalog', 'info');
                              }}
                              className="p-1 text-zinc-400 hover:text-black"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB: CRM CUSTOMER RELATIONSHIPS */}
      {activeTab === 'crm' && (
        <div className="space-y-6" id="admin-crm-tab">
          <div className="bg-white border border-zinc-200 p-6 rounded space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-100 pb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-zinc-900" />
                  Customer Purchase History & Spend Logs
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Search registered checkouts and track customer lifetime valuation metrics.</p>
              </div>

              {/* CRM Search input */}
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, phone, or email..."
                  value={crmSearchQuery}
                  onChange={(e) => setCrmSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs border border-zinc-200 rounded bg-white focus:outline-none focus:border-black font-semibold text-zinc-800"
                />
              </div>
            </div>

            {/* Customers table */}
            {(() => {
              const customerMap: Record<string, { name: string; email: string; phone: string; joinDate: string; totalSpend: number; ordersCount: number; pastOrders: Order[] }> = {};
              orders.forEach(order => {
                const email = (order.customerEmail || '').toLowerCase().trim();
                if (!email) return;
                if (!customerMap[email]) {
                  customerMap[email] = {
                    name: order.customerName,
                    email: order.customerEmail,
                    phone: order.customerPhone,
                    joinDate: new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    totalSpend: 0,
                    ordersCount: 0,
                    pastOrders: []
                  };
                }
                customerMap[email].totalSpend += order.totalAmount;
                customerMap[email].ordersCount += 1;
                customerMap[email].pastOrders.push(order);
              });
              const registeredCustomers = Object.values(customerMap);
              const filteredCustomers = registeredCustomers.filter(c => {
                const q = crmSearchQuery.toLowerCase().trim();
                return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
              });

              if (filteredCustomers.length === 0) {
                return (
                  <div className="py-16 text-center text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    🔍 No customer records found matching search queries.
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto" id="crm-table-container">
                  <table className="w-full text-xs text-left text-zinc-600 border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider text-[9px] bg-zinc-50">
                        <th className="py-3 px-4">Customer Name</th>
                        <th className="py-3 px-4">Contact Info</th>
                        <th className="py-3 px-4 text-center">First Purchase</th>
                        <th className="py-3 px-4 text-center">Orders Placed</th>
                        <th className="py-3 px-4 text-right">Lifetime Spend</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 font-semibold text-zinc-800">
                      {filteredCustomers.map((c) => (
                        <tr key={c.email} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-zinc-900">{c.name}</div>
                          </td>
                          <td className="py-3 px-4 text-[11px]">
                            <div>{c.email}</div>
                            <div className="text-[10px] text-zinc-400">{c.phone}</div>
                          </td>
                          <td className="py-3 px-4 text-center text-zinc-500">{c.joinDate}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="bg-zinc-50 border border-zinc-200 text-zinc-800 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                              {c.ordersCount} checkouts
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-zinc-900">
                            ₹{c.totalSpend.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedCustomerEmail(c.email)}
                              className="px-2.5 py-1 border border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-bold rounded text-[10px] uppercase tracking-wider transition-colors"
                            >
                              View History
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* TAB: CATEGORIES AND BRANDS CRUD */}
      {activeTab === 'categories_brands' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150" id="admin-categories-brands-tab">
          
          {/* Categories Manager Column */}
          <div className="bg-white border border-zinc-200 p-6 rounded space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-zinc-900" />
                Product Categories Manager
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Add, view, and delete product category definitions.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCategoryName.trim()) return;
                addCategory({
                  name: newCategoryName.trim(),
                  subcategories: newSubcategories.split(',').map(s => s.trim()).filter(Boolean),
                });
                setNewCategoryName('');
                setNewSubcategories('');
                toast('Category added to configuration successfully!', 'success');
              }}
              className="bg-zinc-50 p-4 border border-zinc-200 rounded space-y-3"
            >
              <h4 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">🏷️ Create New Category</h4>
              <div className="grid grid-cols-1 gap-3 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider block">Category Name</label>
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Phone Cases"
                    className="w-full px-3 py-1.5 border border-zinc-200 rounded bg-white font-semibold text-zinc-800 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider block">Subcategories (comma separated tags)</label>
                  <input
                    type="text"
                    value={newSubcategories}
                    onChange={(e) => setNewSubcategories(e.target.value)}
                    placeholder="e.g. Matte, MagSafe, Clear Protective"
                    className="w-full px-3 py-1.5 border border-zinc-200 rounded bg-white font-semibold text-zinc-800 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-black hover:bg-zinc-900 text-white font-bold rounded text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
              >
                Add Category definition
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="py-2">Category Name</th>
                    <th className="py-2">Subcategories tags</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-semibold text-zinc-800">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-zinc-50">
                      <td className="py-2.5 font-bold text-zinc-900">{cat.name}</td>
                      <td className="py-2.5 text-zinc-500 max-w-[150px] truncate">
                        {cat.subcategories.join(', ') || 'None'}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            deleteCategory(cat.id);
                            toast('Category definition removed', 'info');
                          }}
                          className="p-1 text-zinc-400 hover:text-black transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Brands Manager Column */}
          <div className="bg-white border border-zinc-200 p-6 rounded space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-zinc-900" />
                Product Brands Manager
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Manage brand partners, premium hardware manufacturers, and labels.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newBrandName.trim()) return;
                addBrand({ name: newBrandName.trim() });
                setNewBrandName('');
                toast('Brand partner registered successfully!', 'success');
              }}
              className="bg-zinc-50 p-4 border border-zinc-200 rounded space-y-3"
            >
              <h4 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">🏷️ Add Brand Partner</h4>
              <div className="space-y-1.5 text-xs">
                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider block">Brand Name</label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. Omexo Labs"
                  className="w-full px-3 py-1.5 border border-zinc-200 rounded bg-white font-semibold text-zinc-800 focus:outline-none focus:border-black"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-black hover:bg-zinc-900 text-white font-bold rounded text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
              >
                Register Brand Label
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="py-2">Registered Brand</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-semibold text-zinc-800">
                  {brands.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-50">
                      <td className="py-2.5 font-bold text-zinc-900">{b.name}</td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            deleteBrand(b.id);
                            toast('Brand definition removed', 'info');
                          }}
                          className="p-1 text-zinc-400 hover:text-black transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}


      {/* Dynamic CRM Customer purchase timeline modal drawer */}
      <AnimatePresence>
        {selectedCustomerEmail && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col border-l border-slate-100"
            >
              {(() => {
                const map: Record<string, { name: string; email: string; phone: string; joinDate: string; totalSpend: number; ordersCount: number; pastOrders: Order[] }> = {};
                orders.forEach(order => {
                  const email = (order.customerEmail || '').toLowerCase().trim();
                  if (!email) return;
                  if (!map[email]) {
                    map[email] = {
                      name: order.customerName,
                      email: order.customerEmail,
                      phone: order.customerPhone,
                      joinDate: new Date(order.createdAt).toLocaleDateString(),
                      totalSpend: 0,
                      ordersCount: 0,
                      pastOrders: []
                    };
                  }
                  map[email].totalSpend += order.totalAmount;
                  map[email].ordersCount += 1;
                  map[email].pastOrders.push(order);
                });
                const c = map[selectedCustomerEmail.toLowerCase().trim()];
                if (!c) return null;

                return (
                  <>
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[9px] bg-teal-50 text-teal-700 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                          Customer Profile
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-1">{c.name}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">{c.email} | {c.phone}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCustomerEmail(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Spend highlights */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="text-[9px] text-slate-400 uppercase font-bold">Lifetime spend</div>
                        <div className="text-sm font-black text-slate-800 mt-1">₹{c.totalSpend.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="text-[9px] text-slate-400 uppercase font-bold">Orders placed</div>
                        <div className="text-sm font-black text-slate-800 mt-1">{c.ordersCount} checkouts</div>
                      </div>
                    </div>

                    {/* Timeline logs */}
                    <div className="space-y-4 flex-1">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Checkout timeline history</h4>
                      <div className="space-y-3">
                        {c.pastOrders.map((order) => (
                          <div key={order.id} className="border border-slate-100 p-3.5 rounded-xl space-y-3 bg-white hover:border-slate-200/80 transition-colors">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-slate-800 font-mono">{order.id}</span>
                              <span className={`px-2 py-0.2 rounded-md ${
                                order.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {order.orderStatus}
                              </span>
                            </div>
                            
                            <div className="text-[10px] text-slate-400">
                              Placed on: {new Date(order.createdAt).toLocaleString('en-IN')}
                            </div>

                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-[11px] font-semibold text-slate-700">
                                  <span>{item.title} × {item.quantity}</span>
                                  <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                              ))}
                            </div>

                            <div className="border-t border-dashed border-slate-100 pt-2 flex justify-between items-center">
                              <span className="text-[10px] text-slate-400">Total transaction amount</span>
                              <span className="text-xs font-black text-slate-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* BULK LABELS PRINT PREVIEW MODAL */}
      <AnimatePresence>
        {isBulkPrinting && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex flex-col justify-between p-4 sm:p-6 print:p-0 overflow-y-auto">
            {/* Top Preview Controls bar - hidden when printing */}
            <div className="bg-white max-w-4xl w-full mx-auto p-4 rounded-2xl flex justify-between items-center shadow-2xl border border-slate-100 shrink-0 print:hidden mb-6">
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">A4 Bulk Shipping Label Printer</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Previewing precisely 6 labels per A4 sheets layout (2 columns × 3 rows grid) optimized for standard black-and-white printing.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkPrinting(false);
                    setSelectedOrderIds([]);
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-teal-600/10"
                >
                  <Printer className="w-4 h-4" />
                  Print Now
                </button>
              </div>
            </div>

            {/* Exact A4 dimensions print representation wrapper */}
            <div className="flex-1 w-full flex justify-center print:block">
              <div className="bg-white max-w-[210mm] w-full p-4 print:p-0 text-slate-900 space-y-8 flex flex-col bg-white">
                {(() => {
                  const selectedOrders = orders.filter((o) => selectedOrderIds.includes(o.id));
                  
                  // Chunk arrays into exactly groups of 6 labels per A4 page!
                  const size = 6;
                  const chunks: Order[][] = [];
                  for (let i = 0; i < selectedOrders.length; i += size) {
                    chunks.push(selectedOrders.slice(i, i + size));
                  }

                  if (chunks.length === 0) {
                    return (
                      <div className="py-16 text-center text-slate-400 text-xs font-bold font-sans">
                        No orders selected for printing. Please select checkouts to preview.
                      </div>
                    );
                  }

                  return chunks.map((chunk, chunkIdx) => (
                    <div
                      key={chunkIdx}
                      className="grid grid-cols-2 gap-4 bg-white print:m-0 print:p-0 print:h-[297mm] print:w-[210mm] print:page-break-after-always"
                      style={{ pageBreakAfter: chunkIdx < chunks.length - 1 ? 'always' : 'auto' }}
                    >
                      {chunk.map((order) => (
                        <div
                          key={order.id}
                          className="border-2 border-dashed border-slate-400 p-4 rounded-lg flex flex-col justify-between space-y-3 font-sans text-xs h-[92mm] max-h-[92mm] overflow-hidden"
                          style={{ boxSizing: 'border-box' }}
                        >
                          {/* Label Header */}
                          <div className="flex justify-between items-start border-b border-slate-300 pb-1.5">
                            <div>
                              <h5 className="font-black text-slate-900 text-[11px] leading-none uppercase">OMEXO PREMIUM</h5>
                              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wide mt-0.5 block">Logistics Dispatch Label</span>
                            </div>
                            <span className="text-[10px] font-black font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                              {order.paymentType}
                            </span>
                          </div>

                          {/* Recipient Address details */}
                          <div className="grid grid-cols-2 gap-3 border-b border-slate-200 pb-1.5">
                            <div className="space-y-0.5 border-r border-slate-200 pr-1.5">
                              <span className="text-[7px] font-bold text-teal-600 uppercase tracking-wider block">Ship To (Recipient):</span>
                              <p className="font-extrabold text-[10px] text-slate-900 leading-none">{order.customerName}</p>
                              <p className="text-[9px] text-slate-700 leading-tight font-semibold line-clamp-3 mt-0.5">{order.address}</p>
                              <div className="text-[9px] pt-1 space-y-0.5">
                                <div className="font-extrabold text-slate-900">PIN: {order.pincode}</div>
                                <div className="font-bold text-slate-800">Mob: {order.customerPhone}</div>
                              </div>
                            </div>
                            
                            <div className="space-y-0.5">
                              <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-wider block">From (Sender):</span>
                              <p className="font-bold text-[9px] text-slate-900 leading-none">Muhammed Sinan vk</p>
                              <p className="text-[8px] text-slate-500 leading-tight font-medium mt-0.5">ozhukour, palekod, kondotty, Malappuram, kerala</p>
                              <div className="text-[8px] pt-1 space-y-0.5">
                                <div className="font-bold text-slate-900">PIN: 673642</div>
                                <div className="font-bold text-slate-800">Mob: 8590181381</div>
                              </div>
                            </div>
                          </div>

                          {/* Items brief lists */}
                          <div className="bg-slate-50 p-2 rounded-md border border-slate-100 flex-1 min-h-[30px] overflow-hidden">
                            <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Package Contents:</span>
                            <div className="space-y-0.5">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-[9px] font-bold text-slate-800 leading-tight">
                                  <span className="truncate max-w-[120px]">{item.title}</span>
                                  <span>×{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bottom barcode and grand amounts */}
                          <div className="flex justify-between items-end border-t border-slate-300 pt-1.5">
                            <div className="space-y-0.5">
                              <span className="text-[8px] text-slate-400 block font-bold leading-none">ORDER REFERENCE REFERENCE</span>
                              <span className="font-mono font-black text-slate-900 text-[10px] leading-none">{order.id}</span>
                              <span className="text-[7px] text-slate-400 block leading-none mt-0.5">
                                Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[7px] font-bold text-slate-400 block uppercase">Collect Cash Total</span>
                              <span className="text-[13px] font-black text-slate-900">
                                {order.paymentType === 'COD' ? `₹${order.totalAmount.toLocaleString('en-IN')}` : 'PAID / ONLINE'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>


      {/* Dynamic Printing Slip overlay container */}
      {printingOrder && (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8 text-slate-800 space-y-6" id="invoice-print-layout">
          {/* Slip Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-none">OMEXO PREMIUM LABS</h2>
              <p className="text-xs text-slate-500">Invoice Slip & Courier Dispatch Label</p>
            </div>
            <div className="text-right">
              <h3 className="text-base font-bold font-mono text-slate-800">{printingOrder.id}</h3>
              <p className="text-xs text-slate-500">Date: {new Date(printingOrder.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Delivery Recipient deck */}
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div>
              <h4 className="font-bold uppercase text-slate-400 mb-1">SHIPPING DESTINATION</h4>
              <p className="font-bold text-sm text-slate-900">{printingOrder.customerName}</p>
              <p className="text-slate-600 leading-relaxed">{printingOrder.address}</p>
              <p className="font-bold text-slate-800">PINCODE: {printingOrder.pincode}</p>
              <p className="text-slate-600">Tel: {printingOrder.customerPhone}</p>
            </div>
            <div>
              <h4 className="font-bold uppercase text-slate-400 mb-1">BILLING INFORMATION</h4>
              <p className="text-slate-600">Payment type: <strong>{printingOrder.paymentType}</strong></p>
              <p className="text-slate-600">Payment Status: <strong>{printingOrder.paymentStatus}</strong></p>
              <p className="text-slate-600">Consignment Ref: <strong>{printingOrder.consignmentNumber || 'Awaiting dispatch'}</strong></p>
            </div>
          </div>

          {/* Itemized Grid List */}
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th className="py-2">Sl. No</th>
                <th className="py-2">Tech Product / Item Details</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {printingOrder.items.map((item, idx) => (
                <tr key={idx} className="py-2">
                  <td className="py-2">{idx + 1}</td>
                  <td className="py-2 font-bold">{item.title}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals computation */}
          <div className="border-t-2 border-slate-800 pt-4 flex justify-between items-end">
            <div className="text-[10px] text-slate-400">
              * Thank you for your business. Certified by Omexo central assembly warehousing.
            </div>
            <div className="text-right space-y-1">
              <div className="text-xs text-slate-500">Shipping: FREE</div>
              <div className="text-sm font-bold text-slate-800">Paid Grand Total</div>
              <div className="text-lg font-black text-slate-900">₹{printingOrder.totalAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      )}


      {/* Custom Deletion Confirmation Modal */}
      <AnimatePresence>
        {deletingProductId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-5 text-center"
            >
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-800">Confirm Deletion</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you absolutely sure you want to delete this product? This action is irreversible and will remove the item from the live store catalog immediately.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingProductId(null)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deletingProductId) {
                      deleteProduct(deletingProductId);
                      setDeletingProductId(null);
                      toast('Product deleted from inventory', 'info');
                    }
                  }}
                  className="py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-red-600/10 cursor-pointer"
                >
                  Delete Live
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
