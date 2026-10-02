import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useHashRouter } from '../hooks/useHashRouter';
import { useToast } from '../components/Toast';
import { 
  ShoppingBag, ShieldCheck, Truck, ArrowLeft, MessageSquare, 
  Check, Smartphone, Mail, MapPin, Sparkles, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../types';

export const Checkout: React.FC = () => {
  const { cart, createOrder } = useStore();
  const { navigate } = useHashRouter();
  const { toast } = useToast();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [stateField, setStateField] = useState('');
  const [cityField, setCityField] = useState('');
  const [pinCode, setPinCode] = useState('');
  
  const [paymentOption, setPaymentOption] = useState<'COD' | 'Online'>('COD');

  // Coupon promo state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);

  // Confirmation Prompt State
  const [showConfirmPrompt, setShowConfirmPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Placed Order Summary Reference
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);

  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim()) {
      toast('Please enter a coupon code.', 'error');
      return;
    }
    const savedCoupons = localStorage.getItem('omexo_coupons');
    const couponsList = savedCoupons ? JSON.parse(savedCoupons) : [
      { code: 'OMEXO50', type: 'Percentage', value: 10, minOrder: 500, expiryDate: '2026-12-31', usageLimit: 100, uses: 45, isActive: true },
      { code: 'FESTIVE150', type: 'Fixed', value: 150, minOrder: 1500, expiryDate: '2026-11-15', usageLimit: 50, uses: 12, isActive: true }
    ];

    const match = couponsList.find((c: any) => c.code === couponCodeInput.trim().toUpperCase() && c.isActive);
    if (!match) {
      toast('Invalid or expired coupon code.', 'error');
      return;
    }

    if (cartSubtotal < match.minOrder) {
      toast(`Min order value to apply this coupon is ₹${match.minOrder}`, 'error');
      return;
    }

    setAppliedCoupon(match);
    toast(`Coupon code "${match.code}" applied successfully!`, 'success');
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
      toast('Your shopping cart is empty!', 'error');
      return;
    }
    if (!/^\d{10}$/.test(mobileNumber)) {
      toast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    if (!/^\d{6}$/.test(pinCode)) {
      toast('Please enter a valid 6-digit PIN code.', 'error');
      return;
    }
    setShowConfirmPrompt(true);
  };

  const handleConfirmOrder = async () => {
    setShowConfirmPrompt(false);
    setIsSubmitting(true);
    try {
      const combinedAddress = `${fullAddress}, ${cityField}, ${stateField}`;
      const order = await createOrder({
        name: fullName,
        email: emailAddress || 'customer@omexo.in',
        phone: mobileNumber,
        address: combinedAddress,
        pincode: pinCode,
        paymentType: paymentOption,
      }, discountAmount);
      setPlacedOrder(order);
      toast('Order registered successfully!', 'success');
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

  // Render Placed Order Success Screen
  if (placedOrder) {
    const formattedTime = getFormattedTimestamp(placedOrder.createdAt);
    const encodedMsg = encodeURIComponent(
      `Hi Omexo, I would like to confirm my order *${placedOrder.id}* placed on ${formattedTime}.\n` +
      `• Total: ₹${placedOrder.totalAmount.toLocaleString('en-IN')}\n` +
      `• Name: ${placedOrder.customerName}\n` +
      `• Phone: ${placedOrder.customerPhone}\n` +
      `Please verify and dispatch my gadget package as soon as possible!`
    );
    const whatsappUrl = `https://api.whatsapp.com/send?phone=919946597201&text=${encodedMsg}`;

    return (
      <div className="max-w-xl mx-auto py-8 text-center space-y-6 animate-in zoom-in duration-150 text-left" id="checkout-success-panel">
        <div className="w-12 h-12 bg-pine-green text-warm-white rounded-full flex items-center justify-center mx-auto border border-white/20 shadow-md">
          <Check className="w-6 h-6 stroke-[3px]" />
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-pine-green leading-tight font-display">Order Registered Successfully!</h2>
          <span className="inline-block text-[9px] bg-pine-green/10 text-pine-green border border-pine-green/10 px-3.5 py-1 rounded-full font-bold uppercase tracking-wider">
            {placedOrder.paymentType === 'COD' ? 'Zero-Cost Cash On Delivery' : 'Online Payment Processing'}
          </span>
          <p className="text-xs text-pine-green/60 font-semibold pt-1 max-w-sm mx-auto leading-relaxed">
            Thank you for shopping at Omexo. Your modern smart tools are being green-lit for packing.
          </p>
        </div>

        {/* Order Details summary ticket */}
        <div className="glass-card p-6 rounded-[28px] space-y-4">
          <div className="flex justify-between border-b border-pine-green/5 pb-2.5">
            <span className="text-[10px] text-pine-green/45 font-bold uppercase tracking-wider">Order ID</span>
            <span className="text-xs font-bold text-pine-green font-mono">{placedOrder.id}</span>
          </div>

          <div className="flex justify-between border-b border-pine-green/5 pb-2.5">
            <span className="text-[10px] text-pine-green/45 font-bold uppercase tracking-wider">Order Timestamp</span>
            <span className="text-xs font-bold text-pine-green/80">{formattedTime}</span>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-xs text-pine-green/50 font-semibold">Recipient Info</span>
            <div className="text-right">
              <div className="text-xs font-extrabold text-pine-green">{placedOrder.customerName}</div>
              <div className="text-[10px] text-pine-green/60 font-semibold">{placedOrder.customerPhone}</div>
            </div>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-xs text-pine-green/50 font-semibold">Shipping Destination</span>
            <span className="text-xs font-bold text-pine-green truncate max-w-[240px] text-right">{placedOrder.address}, {placedOrder.pincode}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-xs text-pine-green/50 font-semibold">Payment Option</span>
            <span className="text-xs font-bold text-pine-green uppercase">{placedOrder.paymentType === 'COD' ? 'Cash on Delivery (COD)' : 'Online Payment'}</span>
          </div>

          {/* Itemized breakdown */}
          <div className="border-t border-pine-green/5 pt-3 space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-pine-green/40 block mb-1">Items Summary</span>
            {placedOrder.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="text-pine-green/80 font-bold truncate max-w-[280px]">
                  {item.title} <span className="text-pine-green/40 font-semibold">× {item.quantity}</span>
                </span>
                <span className="font-extrabold text-pine-green">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-pine-green/5 pt-4 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-pine-green/50">Subtotal</span>
              <span className="font-bold text-pine-green/70">₹{placedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-pine-green/50">Free India Delivery</span>
              <span className="font-extrabold text-pine-green uppercase">FREE</span>
            </div>
            <div className="flex justify-between border-t border-pine-green/5 pt-3 text-xs font-bold">
              <span className="uppercase text-pine-green">Grand Total</span>
              <span className="text-pine-green font-black text-sm">₹{placedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Urgent Confirmation */}
        <div className="p-5 bg-soft-beige/40 border border-pine-green/10 rounded-[28px] space-y-3.5">
          <p className="text-xs text-pine-green/80 font-semibold leading-relaxed">
            ⚡ <strong>Instant Verification:</strong> Please tap the button below to verify your delivery address with our support lab on WhatsApp. This skips the phone-confirmation queue for immediate same-day dispatch!
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold rounded-full text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <MessageSquare className="w-4 h-4 fill-white text-white" />
            Verify instantly on WhatsApp
          </a>
        </div>

        <button
          onClick={() => navigate('home')}
          className="w-full py-3 bg-pine-green hover:bg-pine-green-hover text-warm-white font-extrabold rounded-full text-xs uppercase tracking-widest transition-all cursor-pointer"
        >
          Return to home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300 text-left" id="checkout-root">
      
      {/* Back button */}
      <button
        onClick={() => navigate('home')}
        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-pine-green/60 hover:text-pine-green transition-colors uppercase tracking-wider cursor-pointer"
        id="btn-checkout-back"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Return to home
      </button>

      {/* Prominent FREE DELIVERY ACROSS INDIA notice */}
      <div className="p-4 bg-pine-green text-warm-white rounded-[24px] flex items-center justify-between shadow-sm border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center shrink-0">
            <Truck className="w-4.5 h-4.5 text-soft-beige" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest font-display">FREE DELIVERY ACROSS INDIA</h4>
            <p className="text-[10px] text-warm-white/70">No hidden fees, no shipping charges. Ever.</p>
          </div>
        </div>
        <span className="hidden sm:inline-block text-[9px] font-bold border border-white/20 bg-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
          COD AVAILABLE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Column 1-7 */}
        <div className="lg:col-span-7 glass-card p-6 md:p-8 rounded-[32px] space-y-6" id="checkout-form-panel">
          <div>
            <h2 className="text-lg font-bold text-pine-green uppercase tracking-widest font-display">Shipping Information</h2>
            <p className="text-xs text-pine-green/60 font-semibold">Please fill out your physical address details below.</p>
          </div>

          <form onSubmit={handleOpenConfirmation} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-pine-green/45 tracking-wider">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Recipient Name"
                className="w-full px-4 py-2 bg-white/40 border border-pine-green/10 rounded-xl text-xs font-bold text-pine-green focus:outline-none focus:border-pine-green"
                id="checkout-fullname"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-pine-green/45 tracking-wider">Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').substring(0, 10))}
                  placeholder="10-digit Phone Number"
                  className="w-full pl-10 pr-4 py-2 bg-white/40 border border-pine-green/10 rounded-xl text-xs font-bold text-pine-green focus:outline-none focus:border-pine-green tracking-wider"
                  id="checkout-mobile"
                />
                <Smartphone className="w-3.5 h-3.5 text-pine-green/40 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-pine-green/45 tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-white/40 border border-pine-green/10 rounded-xl text-xs font-bold text-pine-green focus:outline-none focus:border-pine-green"
                  id="checkout-email"
                />
                <Mail className="w-3.5 h-3.5 text-pine-green/40 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Full Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-pine-green/45 tracking-wider">Full Address</label>
              <textarea
                required
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="House Name, Street, Post Office, landmark..."
                rows={3}
                className="w-full px-4 py-2 bg-white/40 border border-pine-green/10 rounded-xl text-xs font-bold text-pine-green focus:outline-none focus:border-pine-green resize-none"
                id="checkout-address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* City */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-pine-green/45 tracking-wider">City</label>
                <input
                  type="text"
                  required
                  value={cityField}
                  onChange={(e) => setCityField(e.target.value)}
                  placeholder="City"
                  className="w-full px-4 py-2 bg-white/40 border border-pine-green/10 rounded-xl text-xs font-bold text-pine-green focus:outline-none focus:border-pine-green"
                  id="checkout-city"
                />
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-pine-green/45 tracking-wider">State</label>
                <input
                  type="text"
                  required
                  value={stateField}
                  onChange={(e) => setStateField(e.target.value)}
                  placeholder="State"
                  className="w-full px-4 py-2 bg-white/40 border border-pine-green/10 rounded-xl text-xs font-bold text-pine-green focus:outline-none focus:border-pine-green"
                  id="checkout-state"
                />
              </div>
            </div>

            {/* PIN Code */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-pine-green/45 tracking-wider">PIN Code</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  placeholder="6-digit PIN Code"
                  className="w-full pl-10 pr-4 py-2 bg-white/40 border border-pine-green/10 rounded-xl text-xs font-bold text-pine-green focus:outline-none focus:border-pine-green tracking-widest"
                  id="checkout-pincode"
                />
                <MapPin className="w-3.5 h-3.5 text-pine-green/40 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Payment Options (COD vs Online) */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold uppercase text-pine-green/45 tracking-wider">Payment Options</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentOption('COD')}
                  className={`p-4 border rounded-2xl text-left transition-all ${
                    paymentOption === 'COD'
                      ? 'border-pine-green bg-pine-green/5'
                      : 'border-pine-green/10 bg-white/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentOption === 'COD' ? 'border-pine-green bg-pine-green text-warm-white' : 'border-pine-green/30'}`}>
                      {paymentOption === 'COD' && <span className="w-1.5 h-1.5 bg-warm-white rounded-full" />}
                    </span>
                    <span className="text-xs font-extrabold text-pine-green uppercase">Cash on Delivery</span>
                  </div>
                  <p className="text-[9px] text-pine-green/60 pl-5 leading-relaxed font-semibold">Pay cash on doorstep delivery.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('Online')}
                  className={`p-4 border rounded-2xl text-left transition-all ${
                    paymentOption === 'Online'
                      ? 'border-pine-green bg-pine-green/5'
                      : 'border-pine-green/10 bg-white/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentOption === 'Online' ? 'border-pine-green bg-pine-green text-warm-white' : 'border-pine-green/30'}`}>
                      {paymentOption === 'Online' && <span className="w-1.5 h-1.5 bg-warm-white rounded-full" />}
                    </span>
                    <span className="text-xs font-extrabold text-pine-green uppercase">Online Payment</span>
                  </div>
                  <p className="text-[9px] text-pine-green/60 pl-5 leading-relaxed font-semibold">Pay online securely via support.</p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-pine-green hover:bg-pine-green-hover text-warm-white font-extrabold rounded-full text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md"
              id="checkout-submit-form-btn"
            >
              Verify & Complete Checkout
            </button>
          </form>
        </div>

        {/* Right Summary: Column 8-12 */}
        <div className="lg:col-span-5 space-y-6" id="checkout-summary-panel">
          <div className="glass-card rounded-[32px] p-6 space-y-4">
            <h3 className="text-xs font-extrabold text-pine-green uppercase tracking-widest font-display border-b border-pine-green/5 pb-3">Shopping Bag Summary</h3>
            
            <div className="divide-y divide-pine-green/5 max-h-72 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-xs text-pine-green/50 font-bold uppercase tracking-wider">Your shopping bag is empty.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 py-3 items-center">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-11 h-11 object-cover rounded-xl bg-white border border-pine-green/10 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-xs font-bold text-pine-green truncate">{item.product.title}</h4>
                      <p className="text-[9px] text-pine-green/50 font-bold uppercase tracking-wider">Qty: {item.quantity} × ₹{item.product.salePrice}</p>
                    </div>
                    <span className="text-xs font-black text-pine-green shrink-0">
                      ₹{(item.product.salePrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Coupon Promo Input Box */}
            {cart.length > 0 && (
              <div className="border-t border-pine-green/5 pt-4 space-y-2 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pine-green/45 block">Apply Coupon</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. OMEXO50"
                    className="flex-1 px-3 py-1.5 bg-white/40 border border-pine-green/10 rounded-xl text-xs font-bold text-pine-green placeholder-pine-green/40 focus:outline-none"
                    disabled={!!appliedCoupon}
                    id="coupon-code-input"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-all uppercase tracking-wider cursor-pointer font-extrabold"
                      id="coupon-remove-btn"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-1.5 bg-pine-green hover:bg-pine-green-hover text-warm-white text-xs font-bold rounded-xl transition-all uppercase tracking-wider cursor-pointer font-extrabold"
                      id="coupon-apply-btn"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                    ✓ Code "{appliedCoupon.code}" applied!
                  </p>
                )}
              </div>
            )}

            {cart.length > 0 && (
              <div className="border-t border-pine-green/5 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-pine-green/60">
                  <span>Subtotal</span>
                  <span className="font-bold text-pine-green">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-pine-green/60">
                  <span>Guaranteed Shipping</span>
                  <span className="font-extrabold text-pine-green uppercase">FREE</span>
                </div>
                <div className="flex justify-between border-t border-pine-green/5 pt-3 text-xs font-bold">
                  <span className="uppercase text-pine-green">Total Amount</span>
                  <span className="text-pine-green font-black text-sm">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 bg-white/40 border border-pine-green/10 rounded-[24px] flex items-center gap-3 text-left">
            <ShieldCheck className="w-5 h-5 text-pine-green shrink-0" />
            <p className="text-[10px] text-pine-green/60 font-semibold leading-relaxed">
              Omexo secures all personal information. Your order is covered by the 100% customer satisfaction replacement guarantee.
            </p>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmPrompt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-pine-green/80 z-50"
              onClick={() => setShowConfirmPrompt(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="fixed inset-0 m-auto max-w-sm h-fit bg-warm-white rounded-[28px] p-6 shadow-2xl z-55 border border-pine-green/10 space-y-5 text-center"
              id="zero-cost-confirm-prompt"
            >
              <div className="w-10 h-10 bg-pine-green/5 text-pine-green rounded-full flex items-center justify-center mx-auto border border-pine-green/10">
                <Truck className="w-5 h-5" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-pine-green uppercase tracking-widest font-display">Confirm Your Order</h3>
                <p className="text-xs text-pine-green/70 leading-relaxed font-semibold">
                  Are you ready to place your order for <strong className="text-pine-green font-extrabold">₹{grandTotal.toLocaleString('en-IN')}</strong>?
                </p>
                <div className="bg-pine-green/5 border border-pine-green/10 p-4 rounded-2xl text-[10px] font-bold text-left space-y-1.5 uppercase tracking-wide leading-relaxed text-pine-green">
                  <div>✓ Free insured priority shipping.</div>
                  <div>✓ {paymentOption === 'COD' ? 'Zero advance payment door delivery.' : 'Verification code shared instantly.'}</div>
                  <div>✓ Total payload exactly ₹{grandTotal.toLocaleString('en-IN')}.</div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmPrompt(false)}
                  className="flex-1 py-2 bg-white hover:bg-pine-green/5 border border-pine-green/10 rounded-full text-[10px] font-extrabold text-pine-green/60 uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-pine-green hover:bg-pine-green-hover text-warm-white rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer shadow-sm"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
