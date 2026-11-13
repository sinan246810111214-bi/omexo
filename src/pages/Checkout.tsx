import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../hooks/useStore';
import { useHashRouter } from '../hooks/useHashRouter';
import { useToast } from '../components/Toast';
import { trackInitiateCheckout } from '../lib/metaPixel';
import {
  Truck,
  ArrowLeft,
  MessageSquare,
  Check,
  Smartphone,
  MapPin,
  Loader2,
  Home as HomeIcon,
  User,
  Building2,
} from 'lucide-react';
import { Order } from '../types';
import { ORDER_LABEL_SENDER, getSiteBrandConfig, getWhatsAppNumberForCategory } from '../config/categories';

interface PostalOfficeOption {
  name: string;
  pincode: string;
  district: string;
  state: string;
  branchType: string;
}

export const Checkout: React.FC = () => {
  const { cart, createOrder, storeSettings, coupons } = useStore();
  const { siteSlug, navigate } = useHashRouter();
  const { toast } = useToast();
  const activeBrand = getSiteBrandConfig(siteSlug);
  const storeDisplayName = storeSettings?.storeName || activeBrand.name;

  // Exact 5 TO-Address Fields: Name, House Name, Post Office, PIN Code, Phone No
  const [fullName, setFullName] = useState('');
  const [houseName, setHouseName] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  // Auto-lookup state for bidirectional PIN <-> Post Office resolution
  const [postalOptions, setPostalOptions] = useState<PostalOfficeOption[]>([]);
  const [lookupSource, setLookupSource] = useState<'pin' | 'po' | null>(null);
  const [isLookingUpPostal, setIsLookingUpPostal] = useState(false);
  const [postalHint, setPostalHint] = useState('');
  const [showPoDropdown, setShowPoDropdown] = useState(false);

  // Prevents ping-pong loops when one field programmatically fills the other
  const suppressPinLookupRef = useRef(false);
  const suppressPoLookupRef = useRef(false);
  const poWrapperRef = useRef<HTMLDivElement>(null);

  const [paymentOption, setPaymentOption] = useState<'COD' | 'Online'>('COD');

  // Coupon promo state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);

  // Confirmation & Success state
  const [showConfirmPrompt, setShowConfirmPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);

  useEffect(() => {
    if (cart.length > 0) {
      trackInitiateCheckout(cart, cartSubtotal);
    }
  }, []);

  // Close Post Office suggestions dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (poWrapperRef.current && !poWrapperRef.current.contains(e.target as Node)) {
        setShowPoDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // 1. PIN Code -> Automatic Post Office lookup
  useEffect(() => {
    if (suppressPinLookupRef.current) {
      suppressPinLookupRef.current = false;
      return;
    }

    if (pinCode.length !== 6) {
      if (lookupSource === 'pin') {
        setPostalOptions([]);
        setPostalHint('');
      }
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsLookingUpPostal(true);
      setLookupSource('pin');
      try {
        const res = await fetch(`/api/postal/pincode/${encodeURIComponent(pinCode)}`);
        if (!res.ok) throw new Error('Lookup failed');
        const data = (await res.json()) as { found: boolean; offices: PostalOfficeOption[] };
        if (cancelled) return;

        if (data.found && data.offices.length > 0) {
          setPostalOptions(data.offices);
          suppressPoLookupRef.current = true;
          setPostOffice(data.offices[0].name);
          setShowPoDropdown(data.offices.length > 1);
          const loc = [data.offices[0].district, data.offices[0].state].filter(Boolean).join(', ');
          setPostalHint(
            data.offices.length > 1
              ? `${data.offices.length} Post Offices found (${loc}). Tap to switch if needed.`
              : `Post Office: ${data.offices[0].name} (${loc})`
          );
        } else {
          setPostalOptions([]);
          setPostalHint('PIN not found in India Post directory. Enter Post Office manually.');
        }
      } catch {
        if (!cancelled) {
          setPostalOptions([]);
          setPostalHint('');
        }
      } finally {
        if (!cancelled) setIsLookingUpPostal(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pinCode]);

  // 2. Post Office Name -> Automatic PIN Code lookup
  useEffect(() => {
    if (suppressPoLookupRef.current) {
      suppressPoLookupRef.current = false;
      return;
    }

    const cleanPo = postOffice.trim();
    if (cleanPo.length < 3) {
      if (lookupSource === 'po') {
        setPostalOptions([]);
        setShowPoDropdown(false);
        setPostalHint('');
      }
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsLookingUpPostal(true);
      setLookupSource('po');
      try {
        const res = await fetch(`/api/postal/postoffice/${encodeURIComponent(cleanPo)}`);
        if (!res.ok) throw new Error('Lookup failed');
        const data = (await res.json()) as { found: boolean; offices: PostalOfficeOption[] };
        if (cancelled) return;

        if (data.found && data.offices.length > 0) {
          setPostalOptions(data.offices);
          const exactMatch = data.offices.find(
            (o) => o.name.toLowerCase() === cleanPo.toLowerCase()
          );
          const best = exactMatch || (data.offices.length === 1 ? data.offices[0] : null);
          if (best && best.pincode) {
            suppressPinLookupRef.current = true;
            setPinCode(best.pincode);
            setPostalHint(`Auto-filled PIN: ${best.pincode} (${best.name}, ${best.district})`);
            setShowPoDropdown(data.offices.length > 1 && !exactMatch);
          } else {
            setShowPoDropdown(true);
            setPostalHint('Select your Post Office below to auto-fill PIN Code.');
          }
        } else {
          setPostalOptions([]);
          setShowPoDropdown(false);
          setPostalHint('');
        }
      } catch {
        if (!cancelled) {
          setPostalOptions([]);
          setShowPoDropdown(false);
        }
      } finally {
        if (!cancelled) setIsLookingUpPostal(false);
      }
    }, 380);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [postOffice]);

  const handleSelectPostalOption = (opt: PostalOfficeOption) => {
    suppressPoLookupRef.current = true;
    suppressPinLookupRef.current = true;
    setPostOffice(opt.name);
    setPinCode(opt.pincode);
    setShowPoDropdown(false);
    const loc = [opt.district, opt.state].filter(Boolean).join(', ');
    setPostalHint(`${opt.name} · PIN ${opt.pincode}${loc ? ` (${loc})` : ''}`);
  };

  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim()) {
      toast('Please enter a coupon code.', 'error');
      return;
    }

    const match = coupons.find((c) => c.code === couponCodeInput.trim().toUpperCase() && c.isActive);
    if (!match) {
      toast('Invalid or expired coupon code.', 'error');
      return;
    }

    if (cartSubtotal < match.minOrder) {
      toast(`Min order value to apply this coupon is ₹${match.minOrder}`, 'error');
      return;
    }

    setAppliedCoupon(match);
    toast(`Coupon "${match.code}" applied!`, 'success');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    toast('Coupon removed.', 'info');
  };

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'Percentage'
      ? Math.round((cartSubtotal * appliedCoupon.value) / 100)
      : appliedCoupon.value
    : 0;

  const grandTotal = Math.max(0, cartSubtotal - discountAmount);

  const handleOpenConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast('Your shopping bag is empty!', 'error');
      return;
    }
    if (!fullName.trim()) {
      toast('Please enter your Name.', 'error');
      return;
    }
    if (!houseName.trim()) {
      toast('Please enter your House Name.', 'error');
      return;
    }
    if (!postOffice.trim()) {
      toast('Please enter your Post Office.', 'error');
      return;
    }
    if (!/^\d{6}$/.test(pinCode)) {
      toast('Please enter a valid 6-digit PIN Code.', 'error');
      return;
    }
    if (!/^\d{10}$/.test(mobileNumber)) {
      toast('Please enter a valid 10-digit Phone No.', 'error');
      return;
    }
    setShowConfirmPrompt(true);
  };

  const handleConfirmOrder = async () => {
    setShowConfirmPrompt(false);
    setIsSubmitting(true);
    try {
      const cleanPo = postOffice.trim();
      const poFormatted = /\bpo$/i.test(cleanPo) || /post\s*office$/i.test(cleanPo)
        ? cleanPo
        : `${cleanPo} PO`;
      const combinedAddress = `${houseName.trim()}, ${poFormatted}`;

      const order = await createOrder(
        {
          name: fullName.trim(),
          email: 'customer@omexo.in',
          phone: mobileNumber.trim(),
          address: combinedAddress,
          pincode: pinCode.trim(),
          paymentType: paymentOption,
        },
        discountAmount,
        siteSlug
      );
      setPlacedOrder(order);
      toast('Order placed successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Checkout failed. Please retry.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormattedTimestamp = (isoString: string) => {
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');

    return `${day}-${month}-${year}, ${strHours}:${minutes} ${ampm}`;
  };

  // Order Success Screen
  if (placedOrder) {
    const formattedTime = getFormattedTimestamp(placedOrder.createdAt);
    const confirmWhatsappNum = getWhatsAppNumberForCategory(
      placedOrder.siteSlug || siteSlug,
      storeSettings
    );
    const encodedMsg = encodeURIComponent(
      `Hi ${storeDisplayName}, I would like to confirm my order *${placedOrder.id}* placed on ${formattedTime}.\n` +
        `• Total: ₹${placedOrder.totalAmount.toLocaleString('en-IN')}\n` +
        `• Name: ${placedOrder.customerName}\n` +
        `• Address: ${placedOrder.address}, PIN: ${placedOrder.pincode}\n` +
        `• Phone: ${placedOrder.customerPhone}\n` +
        `Please verify and dispatch my parcel!`
    );
    const whatsappUrl = `https://wa.me/${confirmWhatsappNum}?text=${encodedMsg}`;

    return (
      <div className="max-w-lg mx-auto py-6 space-y-5 text-left" id="checkout-success-panel">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-pine-green text-warm-white rounded-full flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 stroke-[3px]" />
          </div>
          <h2 className="text-2xl font-extrabold text-pine-green font-display">
            Order Placed Successfully!
          </h2>
          <p className="text-xs text-pine-green/70 font-medium">
            Order ID: <strong className="font-mono text-pine-green">{placedOrder.id}</strong> ·{' '}
            {placedOrder.paymentType === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
          </p>
        </div>

        <div className="bg-white border border-pine-green/10 p-5 rounded-3xl space-y-3 shadow-sm text-xs">
          <div className="flex justify-between">
            <span className="text-pine-green/60">Name & Phone</span>
            <span className="font-bold text-pine-green">
              {placedOrder.customerName} ({placedOrder.customerPhone})
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-pine-green/60 shrink-0">Delivery Address</span>
            <span className="font-semibold text-pine-green text-right">
              {placedOrder.address}, PIN: {placedOrder.pincode}
            </span>
          </div>

          <div className="border-t border-pine-green/10 pt-3 space-y-1.5">
            {placedOrder.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-pine-green/85 font-semibold truncate max-w-[230px]">
                  {item.title} × {item.quantity}
                </span>
                <span className="font-bold text-pine-green tabular-nums">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-pine-green/10 pt-3 flex justify-between font-extrabold text-sm text-pine-green">
            <span>Total Payable</span>
            <span className="tabular-nums">₹{placedOrder.totalAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="border-t border-pine-green/10 pt-3 text-[11px] text-pine-green/75 space-y-0.5">
            <div className="font-extrabold text-pine-green uppercase text-[10px] tracking-wider">
              From / Sender &amp; Support Team
            </div>
            <div className="font-semibold">
              {ORDER_LABEL_SENDER.name}, {ORDER_LABEL_SENDER.address}
            </div>
            <div className="font-bold text-pine-green">
              Support team: {storeSettings?.supportNum || ORDER_LABEL_SENDER.phone}
            </div>
          </div>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 bg-[#1E8E3E] hover:bg-[#167330] text-white font-extrabold rounded-full text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Confirm Order on WhatsApp
        </a>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.setItem('omexo_last_order_id', placedOrder.id);
              } catch {
                // ignore
              }
              navigate('track-order', undefined, siteSlug);
            }}
            className="w-full py-3.5 bg-white border border-pine-green/20 text-pine-green font-extrabold rounded-full text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Track Order
          </button>
          <button
            type="button"
            onClick={() => navigate('home', undefined, siteSlug)}
            className="w-full py-3.5 bg-pine-green hover:bg-pine-green-hover text-warm-white font-extrabold rounded-full text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Shop More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 text-left" id="checkout-root">
      <button
        type="button"
        onClick={() => navigate('home', undefined, siteSlug)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-pine-green/70 hover:text-pine-green uppercase tracking-wider cursor-pointer"
        id="btn-checkout-back"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to {storeDisplayName}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Exact 5 Required Fields (Name, House Name, Post Office, PIN Code, Phone No) */}
        <div
          className="lg:col-span-7 bg-white border border-pine-green/10 p-5 sm:p-7 rounded-3xl space-y-5 shadow-sm"
          id="checkout-form-panel"
        >
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-pine-green font-display">
              Delivery Address Details
            </h1>
            <p className="text-xs text-pine-green/60 font-medium">
              Enter PIN Code to auto-fill Post Office, or enter Post Office to auto-fill PIN Code.
            </p>
          </div>

          <form onSubmit={handleOpenConfirmation} className="space-y-4">
            {/* 1. Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-pine-green/65 tracking-wider">
                Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-3 bg-warm-white border border-pine-green/15 rounded-xl text-sm font-semibold text-pine-green focus:outline-none focus:border-pine-green"
                  id="checkout-fullname"
                />
                <User className="w-4 h-4 text-pine-green/45 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* 2. House Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-pine-green/65 tracking-wider">
                House Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  placeholder="House Name / Flat / Locality"
                  className="w-full pl-10 pr-4 py-3 bg-warm-white border border-pine-green/15 rounded-xl text-sm font-semibold text-pine-green focus:outline-none focus:border-pine-green"
                  id="checkout-housename"
                />
                <HomeIcon className="w-4 h-4 text-pine-green/45 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* 3 & 4. Bidirectional Auto-Lookup: PIN Code <-> Post Office */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              {/* PIN Code */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-pine-green/65 tracking-wider">
                  PIN Code *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    required
                    value={pinCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').substring(0, 6);
                      setPinCode(val);
                    }}
                    placeholder="6-digit PIN Code"
                    className="w-full pl-10 pr-9 py-3 bg-warm-white border border-pine-green/15 rounded-xl text-sm font-semibold text-pine-green focus:outline-none focus:border-pine-green tracking-wider tabular-nums"
                    id="checkout-pincode"
                  />
                  <MapPin className="w-4 h-4 text-pine-green/45 absolute left-3.5 top-3.5" />
                  {isLookingUpPostal && lookupSource === 'pin' && (
                    <Loader2 className="w-4 h-4 text-pine-green animate-spin absolute right-3 top-3.5" />
                  )}
                </div>
              </div>

              {/* Post Office */}
              <div className="space-y-1 relative" ref={poWrapperRef}>
                <label className="text-[11px] font-bold uppercase text-pine-green/65 tracking-wider">
                  Post Office *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={postOffice}
                    onChange={(e) => setPostOffice(e.target.value)}
                    onFocus={() => {
                      if (postalOptions.length > 0) setShowPoDropdown(true);
                    }}
                    placeholder="Post Office Name"
                    className="w-full pl-10 pr-9 py-3 bg-warm-white border border-pine-green/15 rounded-xl text-sm font-semibold text-pine-green focus:outline-none focus:border-pine-green"
                    id="checkout-postoffice"
                  />
                  <Building2 className="w-4 h-4 text-pine-green/45 absolute left-3.5 top-3.5" />
                  {isLookingUpPostal && lookupSource === 'po' && (
                    <Loader2 className="w-4 h-4 text-pine-green animate-spin absolute right-3 top-3.5" />
                  )}
                </div>

                {/* Dropdown suggestions when multiple Post Offices match PIN or PO search */}
                {showPoDropdown && postalOptions.length > 0 && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 bg-white border border-pine-green/20 rounded-xl shadow-xl z-30 max-h-52 overflow-y-auto divide-y divide-pine-green/5"
                    id="postal-options-dropdown"
                  >
                    {postalOptions.map((opt) => (
                      <button
                        type="button"
                        key={`${opt.name}-${opt.pincode}`}
                        onClick={() => handleSelectPostalOption(opt)}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-pine-green/5 flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-pine-green truncate">{opt.name}</div>
                          <div className="text-[10px] text-pine-green/60 truncate">
                            {[opt.district, opt.state].filter(Boolean).join(', ')}
                          </div>
                        </div>
                        <span className="text-[11px] font-mono font-extrabold text-pine-green shrink-0">
                          {opt.pincode}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {postalHint && (
              <p className="text-[11px] font-semibold text-pine-green/75 bg-pine-green/5 px-3 py-2 rounded-xl">
                {postalHint}
              </p>
            )}

            {/* 5. Phone No */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-pine-green/65 tracking-wider">
                Phone No *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').substring(0, 10))}
                  placeholder="10-digit Phone Number"
                  className="w-full pl-10 pr-4 py-3 bg-warm-white border border-pine-green/15 rounded-xl text-sm font-semibold text-pine-green focus:outline-none focus:border-pine-green tracking-wider tabular-nums"
                  id="checkout-mobile"
                />
                <Smartphone className="w-4 h-4 text-pine-green/45 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold uppercase text-pine-green/65 tracking-wider">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentOption('COD')}
                  className={`p-3.5 border rounded-2xl text-left transition-colors cursor-pointer ${
                    paymentOption === 'COD'
                      ? 'border-pine-green bg-pine-green/5'
                      : 'border-pine-green/15 bg-warm-white'
                  }`}
                >
                  <div className="text-xs font-extrabold text-pine-green uppercase">
                    Cash on Delivery
                  </div>
                  <p className="text-[11px] text-pine-green/65 mt-0.5">Pay when delivered</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('Online')}
                  className={`p-3.5 border rounded-2xl text-left transition-colors cursor-pointer ${
                    paymentOption === 'Online'
                      ? 'border-pine-green bg-pine-green/5'
                      : 'border-pine-green/15 bg-warm-white'
                  }`}
                >
                  <div className="text-xs font-extrabold text-pine-green uppercase">
                    Online Payment
                  </div>
                  <p className="text-[11px] text-pine-green/65 mt-0.5">UPI / Online pay</p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full min-h-[48px] bg-pine-green hover:bg-pine-green-hover disabled:opacity-50 text-warm-white font-extrabold rounded-full text-xs uppercase tracking-widest transition-colors cursor-pointer shadow-sm"
              id="checkout-submit-form-btn"
            >
              Place Order · ₹{grandTotal.toLocaleString('en-IN')}
            </button>
          </form>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-5 space-y-4" id="checkout-summary-panel">
          <div className="bg-white border border-pine-green/10 rounded-3xl p-5 space-y-4 shadow-sm">
            <h2 className="text-xs font-extrabold text-pine-green uppercase tracking-widest border-b border-pine-green/10 pb-3">
              Order Summary ({cart.length})
            </h2>

            <div className="divide-y divide-pine-green/10 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-6 text-xs text-pine-green/55 font-semibold">
                  Your bag is empty.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 py-3 items-center">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-12 h-12 object-cover rounded-xl bg-soft-beige/40 border border-pine-green/10 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-pine-green truncate">
                        {item.product.title}
                      </h4>
                      <p className="text-[11px] text-pine-green/60 font-medium">
                        Qty: {item.quantity} × ₹{item.product.salePrice}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-pine-green shrink-0 tabular-nums">
                      ₹{(item.product.salePrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-pine-green/10 pt-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code (optional)"
                    className="flex-1 px-3 py-2 bg-warm-white border border-pine-green/15 rounded-xl text-xs font-bold text-pine-green placeholder-pine-green/45 focus:outline-none"
                    disabled={!!appliedCoupon}
                    id="coupon-code-input"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3.5 py-2 bg-red-50 text-red-700 text-xs font-bold rounded-xl cursor-pointer"
                      id="coupon-remove-btn"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-pine-green text-warm-white text-xs font-bold rounded-xl cursor-pointer"
                      id="coupon-apply-btn"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            )}

            {cart.length > 0 && (
              <div className="border-t border-pine-green/10 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-pine-green/70">
                  <span>Subtotal</span>
                  <span className="font-bold text-pine-green tabular-nums">
                    ₹{cartSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="tabular-nums">- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-pine-green/70">
                  <span>Delivery</span>
                  <span className="font-extrabold text-pine-green">FREE</span>
                </div>
                <div className="flex justify-between border-t border-pine-green/10 pt-2.5 text-sm font-extrabold text-pine-green">
                  <span>Total</span>
                  <span className="tabular-nums">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmPrompt && (
        <div className="fixed inset-0 bg-pine-green/60 z-50 flex items-center justify-center p-4">
          <div
            className="max-w-sm w-full bg-warm-white rounded-3xl p-6 shadow-2xl border border-pine-green/15 space-y-4 text-center"
            id="zero-cost-confirm-prompt"
          >
            <div className="w-10 h-10 bg-pine-green/10 text-pine-green rounded-full flex items-center justify-center mx-auto">
              <Truck className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-pine-green uppercase tracking-wider font-display">
                Confirm Order
              </h3>
              <p className="text-xs text-pine-green/80 font-medium leading-relaxed">
                <strong>{fullName}</strong> · {houseName}, {postOffice} ({pinCode}) · {mobileNumber}
              </p>
              <p className="text-xs text-pine-green font-extrabold tabular-nums">
                Total: ₹{grandTotal.toLocaleString('en-IN')} ({paymentOption})
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmPrompt(false)}
                className="flex-1 py-2.5 bg-white border border-pine-green/15 rounded-full text-xs font-bold text-pine-green/70 cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-pine-green hover:bg-pine-green-hover text-warm-white rounded-full text-xs font-extrabold cursor-pointer"
              >
                {isSubmitting ? 'Placing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
