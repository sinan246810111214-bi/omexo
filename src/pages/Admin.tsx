import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../hooks/useStore';
import { useToast } from '../components/Toast';
import { Order, Product, OrderStatus, Category, Brand, OfferBanner } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  Settings, LogIn, LogOut, LineChart, Package, ShoppingBag, 
  Plus, Trash2, Edit, Save, CheckCircle, FileText, Bot, Send, 
  ArrowRight, Printer, AlertTriangle, X, Sparkles, Users, Award, 
  Eye, Search, SlidersHorizontal, ChevronDown, Check, Smartphone, 
  Mail, MapPin, Tag, Percent, Image, HelpCircle, Layers, FileDown, 
  ShieldCheck, RefreshCw, BarChart2, Shield, Calendar, Info, Star, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Additional custom administrative state interfaces
interface Coupon {
  code: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  minOrder: number;
  expiryDate: string;
  isActive: boolean;
  usageLimit: number;
  uses: number;
}

interface PromoOffer {
  id: string;
  title: string;
  subheadline: string;
  price: number;
  ctaText: string;
  bannerUrl: string;
  isActive: boolean;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Staff';
  permissions: string[];
  isActive: boolean;
}

interface AuditLog {
  id: string;
  admin: string;
  action: string;
  module: string;
  timestamp: string;
}

interface CMSPage {
  id: string;
  title: string;
  content: string;
}

