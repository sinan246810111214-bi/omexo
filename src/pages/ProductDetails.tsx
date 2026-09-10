import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useHashRouter } from '../hooks/useHashRouter';
import { useToast } from '../components/Toast';
import { 
  ArrowLeft, Star, ShoppingBag, Zap, ShieldAlert, Award, 
  ChevronDown, ChevronUp, MapPin, Truck, Check, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailsProps {
  productId: string;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ productId }) => {
  const { products, addToCart } = useStore();
  const { navigate } = useHashRouter();
  const { toast } = useToast();

  const product = products.find((p) => p.id === productId);

  // Gallery active index
  const [activeImage, setActiveImage] = useState(0);
  
  // Accordion active keys
  const [isSpecsOpen, setIsSpecsOpen] = useState(true);
  const [isDescOpen, setIsDescOpen] = useState(false);

  // Selected Variants state
  const [selectedColor, setSelectedColor] = useState('Tactical Black');
  const [selectedSize, setSelectedSize] = useState('Standard Edition');

  // Pincode checker states
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<{
    checked: boolean;
    valid: boolean;
    message: string;
  }>({ checked: false, valid: false, message: '' });

  if (!product) {
    return (
      <div className="py-16 text-center animate-in fade-in" id="product-not-found">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Product Not Found</h2>
        <p className="text-slate-500 mb-6">The gadget you are looking for does not exist or has been discontinued.</p>
        <button
          onClick={() => navigate('home')}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
          id="btn-return-home"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const discountPercentage = Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100);
  const isSoldOut = product.stockCount <= 0;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(product, 1);
    toast(`Added "${product.title}" (${selectedColor}, ${selectedSize}) to your cart!`, 'success');
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    addToCart(product, 1);
    navigate('checkout');
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeStatus({
        checked: true,
        valid: false,
        message: 'Invalid pincode format. Please enter a valid 6-digit number.'
      });
      return;
    }

    // Interactive delivery feedback based on pincode region
    const firstDigit = parseInt(pincode[0]);
    const isExpressEligible = firstDigit % 2 === 0;
    const days = isExpressEligible ? '2-3 Days (Express Air)' : '4-5 Days (Standard Delivery)';
    
    setPincodeStatus({
      checked: true,
      valid: true,
      message: `Delivering to pincode ${pincode}! Guaranteed courier delivery in ${days}. Cash on Delivery (COD) eligible with zero extra charges.`
    });
    toast('Delivery pincode verified!', 'success');
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300 relative" id={`product-details-${product.id}`}>
      
      {/* Back to Catalog button */}
      <button
        onClick={() => navigate('home')}
        className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-teal-600 transition-colors uppercase tracking-wider"
        id="btn-back-catalog"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </button>

      {/* Main product card detail panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left: Gallery Module */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative">
            <img
              src={product.images[activeImage] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80'}
              alt={product.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {isSoldOut && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                <span className="bg-rose-500 text-white font-bold px-4 py-2 rounded-full uppercase text-xs tracking-widest shadow">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex gap-2" id="gallery-thumbnails">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border bg-slate-50 transition-all ${
                    activeImage === idx
                      ? 'border-teal-600 ring-2 ring-teal-600/10'
                      : 'border-slate-100 opacity-75 hover:opacity-100'
                  }`}
                  id={`thumbnail-btn-${idx}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Meta configuration */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
              {product.title}
            </h1>
            
            {/* Review Block */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-600">4.9 / 5.0 Rating</span>
              <span className="text-xs text-slate-400">(418 Verified Buyer Reviews)</span>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-teal-700">
                ₹{product.salePrice.toLocaleString('en-IN')}
              </span>
              {product.regularPrice > product.salePrice && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    ₹{product.regularPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Save {discountPercentage}%
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Free Express Cash on Delivery (COD) Shipping Applied.</p>
          </div>

          {/* Dynamic Variant Selector (Color) */}
          <div className="space-y-3" id="variant-color-selector">
            <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Select Device Color</h4>
            <div className="flex flex-wrap gap-2">
              {['Tactical Black', 'Arctic Silver', 'Olive Drab'].map((color) => {
                const colorCode = color === 'Tactical Black' ? 'bg-slate-900' : color === 'Arctic Silver' ? 'bg-slate-300' : 'bg-emerald-800';
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      selectedColor === color
                        ? 'border-teal-600 bg-teal-50/20 text-teal-700 ring-2 ring-teal-500/10'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${colorCode} border border-slate-200 block shrink-0`} />
                    <span>{color}</span>
                    {selectedColor === color && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Variant Selector (Specs/Size Edition) */}
          <div className="space-y-3" id="variant-edition-selector">
            <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Select Edition</h4>
            <div className="flex gap-2.5">
              {['Standard Edition', 'Pro Elite Pro Max'].map((edition) => {
                const priceAdder = edition.includes('Elite') ? ' (+ ₹999)' : ' (Base)';
                return (
                  <button
                    key={edition}
                    onClick={() => setSelectedSize(edition)}
                    className={`flex-1 px-4 py-3 border rounded-xl text-xs font-bold text-left transition-all ${
                      selectedSize === edition
                        ? 'border-teal-600 bg-teal-50/20 text-teal-700 ring-2 ring-teal-500/10'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="font-extrabold">{edition}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">{priceAdder}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock availability status alert */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span>Availability Status:</span>
            {isSoldOut ? (
              <span className="text-rose-500 font-black">Out of Stock</span>
            ) : product.stockCount < 5 ? (
              <span className="text-amber-500 font-black">Critical low: Only {product.stockCount} units left!</span>
            ) : (
              <span className="text-emerald-600 font-black">In Stock (Dispatches in 12 hours)</span>
            )}
          </div>

          {/* Pincode eligibility checker */}
          <div className="p-4 border border-slate-100 rounded-2xl bg-white space-y-3 shadow-xs" id="pincode-checker-block">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-teal-600" />
              Verify Delivery Pincode
            </h4>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                placeholder="Enter 6-digit PIN Code"
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                id="pincode-input"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
                id="pincode-submit"
              >
                Verify
              </button>
            </form>
            {pincodeStatus.checked && (
              <div 
                className={`text-[11px] p-2.5 rounded-lg flex items-start gap-2 leading-relaxed ${
                  pincodeStatus.valid
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                    : 'bg-rose-50 text-rose-800 border border-rose-100'
                }`}
                id="pincode-response"
              >
                <Truck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{pincodeStatus.message}</span>
              </div>
            )}
          </div>

          {/* Normal Desktop Buy Action Buttons */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
              id="details-add-to-cart"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isSoldOut}
              className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-600/10"
              id="details-buy-now"
            >
              <Zap className="w-4 h-4 fill-white" />
              Buy Now
            </button>
          </div>

          {/* Collapsible Info Accordions (Specs & Description Overview) */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white" id="details-accordions">
            {/* Specifications Accordion */}
            <div>
              <button
                onClick={() => setIsSpecsOpen(!isSpecsOpen)}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-black text-slate-800 hover:bg-slate-50/50 transition-colors uppercase tracking-wider"
                id="accordion-toggle-specs"
              >
                <span>Device Specifications</span>
                {isSpecsOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              <AnimatePresence initial={false}>
                {isSpecsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-slate-50/50 text-xs text-slate-600 space-y-2.5 border-t border-slate-100">
                      {Object.entries(product.specs).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-3 py-1 border-b border-slate-100/30 last:border-b-0">
                          <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">{key}</span>
                          <span className="col-span-2 text-slate-700 font-bold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Description Accordion */}
            <div>
              <button
                onClick={() => setIsDescOpen(!isDescOpen)}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-black text-slate-800 hover:bg-slate-50/50 transition-colors uppercase tracking-wider"
                id="accordion-toggle-desc"
              >
                <span>Full Product Overview</span>
                {isDescOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              <AnimatePresence initial={false}>
                {isDescOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 text-xs text-slate-600 bg-slate-50/50 leading-relaxed font-semibold space-y-2 border-t border-slate-100">
                      <p>{product.description}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>

      {/* Sticky mobile-first action buttons bar on bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-100 z-40 flex items-center justify-between gap-3 md:hidden shadow-2xl">
        <div className="flex items-center gap-2 max-w-[40%]">
          <img 
            src={product.images[0]} 
            alt={product.title} 
            className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-100 shrink-0" 
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h4 className="text-[10px] font-black text-slate-800 truncate">{product.title}</h4>
            <span className="text-xs font-black text-teal-700">₹{product.salePrice.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="flex-1 flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-black rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isSoldOut}
            className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed font-black rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-md shadow-teal-500/20"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            Buy COD
          </button>
        </div>
      </div>

    </div>
  );
};
