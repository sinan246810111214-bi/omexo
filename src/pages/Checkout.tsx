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
      <div className="max-w-xl mx-auto py-8 text-center space-y-6 animate-in zoom-in duration-150" id="checkout-success-panel">
        <div className="w-12 h-12 bg-black text-white rounded flex items-center justify-center mx-auto border border-zinc-200">
          <Check className="w-6 h-6 stroke-[3px]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold uppercase tracking-wide text-zinc-900 leading-tight">Order Confirmed!</h2>
          <span className="text-[10px] bg-zinc-100 text-zinc-900 border border-zinc-200 px-3 py-1 rounded font-bold uppercase tracking-wider">
            Zero-Cost Cash On Delivery
          </span>
          <p className="text-xs text-zinc-500 font-medium pt-1 max-w-sm mx-auto leading-relaxed">
            Thank you for shopping at Omexo. We are preparing your high-performance accessories!
          </p>
        </div>

        {/* Order Details summary ticket */}
        <div className="p-5 bg-white border border-zinc-200 rounded text-left space-y-3.5 shadow-xs">
          <div className="flex justify-between border-b border-zinc-100 pb-2.5">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Order ID</span>
            <span className="text-xs font-bold text-zinc-900 font-mono">{placedOrder.id}</span>
          </div>

          <div className="flex justify-between border-b border-zinc-100 pb-2.5">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Exact Timestamp</span>
            <span className="text-xs font-bold text-zinc-700">{formattedTime}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-xs text-zinc-400 font-medium">Customer Details</span>
            <div className="text-right">
              <div className="text-xs font-bold text-zinc-850">{placedOrder.customerName}</div>
              <div className="text-[10px] text-zinc-405 font-medium">{placedOrder.customerPhone}</div>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-xs text-zinc-400 font-medium">Shipping Address</span>
            <span className="text-xs font-bold text-zinc-800 truncate max-w-[220px]">{placedOrder.address}, {placedOrder.pincode}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-xs text-zinc-400 font-medium">Payment Mode</span>
            <span className="text-xs font-bold text-zinc-950 uppercase">Cash on Delivery (COD)</span>
          </div>

          {/* Itemized breakdown */}
          <div className="border-t border-zinc-200 pt-3 space-y-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Purchased Accessories</span>
            {placedOrder.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="text-zinc-655 font-medium truncate max-w-[280px]">
                  {item.title} <span className="text-zinc-400">× {item.quantity}</span>
                </span>
                <span className="font-bold text-zinc-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-200 pt-3.5 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Subtotal</span>
              <span className="font-bold text-zinc-600">₹{placedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 font-medium">Cash On Delivery Fee</span>
              <span className="font-bold text-zinc-900 uppercase">₹0 (FREE)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 font-medium">Insured Delivery</span>
              <span className="font-bold text-zinc-900 uppercase">₹0 (FREE)</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2.5 text-xs">
              <span className="font-bold text-zinc-900 uppercase tracking-wider">Grand Total</span>
              <span className="font-black text-zinc-950 text-sm">₹{placedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Urgent Confirmation Button */}
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded text-left space-y-3.5">
          <p className="text-[11px] text-zinc-650 font-medium leading-relaxed">
            ⚡ <strong>Urgent Support:</strong> Click the button below to send your order verification to our official support team via WhatsApp. This ensures your package is immediately green-lit and processed today!
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <MessageSquare className="w-4 h-4 fill-white text-white" />
            Contact on WhatsApp to Confirm Delivery
          </a>
        </div>

        {/* Support helper */}
        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
          Copy Order ID <strong className="text-zinc-900 font-mono">{placedOrder.id}</strong> to track delivery.
        </div>

        <button
          onClick={() => navigate('home')}
          className="w-full py-2.5 bg-black hover:bg-zinc-900 text-white font-bold rounded text-xs uppercase tracking-widest transition-colors"
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
        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-black transition-colors uppercase tracking-wider"
        id="btn-checkout-back"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Return to Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: 1-Page Shipping Checkout Form */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 p-5 md:p-6 rounded space-y-6" id="checkout-form-panel">
          <div>
            <span className="text-[9px] bg-zinc-100 border border-zinc-200 text-zinc-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              No Advance Pay Required
            </span>
            <h2 className="text-base font-bold text-zinc-900 uppercase tracking-widest mt-2">Express Doorstep COD Shipping</h2>
            <p className="text-xs text-zinc-500 font-medium">Provide your correct, active contact details to ensure swift delivery routing.</p>
          </div>

          <form onSubmit={handleOpenConfirmation} className="space-y-4">
            
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Full Recipient Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priyan Sharma"
                className="w-full px-3 py-2 text-xs border border-zinc-200 bg-white rounded focus:outline-none focus:border-black font-semibold"
                id="checkout-name"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priyan.sharma@gmail.com"
                className="w-full px-3 py-2 text-xs border border-zinc-200 bg-white rounded focus:outline-none focus:border-black font-semibold"
                id="checkout-email"
              />
            </div>

            {/* Mobile Contact */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Active Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                  placeholder="10-digit delivery mobile number"
                  className="w-full pl-10 pr-3 py-2 text-xs border border-zinc-200 bg-white rounded focus:outline-none focus:border-black font-semibold tracking-wider"
                  id="checkout-phone"
                />
                <Smartphone className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-3" />
              </div>
              <span className="text-[9px] text-zinc-400 font-medium">Our courier executive will call this number before arrival.</span>
            </div>

            {/* Shipping Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Detailed Shipping Address</label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat/House No, Building, Landmark, Area, City, State"
                className="w-full px-3 py-2 text-xs border border-zinc-200 bg-white rounded focus:outline-none focus:border-black font-semibold"
                id="checkout-address"
              />
            </div>

            {/* Pincode */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Delivery Pincode / ZIP</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  placeholder="6-digit PIN Code"
                  className="w-full pl-10 pr-3 py-2 text-xs border border-zinc-200 bg-white rounded focus:outline-none focus:border-black font-semibold tracking-wider"
                  id="checkout-pincode"
                />
                <MapPin className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* LOCKED COD PAYMENT PERK */}
            <div className="space-y-2 pt-4 border-t border-zinc-200">
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Payment Mode Guaranteed</label>
              <div className="p-4 rounded border border-black bg-zinc-50" id="locked-payment-block">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-bold">✓</span>
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Cash on Delivery (COD) Locked</span>
                </div>
                <p className="text-[10px] text-zinc-500 pl-6 font-medium leading-relaxed">
                  We currently offer exclusively COD to promote buyer confidence. Hand over cash on delivery at your doorstep with zero transaction surcharges.
                </p>
              </div>
            </div>

            {/* Place Order submit trigger */}
            <button
              type="submit"
              className="w-full py-2.5 bg-black hover:bg-zinc-900 text-white font-bold rounded text-xs uppercase tracking-widest transition-all"
              id="checkout-submit-form-btn"
            >
              Confirm Cash on Delivery Order
            </button>

          </form>
        </div>

        {/* Right: Order Summary calculation drawer */}
        <div className="lg:col-span-5 space-y-6" id="checkout-summary-panel">
          <div className="bg-zinc-50 border border-zinc-200 rounded p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Order Summary</h3>
            
            <div className="divide-y divide-zinc-200 max-h-72 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-400 font-bold uppercase tracking-wide">Your shopping cart is empty.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 py-3 items-center">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-11 h-11 object-cover rounded bg-white border border-zinc-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-zinc-900 truncate">{item.product.title}</h4>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Qty: {item.quantity} × ₹{item.product.salePrice.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="text-xs font-bold text-zinc-950 shrink-0">
                      ₹{(item.product.salePrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Calculations block */}
            {cart.length > 0 && (
              <div className="border-t border-zinc-200 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500 font-medium">
                  <span>Cart Items Subtotal</span>
                  <span className="font-bold text-zinc-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-zinc-500 font-medium">
                  <span>Guaranteed Free Shipping</span>
                  <span className="font-bold text-zinc-950 uppercase">FREE</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-3 text-xs font-bold">
                  <span className="uppercase text-zinc-900">Grand Total</span>
                  <span className="text-zinc-950 font-black text-sm">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border border-zinc-200 rounded flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-zinc-900 shrink-0" />
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
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
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowConfirmPrompt(false)}
            />

            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="fixed inset-0 m-auto max-w-sm h-fit bg-white rounded p-6 shadow-xl z-55 border border-zinc-200 space-y-5 text-center"
              id="zero-cost-confirm-prompt"
            >
              <div className="w-10 h-10 bg-zinc-50 text-zinc-900 rounded border border-zinc-200 flex items-center justify-center mx-auto">
                <Truck className="w-5 h-5" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Confirm COD Order</h3>
                <p className="text-xs text-zinc-500 font-medium max-w-xs mx-auto leading-relaxed">
                  You are confirming a Cash on Delivery order for <strong className="text-zinc-950 font-bold">₹{cartSubtotal.toLocaleString('en-IN')}</strong>.
                </p>
                <div className="bg-zinc-50 text-zinc-800 p-3 rounded border border-zinc-200 text-[10px] font-bold text-left space-y-1 uppercase tracking-wide leading-relaxed">
                  <div>✓ ZERO extra hidden fees.</div>
                  <div>✓ ZERO shipping charges.</div>
                  <div>✓ Pay exactly ₹{cartSubtotal.toLocaleString('en-IN')} at doorstep.</div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmPrompt(false)}
                  className="flex-1 py-2 border border-zinc-200 hover:border-zinc-300 rounded text-[10px] font-bold text-zinc-500 uppercase tracking-wide transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-black hover:bg-zinc-900 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
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