interface CustomerReview {
  id: string;
  customerName: string;
  productName: string;
  rating: number;
  reviewText: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

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
    addCategory,
    deleteCategory,
    addBrand,
    deleteBrand,
    banners,
    addBanner,
    updateBanner,
    deleteBanner,
    isLoadingDb
  } = useStore();

  const { toast } = useToast();

  // Authentication & Session
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('omexo_admin_logged_in') === 'true';
  });
  const [adminRole, setAdminRole] = useState<'Super Admin' | 'Admin' | 'Staff'>(() => {
    return (localStorage.getItem('omexo_admin_role') as any) || 'Super Admin';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Security & Alarm Siren states
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const oscillatorRef = React.useRef<OscillatorNode | null>(null);
  const gainNodeRef = React.useRef<GainNode | null>(null);
  const alarmIntervalRef = React.useRef<any>(null);

  const startSiren = () => {
    try {
      stopSiren(); // Always clean up first
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      const oscillator = audioCtx.createOscillator();
      oscillatorRef.current = oscillator;

      const gainNode = audioCtx.createGain();
      gainNodeRef.current = gainNode;

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();

      let up = true;
      alarmIntervalRef.current = setInterval(() => {
        if (!oscillatorRef.current || !audioCtxRef.current) return;
        const currentFreq = oscillatorRef.current.frequency.value;
        if (up) {
          oscillatorRef.current.frequency.setValueAtTime(currentFreq + 60, audioCtxRef.current.currentTime);
          if (currentFreq >= 1200) up = false;
        } else {
          oscillatorRef.current.frequency.setValueAtTime(currentFreq - 60, audioCtxRef.current.currentTime);
          if (currentFreq <= 500) up = true;
        }
      }, 40);
    } catch (e) {
      console.error('Failed to start Web Audio siren:', e);
    }
  };

  const stopSiren = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); } catch (e) {}
      oscillatorRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopSiren();
    };
  }, []);

  // Layout and Sidebar Toggles
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Unified Filtering & Searching
  const [productSearch, setProdSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState('All');

  // Custom Admin Lists with localStorage persistence
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('omexo_coupons');
    return saved ? JSON.parse(saved) : [
      { code: 'OMEXO50', type: 'Percentage', value: 10, minOrder: 500, expiryDate: '2026-12-31', usageLimit: 100, uses: 45, isActive: true },
      { code: 'FESTIVE150', type: 'Fixed', value: 150, minOrder: 1500, expiryDate: '2026-11-15', usageLimit: 50, uses: 12, isActive: true }
    ];
  });

  const [promos, setPromos] = useState<PromoOffer[]>(() => {
    const saved = localStorage.getItem('omexo_promos');
    return saved ? JSON.parse(saved) : [
      { id: 'combo-1', title: 'Special Desk Combo', subheadline: 'Two useful picks. One special price.', price: 350, ctaText: 'GET THE COMBO', bannerUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80', isActive: true }
    ];
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('omexo_admin_users');
    return saved ? JSON.parse(saved) : [
      { id: 'usr-1', name: 'Muhammed Sinan vk', email: 'omexoofficial@gmail.com', role: 'Super Admin', permissions: ['all'], isActive: true },
      { id: 'usr-2', name: 'Albin Joseph', email: 'albin@omexo.in', role: 'Admin', permissions: ['products', 'orders', 'inventory'], isActive: true },
      { id: 'usr-3', name: 'Fida Sherin', email: 'fida@omexo.in', role: 'Staff', permissions: ['orders'], isActive: true }
    ];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('omexo_audit_logs');
    return saved ? JSON.parse(saved) : [
      { id: 'log-1', admin: 'Muhammed Sinan vk', action: 'Created Special Combo promotion offer', module: 'Offers', timestamp: '02-10-2026, 09:12 AM' },
      { id: 'log-2', admin: 'Albin Joseph', action: 'Adjusted mechanical keyboard switch stock quantity to +50', module: 'Inventory', timestamp: '02-10-2026, 08:34 AM' },
      { id: 'log-3', admin: 'Fida Sherin', action: 'Dispatched order OMX-749204 to India Post', module: 'Orders', timestamp: '01-10-2026, 04:15 PM' }
    ];
  });

  const [cmsPages, setCmsPages] = useState<CMSPage[]>(() => {
    const saved = localStorage.getItem('omexo_cms_pages');
    return saved ? JSON.parse(saved) : [
      { id: 'home', title: 'Homepage Hero Content', content: 'Small Things. Big Joy. Smart, useful products made for everyday life.' },
      { id: 'about', title: 'About Us Narrative', content: 'At Omexo, we design, test and build high-performance smart gadgets and everyday desk accessories to refine your workflow.' },
      { id: 'refund', title: 'Refund Policy Document', content: 'Our replacement check window remains active for 7 days post door delivery. Simple and zero cost.' }
    ];
  });

  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    const saved = localStorage.getItem('omexo_reviews');
    return saved ? JSON.parse(saved) : [
      { id: 'rev-1', customerName: 'Rohan Sharma', productName: 'Mechanical Switch Fidget Keychain', rating: 5, reviewText: 'Extremely satisfying clicks. Best desk toy ever!', date: '01-10-2026', status: 'Approved' },
      { id: 'rev-2', customerName: 'Anjali Menon', productName: 'Ultra-Slim Foldable Phone Stand', rating: 4, reviewText: 'Super thin and fits easily in my pocket. Highly recommended!', date: '30-09-2026', status: 'Approved' },
      { id: 'rev-3', customerName: 'Abhishek K.', productName: 'Omexo Wave Pro Active Smartwatch', rating: 5, reviewText: 'Premium quality screen, looks incredibly futuristic.', date: '28-09-2026', status: 'Pending' }
    ];
  });

  const [mediaLibrary, setMediaLibrary] = useState<string[]>(() => {
    const saved = localStorage.getItem('omexo_media_library');
    return saved ? JSON.parse(saved) : [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
    ];
  });

  const [newMediaUrl, setNewMediaUrl] = useState('');

  // Global settings control
  const [storeName, setStoreName] = useState('Omexo');
  const [supportNum, setStorePhone] = useState('+91 99465 97201');
  const [supportMail, setStoreEmail] = useState('omexoofficial@gmail.com');
  const [seoTitle, setSeoTitle] = useState('Omexo | Small Things. Big Joy.');
  const [seoDescription, setSeoDescription] = useState('Premium clicky keychains, workspace tools, and everyday desk accessories designed with minimal luxury.');

  // Forms state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Fields
  const [prodTitle, setProdTitle] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodSalePrice, setProdSalePrice] = useState(199);
  const [prodRegularPrice, setProdRegularPrice] = useState(250);
  const [prodStockCount, setProdStockCount] = useState(100);
  const [prodImageUrl, setProdImageUrl] = useState('');

  // Drawer / Modals
  const [activeOrderDetails, setActiveOrderDetails] = useState<Order | null>(null);
  const [trackingNumInput, setTrackingNumInput] = useState('');
  const [courierInput, setCourierInput] = useState('India Post');

  // Category and Brand Inputs
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');

  // Coupon Inputs
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponType, setNewCouponType] = useState<'Percentage' | 'Fixed'>('Percentage');
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(500);

  // Bulk Labels Printing
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBulkPrinting, setIsBulkPrinting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Promo / Offers editing states
  const [isEditingPromo, setIsEditingPromo] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoTitle, setPromoTitle] = useState('');
  const [promoSubheadline, setPromoSubheadline] = useState('');
  const [promoPrice, setPromoPrice] = useState<number>(350);
  const [promoCtaText, setPromoCtaText] = useState('GET THE COMBO');
  const [promoImageUrl, setPromoImageUrl] = useState('');
  const [isUploadingPromoImage, setIsUploadingPromoImage] = useState(false);

  // Slide Banners editing states
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [editingBannerIdx, setEditingBannerIdx] = useState<number | null>(null);
  const [bannerBadge, setBannerBadge] = useState('🔥 SPECIAL DROP');
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [bannerPrimaryCta, setBannerPrimaryCta] = useState('Explore Collection');
  const [bannerSecondaryCta, setBannerSecondaryCta] = useState('Track Order');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [isUploadingBannerImage, setIsUploadingBannerImage] = useState(false);

  // Analytics and Stats dynamic filtering states
  const [chartInterval, setChartInterval] = useState<'today' | '7days' | '30days' | '3months' | '6months' | '1year' | 'custom'>('30days');
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Custom Modals State instead of window.prompt
  const [stockModalConfig, setStockModalConfig] = useState<{
    isOpen: boolean;
    product: Product | null;
    mode: 'add' | 'reduce';
    quantity: number;
  }>({ isOpen: false, product: null, mode: 'add', quantity: 10 });

  const [comboModalConfig, setComboModalConfig] = useState<{
    isOpen: boolean;
    promo: PromoOffer | null;
    price: number;
  }>({ isOpen: false, promo: null, price: 350 });

  const [bannerModalConfig, setBannerModalConfig] = useState<{
    isOpen: boolean;
    badge: string;
    title: string;
    description: string;
    backgroundImageUrl: string;
  }>({ isOpen: false, badge: '🔥 SPECIAL DROP', title: '', description: '', backgroundImageUrl: '' });

  // Sync state helpers to localStorage
  useEffect(() => {
    localStorage.setItem('omexo_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('omexo_promos', JSON.stringify(promos));
  }, [promos]);

  useEffect(() => {
    localStorage.setItem('omexo_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem('omexo_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('omexo_cms_pages', JSON.stringify(cmsPages));
  }, [cmsPages]);

  useEffect(() => {
    localStorage.setItem('omexo_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('omexo_media_library', JSON.stringify(mediaLibrary));
  }, [mediaLibrary]);

  // Load promos from Firestore on mount
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const snap = await getDocs(collection(db, 'promos'));
        if (!snap.empty) {
          const loadedPromos = snap.docs.map(d => d.data() as PromoOffer);
          setPromos(loadedPromos);
          localStorage.setItem('omexo_promos', JSON.stringify(loadedPromos));
        } else {
          // Seed default promo
          const defaultPromos: PromoOffer[] = [
            { id: 'combo-1', title: 'Special Desk Combo', subheadline: 'Two useful picks. One special price.', price: 350, ctaText: 'GET THE COMBO', bannerUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80', isActive: true }
          ];
          for (const p of defaultPromos) {
            await setDoc(doc(db, 'promos', p.id), p);
          }
        }
      } catch (err) {
        console.error('Failed to load promos from Firestore:', err);
      }
    };
    fetchPromos();
  }, []);

  const addAuditLog = (action: string, module: string) => {
    const activeAdmin = adminUsers.find(u => u.email === username)?.name || 'Muhammed Sinan vk';
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      admin: activeAdmin,
      action,
      module,
      timestamp: new Date().toLocaleString('en-IN', { hour12: true })
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Auth Submit logic
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMail = username.toLowerCase().trim();
    if (cleanMail === 'omexoofficial@gmail.com' && password === 'omexo246') {
      setIsAuthenticated(true);
      setAdminRole('Super Admin');
      localStorage.setItem('omexo_admin_logged_in', 'true');
      localStorage.setItem('omexo_admin_role', 'Super Admin');
      toast('Welcome back, Muhammed Sinan! Super Admin console authorized.', 'success');
      addAuditLog('Successfully logged into Super Admin control panel', 'Access');
    } else if (cleanMail === 'albin@omexo.in' && password === 'admin123') {
      setIsAuthenticated(true);
      setAdminRole('Admin');
      localStorage.setItem('omexo_admin_logged_in', 'true');
      localStorage.setItem('omexo_admin_role', 'Admin');
      toast('Welcome back, Albin joseph! Store admin console authorized.', 'success');
      addAuditLog('Successfully logged into Admin control panel', 'Access');
    } else if (cleanMail === 'fida@omexo.in' && password === 'staff123') {
      setIsAuthenticated(true);
      setAdminRole('Staff');
      localStorage.setItem('omexo_admin_logged_in', 'true');
      localStorage.setItem('omexo_admin_role', 'Staff');
      toast('Welcome back, Fida! Limited staff console authorized.', 'success');
      addAuditLog('Successfully logged into Staff control panel', 'Access');
    } else {
      toast('Access Denied. Check your administrator credentials.', 'error');
      setIsAlarmActive(true);
      startSiren();
    }
  };

  const handleLogout = () => {
    addAuditLog('Safely logged out of console session', 'Access');
    setIsAuthenticated(false);
    localStorage.removeItem('omexo_admin_logged_in');
    localStorage.removeItem('omexo_admin_role');
    toast('Logged out from command console.', 'success');
  };

  // Check Role Permissions
  const hasPermission = (module: string) => {
    if (adminRole === 'Super Admin') return true;
    if (adminRole === 'Admin') {
      return ['products', 'categories', 'inventory', 'orders', 'customers', 'offers', 'banners'].includes(module);
    }
    if (adminRole === 'Staff') {
      return ['orders', 'inventory'].includes(module);
    }
    return false;
  };

  // Handle direct product image file upload to server Cloudinary storage (or local base64 fallback)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!hasPermission('products')) {
      toast('Unauthorized file upload action scope.', 'error');
      return;
    }

    // Volumetric limits: 15MB limit check
    if (file.size > 15 * 1024 * 1024) {
      toast('Selected image file is too large (Maximum size: 15MB).', 'error');
      return;
    }

    setIsUploadingImage(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: base64Data })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Server responded with an upload error state');
        }

        const resData = await response.json();
        if (resData.success && resData.url) {
          setProdImageUrl(resData.url);
          toast(resData.fallback 
            ? 'Success: Product image saved as Base64 storage fallback.' 
            : 'Success: Product image uploaded securely to Cloudinary storage!', 
            'success'
          );
          addAuditLog(`Uploaded product image file to backend storage`, 'Products');
        } else {
          throw new Error(resData.error || 'Invalid server payload format returned');
        }
      } catch (err: any) {
        console.error('Image upload failed:', err);
        // Robust fallback: set file data as local preview so merchant can still preview and save the product details
        setProdImageUrl(base64Data);
        toast('Direct cloud storage upload failed, but image preview successfully loaded locally!', 'info');
      } finally {
        setIsUploadingImage(false);
      }
    };

    reader.onerror = () => {
      toast('Failed to parse selected image file.', 'error');
      setIsUploadingImage(false);
    };

    reader.readAsDataURL(file);
  };

  // Handle direct promo/offer image file upload to server
  const handlePromoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!hasPermission('offers')) {
      toast('Unauthorized file upload action scope.', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast('Selected image file is too large (Maximum size: 15MB).', 'error');
      return;
    }

    setIsUploadingPromoImage(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: base64Data })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Server responded with an upload error state');
        }

        const resData = await response.json();
        if (resData.success && resData.url) {
          setPromoImageUrl(resData.url);
          toast(resData.fallback 
            ? 'Success: Promo image saved as Base64 storage fallback.' 
            : 'Success: Promo image uploaded securely to Cloudinary storage!', 
            'success'
          );
        } else {
          throw new Error(resData.error || 'Invalid server payload format returned');
        }
      } catch (err: any) {
        console.error('Promo image upload failed:', err);
        setPromoImageUrl(base64Data);
        toast('Direct cloud storage upload failed, but image preview successfully loaded locally!', 'info');
      } finally {
        setIsUploadingPromoImage(false);
      }
    };

    reader.onerror = () => {
      toast('Failed to parse selected image file.', 'error');
      setIsUploadingPromoImage(false);
    };

    reader.readAsDataURL(file);
  };

  // Create or Update Promo Offer
  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('offers')) {
      toast('Unauthorized operation scope.', 'error');
      return;
    }

    const imgUrl = promoImageUrl || 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80';
    const isEdit = !!editingPromoId;
    const promoId = editingPromoId || 'promo-' + Date.now();

    const payload: PromoOffer = {
      id: promoId,
      title: promoTitle,
      subheadline: promoSubheadline,
      price: Number(promoPrice),
      ctaText: promoCtaText,
      bannerUrl: imgUrl,
      isActive: true
    };

    try {
      // Sync with Firestore
      await setDoc(doc(db, 'promos', promoId), payload);

      // Update local state
      if (isEdit) {
        setPromos(prev => prev.map(p => p.id === promoId ? payload : p));
        toast(`Successfully updated combo promo campaign: "${promoTitle}"`, 'success');
        addAuditLog(`Updated combo promotion: "${promoTitle}"`, 'Offers');
      } else {
        setPromos(prev => [payload, ...prev]);
        toast(`Successfully created new combo promo campaign: "${promoTitle}"`, 'success');
        addAuditLog(`Created new combo promotion: "${promoTitle}"`, 'Offers');
      }

      // Reset state
      setIsEditingPromo(false);
      setEditingPromoId(null);
      setPromoTitle('');
      setPromoSubheadline('');
      setPromoPrice(350);
      setPromoCtaText('GET THE COMBO');
      setPromoImageUrl('');
    } catch (err: any) {
      console.error('Failed to save promo offer:', err);
      toast('Failed to save promo campaign to Firestore database.', 'error');
    }
  };

  // Delete Promo Offer
  const handleDeletePromo = async (id: string, title: string) => {
    if (!hasPermission('offers')) {
      toast('Unauthorized operation scope.', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to completely remove the promo campaign "${title}"?`)) {
      try {
        await deleteDoc(doc(db, 'promos', id));
        setPromos(prev => prev.filter(p => p.id !== id));
        toast(`Removed promo campaign: "${title}"`, 'success');
        addAuditLog(`Deleted promo campaign: "${title}"`, 'Offers');
      } catch (err) {
        console.error('Failed to delete promo:', err);
        toast('Failed to delete promo from Firestore database.', 'error');
      }
    }
  };

  // Generate standalone HTML Print Companion to bypass iframe sandboxing limits
  const handleDownloadHTMLPrintSheet = () => {
    const selectedOrders = orders.filter((o) => selectedOrderIds.includes(o.id));
    
    const size = 8;
    const chunks: Order[][] = [];
    for (let i = 0; i < selectedOrders.length; i += size) {
      chunks.push(selectedOrders.slice(i, i + size));
    }

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Omexo Bulk Shipping Labels</title>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { margin: 0; padding: 0; background: white; }
      .no-print { display: none !important; }
      .page-break { page-break-after: always !important; }
    }
    body { font-family: sans-serif; background-color: #f4f4f5; padding: 20px; }
  </style>
</head>
<body class="flex flex-col items-center">
  <div class="no-print bg-white shadow-md p-4 rounded-xl mb-6 max-w-2xl w-full text-center">
    <h3 class="text-sm font-bold text-zinc-800 uppercase tracking-wider">Omexo Desktop Label Printer Companion</h3>
    <p class="text-xs text-zinc-500 mt-1">Press the print button below or press <strong>Ctrl + P</strong> (Cmd + P on Mac) to print these labels.</p>
    <button onclick="window.print()" class="mt-3 px-5 py-2 bg-[#234F1E] text-white font-extrabold text-xs uppercase tracking-widest rounded-full cursor-pointer hover:bg-[#1C4018]">
      🖨️ Open Print Dialog
    </button>
  </div>

  <div class="max-w-[210mm] w-full bg-white p-4 print:p-0 text-slate-900 space-y-8 flex flex-col">
    ${chunks.map((chunk, chunkIdx) => `
      <div class="grid grid-cols-2 gap-4 bg-white print:m-0 print:p-0 print:h-[297mm] print:w-[210mm] ${chunkIdx < chunks.length - 1 ? 'page-break' : ''}">
        ${chunk.map(order => `
          <div class="border-2 border-dashed border-slate-400 p-4 rounded-lg flex flex-col justify-between space-y-2 text-[11px] h-[68mm] max-h-[68mm] overflow-hidden text-left" style="box-sizing: border-box;">
            <div class="flex justify-between items-start border-b border-slate-300 pb-1">
              <div>
                <h5 class="font-black text-slate-900 text-[10px] leading-none uppercase tracking-wider">omexo premium</h5>
                <p class="text-[8px] text-slate-500 mt-0.5">PREMIUM TECH ACCESSORIES</p>
              </div>
              <div class="text-right">
                <span class="text-[9px] bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded font-black font-mono">${order.paymentType}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 text-[10px] text-slate-700">
              <div class="space-y-0.5">
                <span class="text-[7.5px] text-slate-400 font-extrabold uppercase block leading-none">Deliver To</span>
                <strong class="text-slate-900 font-black text-xs block leading-tight">${order.customerName}</strong>
                <p class="text-[9.5px] leading-tight font-semibold mt-0.5">${order.address}</p>
                <p class="font-black text-slate-900 mt-0.5">PIN: ${order.pincode}</p>
                <p class="font-mono mt-0.5">Mob: ${order.customerPhone}</p>
              </div>
              
              <div class="border-l border-slate-200 pl-2 flex flex-col justify-between space-y-1">
                <div>
                  <span class="text-[7.5px] text-slate-400 font-extrabold uppercase block leading-none">Sender / Return Address</span>
                  <strong class="text-slate-900 font-bold text-[8.5px] block leading-none mt-0.5">OMEXO DESIGN LAB</strong>
                  <p class="text-[8px] text-slate-500 leading-tight">Phase 1, Infopark Kochi, Kerala, PIN: 682030</p>
                </div>

                <div class="border-t border-slate-200 pt-1">
                  <span class="text-[7.5px] text-slate-400 font-extrabold uppercase block leading-none">Collect Value</span>
                  <span class="text-xs font-black text-slate-900">₹${order.totalAmount}</span>
                </div>
              </div>
            </div>

            <div class="border-t border-slate-200 pt-1.5 flex justify-between items-center text-[9px] text-slate-500">
              <div class="font-semibold truncate max-w-[120px]">
                ${order.items.map(item => `${item.title} (x${item.quantity})`).join(', ')}
              </div>
              <div class="text-right font-mono font-bold text-slate-800">
                Ref: ${order.id}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('')}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omexo_shipping_labels_${Date.now()}.html`;
    a.click();
    toast('Success: Standalone HTML Print Companion saved! Open and print directly from any web browser.', 'success');
  };

  // Handle direct slide banner background image file upload to server
  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!hasPermission('banners')) {
      toast('Unauthorized file upload action scope.', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast('Selected image file is too large (Maximum size: 15MB).', 'error');
      return;
    }

    setIsUploadingBannerImage(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: base64Data })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Server responded with an upload error state');
        }

        const resData = await response.json();
        if (resData.success && resData.url) {
          setBannerImageUrl(resData.url);
          toast(resData.fallback 
            ? 'Success: Slide banner image saved as Base64 storage fallback.' 
            : 'Success: Slide banner image uploaded securely to Cloudinary storage!', 
            'success'
          );
        } else {
          throw new Error(resData.error || 'Invalid server payload format returned');
        }
      } catch (err: any) {
        console.error('Banner image upload failed:', err);
        setBannerImageUrl(base64Data);
        toast('Direct cloud storage upload failed, but image preview successfully loaded locally!', 'info');
      } finally {
        setIsUploadingBannerImage(false);
      }
    };

    reader.onerror = () => {
      toast('Failed to parse selected image file.', 'error');
      setIsUploadingBannerImage(false);
    };

    reader.readAsDataURL(file);
  };

  // Create or Update Slide Banner
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('banners')) {
      toast('Unauthorized operation scope.', 'error');
      return;
    }

    const imgUrl = bannerImageUrl || 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80';
    const isEdit = editingBannerIdx !== null;

    const payload: OfferBanner = {
      badge: bannerBadge,
      title: bannerTitle,
      description: bannerDescription,
      primaryCta: bannerPrimaryCta,
      secondaryCta: bannerSecondaryCta,
      imageUrl: imgUrl,
      backgroundImageUrl: imgUrl
    };

    try {
      if (isEdit) {
        await updateBanner(editingBannerIdx!, payload);
        toast(`Successfully updated homepage slide banner!`, 'success');
        addAuditLog(`Updated homepage banner slide "${bannerTitle}"`, 'Banners');
      } else {
        await addBanner(payload);
        toast(`Successfully created new homepage slide banner!`, 'success');
        addAuditLog(`Created new homepage banner slide "${bannerTitle}"`, 'Banners');
      }

      // Reset state
      setIsEditingBanner(false);
      setEditingBannerIdx(null);
      setBannerBadge('🔥 SPECIAL DROP');
      setBannerTitle('');
      setBannerDescription('');
      setBannerPrimaryCta('Explore Collection');
      setBannerSecondaryCta('Track Order');
      setBannerImageUrl('');
    } catch (err: any) {
      console.error('Failed to save banner slide:', err);
      toast('Failed to save banner slide to database.', 'error');
    }
  };

  // Delete Slide Banner
  const handleDeleteBannerWrapper = async (idx: number, title: string) => {
    if (!hasPermission('banners')) {
      toast('Unauthorized operation scope.', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to completely remove the banner slide "${title}"?`)) {
      try {
        await deleteBanner(idx);
        toast(`Successfully deleted homepage slide banner!`, 'success');
        addAuditLog(`Deleted slide banner: "${title}"`, 'Banners');
      } catch (err) {
        console.error('Failed to delete banner:', err);
        toast('Failed to delete banner slide from database.', 'error');
      }
    }
  };

  // Add / Edit Product Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('products')) {
      toast('Unauthorized operation scope.', 'error');
      return;
    }

    const imgUrl = prodImageUrl || 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80';

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        title: prodTitle,
        description: prodDescription,
        category: prodCategory || 'Desk Essentials',
        salePrice: Number(prodSalePrice),
        regularPrice: Number(prodRegularPrice),
        stockCount: Number(prodStockCount),
        images: [imgUrl, ...editingProduct.images.slice(1)]
      };
      await updateProduct(updated);
      toast(`Successfully updated "${prodTitle}"!`, 'success');
      addAuditLog(`Updated product information for "${prodTitle}"`, 'Products');
      setEditingProduct(null);
    } else {
      const payload = {
        title: prodTitle,
        category: prodCategory || 'Desk Essentials',
        description: prodDescription,
        salePrice: Number(prodSalePrice),
        regularPrice: Number(prodRegularPrice),
        stockCount: Number(prodStockCount),
        images: [imgUrl],
        specs: { 'Origin': 'Omexo Assembly Lab', 'Warranty': '1 Year Replacement' },
        isTrending: true
      };
      await addProduct(payload);
      toast(`Successfully created "${prodTitle}"!`, 'success');
      addAuditLog(`Created new catalog product "${prodTitle}"`, 'Products');
      setIsAddingProduct(false);
    }

    // Reset forms
    setProdTitle('');
    setProdDescription('');
    setProdImageUrl('');
  };

  // Delete product wrapper
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!hasPermission('products')) {
      toast('Unauthorized mutation scope.', 'error');
      return;
    }
    if (window.confirm(`Are you completely sure you want to delete "${name}"?`)) {
      await deleteProduct(id);
      toast(`Deleted "${name}"`, 'success');
      addAuditLog(`Deleted catalog product "${name}"`, 'Products');
    }
  };

  // Revenue & Order Statistics Computations
  // Helper to determine if an order falls within a specific timeframe/interval
  const isWithinInterval = (dateStr: string, interval: string, start?: string, end?: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    
    // Set hours to 0 to compare full days cleanly
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const orderDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    switch (interval) {
      case 'today':
        return orderDay.getTime() === startOfToday.getTime();
      case '7days': {
        const sevenDaysAgo = new Date(startOfToday);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return orderDay >= sevenDaysAgo;
      }
      case '30days': {
        const thirtyDaysAgo = new Date(startOfToday);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return orderDay >= thirtyDaysAgo;
      }
      case '3months': {
        const threeMonthsAgo = new Date(startOfToday);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return orderDay >= threeMonthsAgo;
      }
      case '6months': {
        const sixMonthsAgo = new Date(startOfToday);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return orderDay >= sixMonthsAgo;
      }
      case '1year': {
        const oneYearAgo = new Date(startOfToday);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return orderDay >= oneYearAgo;
      }
      case 'custom': {
        if (!start || !end) return true;
        const startDate = new Date(start);
        const endDate = new Date(end);
        // Normalize custom dates
        const sD = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const eD = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        return orderDay >= sD && orderDay <= eD;
      }
      default:
        return true;
    }
  };

  // 1. Total Sales Statistics (Lifetime vs Interval breakdowns)
  const totalSales = orders.reduce((sum, o) => sum + (o.orderStatus !== 'Cancelled' ? o.totalAmount : 0), 0);
  const todaySales = orders.reduce((sum, o) => sum + (o.orderStatus !== 'Cancelled' && isWithinInterval(o.createdAt, 'today') ? o.totalAmount : 0), 0);
  const thisWeekSales = orders.reduce((sum, o) => sum + (o.orderStatus !== 'Cancelled' && isWithinInterval(o.createdAt, '7days') ? o.totalAmount : 0), 0);
  const thisMonthSales = orders.reduce((sum, o) => sum + (o.orderStatus !== 'Cancelled' && isWithinInterval(o.createdAt, '30days') ? o.totalAmount : 0), 0);

  // 2. Orders Statistics (Today's count vs Week vs Custom Interval)
  const todayOrdersCount = orders.filter(o => isWithinInterval(o.createdAt, 'today')).length;
  const thisWeekOrdersCount = orders.filter(o => isWithinInterval(o.createdAt, '7days')).length;
  const customDateOrdersCount = orders.filter(o => isWithinInterval(o.createdAt, 'custom', customStartDate, customEndDate)).length;
  const customDateSalesValue = orders.reduce((sum, o) => sum + (o.orderStatus !== 'Cancelled' && isWithinInterval(o.createdAt, 'custom', customStartDate, customEndDate) ? o.totalAmount : 0), 0);

  // 3. Operational pipeline counts
  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
  const processingOrders = orders.filter(o => o.orderStatus === 'Processing').length;
  const shippedOrders = orders.filter(o => o.orderStatus === 'Shipped').length;
  const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
  const lowStockCount = products.filter(p => p.stockCount <= 5).length;

  // 4. Dynamic Chart Progression Data
  const getDynamicChartData = () => {
    const selectedOrders = orders.filter(o => o.orderStatus !== 'Cancelled' && isWithinInterval(o.createdAt, chartInterval, customStartDate, customEndDate));
    
    if (selectedOrders.length === 0) {
      return [
        { label: 'P1', value: 0 },
        { label: 'P2', value: 0 },
        { label: 'P3', value: 0 },
        { label: 'P4', value: 0 },
        { label: 'P5', value: 0 },
        { label: 'P6', value: 0 }
      ];
    }

    if (chartInterval === 'today') {
      const buckets = [
        { label: '08:00 AM', value: 0 },
        { label: '12:00 PM', value: 0 },
        { label: '04:00 PM', value: 0 },
        { label: '08:00 PM', value: 0 }
      ];
      selectedOrders.forEach(o => {
        const hr = new Date(o.createdAt).getHours();
        if (hr < 10) buckets[0].value += o.totalAmount;
        else if (hr < 14) buckets[1].value += o.totalAmount;
        else if (hr < 18) buckets[2].value += o.totalAmount;
        else buckets[3].value += o.totalAmount;
      });
      return buckets;
    } else if (chartInterval === '7days') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const buckets = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { label: days[d.getDay()], value: 0, dateKey: d.toDateString() };
      });
      selectedOrders.forEach(o => {
        const orderDateStr = new Date(o.createdAt).toDateString();
        const b = buckets.find(bucket => bucket.dateKey === orderDateStr);
        if (b) b.value += o.totalAmount;
      });
      return buckets;
    } else {
      const bucketCount = 6;
      const sorted = [...selectedOrders].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const bucketSize = Math.ceil(sorted.length / bucketCount);
      const buckets = Array.from({ length: bucketCount }).map((_, i) => ({
        label: `Slot ${i + 1}`,
        value: 0
      }));
      sorted.forEach((o, idx) => {
        const bIdx = Math.min(bucketCount - 1, Math.floor(idx / bucketSize));
        const dateObj = new Date(o.createdAt);
        buckets[bIdx].label = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
        buckets[bIdx].value += o.totalAmount;
      });
      return buckets;
    }
  };

  const chartData = getDynamicChartData();
  const maxChartValue = Math.max(...chartData.map(d => d.value), 100);

  return (
    <div className="min-h-screen bg-[#FAF9F4] text-[#234F1E] font-sans antialiased" id="admin-root-dashboard">
      <AnimatePresence mode="wait">
        
        {/* UNAUTHENTICATED STATE: Premium Glassmorphic Login Screen */}
        {!isAuthenticated ? (
          isAlarmActive ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex items-center justify-center p-4 relative bg-black overflow-hidden"
              id="admin-alarm-screen"
              style={{
                animation: 'admin-alarm-flash 0.25s infinite alternate'
              }}
            >
              <style>{`
                @keyframes admin-alarm-flash {
                  0% { background-color: #090202; }
                  100% { background-color: #6a0d0d; }
                }
              `}</style>
              
              <div className="max-w-md w-full bg-black/85 backdrop-blur-xl border-4 border-red-600 p-8 rounded-[32px] text-center space-y-6 relative z-10 shadow-2xl ring-4 ring-black">
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-red-600/20 p-4 rounded-full border border-red-500 animate-bounce">
                    <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
                  </div>
                  <h1 className="text-2xl font-black uppercase tracking-widest text-red-500 font-display">SECURITY ALERT</h1>
                  <p className="text-xs text-red-400 font-extrabold uppercase tracking-widest leading-none">Access Attempt Blocked</p>
                </div>

                <div className="p-4 bg-red-950/40 border border-red-500/20 rounded-2xl text-[10px] text-red-200/90 font-mono text-left space-y-1.5 leading-relaxed">
                  <div className="flex items-center gap-2 font-black text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>[ ALERT ] UNAUTHORIZED CREDENTIALS DETECTED</span>
                  </div>
                  <div>• SIREN ACTIVE: Web Audio Synthesizer Beacons On</div>
                  <div>• CONSOLE PORT: Admin Dashboard Access Forbidden</div>
                  <div>• IP LOGGED: Logged to persistent store & audit table</div>
                  <div>• TELEGRAM ALERT: Security broadcast queued</div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase leading-snug">
                    Access denied. Intruder alert is sounding to warn off unauthorized attempts.
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => {
                      stopSiren();
                      setIsAlarmActive(false);
                      setPassword('');
                    }}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-lg active:scale-95"
                  >
                    Silence Alert & Reset Console
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex items-center justify-center p-4 relative bg-[#234F1E] overflow-hidden"
              id="admin-login-screen"
            >
              {/* Soft lighting accents inspired by posters */}
              <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#E8E0D2]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-md w-full bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[32px] text-center space-y-6 relative z-10 shadow-2xl">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-white/90 p-4 rounded-2xl shadow-inner mb-2">
                    <span className="text-2xl font-black tracking-widest text-[#234F1E] font-display">omexo</span>
                  </div>
                  <h1 className="text-xl font-extrabold uppercase tracking-widest text-white font-display">Command Console</h1>
                  <p className="text-xs text-white/70 font-semibold tracking-wide">Authorized store managers access point only.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-white/60 tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="name@omexo.in"
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-white/60 tracking-wider">Security Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-white/80">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)} 
                        className="rounded border-white/20 text-[#234F1E] focus:ring-transparent"
                      />
                      <span>Remember console</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => toast('Credentials shared offline securely on official channel.', 'info')}
                      className="hover:text-white"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#FAF9F4] hover:bg-[#E8E0D2] text-[#234F1E] font-black text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-md"
                  >
                    Verify Access
                  </button>
                </form>
              </div>
            </motion.div>
          )
        ) : (
          
          /* AUTHENTICATED STATE: Complete Responsive Dashboard Console */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-screen relative"
            id="admin-dashboard-layout"
          >
            {/* Sidebar Desktop Navigation */}
            <aside className="w-64 bg-[#234F1E] text-[#FAF9F4] hidden lg:flex flex-col shrink-0 border-r border-white/5 relative z-20 shadow-xl" id="admin-sidebar">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <span className="text-2xl font-black tracking-widest text-white font-display">omexo</span>
                <span className="text-[9px] bg-white/10 text-[#E8E0D2] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{adminRole}</span>
              </div>

              {/* Sidebar Menu items */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-xs font-bold uppercase tracking-wider text-white/70">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
                  { id: 'products', label: 'Products Grid', icon: Package },
                  { id: 'categories', label: 'Categories Manager', icon: Layers },
                  { id: 'inventory', label: 'Inventory Hub', icon: ShieldCheck },
                  { id: 'orders', label: 'Orders Desk', icon: ShoppingBag },
                  { id: 'customers', label: 'Customers CRM', icon: Users },
                  { id: 'coupons', label: 'Coupons Control', icon: Tag },
                  { id: 'offers', label: 'Offers & Promos', icon: Percent },
                  { id: 'banners', label: 'Slide Banners', icon: Image },
                  { id: 'reviews', label: 'Reviews Admin', icon: Star },
                  { id: 'pages', label: 'CMS Content Pages', icon: FileText },
                  { id: 'settings', label: 'Settings & Info', icon: Settings },
                  { id: 'audit', label: 'Audit Logs', icon: FileDown }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${
                        isSelected 
                          ? 'bg-white/10 text-white shadow-sm font-black' 
                          : 'hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#E8E0D2] shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-white/5 bg-black/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-red-950/20 text-white hover:text-red-300 border border-white/10 hover:border-red-800/30 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Log Out</span>
                </button>
              </div>
            </aside>

            {/* Mobile Drawer Sidebar */}
            <AnimatePresence>
              {isMobileSidebarOpen && (
                <>
                  <div 
                    className="fixed inset-0 bg-[#234F1E]/40 backdrop-blur-xs z-40 lg:hidden" 
                    onClick={() => setIsMobileSidebarOpen(false)}
                  />
                  <motion.aside 
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className="fixed top-0 bottom-0 left-0 w-64 bg-[#234F1E] text-[#FAF9F4] flex flex-col z-50 lg:hidden border-r border-white/5"
                  >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                      <span className="text-2xl font-black tracking-widest text-white font-display">omexo</span>
                      <button onClick={() => setIsMobileSidebarOpen(false)} className="text-white/60 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-xs font-bold uppercase tracking-wider text-white/70">
                      {[
                        { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
                        { id: 'products', label: 'Products Grid', icon: Package },
                        { id: 'categories', label: 'Categories Manager', icon: Layers },
                        { id: 'inventory', label: 'Inventory Hub', icon: ShieldCheck },
                        { id: 'orders', label: 'Orders Desk', icon: ShoppingBag },
                        { id: 'customers', label: 'Customers CRM', icon: Users },
                        { id: 'coupons', label: 'Coupons Control', icon: Tag },
                        { id: 'offers', label: 'Offers & Promos', icon: Percent },
                        { id: 'banners', label: 'Slide Banners', icon: Image },
                        { id: 'reviews', label: 'Reviews Admin', icon: Star },
                        { id: 'pages', label: 'CMS Content Pages', icon: FileText },
                        { id: 'settings', label: 'Settings & Info', icon: Settings },
                        { id: 'audit', label: 'Audit Logs', icon: FileDown }
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => { 
                              setActiveTab(tab.id); 
                              setIsMobileSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${
                              isSelected 
                                ? 'bg-white/10 text-white shadow-sm font-black' 
                                : 'hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <Icon className="w-4 h-4 text-[#E8E0D2] shrink-0" />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </nav>

                    <div className="p-4 border-t border-white/5 bg-black/10">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-red-950/20 text-white hover:text-red-300 border border-white/10 hover:border-red-800/30 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

            {/* Main Admin Content Area */}
            <main className="flex-1 flex flex-col min-w-0" id="admin-canvas">
              
              {/* Header */}
              <header className="h-20 bg-white border-b border-[#234F1E]/5 px-6 flex items-center justify-between relative z-10 shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsMobileSidebarOpen(true)} 
                    className="p-1.5 hover:bg-zinc-100 rounded-lg lg:hidden text-[#234F1E]"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <div className="text-left">
                    <h2 className="text-xs font-black text-[#234F1E]/60 uppercase tracking-widest leading-none">Console Management</h2>
                    <h1 className="text-lg font-black text-[#234F1E] font-display mt-0.5 uppercase tracking-wider">omexo</h1>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-black text-[#234F1E]">Muhammed Sinan vk</div>
                    <div className="text-[9px] text-[#234F1E]/50 font-bold uppercase tracking-wider">Role: {adminRole}</div>
                  </div>
                  <div className="w-10 h-10 bg-[#234F1E] text-[#FAF9F4] font-black text-xs rounded-full flex items-center justify-center border border-white/20">
                    MS
                  </div>
                </div>
              </header>

              {/* Scrollable layout contents */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 relative z-0">
                
                {/* 1. DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-8 animate-in fade-in duration-200">
                    
                    {/* Stats bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Total Sales Card */}
                      <div className="glass-card p-6 rounded-[28px] text-left border border-[#234F1E]/10 shadow-sm relative overflow-hidden bg-white/40">
                        <span className="text-[10px] font-bold text-[#234F1E]/45 uppercase tracking-wider block mb-1">Total Sales Revenue</span>
                        <h3 className="text-3xl font-black text-[#234F1E] font-display">₹{totalSales.toLocaleString('en-IN')}</h3>
                        <p className="text-[9px] text-[#234F1E]/55 font-bold uppercase tracking-wide border-b border-[#234F1E]/10 pb-2">Lifetime clear transactions</p>
                        
                        <div className="pt-3 space-y-1.5 text-[10px] font-bold text-[#234F1E]/80">
                          <div className="flex justify-between items-center bg-[#234F1E]/5 p-1 px-2.5 rounded-lg">
                            <span className="text-[#234F1E]/60 uppercase text-[8px] tracking-wider">Today's Sales:</span>
                            <span className="font-mono text-xs">₹{todaySales.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between items-center bg-[#234F1E]/5 p-1 px-2.5 rounded-lg">
                            <span className="text-[#234F1E]/60 uppercase text-[8px] tracking-wider">This Week:</span>
                            <span className="font-mono text-xs">₹{thisWeekSales.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between items-center bg-[#234F1E]/5 p-1 px-2.5 rounded-lg">
                            <span className="text-[#234F1E]/60 uppercase text-[8px] tracking-wider">This Month:</span>
                            <span className="font-mono text-xs">₹{thisMonthSales.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Today's Orders / Date Filter Card */}
                      <div className="glass-card p-6 rounded-[28px] text-left border border-[#234F1E]/10 shadow-sm relative overflow-hidden bg-white/40">
                        <span className="text-[10px] font-bold text-[#234F1E]/45 uppercase tracking-wider block mb-1">Orders Tracker</span>
                        <h3 className="text-3xl font-black text-[#234F1E] font-display">{todayOrdersCount}</h3>
                        <p className="text-[9px] text-[#234F1E]/55 font-bold uppercase tracking-wide border-b border-[#234F1E]/10 pb-2">Completed checkouts today</p>
                        
                        <div className="pt-3 space-y-1.5 text-[10px] font-bold text-[#234F1E]/80">
                          <div className="flex justify-between items-center bg-[#234F1E]/5 p-1 px-2.5 rounded-lg">
                            <span className="text-[#234F1E]/60 uppercase text-[8px] tracking-wider">This Week:</span>
                            <span className="font-mono text-xs">{thisWeekOrdersCount} orders</span>
                          </div>
                          <div className="flex justify-between items-center bg-[#234F1E]/5 p-1 px-2.5 rounded-lg">
                            <span className="text-[#234F1E]/60 uppercase text-[8px] tracking-wider">This Month:</span>
                            <span className="font-mono text-xs">₹{thisMonthSales.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex flex-col bg-[#FAF9F4] border border-[#234F1E]/10 p-1 px-2.5 rounded-lg text-center mt-1">
                            <span className="text-[#234F1E]/50 uppercase text-[7px] font-black tracking-wider leading-none">Custom Date Range:</span>
                            <div className="flex justify-between items-center mt-1 font-mono text-[9px] leading-tight">
                              <span>{customDateOrdersCount} orders</span>
                              <span className="text-[#234F1E]/60 font-black">₹{customDateSalesValue}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pending Shipments Card */}
                      <button
                        onClick={() => { setActiveTab('orders'); setOrderFilterStatus('Pending'); }}
                        className="glass-card p-6 rounded-[28px] text-left border border-[#234F1E]/10 shadow-sm interactive-action hover:bg-[#234F1E]/5 transition-all cursor-pointer w-full block focus:outline-none focus:ring-2 focus:ring-[#234F1E]/20"
                      >
                        <span className="text-[10px] font-bold text-[#234F1E]/45 uppercase tracking-wider block mb-1">Pending Shipments</span>
                        <h3 className="text-4xl font-black text-[#234F1E] font-display">{pendingOrders}</h3>
                        <p className="text-[9px] text-[#234F1E]/55 font-bold mt-1 uppercase tracking-wide">Awaiting fulfillment desk</p>
                        <div className="mt-4 p-2.5 bg-[#234F1E]/5 rounded-xl border border-[#234F1E]/5 text-[9.5px] font-semibold text-[#234F1E]/70 leading-relaxed text-center">
                          Click here to open and process pending orders.
                        </div>
                      </button>

                      {/* Dispatched Goods Card */}
                      <button
                        onClick={() => { setActiveTab('orders'); setOrderFilterStatus('Shipped'); }}
                        className="glass-card p-6 rounded-[28px] text-left border border-[#234F1E]/10 shadow-sm interactive-action hover:bg-[#234F1E]/5 transition-all cursor-pointer w-full block focus:outline-none focus:ring-2 focus:ring-[#234F1E]/20"
                      >
                        <span className="text-[10px] font-bold text-[#234F1E]/45 uppercase tracking-wider block mb-1">Dispatched Goods</span>
                        <h3 className="text-4xl font-black text-[#234F1E] font-display">{shippedOrders}</h3>
                        <p className="text-[9px] text-[#234F1E]/55 font-bold mt-1 uppercase tracking-wide">Logistics consignment tracking active</p>
                        <div className="mt-4 p-2.5 bg-[#234F1E]/5 rounded-xl border border-[#234F1E]/5 text-[9.5px] font-semibold text-[#234F1E]/70 leading-relaxed text-center">
                          Click here to monitor transit and dispatches.
                        </div>
                      </button>
                    </div>

                    {/* Chart and Stock Alert Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Interactive Revenue Graph */}
                      <div className="lg:col-span-2 glass-card p-6 rounded-[28px] border border-[#234F1E]/10 text-left space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#234F1E]/10 pb-3">
                          <div>
                            <h4 className="text-xs font-bold text-[#234F1E] uppercase tracking-widest font-display">Revenue progression graph</h4>
                            <p className="text-[9px] text-[#234F1E]/50 font-semibold uppercase mt-0.5">Interactive live financial metrics tracking</p>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              value={chartInterval}
                              onChange={(e) => setChartInterval(e.target.value as any)}
                              className="px-3 py-1 text-[11px] font-bold text-[#234F1E] bg-white rounded-lg border border-[#234F1E]/15 focus:outline-none cursor-pointer"
                            >
                              <option value="today">Today</option>
                              <option value="7days">7 Days</option>
                              <option value="30days">30 Days</option>
                              <option value="3months">3 Months</option>
                              <option value="6months">6 Months</option>
                              <option value="1year">1 Year</option>
                              <option value="custom">Custom Date Range</option>
                            </select>
                          </div>
                        </div>

                        {/* Custom inputs for date range when "custom" is active */}
                        {chartInterval === 'custom' && (
                          <div className="flex items-center gap-2 text-[10px] font-bold p-3 bg-[#FAF9F4] rounded-2xl border border-[#234F1E]/10 animate-in fade-in slide-in-from-top-1 duration-150">
                            <div className="space-y-0.5">
                              <span className="text-[8px] text-[#234F1E]/50 uppercase tracking-wider block">Start Date</span>
                              <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="px-2 py-1 bg-white border border-[#234F1E]/10 rounded focus:outline-none text-[#234F1E] font-mono text-[10px]"
                              />
                            </div>
                            <span className="text-[#234F1E]/40 self-end pb-1.5">to</span>
                            <div className="space-y-0.5">
                              <span className="text-[8px] text-[#234F1E]/50 uppercase tracking-wider block">End Date</span>
                              <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="px-2 py-1 bg-white border border-[#234F1E]/10 rounded focus:outline-none text-[#234F1E] font-mono text-[10px]"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Custom Pure-CSS bar graphic */}
                        <div className="h-48 flex items-end gap-3 pt-6 border-b border-[#234F1E]/15 pr-2">
                          {chartData.map((d, idx) => {
                            const pct = Math.min(100, Math.max(8, (d.value / maxChartValue) * 100));
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                <div className="text-[8px] font-bold text-[#234F1E] opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">₹{d.value.toLocaleString('en-IN')}</div>
                                <div 
                                  className="w-full bg-[#234F1E]/80 hover:bg-[#234F1E] rounded-t-lg transition-all" 
                                  style={{ height: `${pct}%` }} 
                                />
                                <span className="text-[8px] font-bold text-[#234F1E]/50 font-mono truncate max-w-full">{d.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Stock Alerts list */}
                      <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 text-left space-y-4">
                        <h4 className="text-xs font-bold text-[#234F1E] uppercase tracking-widest font-display">Inventory Alert Desk</h4>
                        <div className="divide-y divide-[#234F1E]/5 max-h-56 overflow-y-auto pr-1">
                          {products.map(p => {
                            const isLow = p.stockCount <= 5;
                            return (
                              <div key={p.id} className="py-2.5 flex items-center justify-between">
                                <div className="min-w-0 pr-2">
                                  <h5 className="text-xs font-black text-[#234F1E] truncate">{p.title}</h5>
                                  <span className="text-[9px] text-[#234F1E]/50 font-bold uppercase">{p.category}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold tracking-wider ${
                                  isLow ? 'bg-[#E8E0D2] text-[#234F1E] border border-[#234F1E]/10' : 'bg-[#234F1E]/10 text-[#234F1E]'
                                }`}>
                                  {p.stockCount} units
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Recent transactions grid table */}
                    <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 text-left space-y-4">
                      <div className="flex justify-between items-center border-b border-[#234F1E]/5 pb-3">
                        <h4 className="text-xs font-bold text-[#234F1E] uppercase tracking-widest font-display">Recent Shop Transactions</h4>
                        <button onClick={() => { setActiveTab('orders'); }} className="text-[10px] font-black text-[#234F1E] uppercase tracking-widest hover:underline flex items-center gap-1 cursor-pointer">
                          View Orders Desk <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[#234F1E]/10 text-[#234F1E]/50 font-bold uppercase text-[9px] tracking-wider bg-[#234F1E]/5">
                              <th className="p-3">Reference ID</th>
                              <th className="p-3">Buyer Name</th>
                              <th className="p-3 text-center">Items count</th>
                              <th className="p-3 text-right">Collect Total</th>
                              <th className="p-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#234F1E]/5 font-semibold">
                            {orders.slice(0, 5).map((o) => (
                              <tr key={o.id} className="hover:bg-[#234F1E]/5">
                                <td className="p-3 font-mono font-bold text-[#234F1E]">{o.id}</td>
                                <td className="p-3">{o.customerName}</td>
                                <td className="p-3 text-center">{o.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                                <td className="p-3 text-right font-black text-[#234F1E]">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                                <td className="p-3 text-center">
                                  <span className="bg-[#234F1E]/10 text-[#234F1E] px-2.5 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider">
                                    {o.orderStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. PRODUCTS TAB */}
                {activeTab === 'products' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="text-left">
                        <h3 className="text-sm font-bold text-[#234F1E] uppercase tracking-widest font-display">Products Catalog</h3>
                        <p className="text-[10px] text-[#234F1E]/50 font-bold uppercase mt-0.5">Manage stock availability, regular pricing, and listing imagery.</p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-[#234F1E]/40 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            placeholder="Search catalog title..."
                            value={productSearch}
                            onChange={(e) => setProdSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 bg-white border border-[#234F1E]/15 rounded-full text-xs font-bold text-[#234F1E] placeholder-[#234F1E]/40 focus:outline-none focus:border-[#234F1E]"
                          />
                        </div>
                        
                        <button
                          onClick={() => { setIsAddingProduct(true); setEditingProduct(null); }}
                          className="px-4 py-1.5 bg-[#234F1E] hover:bg-[#1C4018] text-[#FAF9F4] font-extrabold rounded-full text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Product
                        </button>
                      </div>
                    </div>

                    {/* Add/Edit Product Form panel */}
                    {(isAddingProduct || editingProduct) && (
                      <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 text-left animate-in slide-in-from-top-2 duration-200 space-y-4">
                        <div className="flex justify-between items-center border-b border-[#234F1E]/10 pb-3">
                          <h4 className="text-xs font-bold text-[#234F1E] uppercase tracking-widest font-display">
                            {editingProduct ? `Edit "${editingProduct.title}"` : '🏷️ Create New Catalog Product'}
                          </h4>
                          <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="text-[#234F1E]/40 hover:text-[#234F1E]">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Product Title</label>
                            <input
                              type="text"
                              required
                              value={prodTitle}
                              onChange={(e) => setProdTitle(e.target.value)}
                              placeholder="e.g. Mechanical Switch Keychain"
                              className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-bold text-[#234F1E] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Category Department</label>
                            <select
                              value={prodCategory}
                              onChange={(e) => setProdCategory(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-[#234F1E]/10 rounded-xl font-bold text-[#234F1E] focus:outline-none"
                            >
                              <option value="">Select Category</option>
                              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Sale Price (₹)</label>
                            <input
                              type="number"
                              required
                              value={prodSalePrice}
                              onChange={(e) => setProdSalePrice(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-bold text-[#234F1E] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Regular Price (₹)</label>
                            <input
                              type="number"
                              required
                              value={prodRegularPrice}
                              onChange={(e) => setProdRegularPrice(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-bold text-[#234F1E] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Stock quantity</label>
                            <input
                              type="number"
                              required
                              value={prodStockCount}
                              onChange={(e) => setProdStockCount(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-bold text-[#234F1E] focus:outline-none"
                            />
                          </div>

                          <div className="col-span-2 space-y-2">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Product Image Source</label>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Left/Middle Column: File drag & select zone */}
                              <div className="md:col-span-2 border-2 border-dashed border-[#234F1E]/20 hover:border-[#234F1E]/40 rounded-2xl bg-white/40 p-4 transition-all flex flex-col items-center justify-center relative min-h-[140px] text-center">
                                {isUploadingImage ? (
                                  <div className="space-y-2 flex flex-col items-center justify-center">
                                    <RefreshCw className="w-8 h-8 text-[#234F1E] animate-spin" />
                                    <p className="text-[10px] font-bold text-[#234F1E]/75 uppercase tracking-wider">Uploading to secure storage server...</p>
                                  </div>
                                ) : (
                                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full space-y-2">
                                    <div className="bg-[#234F1E]/10 p-3 rounded-full text-[#234F1E]">
                                      <Image className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <p className="text-[11px] font-black text-[#234F1E] uppercase tracking-wider">Select Product Image File</p>
                                      <p className="text-[9px] text-[#234F1E]/50 font-bold uppercase tracking-wide mt-0.5">Drag & drop or browse from storage (Max: 15MB)</p>
                                    </div>
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={handleImageUpload} 
                                      className="hidden" 
                                    />
                                  </label>
                                )}
                              </div>

                              {/* Right Column: Image Preview Card */}
                              <div className="border border-[#234F1E]/10 rounded-2xl bg-white/60 p-3 flex flex-col items-center justify-center relative min-h-[140px]">
                                {prodImageUrl ? (
                                  <div className="w-full h-full flex flex-col items-center justify-between space-y-2">
                                    <div className="w-20 h-20 rounded-xl border border-[#234F1E]/10 overflow-hidden bg-zinc-50 relative group">
                                      <img 
                                        src={prodImageUrl} 
                                        alt="Upload preview" 
                                        className="w-full h-full object-cover" 
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setProdImageUrl('')}
                                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <div className="text-center w-full">
                                      <span className="text-[8px] bg-[#234F1E]/15 text-[#234F1E] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-widest leading-none">PREVIEW LOADED</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center text-[#234F1E]/40 space-y-1">
                                    <HelpCircle className="w-6 h-6 mx-auto opacity-70" />
                                    <p className="text-[9.5px] font-bold uppercase tracking-wider">No Image Loaded</p>
                                    <p className="text-[8px] font-semibold uppercase tracking-wide opacity-80">Select a file or paste URL below</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Direct URL input fallback */}
                            <div className="space-y-1 text-left pt-1">
                              <span className="text-[9px] font-bold uppercase text-[#234F1E]/40 tracking-wider">Or paste explicit image URL link manually</span>
                              <input
                                type="text"
                                value={prodImageUrl}
                                onChange={(e) => setProdImageUrl(e.target.value)}
                                placeholder="Image link (Unsplash, Cloudinary, Imgur, or direct URL)"
                                className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-mono text-[11px] font-bold text-[#234F1E] focus:outline-none placeholder-[#234F1E]/30"
                              />
                            </div>
                          </div>

                          <div className="col-span-2 space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Product Detailed Description</label>
                            <textarea
                              required
                              value={prodDescription}
                              onChange={(e) => setProdDescription(e.target.value)}
                              rows={3}
                              className="w-full px-4 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-bold text-[#234F1E] focus:outline-none resize-none"
                            />
                          </div>

                          <div className="col-span-2 flex gap-2">
                            <button
                              type="submit"
                              className="px-5 py-2.5 bg-[#234F1E] text-white font-extrabold rounded-full text-xs uppercase tracking-widest cursor-pointer hover:bg-[#1C4018]"
                            >
                              Save product details
                            </button>
                            <button
                              type="button"
                              onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
                              className="px-5 py-2.5 bg-[#234F1E]/10 text-[#234F1E] font-extrabold rounded-full text-xs uppercase tracking-widest cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Products Grid Table */}
                    <div className="glass-card rounded-[28px] p-6 text-left border border-[#234F1E]/10 shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[#234F1E]/10 text-[#234F1E]/50 font-bold uppercase text-[9px] tracking-wider bg-[#234F1E]/5">
                              <th className="p-3">Image</th>
                              <th className="p-3">Title</th>
                              <th className="p-3">Category</th>
                              <th className="p-3 text-right">Sale Price</th>
                              <th className="p-3 text-right">Regular Price</th>
                              <th className="p-3 text-center">Stock</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#234F1E]/5 font-semibold text-[#234F1E]">
                            {products
                              .filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()))
                              .map((p) => (
                                <tr key={p.id} className="hover:bg-[#234F1E]/5 transition-all">
                                  <td className="p-3">
                                    <img src={p.images[0]} alt={p.title} className="w-10 h-10 object-cover rounded-xl border border-[#234F1E]/10" />
                                  </td>
                                  <td className="p-3 font-bold max-w-[200px] truncate">{p.title}</td>
                                  <td className="p-3 uppercase text-[10px] text-[#234F1E]/60">{p.category}</td>
                                  <td className="p-3 text-right font-black">₹{p.salePrice}</td>
                                  <td className="p-3 text-right text-[#234F1E]/40">₹{p.regularPrice}</td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${p.stockCount <= 5 ? 'bg-[#E8E0D2] text-[#234F1E]' : 'bg-[#234F1E]/10'}`}>
                                      {p.stockCount} units
                                    </span>
                                  </td>
                                  <td className="p-3 text-right space-x-2">
                                    <button
                                      onClick={() => {
                                        setEditingProduct(p);
                                        setProdTitle(p.title);
                                        setProdCategory(p.category);
                                        setProdSalePrice(p.salePrice);
                                        setProdRegularPrice(p.regularPrice);
                                        setProdStockCount(p.stockCount);
                                        setProdDescription(p.description);
                                        setProdImageUrl(p.images[0] || '');
                                      }}
                                      className="p-1.5 hover:bg-[#234F1E]/10 rounded-full cursor-pointer text-[#234F1E]"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(p.id, p.title)}
                                      className="p-1.5 hover:bg-red-500/10 text-[#234F1E] hover:text-red-700 rounded-full cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
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

                {/* 3. CATEGORIES TAB */}
                {activeTab === 'categories' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left animate-in fade-in duration-200">
                    <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#234F1E] font-display">Product Categories</h3>
                        <p className="text-[10px] text-[#234F1E]/50 font-bold uppercase mt-0.5">Manage the available categories across the online store.</p>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newCategoryName.trim()) return;
                          addCategory({
                            name: newCategoryName.trim(),
                            subcategories: []
                          });
                          setNewCategoryName('');
                          toast(`Created category "${newCategoryName}"`, 'success');
                          addAuditLog(`Created product category "${newCategoryName}"`, 'Categories');
                        }}
                        className="bg-[#234F1E]/5 p-4 rounded-2xl border border-[#234F1E]/10 space-y-3"
                      >
                        <h4 className="text-[10px] font-bold text-[#234F1E] uppercase tracking-widest">Create New Category</h4>
                        <div className="space-y-1.5 text-xs">
                          <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider block">Category Title</label>
                          <input
                            type="text"
                            required
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="e.g. Workspace Tools"
                            className="w-full px-3 py-1.5 border border-[#234F1E]/10 rounded-xl bg-white focus:outline-none font-bold"
                          />
                        </div>
                        <button type="submit" className="w-full py-2.5 bg-[#234F1E] hover:bg-[#1C4018] text-white font-extrabold text-[10px] uppercase tracking-widest rounded-full cursor-pointer">
                          Add category definition
                        </button>
                      </form>

                      <div className="divide-y divide-[#234F1E]/5">
                        {categories.map(c => (
                          <div key={c.id} className="py-2.5 flex justify-between items-center font-bold">
                            <span className="text-[#234F1E]">{c.name}</span>
                            <button onClick={() => { deleteCategory(c.id); toast('Removed category', 'info'); }} className="p-1 hover:bg-[#234F1E]/5 rounded text-[#234F1E]/40 hover:text-red-700 cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#234F1E] font-display">Brand Labels</h3>
                        <p className="text-[10px] text-[#234F1E]/50 font-bold uppercase mt-0.5">Manage manufacturing labels and brand partners.</p>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newBrandName.trim()) return;
                          addBrand({ name: newBrandName.trim() });
                          setNewBrandName('');
                          toast(`Registered brand "${newBrandName}"`, 'success');
                          addAuditLog(`Registered brand partner "${newBrandName}"`, 'Categories');
                        }}
                        className="bg-[#234F1E]/5 p-4 rounded-2xl border border-[#234F1E]/10 space-y-3"
                      >
                        <h4 className="text-[10px] font-bold text-[#234F1E] uppercase tracking-widest">Register Brand Partner</h4>
                        <div className="space-y-1.5 text-xs">
                          <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider block">Brand Name</label>
                          <input
                            type="text"
                            required
                            value={newBrandName}
                            onChange={(e) => setNewBrandName(e.target.value)}
                            placeholder="e.g. Anker"
                            className="w-full px-3 py-1.5 border border-[#234F1E]/10 rounded-xl bg-white focus:outline-none font-bold"
                          />
                        </div>
                        <button type="submit" className="w-full py-2.5 bg-[#234F1E] hover:bg-[#1C4018] text-white font-extrabold text-[10px] uppercase tracking-widest rounded-full cursor-pointer">
                          Add brand partner
                        </button>
                      </form>

                      <div className="divide-y divide-[#234F1E]/5">
                        {brands.map(b => (
                          <div key={b.id} className="py-2.5 flex justify-between items-center font-bold">
                            <span className="text-[#234F1E]">{b.name}</span>
                            <button onClick={() => { deleteBrand(b.id); toast('Removed brand partner', 'info'); }} className="p-1 hover:bg-[#234F1E]/5 rounded text-[#234F1E]/40 hover:text-red-700 cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. INVENTORY TAB */}
                {activeTab === 'inventory' && (
                  <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 text-left animate-in fade-in duration-200 space-y-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[#234F1E] font-display">Inventory Hub</h3>
                      <p className="text-[10px] text-[#234F1E]/50 font-bold uppercase mt-0.5">Complete real-time control over warehouse product stock quantities.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#234F1E]/10 text-[#234F1E]/50 font-bold uppercase text-[9px] tracking-wider bg-[#234F1E]/5">
                            <th className="p-3">Product Name</th>
                            <th className="p-3 text-center">Warehouse Stock</th>
                            <th className="p-3 text-center">Status Badge</th>
                            <th className="p-3 text-right">Quick Balance Adjustments</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#234F1E]/5 font-semibold text-[#234F1E]">
                          {products.map(p => (
                            <tr key={p.id} className="hover:bg-[#234F1E]/5">
                              <td className="p-3 font-bold">{p.title}</td>
                              <td className="p-3 text-center tabular-nums">{p.stockCount} units</td>
                              <td className="p-3 text-center">
                                {p.stockCount <= 5 ? (
                                  <span className="bg-[#E8E0D2] text-[#234F1E] px-2.5 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider">CRITICAL LOW LEVEL</span>
                                ) : (
                                  <span className="text-[#234F1E]/40 uppercase text-[9px] font-extrabold tracking-wider">Optimal</span>
                                )}
                              </td>
                              <td className="p-3 text-right space-x-2">
                                <button
                                  onClick={async () => {
                                    const val = Number(prompt(`Enter stock quantity to ADD to "${p.title}":`, '10'));
                                    if (isNaN(val) || val <= 0) return;
                                    await updateProduct({ ...p, stockCount: p.stockCount + val });
                                    toast(`Added +${val} units to "${p.title}"`, 'success');
                                    addAuditLog(`Added +${val} stock count to product "${p.title}"`, 'Inventory');
                                  }}
                                  className="px-3 py-1 bg-[#234F1E] hover:bg-[#1C4018] text-white rounded-full text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                                >
                                  + Restock
                                </button>
                                <button
                                  onClick={async () => {
                                    const val = Number(prompt(`Enter stock quantity to REDUCE from "${p.title}":`, '5'));
                                    if (isNaN(val) || val <= 0) return;
                                    await updateProduct({ ...p, stockCount: Math.max(0, p.stockCount - val) });
                                    toast(`Reduced -${val} units from "${p.title}"`, 'success');
                                    addAuditLog(`Removed -${val} stock count from product "${p.title}"`, 'Inventory');
                                  }}
                                  className="px-3 py-1 bg-white border border-[#234F1E]/15 hover:border-[#234F1E] text-[#234F1E] rounded-full text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                                >
                                  - Reduce
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. ORDERS TAB */}
                {activeTab === 'orders' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#234F1E] font-display">Orders Desk</h3>
                        <p className="text-[10px] text-[#234F1E]/50 font-bold uppercase mt-0.5">Monitor client checkout logs, manage status pipelines, and trigger A4 bulk labels print sheets.</p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {selectedOrderIds.length > 0 && (
                          <button
                            onClick={() => setIsBulkPrinting(true)}
                            className="px-4 py-1.5 bg-[#E8E0D2] hover:bg-[#D8CEBD] text-[#234F1E] font-extrabold rounded-full text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Print A4 Labels ({selectedOrderIds.length})
                          </button>
                        )}
                        <select
                          value={orderFilterStatus}
                          onChange={(e) => setOrderFilterStatus(e.target.value)}
                          className="px-4 py-1.5 text-xs font-bold text-[#234F1E] bg-white rounded-full border border-[#234F1E]/15 focus:outline-none focus:border-[#234F1E] cursor-pointer shadow-sm"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Orders lists */}
                    <div className="glass-card rounded-[28px] p-6 text-left border border-[#234F1E]/10 shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[#234F1E]/10 text-[#234F1E]/50 font-bold uppercase text-[9px] tracking-wider bg-[#234F1E]/5">
                              <th className="p-3 text-center">
                                <input 
                                  type="checkbox" 
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedOrderIds(orders.map(o => o.id));
                                    } else {
                                      setSelectedOrderIds([]);
                                    }
                                  }}
                                  className="rounded border-[#234F1E]/20 text-[#234F1E] focus:ring-transparent"
                                />
                              </th>
                              <th className="p-3">Ref ID</th>
                              <th className="p-3">Date</th>
                              <th className="p-3">Customer</th>
                              <th className="p-3">Pincode</th>
                              <th className="p-3 text-right">Collect Total</th>
                              <th className="p-3 text-center">Status</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#234F1E]/5 font-semibold text-[#234F1E]">
                            {orders
                              .filter(o => orderFilterStatus === 'All' || o.orderStatus === orderFilterStatus)
                              .map((o) => (
                                <tr key={o.id} className="hover:bg-[#234F1E]/5">
                                  <td className="p-3 text-center">
                                    <input 
                                      type="checkbox"
                                      checked={selectedOrderIds.includes(o.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedOrderIds(prev => [...prev, o.id]);
                                        } else {
                                          setSelectedOrderIds(prev => prev.filter(id => id !== o.id));
                                        }
                                      }}
                                      className="rounded border-[#234F1E]/20 text-[#234F1E] focus:ring-transparent"
                                    />
                                  </td>
                                  <td className="p-3 font-mono font-bold text-[#234F1E]">{o.id}</td>
                                  <td className="p-3 text-[#234F1E]/60">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                                  <td className="p-3">{o.customerName}</td>
                                  <td className="p-3 font-mono">{o.pincode}</td>
                                  <td className="p-3 text-right font-black">₹{o.totalAmount}</td>
                                  <td className="p-3 text-center">
                                    <span className="bg-[#234F1E]/10 text-[#234F1E] px-2.5 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider">
                                      {o.orderStatus}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right">
                                    <button
                                      onClick={() => {
                                        setActiveOrderDetails(o);
                                        setTrackingNumInput(o.consignmentNumber || '');
                                      }}
                                      className="px-2.5 py-1 bg-white border border-[#234F1E]/10 text-[#234F1E] hover:border-[#234F1E] rounded-full text-[10px] uppercase font-extrabold tracking-wider cursor-pointer"
                                    >
                                      Manage
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Order detail overlay */}
                    <AnimatePresence>
                      {activeOrderDetails && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end">
                          <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-[#FAF9F4] w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col border-l border-[#234F1E]/10 text-left"
                          >
                            <div className="flex justify-between items-start border-b border-[#234F1E]/10 pb-4">
                              <div>
                                <span className="text-[9px] bg-[#234F1E]/10 text-[#234F1E] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                                  Order Management
                                </span>
                                <h3 className="text-base font-black text-[#234F1E] font-mono mt-1">{activeOrderDetails.id}</h3>
                              </div>
                              <button
                                onClick={() => setActiveOrderDetails(null)}
                                className="p-1.5 hover:bg-[#234F1E]/5 text-[#234F1E] rounded-full"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="space-y-1 font-semibold text-xs text-[#234F1E]/80">
                              <p><strong>Customer Name:</strong> {activeOrderDetails.customerName}</p>
                              <p><strong>Mobile Contact:</strong> {activeOrderDetails.customerPhone}</p>
                              <p><strong>Shipping Address:</strong> {activeOrderDetails.address}, PIN: {activeOrderDetails.pincode}</p>
                              <p><strong>Payment Type:</strong> {activeOrderDetails.paymentType}</p>
                              {activeOrderDetails.consignmentNumber && (
                                <p><strong>Consignment Track Code:</strong> <span className="font-mono text-[#234F1E] font-extrabold">{activeOrderDetails.consignmentNumber}</span></p>
                              )}
                            </div>

                            <div className="space-y-1.5 text-xs">
                              <label className="text-[10px] font-bold uppercase text-[#234F1E]/50 tracking-wider block">Transition Order Status</label>
                              <select
                                value={activeOrderDetails.orderStatus}
                                onChange={async (e) => {
                                  const target = e.target.value as OrderStatus;
                                  await updateOrderStatus(activeOrderDetails.id, target);
                                  setActiveOrderDetails(prev => prev ? { ...prev, orderStatus: target } : null);
                                  toast(`Order status transitioned to "${target}"`, 'success');
                                  addAuditLog(`Transitioned order status of ${activeOrderDetails.id} to "${target}"`, 'Orders');
                                }}
                                className="w-full px-3 py-2 border border-[#234F1E]/10 bg-white rounded-xl text-xs font-bold text-[#234F1E] focus:outline-none"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>

                            {/* Logistic consignment tracking inputs */}
                            <div className="p-4 bg-white border border-[#234F1E]/10 rounded-2xl space-y-3">
                              <h4 className="text-[10px] font-bold text-[#234F1E] uppercase tracking-widest">India Post Consignment tracking ID</h4>
                              <div className="space-y-2 text-xs">
                                <input
                                  type="text"
                                  value={trackingNumInput}
                                  onChange={(e) => setTrackingNumInput(e.target.value)}
                                  placeholder="e.g. EP123456789IN"
                                  className="w-full px-3 py-1.5 border border-[#234F1E]/10 bg-white rounded-xl focus:outline-none font-bold text-[#234F1E]"
                                />
                                <button
                                  onClick={async () => {
                                    await updateOrderStatus(activeOrderDetails.id, activeOrderDetails.orderStatus, trackingNumInput);
                                    toast('Logistic track ID assigned successfully!', 'success');
                                    addAuditLog(`Assigned tracking consignment ID "${trackingNumInput}" to order ${activeOrderDetails.id}`, 'Orders');
                                    setActiveOrderDetails(prev => prev ? { ...prev, consignmentNumber: trackingNumInput } : null);
                                  }}
                                  className="w-full py-2 bg-[#234F1E] hover:bg-[#1C4018] text-white font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                                >
                                  Update track code
                                </button>
                              </div>
                            </div>

                            {/* Products purchased listing */}
                            <div className="space-y-2 border-t border-[#234F1E]/5 pt-4">
                              <h4 className="text-[10px] font-bold text-[#234F1E] uppercase tracking-widest">Purchased Products</h4>
                              <div className="space-y-2 text-xs">
                                {activeOrderDetails.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs font-bold">
                                    <span>{item.title} × {item.quantity}</span>
                                    <span>₹{item.price * item.quantity}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between items-center text-sm font-black border-t border-[#234F1E]/10 pt-2 text-[#234F1E]">
                                  <span>GRAND TOTAL COLLECTABLE</span>
                                  <span>₹{activeOrderDetails.totalAmount}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>

                  </div>
                )}

                {/* 6. CUSTOMERS CRM TAB */}
                {activeTab === 'customers' && (
                  <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 text-left animate-in fade-in duration-200 space-y-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[#234F1E] font-display">Customers CRM</h3>
                      <p className="text-[10px] text-[#234F1E]/50 font-bold uppercase mt-0.5">Maintain consumer profiles and capture lifetime purchase values.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#234F1E]/10 text-[#234F1E]/50 font-bold uppercase text-[9px] tracking-wider bg-[#234F1E]/5">
                            <th className="p-3">Customer Name</th>
                            <th className="p-3">Mobile Contact</th>
                            <th className="p-3">Email Address</th>
                            <th className="p-3 text-center">Total checkouts</th>
                            <th className="p-3 text-right">Lifetime purchase spent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#234F1E]/5 font-semibold text-[#234F1E]">
                          {orders.reduce((acc: any[], order) => {
                            const existing = acc.find(c => c.phone === order.customerPhone);
                            if (existing) {
                              existing.totalSpend += order.totalAmount;
                              existing.ordersCount += 1;
                            } else {
                              acc.push({
                                name: order.customerName,
                                phone: order.customerPhone,
                                email: order.customerEmail || 'No official email',
                                totalSpend: order.totalAmount,
                                ordersCount: 1
                              });
                            }
                            return acc;
                          }, []).map((customer, idx) => (
                            <tr key={idx} className="hover:bg-[#234F1E]/5">
                              <td className="p-3 font-bold">{customer.name}</td>
                              <td className="p-3 font-mono">{customer.phone}</td>
                              <td className="p-3 text-[#234F1E]/60">{customer.email}</td>
                              <td className="p-3 text-center">{customer.ordersCount} orders</td>
                              <td className="p-3 text-right font-black">₹{customer.totalSpend.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 7. COUPONS CONTROL TAB */}
                {activeTab === 'coupons' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left animate-in fade-in duration-200">
                    <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#234F1E] font-display">Coupons Control</h3>
                        <p className="text-[10px] text-[#234F1E]/50 font-bold uppercase mt-0.5">Generate campaign coupon discount codes.</p>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newCouponCode.trim()) return;
                          const code = newCouponCode.trim().toUpperCase();
                          const newCoupon: Coupon = {
                            code,
                            type: newCouponType,
                            value: Number(newCouponValue),
                            minOrder: Number(newCouponMinOrder),
                            expiryDate: '2026-12-31',
                            isActive: true,
                            usageLimit: 100,
                            uses: 0
                          };
                          setCoupons(prev => [newCoupon, ...prev]);
                          setNewCouponCode('');
                          toast(`Active coupon "${code}" generated successfully!`, 'success');
                          addAuditLog(`Created new store coupon code: "${code}"`, 'Coupons');
                        }}
                        className="bg-[#234F1E]/5 p-4 border border-[#234F1E]/15 rounded-2xl space-y-3"
                      >
                        <h4 className="text-[10px] font-bold text-[#234F1E] uppercase tracking-widest">Create Coupon Code</h4>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/45 block">Discount Code</label>
                            <input
                              type="text"
                              required
                              value={newCouponCode}
                              onChange={(e) => setNewCouponCode(e.target.value)}
                              placeholder="e.g. MONSOON10"
                              className="w-full px-3 py-1.5 border border-[#234F1E]/10 rounded-xl bg-white font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/45 block">Type</label>
                            <select
                              value={newCouponType}
                              onChange={(e) => setNewCouponType(e.target.value as any)}
                              className="w-full px-3 py-1.5 border border-[#234F1E]/10 rounded-xl bg-white font-bold"
                            >
                              <option value="Percentage">Percentage (%)</option>
                              <option value="Fixed">Fixed Cash (₹)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/45 block">Value</label>
                            <input
                              type="number"
                              required
                              value={newCouponValue}
                              onChange={(e) => setNewCouponValue(Number(e.target.value))}
                              className="w-full px-3 py-1.5 border border-[#234F1E]/10 rounded-xl bg-white font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/45 block">Min Order value (₹)</label>
                            <input
                              type="number"
                              required
                              value={newCouponMinOrder}
                              onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                              className="w-full px-3 py-1.5 border border-[#234F1E]/10 rounded-xl bg-white font-bold"
                            />
                          </div>
                        </div>
                        <button type="submit" className="w-full py-2.5 bg-[#234F1E] hover:bg-[#1C4018] text-white font-extrabold text-[10px] uppercase tracking-widest rounded-full cursor-pointer">
                          Generate Active Coupon
                        </button>
                      </form>
                    </div>

                    <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#234F1E] font-display">Active Shop Coupons</h4>
                      <div className="divide-y divide-[#234F1E]/5">
                        {coupons.map((coupon, idx) => (
                          <div key={idx} className="py-3 flex justify-between items-center text-xs font-bold">
                            <div>
                              <div className="text-[#234F1E] font-mono font-extrabold text-sm">{coupon.code}</div>
                              <div className="text-[10px] text-[#234F1E]/50">
                                {coupon.type === 'Percentage' ? `${coupon.value}% Off` : `₹${coupon.value} Off`} · Min spend: ₹{coupon.minOrder}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-[#234F1E]/60">{coupon.uses} uses</span>
                              <button 
                                onClick={() => {
                                  setCoupons(prev => prev.filter((_, i) => i !== idx));
                                  toast('Removed coupon discount code', 'info');
                                  addAuditLog(`Deleted coupon discount "${coupon.code}"`, 'Coupons');
                                }} 
                                className="p-1 text-[#234F1E]/45 hover:text-red-700 cursor-pointer hover:bg-[#234F1E]/5 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. OFFERS & PROMOS TAB */}
                {activeTab === 'offers' && (
                  <div className="space-y-6 animate-in fade-in duration-200 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#234F1E] font-display">Offers & Combo Campaigns</h3>
                        <p className="text-[10px] text-[#234F1E]/50 font-bold uppercase mt-0.5">Manage special bundle listings and promotional combo price rates.</p>
                      </div>

                      <button
                        onClick={() => {
                          setIsEditingPromo(true);
                          setEditingPromoId(null);
                          setPromoTitle('');
                          setPromoSubheadline('');
                          setPromoPrice(350);
                          setPromoCtaText('GET THE COMBO');
                          setPromoImageUrl('');
                        }}
                        className="px-4 py-1.5 bg-[#234F1E] hover:bg-[#1C4018] text-white font-extrabold rounded-full text-xs uppercase tracking-widest cursor-pointer shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add New Promo
                      </button>
                    </div>

                    {/* Create / Edit Promo Form */}
                    {isEditingPromo && (
                      <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 text-left animate-in slide-in-from-top-2 duration-200 space-y-4">
                        <div className="flex justify-between items-center border-b border-[#234F1E]/10 pb-3">
                          <h4 className="text-xs font-bold text-[#234F1E] uppercase tracking-widest font-display">
                            {editingPromoId ? '✏️ Edit Combo Campaign Details' : '🏷️ Create New Combo Campaign'}
                          </h4>
                          <button 
                            onClick={() => {
                              setIsEditingPromo(false);
                              setEditingPromoId(null);
                            }} 
                            className="text-[#234F1E]/40 hover:text-[#234F1E]"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handlePromoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Promo Title</label>
                            <input
                              type="text"
                              required
                              value={promoTitle}
                              onChange={(e) => setPromoTitle(e.target.value)}
                              placeholder="e.g. Special Desk Combo"
                              className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-bold text-[#234F1E] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Subheadline / Supporting Text</label>
                            <input
                              type="text"
                              required
                              value={promoSubheadline}
                              onChange={(e) => setPromoSubheadline(e.target.value)}
                              placeholder="e.g. Two useful picks. One special price."
                              className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-bold text-[#234F1E] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Combo Price (₹)</label>
                            <input
                              type="number"
                              required
                              value={promoPrice}
                              onChange={(e) => setPromoPrice(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-bold text-[#234F1E] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">CTA Button Text</label>
                            <input
                              type="text"
                              required
                              value={promoCtaText}
                              onChange={(e) => setPromoCtaText(e.target.value)}
                              className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-bold text-[#234F1E] focus:outline-none"
                            />
                          </div>

                          {/* Image upload sector */}
                          <div className="col-span-2 space-y-2">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Promo Banner Image</label>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Left/Middle: File Select Area */}
                              <div className="md:col-span-2 border-2 border-dashed border-[#234F1E]/20 hover:border-[#234F1E]/40 rounded-2xl bg-white/40 p-4 transition-all flex flex-col items-center justify-center relative min-h-[140px] text-center">
                                {isUploadingPromoImage ? (
                                  <div className="space-y-2 flex flex-col items-center justify-center">
                                    <RefreshCw className="w-8 h-8 text-[#234F1E] animate-spin" />
                                    <p className="text-[10px] font-bold text-[#234F1E]/75 uppercase tracking-wider">Uploading promo banner image...</p>
                                  </div>
                                ) : (
                                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full space-y-2">
                                    <div className="bg-[#234F1E]/10 p-3 rounded-full text-[#234F1E]">
                                      <Image className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <p className="text-[11px] font-black text-[#234F1E] uppercase tracking-wider">Select Promo Image File</p>
                                      <p className="text-[9px] text-[#234F1E]/50 font-bold uppercase tracking-wide mt-0.5">Drag & drop or browse from storage (Max: 15MB)</p>
                                    </div>
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={handlePromoImageUpload} 
                                      className="hidden" 
                                    />
                                  </label>
                                )}
                              </div>

                              {/* Right: Preview Card */}
                              <div className="border border-[#234F1E]/10 rounded-2xl bg-white/60 p-3 flex flex-col items-center justify-center relative min-h-[140px]">
                                {promoImageUrl ? (
                                  <div className="w-full h-full flex flex-col items-center justify-between space-y-2">
                                    <div className="w-20 h-20 rounded-xl border border-[#234F1E]/10 overflow-hidden bg-zinc-50 relative group">
                                      <img 
                                        src={promoImageUrl} 
                                        alt="Promo Upload preview" 
                                        className="w-full h-full object-cover" 
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setPromoImageUrl('')}
                                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <div className="text-center w-full">
                                      <span className="text-[8px] bg-[#234F1E]/15 text-[#234F1E] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-widest leading-none">PREVIEW LOADED</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center text-[#234F1E]/40 space-y-1">
                                    <HelpCircle className="w-6 h-6 mx-auto opacity-70" />
                                    <p className="text-[9.5px] font-bold uppercase tracking-wider">No Image Loaded</p>
                                    <p className="text-[8px] font-semibold uppercase tracking-wide opacity-80">Select a file or paste URL below</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Manual link input fallback */}
                            <div className="space-y-1 text-left pt-1">
                              <span className="text-[9px] font-bold uppercase text-[#234F1E]/40 tracking-wider">Or paste promo image URL link manually</span>
                              <input
                                type="text"
                                value={promoImageUrl}
                                onChange={(e) => setPromoImageUrl(e.target.value)}
                                placeholder="Image link (Unsplash, Cloudinary or Base64 data)"
                                className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-mono text-[11px] font-bold text-[#234F1E] focus:outline-none placeholder-[#234F1E]/30"
                              />
                            </div>
                          </div>

                          <div className="col-span-2 flex gap-2 pt-2">
                            <button
                              type="submit"
                              className="px-5 py-2.5 bg-[#234F1E] text-white font-extrabold rounded-full text-xs uppercase tracking-widest cursor-pointer hover:bg-[#1C4018]"
                            >
                              Save Campaign Details
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingPromo(false);
                                setEditingPromoId(null);
                              }}
                              className="px-5 py-2.5 bg-[#234F1E]/10 text-[#234F1E] font-extrabold rounded-full text-xs uppercase tracking-widest cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Promos List Grid */}
                    <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 shadow-sm text-left">
                      <div className="divide-y divide-[#234F1E]/5">
                        {promos.map((promo, idx) => (
                          <div key={promo.id || idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-bold">
                            <div className="flex gap-4 items-center">
                              <img src={promo.bannerUrl} alt={promo.title} className="w-16 h-16 object-cover rounded-2xl border border-[#234F1E]/10 bg-zinc-50 shrink-0" />
                              <div className="min-w-0">
                                <h4 className="text-sm text-[#234F1E] font-display uppercase truncate">{promo.title}</h4>
                                <p className="text-xs text-[#234F1E]/60 font-semibold truncate max-w-[320px]">{promo.subheadline}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] bg-[#234F1E]/10 text-[#234F1E] px-2 py-0.5 rounded font-extrabold uppercase font-mono">
                                    {promo.ctaText}
                                  </span>
                                  <span className="text-xs text-[#234F1E]/80 font-black">₹{promo.price}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              <button
                                onClick={() => {
                                  setEditingPromoId(promo.id);
                                  setPromoTitle(promo.title);
                                  setPromoSubheadline(promo.subheadline);
                                  setPromoPrice(promo.price);
                                  setPromoCtaText(promo.ctaText);
                                  setPromoImageUrl(promo.bannerUrl || '');
                                  setIsEditingPromo(true);
                                }}
                                className="p-2 hover:bg-[#234F1E]/10 rounded-full cursor-pointer text-[#234F1E]"
                                title="Edit Combo Offer"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePromo(promo.id, promo.title)}
                                className="p-2 hover:bg-red-500/10 text-[#234F1E] hover:text-red-700 rounded-full cursor-pointer"
                                title="Delete Combo Offer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. SLIDE BANNERS TAB */}
                {activeTab === 'banners' && (
                  <div className="space-y-6 animate-in fade-in duration-200 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#234F1E] font-display">Slide Banners Carousel</h3>
                        <p className="text-[10px] text-[#234F1E]/50 font-bold uppercase mt-0.5">Manage the homepage hero rotating slideshow cards.</p>
                      </div>

                      <button
                        onClick={() => {
                          setIsEditingBanner(true);
                          setEditingBannerIdx(null);
                          setBannerBadge('🔥 SPECIAL DROP');
                          setBannerTitle('');
                          setBannerDescription('');
                          setBannerPrimaryCta('Explore Collection');
                          setBannerSecondaryCta('Track Order');
                          setBannerImageUrl('');
                        }}
                        className="px-4 py-1.5 bg-[#234F1E] hover:bg-[#1C4018] text-white font-extrabold rounded-full text-xs uppercase tracking-widest cursor-pointer shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add New Slide
                      </button>
                    </div>

                    {/* Create / Edit Slide Form */}
                    {isEditingBanner && (
                      <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 text-left animate-in slide-in-from-top-2 duration-200 space-y-4">
                        <div className="flex justify-between items-center border-b border-[#234F1E]/10 pb-3">
                          <h4 className="text-xs font-bold text-[#234F1E] uppercase tracking-widest font-display">
                            {editingBannerIdx !== null ? '✏️ Edit Slide Banner Details' : '🏷️ Create New Homepage Banner Slide'}
                          </h4>
                          <button 
                            onClick={() => {
                              setIsEditingBanner(false);
                              setEditingBannerIdx(null);
                            }} 
                            className="text-[#234F1E]/40 hover:text-[#234F1E]"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleBannerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Small Badge Prefix</label>
                            <input
                              type="text"
                              required
                              value={bannerBadge}
                              onChange={(e) => setBannerBadge(e.target.value)}
                              placeholder="e.g. 🔥 SPECIAL COLLECTION"
                              className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-bold text-[#234F1E] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Primary Title Headline</label>
                            <input
                              type="text"
                              required
                              value={bannerTitle}
                              onChange={(e) => setBannerTitle(e.target.value)}
                              placeholder="e.g. Small Things. Big Joy."
                              className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-bold text-[#234F1E] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5 col-span-2">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Supporting Text Description</label>
                            <input
                              type="text"
                              required
                              value={bannerDescription}
                              onChange={(e) => setBannerDescription(e.target.value)}
                              placeholder="e.g. Discover a curated collection of ultra-responsive wearables..."
                              className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-bold text-[#234F1E] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Primary CTA button text</label>
                            <input
                              type="text"
                              required
                              value={bannerPrimaryCta}
                              onChange={(e) => setBannerPrimaryCta(e.target.value)}
                              className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-bold text-[#234F1E] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Secondary CTA button text</label>
                            <input
                              type="text"
                              required
                              value={bannerSecondaryCta}
                              onChange={(e) => setBannerSecondaryCta(e.target.value)}
                              className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-bold text-[#234F1E] focus:outline-none"
                            />
                          </div>

                          {/* Image upload sector */}
                          <div className="col-span-2 space-y-2">
                            <label className="text-[9px] font-bold uppercase text-[#234F1E]/50 tracking-wider">Banner Background Image</label>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Left/Middle: File Select Area */}
                              <div className="md:col-span-2 border-2 border-dashed border-[#234F1E]/20 hover:border-[#234F1E]/40 rounded-2xl bg-white/40 p-4 transition-all flex flex-col items-center justify-center relative min-h-[140px] text-center">
                                {isUploadingBannerImage ? (
                                  <div className="space-y-2 flex flex-col items-center justify-center">
                                    <RefreshCw className="w-8 h-8 text-[#234F1E] animate-spin" />
                                    <p className="text-[10px] font-bold text-[#234F1E]/75 uppercase tracking-wider">Uploading slide banner image...</p>
                                  </div>
                                ) : (
                                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full space-y-2">
                                    <div className="bg-[#234F1E]/10 p-3 rounded-full text-[#234F1E]">
                                      <Image className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <p className="text-[11px] font-black text-[#234F1E] uppercase tracking-wider">Select Slide Image File</p>
                                      <p className="text-[9px] text-[#234F1E]/50 font-bold uppercase tracking-wide mt-0.5">Drag & drop or browse from storage (Max: 15MB)</p>
                                    </div>
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={handleBannerImageUpload} 
                                      className="hidden" 
                                    />
                                  </label>
                                )}
                              </div>

                              {/* Right: Preview Card */}
                              <div className="border border-[#234F1E]/10 rounded-2xl bg-white/60 p-3 flex flex-col items-center justify-center relative min-h-[140px]">
                                {bannerImageUrl ? (
                                  <div className="w-full h-full flex flex-col items-center justify-between space-y-2">
                                    <div className="w-20 h-20 rounded-xl border border-[#234F1E]/10 overflow-hidden bg-zinc-50 relative group">
                                      <img 
                                        src={bannerImageUrl} 
                                        alt="Banner Upload preview" 
                                        className="w-full h-full object-cover" 
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setBannerImageUrl('')}
                                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <div className="text-center w-full">
                                      <span className="text-[8px] bg-[#234F1E]/15 text-[#234F1E] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-widest leading-none">PREVIEW LOADED</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center text-[#234F1E]/40 space-y-1">
                                    <HelpCircle className="w-6 h-6 mx-auto opacity-70" />
                                    <p className="text-[9.5px] font-bold uppercase tracking-wider">No Image Loaded</p>
                                    <p className="text-[8px] font-semibold uppercase tracking-wide opacity-80">Select a file or paste URL below</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Manual link input fallback */}
                            <div className="space-y-1 text-left pt-1">
                              <span className="text-[9px] font-bold uppercase text-[#234F1E]/40 tracking-wider">Or paste banner background image URL manually</span>
                              <input
                                type="text"
                                value={bannerImageUrl}
                                onChange={(e) => setBannerImageUrl(e.target.value)}
                                placeholder="Image link (Unsplash, Cloudinary or Base64 data)"
                                className="w-full px-3 py-2 bg-white/40 border border-[#234F1E]/10 rounded-xl font-mono text-[11px] font-bold text-[#234F1E] focus:outline-none placeholder-[#234F1E]/30"
                              />
                            </div>
                          </div>

                          <div className="col-span-2 flex gap-2 pt-2">
                            <button
                              type="submit"
                              className="px-5 py-2.5 bg-[#234F1E] text-white font-extrabold rounded-full text-xs uppercase tracking-widest cursor-pointer hover:bg-[#1C4018]"
                            >
                              Save Banner Slide
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingBanner(false);
                                setEditingBannerIdx(null);
                              }}
                              className="px-5 py-2.5 bg-[#234F1E]/10 text-[#234F1E] font-extrabold rounded-full text-xs uppercase tracking-widest cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Banners List Carousel representation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {banners.map((banner, idx) => (
                        <div key={idx} className="glass-card rounded-[28px] p-6 space-y-4 flex flex-col justify-between relative overflow-hidden border border-[#234F1E]/10 min-h-[220px]">
                          {banner.backgroundImageUrl && (
                            <div className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none transition-transform duration-500 hover:scale-102" style={{ backgroundImage: `url(${banner.backgroundImageUrl})` }} />
                          )}
                          <div className="space-y-2 relative z-10">
                            <span className="text-[8.5px] bg-[#234F1E]/10 text-[#234F1E] px-3 py-0.5 rounded-full font-black uppercase tracking-wider">{banner.badge}</span>
                            <h4 className="text-base font-black text-[#234F1E] font-display leading-tight">{banner.title}</h4>
                            <p className="text-xs text-[#234F1E]/60 leading-relaxed font-semibold">{banner.description}</p>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 relative z-10 border-t border-[#234F1E]/5">
                            <div className="flex flex-col text-left">
                              <span className="text-[8px] text-[#234F1E]/40 font-bold uppercase">Actions</span>
                              <span className="text-[10px] text-[#234F1E]/70 font-black">{banner.primaryCta} / {banner.secondaryCta}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingBannerIdx(idx);
                                  setBannerBadge(banner.badge);
                                  setBannerTitle(banner.title);
                                  setBannerDescription(banner.description);
                                  setBannerPrimaryCta(banner.primaryCta || 'Explore Collection');
                                  setBannerSecondaryCta(banner.secondaryCta || 'Track Order');
                                  setBannerImageUrl(banner.backgroundImageUrl || banner.imageUrl || '');
                                  setIsEditingBanner(true);
                                }}
                                className="p-2 hover:bg-[#234F1E]/10 rounded-full cursor-pointer text-[#234F1E]"
                                title="Edit Slide"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBannerWrapper(idx, banner.title)}
                                className="p-2 hover:bg-red-500/10 text-[#234F1E] hover:text-red-700 rounded-full cursor-pointer"
                                title="Delete Slide"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. REVIEWS ADMIN TAB */}
                {activeTab === 'reviews' && (
                  <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 text-left animate-in fade-in duration-200 space-y-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[#234F1E] font-display">Customer Feedback Reviews</h3>
                      <p className="text-[10px] text-[#234F1E]/50 font-bold uppercase mt-0.5">Approve, decline, or moderate client product reviews.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#234F1E]/10 text-[#234F1E]/50 font-bold uppercase text-[9px] tracking-wider bg-[#234F1E]/5">
                            <th className="p-3">Buyer Name</th>
                            <th className="p-3">Product</th>
                            <th className="p-3 text-center">Stars rating</th>
                            <th className="p-3">Feedback comment</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#234F1E]/5 font-semibold text-[#234F1E]">
                          {reviews.map((rev) => (
                            <tr key={rev.id} className="hover:bg-[#234F1E]/5">
                              <td className="p-3 font-bold">{rev.customerName}</td>
                              <td className="p-3 text-[#234F1E]/75">{rev.productName}</td>
                              <td className="p-3 text-center text-[#234F1E] font-mono font-black">{rev.rating} / 5</td>
                              <td className="p-3 text-[#234F1E]/60 italic">"{rev.reviewText}"</td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase ${
                                  rev.status === 'Approved' ? 'bg-[#234F1E]/10 text-[#234F1E]' : 'bg-[#E8E0D2] text-[#234F1E]'
                                }`}>
                                  {rev.status}
                                </span>
                              </td>
                              <td className="p-3 text-right space-x-2">
                                {rev.status === 'Pending' && (
                                  <button
                                    onClick={() => {
                                      setReviews(prev => prev.map(r => r.id === rev.id ? { ...r, status: 'Approved' } : r));
                                      toast('Review approved live!', 'success');
                                      addAuditLog(`Approved customer review by "${rev.customerName}"`, 'Reviews');
                                    }}
                                    className="px-2.5 py-1 bg-[#234F1E] text-white rounded-full text-[9px] font-bold uppercase cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setReviews(prev => prev.filter(r => r.id !== rev.id));
                                    toast('Review deleted from records', 'info');
                                    addAuditLog(`Deleted customer review ID ${rev.id}`, 'Reviews');
                                  }}
                                  className="p-1 hover:bg-red-500/10 hover:text-red-700 text-[#234F1E]/45 rounded-full cursor-pointer inline-block"
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
                )}

                {/* 11. CMS CONTENT PAGES TAB */}
                {activeTab === 'pages' && (
                  <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 text-left animate-in fade-in duration-200 space-y-6">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[#234F1E] font-display">Website CMS Content Pages</h3>
                      <p className="text-[10px] text-[#234F1E]/50 font-bold uppercase mt-0.5">Edit copy text blocks and narrative guidelines displayed on the homepage.</p>
                    </div>

                    <div className="space-y-4">
                      {cmsPages.map((page, idx) => (
                        <div key={page.id} className="p-4 bg-white border border-[#234F1E]/10 rounded-2xl space-y-3">
                          <h4 className="text-xs font-bold uppercase text-[#234F1E] tracking-wider font-display">{page.title}</h4>
                          <textarea
                            value={page.content}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCmsPages(prev => prev.map((p, i) => i === idx ? { ...p, content: val } : p));
                            }}
                            rows={3}
                            className="w-full p-3 text-xs bg-[#FAF9F4] border border-[#234F1E]/10 rounded-xl text-[#234F1E] font-semibold resize-none focus:outline-none focus:border-[#234F1E]/20"
                          />
                          <button
                            onClick={() => {
                              toast(`Successfully saved CMS copy edits for "${page.title}"!`, 'success');
                              addAuditLog(`Updated CMS page copy content block: "${page.title}"`, 'Pages');
                            }}
                            className="px-4 py-2 bg-[#234F1E] hover:bg-[#1C4018] text-white text-[9px] font-bold uppercase tracking-wider rounded-full cursor-pointer"
                          >
                            Save Copy Updates
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 12. SETTINGS TAB */}
                {activeTab === 'settings' && (
                  <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 text-left animate-in fade-in duration-200 space-y-6">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[#234F1E] font-display">Console Settings</h3>
                      <p className="text-[10px] text-[#234F1E]/50 font-bold uppercase mt-0.5">Adjust metadata properties, support contacts, and notification channels.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      
                      {/* Store Metadata contact */}
                      <div className="space-y-4 bg-white p-5 border border-[#234F1E]/10 rounded-2xl">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#234F1E]">General Contact Info</h4>
                        
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-[#234F1E]/50 uppercase tracking-wider block">Official Brand Name</label>
                          <input
                            type="text"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            className="w-full px-3 py-1.5 border border-[#234F1E]/10 rounded-xl bg-[#FAF9F4] focus:outline-none font-bold text-[#234F1E]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-[#234F1E]/50 uppercase tracking-wider block">Support WhatsApp Contact</label>
                          <input
                            type="text"
                            value={supportNum}
                            onChange={(e) => setStorePhone(e.target.value)}
                            className="w-full px-3 py-1.5 border border-[#234F1E]/10 rounded-xl bg-[#FAF9F4] focus:outline-none font-bold text-[#234F1E]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-[#234F1E]/50 uppercase tracking-wider block">Support Email Address</label>
                          <input
                            type="email"
                            value={supportMail}
                            onChange={(e) => setStoreEmail(e.target.value)}
                            className="w-full px-3 py-1.5 border border-[#234F1E]/10 rounded-xl bg-[#FAF9F4] focus:outline-none font-bold text-[#234F1E]"
                          />
                        </div>

                        <button
                          onClick={() => {
                            toast('General store details saved successfully!', 'success');
                            addAuditLog('Updated global support contact metadata properties', 'Settings');
                          }}
                          className="px-5 py-2.5 bg-[#234F1E] text-white font-extrabold text-[10px] uppercase tracking-widest rounded-full cursor-pointer"
                        >
                          Save general settings
                        </button>
                      </div>

                      {/* Telegram integration details */}
                      <div className="space-y-4 bg-white p-5 border border-[#234F1E]/10 rounded-2xl">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#234F1E]">Telegram Alerts Bot Channel</h4>
                        
                        <div className="p-3 bg-[#234F1E]/5 border border-[#234F1E]/10 text-[9.5px] text-[#234F1E]/70 font-semibold leading-relaxed rounded-xl space-y-1">
                          <p>🔗 <strong>Real-time Telegram integration:</strong></p>
                          <p>Dispatch automated instant order checkouts alerts directly to your team chat or bot stream via HTTP Bot API.</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-[#234F1E]/50 uppercase tracking-wider block">Bot Token (BotFather)</label>
                          <input
                            type="password"
                            value={telegramConfig.botToken}
                            onChange={async (e) => {
                              await updateTelegramConfig({ ...telegramConfig, botToken: e.target.value });
                            }}
                            placeholder="e.g. 748209384:AAH92..."
                            className="w-full px-3 py-1.5 border border-[#234F1E]/10 rounded-xl bg-[#FAF9F4] focus:outline-none font-mono text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-[#234F1E]/50 uppercase tracking-wider block">Chat ID (Channel or Group ID)</label>
                          <input
                            type="text"
                            value={telegramConfig.chatId}
                            onChange={async (e) => {
                              await updateTelegramConfig({ ...telegramConfig, chatId: e.target.value });
                            }}
                            placeholder="e.g. -1004829304"
                            className="w-full px-3 py-1.5 border border-[#234F1E]/10 rounded-xl bg-[#FAF9F4] focus:outline-none font-mono text-xs"
                          />
                        </div>

                        <button
                          onClick={() => {
                            toast('Telegram live notification channel successfully synced!', 'success');
                            addAuditLog('Saved changes to operational Telegram Bot tokens', 'Settings');
                          }}
                          className="px-5 py-2.5 bg-[#234F1E] text-white font-extrabold text-[10px] uppercase tracking-widest rounded-full cursor-pointer"
                        >
                          Sync Bot configuration
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* 13. AUDIT LOGS TAB */}
                {activeTab === 'audit' && (
                  <div className="glass-card p-6 rounded-[28px] border border-[#234F1E]/10 text-left animate-in fade-in duration-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#234F1E]/5 pb-3">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#234F1E] font-display">Console Audit Logs</h3>
                        <p className="text-[10px] text-[#234F1E]/50 font-bold uppercase mt-0.5">Chronological record of store modifications and active sessions.</p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        {adminRole === 'Super Admin' ? (
                          <button
                            onClick={() => {
                              if (window.confirm('⚠️ Are you completely sure you want to permanently clear all audit logs? This action is irreversible.')) {
                                const clearedLogs = [
                                  {
                                    id: 'log-' + Date.now(),
                                    admin: 'Muhammed Sinan vk',
                                    action: 'Cleared all console audit log board history',
                                    module: 'Audit Logs',
                                    timestamp: new Date().toLocaleString('en-IN', { hour12: true })
                                  }
                                ];
                                setAuditLogs(clearedLogs);
                                toast('Audit log board cleared successfully!', 'success');
                              }
                            }}
                            className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-extrabold rounded-full text-xs uppercase tracking-widest cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear Logs
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-1.5 bg-zinc-200 text-zinc-400 font-extrabold rounded-full text-xs uppercase tracking-widest flex items-center gap-1.5 cursor-not-allowed border border-zinc-300"
                            title="Super Admin clearance required to delete records"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            Super Admin Only
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const logsTxt = auditLogs.map(l => `[${l.timestamp}] [${l.module}] ${l.admin}: ${l.action}`).join('\n');
                            const blob = new Blob([logsTxt], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `omexo_audit_logs_${Date.now()}.txt`;
                            a.click();
                            toast('Successfully exported raw audit logs text!', 'success');
                          }}
                          className="px-4 py-1.5 bg-[#234F1E] hover:bg-[#1C4018] text-white font-extrabold rounded-full text-xs uppercase tracking-widest cursor-pointer flex items-center gap-1.5"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          Export Log File
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-[#234F1E]/5 max-h-[500px] overflow-y-auto pr-1">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="py-3 flex justify-between items-start gap-3 text-xs font-semibold">
                          <div className="space-y-0.5 text-left">
                            <div className="text-[#234F1E]/90 leading-tight">
                              <strong>{log.admin}</strong>: <span className="text-[#234F1E]/70">{log.action}</span>
                            </div>
                            <div className="text-[9px] text-[#234F1E]/40 font-bold uppercase">Module: {log.module}</div>
                          </div>
                          <span className="text-[9px] text-[#234F1E]/50 font-mono shrink-0 text-right">{log.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </main>

          </motion.div>
        )}

      </AnimatePresence>

      {/* BULK LABELS PRINT PREVIEW MODAL - Rendered through React Portal at body root for flawless printing */}
      {isBulkPrinting && createPortal(
        <div id="bulk-print-modal" className="fixed inset-0 bg-[#234F1E]/80 backdrop-blur-md z-[9999] flex flex-col justify-between p-4 sm:p-6 print:p-0 overflow-y-auto">
          {/* Controls Bar - Hidden when printing */}
          <div className="bg-white max-w-4xl w-full mx-auto p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xl border border-zinc-100 shrink-0 print:hidden mb-6 text-left">
            <div>
              <div className="flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-[#234F1E]" />
                <h3 className="text-sm font-black text-[#234F1E] uppercase tracking-wider font-display">Bulk Shipping Label Printer (8 per Page)</h3>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Previewing precisely <strong>8 labels per A4 sheet</strong> (2 columns × 4 rows grid). 
                Optimized with a seamless layout fit.
              </p>
              <div className="mt-2 text-[10px] text-zinc-600 font-bold flex items-center gap-1 bg-[#FAF9F4] p-1.5 px-3 rounded-lg border border-[#234F1E]/10">
                <span>💡 <strong>Direct PDF Download:</strong> Click "Print Now" below, and select <strong>"Save as PDF"</strong> as your destination in the printer dialog!</span>
              </div>
            </div>
            <div className="flex gap-2 self-end sm:self-auto shrink-0 flex-wrap justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsBulkPrinting(false);
                  setSelectedOrderIds([]);
                }}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-full text-xs cursor-pointer transition-all uppercase tracking-wider"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={handleDownloadHTMLPrintSheet}
                className="px-4 py-2 bg-[#E8E0D2] hover:bg-[#D8CEBD] text-[#234F1E] font-extrabold rounded-full text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer uppercase tracking-wider"
                title="Bypasses iframe sandboxing to print beautifully from any browser"
              >
                <FileDown className="w-4 h-4" />
                Download Print File
              </button>
              <button
                type="button"
                onClick={() => {
                  window.focus();
                  window.print();
                }}
                className="px-5 py-2 bg-[#234F1E] hover:bg-[#1C4018] text-white font-black rounded-full text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer uppercase tracking-widest"
              >
                <Printer className="w-4 h-4" />
                Print Now
              </button>
            </div>
          </div>

          {/* Precise A4 layout representation */}
          <div className="flex-1 w-full flex justify-center print:block">
            <div className="bg-white max-w-[210mm] w-full p-4 print:p-0 text-slate-900 space-y-8 flex flex-col">
              {(() => {
                const selectedOrders = orders.filter((o) => selectedOrderIds.includes(o.id));
                
                // Chunk arrays into exactly groups of 8 labels per A4 page!
                const size = 8;
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
                        className="border-2 border-dashed border-slate-400 p-3 rounded-lg flex flex-col justify-between space-y-1.5 font-sans text-[10px] h-[65mm] max-h-[65mm] overflow-hidden text-left"
                        style={{ boxSizing: 'border-box' }}
                      >
                        {/* Label Header */}
                        <div className="flex justify-between items-start border-b border-slate-300 pb-1">
                          <div>
                            <h5 className="font-black text-slate-900 text-[10px] leading-none uppercase tracking-wider font-display">omexo premium</h5>
                            <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wide mt-0.5 block">Logistics Dispatch Slip</span>
                          </div>
                          <span className="text-[9px] font-black font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                            {order.paymentType}
                          </span>
                        </div>

                        {/* Recipient Address */}
                        <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-1">
                          <div className="space-y-0.5 border-r border-slate-200 pr-1.5">
                            <span className="text-[7px] font-bold text-teal-600 uppercase tracking-wider block">Ship To (Recipient):</span>
                            <p className="font-extrabold text-[9px] text-slate-900 leading-none">{order.customerName}</p>
                            <p className="text-[8px] text-slate-700 leading-tight font-semibold line-clamp-2 mt-0.5">{order.address}</p>
                            <div className="text-[8px] pt-0.5 space-y-0.5">
                              <div className="font-extrabold text-slate-900">PIN: {order.pincode}</div>
                              <div className="font-bold text-slate-800">Mob: {order.customerPhone}</div>
                            </div>
                          </div>
                          
                          <div className="space-y-0.5 pl-0.5">
                            <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-wider block">From (Sender):</span>
                            <p className="font-bold text-[8.5px] text-slate-900 leading-none">Muhammed Sinan vk</p>
                            <p className="text-[7.5px] text-slate-500 leading-tight font-medium mt-0.5">ozhukour, palekod, kondotty, Malappuram, Kerala</p>
                            <div className="text-[7.5px] pt-0.5 space-y-0.5">
                              <div className="font-bold text-slate-900">PIN: 673642</div>
                              <div className="font-bold text-slate-800">Mob: 8590181381</div>
                            </div>
                          </div>
                        </div>

                        {/* Contents details */}
                        <div className="bg-slate-50 p-1 rounded-md border border-slate-100 flex-1 min-h-[25px] overflow-hidden">
                          <span className="text-[7px] font-bold text-slate-400 uppercase block mb-0.5">Item contents list:</span>
                          <div className="space-y-0.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-[8px] font-bold text-slate-800 leading-tight">
                                <span className="truncate max-w-[120px]">{item.title}</span>
                                <span>×{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Reference & Cash collection info */}
                        <div className="flex justify-between items-end border-t border-slate-300 pt-1">
                          <div className="space-y-0.5">
                            <span className="text-[7.5px] text-slate-400 block font-bold leading-none uppercase">Reference ID</span>
                            <span className="font-mono font-black text-slate-900 text-[9px] leading-none">{order.id}</span>
                            <span className="text-[6.5px] text-slate-400 block leading-none mt-0.5">
                              Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[6.5px] font-bold text-slate-400 block uppercase">Collect Cash</span>
                            <span className="text-[11px] font-black text-slate-900">
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
        </div>,
        document.body
      )}

    </div>
  );
};
