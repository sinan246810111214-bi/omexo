import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useHashRouter } from '../hooks/useHashRouter';
import { useToast } from '../components/Toast';
import { 
  ShoppingBag, ShieldCheck, Truck, ArrowLeft, MessageSquare, 
  Check, Smartphone, Mail, MapPin, Sparkles, ShoppingCart, HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../types';

export const Checkout: React.FC = () => {
  const { cart, createOrder, clearCart } = useStore();
  const { navigate } = useHashRouter();
  const { toast } = useToast();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  // Confirmation Prompt State
  const [showConfirmPrompt, setShowConfirmPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Placed Order Summary Reference
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);

  const handleOpenConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast('Your shopping cart is empty!', 'error');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      toast('Please enter a valid 6-digit PIN code.', 'error');
      return;
    }
    setShowConfirmPrompt(true);
  };

  const handleConfirmOrder = async () => {
    setShowConfirmPrompt(false);
    setIsSubmitting(true);
    try {
      const order = await createOrder({
        name,
        email,
        phone,
        address,
        pincode,
        paymentType: 'COD',
      });
      setPlacedOrder(order);
      toast('Order registered successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Checkout failed. Please retry.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Human-readable precise timestamp formatter: DD-MM-YYYY, hh:mm A
  const getFormattedTimestamp = (isoString: string) => {
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
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
      <div className="max-w-xl mx-auto py-8 text-center space-y-6 animate-in zoom-in duration-300" id="checkout-success-panel">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <Check className="w-8 h-8 stroke-[3px]" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800 leading-tight">Order Confirmed!</h2>
          <span className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Zero-Cost Cash On Delivery
          </span>
          <p className="text-xs text-slate-400 font-semibold pt-1">
            Thank you for shopping at Omexo. We are preparing your high-performance accessories!
          </p>
        </div>

        {/* Order Details summary ticket */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl text-left space-y-3.5 shadow-sm">
          <div className="flex justify-between border-b border-slate-50 pb-2.5">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Order ID</span>
            <span className="text-xs font-black text-slate-800 font-mono">{placedOrder.id}</span>
          </div>

          <div className="flex justify-between border-b border-slate-50 pb-2.5">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Exact Timestamp</span>
            <span className="text-xs font-bold text-slate-700">{formattedTime}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-xs text-slate-400 font-medium">Customer Details</span>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-700">{placedOrder.customerName}</div>
              <div className="text-[10px] text-slate-400 font-semibold">{placedOrder.customerPhone}</div>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-xs text-slate-400 font-medium">Shipping Address</span>
            <span className="text-xs font-bold text-slate-700 truncate max-w-[220px]">{placedOrder.address}, {placedOrder.pincode}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-xs text-slate-400 font-medium">Payment Mode</span>
            <span className="text-xs font-black text-teal-700 uppercase">Cash on Delivery (COD)</span>
          </div>

          {/* Itemized breakdown */}
          <div className="border-t border-slate-100 pt-3 space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">Purchased Accessories</span>
            {placedOrder.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium truncate max-w-[280px]">
                  {item.title} <span className="text-slate-400">× {item.quantity}</span>
                </span>
                <span className="font-bold text-slate-700">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3.5 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Subtotal</span>
              <span className="font-bold text-slate-600">₹{placedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Cash On Delivery Fee</span>
              <span className="font-black text-emerald-600 uppercase">₹0 (FREE)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Insured Delivery</span>
              <span className="font-black text-emerald-600 uppercase">₹0 (FREE)</span>
            </div>
            <div className="flex justify-between border-t border-slate-200/60 pt-2.5 text-sm">
              <span className="font-black text-slate-800">Grand Total</span>
              <span className="font-black text-slate-900 text-base">₹{placedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Urgent Confirmation Button */}
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-left space-y-2">
          <p className="text-[11px] text-emerald-800 font-semibold leading-relaxed">
            ⚡ <strong>Urgent:</strong> Click the button below to send your order verification to our official support team via WhatsApp. This ensures your package is immediately green-lit and processed today!
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            <MessageSquare className="w-4.5 h-4.5 fill-white text-white" />
            Contact on WhatsApp to Confirm Delivery
          </a>
        </div>

        {/* Support helper */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-400 font-semibold">
          Need details? Copy your Order ID <strong>{placedOrder.id}</strong> and paste it in the <strong>Track Order</strong> tab.
        </div>

        <button
          onClick={() => navigate('home')}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-colors"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300" id="checkout-root">
      
      {/* Back button */}
      <button
        onClick={() => navigate('home')}
        className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-teal-600 transition-colors uppercase tracking-wider"
        id="btn-checkout-back"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: 1-Page Shipping Checkout Form */}
        <div className="lg:col-span-7 bg-white border border-slate-100 p-5 md:p-6 rounded-3xl space-y-6" id="checkout-form-panel">
          <div>
            <span className="text-[9px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-black uppercase tracking-wider">
              No Advance Pay Required
            </span>
            <h2 className="text-xl font-black text-slate-800 tracking-tight mt-1.5">Express Doorstep COD Shipping</h2>
            <p className="text-xs text-slate-400 font-semibold">Provide your correct, active contact details to ensure swift delivery routing.</p>
          </div>

          <form onSubmit={handleOpenConfirmation} className="space-y-4">
            
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Full Recipient Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priyan Sharma"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/10 focus:border-teal-500 font-semibold"
                id="checkout-name"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priyan.sharma@gmail.com"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/10 focus:border-teal-500 font-semibold"
                id="checkout-email"
              />
            </div>

            {/* Mobile Contact */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                  placeholder="10-digit delivery mobile number"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/10 focus:border-teal-500 font-semibold tracking-wider"
                  id="checkout-phone"
                />
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              <span className="text-[9px] text-slate-400 font-medium">Our courier executive will call this number before arrival.</span>
            </div>

            {/* Shipping Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Detailed Shipping Address</label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat/House No, Building, Landmark, Area, City, State"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/10 focus:border-teal-500 font-semibold"
                id="checkout-address"
              />
            </div>

            {/* Pincode */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Delivery Pincode / ZIP</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  placeholder="6-digit PIN Code"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-100 bg-slate-50 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/10 focus:border-teal-500 font-semibold tracking-wider"
                  id="checkout-pincode"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* LOCKED COD PAYMENT PERK */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Payment Mode Guaranteed</label>
              <div className="p-4 rounded-2xl border border-teal-500 bg-teal-50/20" id="locked-payment-block">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-4.5 h-4.5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Cash on Delivery (COD) Locked</span>
                </div>
                <p className="text-[10px] text-slate-400 pl-6 font-semibold leading-relaxed">
                  We currently offer exclusively COD to promote buyer confidence. Hand over cash on delivery at your doorstep with zero transaction surcharges.
                </p>
              </div>
            </div>

            {/* Place Order submit trigger */}
            <button
              type="submit"
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md shadow-teal-500/10"
              id="checkout-submit-form-btn"
            >
              Confirm Cash on Delivery Order
            </button>

          </form>
        </div>

        {/* Right: Order Summary calculation drawer */}
        <div className="lg:col-span-5 space-y-6" id="checkout-summary-panel">
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Order Summary</h3>
            
            <div className="divide-y divide-slate-200/50 max-h-72 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">Your shopping cart is empty.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 py-3 items-center">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-11 h-11 object-cover rounded-lg bg-white border border-slate-150"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{item.product.title}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Qty: {item.quantity} × ₹{item.product.salePrice.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="text-xs font-extrabold text-slate-700 shrink-0">
                      ₹{(item.product.salePrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Calculations block */}
            {cart.length > 0 && (
              <div className="border-t border-slate-200/60 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Cart Items Subtotal</span>
                  <span className="font-bold text-slate-700">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Guaranteed Free Shipping</span>
                  <span className="font-black text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-sm">
                  <span className="font-black text-slate-800">Grand Total</span>
                  <span className="font-black text-slate-900 text-base">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              We encrypt all personal info. Your delivery is covered by the 100% replacement warranty in case of any damage.
            </p>
          </div>
        </div>

      </div>

      {/* Dynamic Zero-Cost Cash on Delivery Confirmation Modal */}
      <AnimatePresence>
        {showConfirmPrompt && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 z-50 backdrop-blur-xs"
              onClick={() => setShowConfirmPrompt(false)}
            />

            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 m-auto max-w-sm h-fit bg-white rounded-3xl p-6 shadow-2xl z-55 border border-slate-100 space-y-5 text-center"
              id="zero-cost-confirm-prompt"
            >
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">Confirm COD Order</h3>
                <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto leading-relaxed">
                  You are confirming a Cash on Delivery order for <strong className="text-teal-700">₹{cartSubtotal.toLocaleString('en-IN')}</strong>.
                </p>
                <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-100 text-[10px] font-bold text-left leading-relaxed">
                  ✓ ZERO extra hidden fees.<br />
                  ✓ ZERO shipping or handling charges.<br />
                  ✓ You will pay exactly ₹{cartSubtotal.toLocaleString('en-IN')} upon delivery.
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmPrompt(false)}
                  className="flex-1 py-3 border border-slate-100 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500 uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-md"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm Order'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
