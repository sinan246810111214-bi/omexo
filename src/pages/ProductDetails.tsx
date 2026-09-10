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
        <ShieldAlert className="w-10 h-10 text-zinc-900 mx-auto mb-4" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-zinc-500 mb-6 font-medium">The gadget you are looking for does not exist or has been discontinued.</p>
        <button
          onClick={() => navigate('home')}
          className="px-6 py-2 bg-black hover:bg-zinc-900 text-white font-bold text-xs uppercase tracking-wide rounded transition-colors"
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
        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-black transition-colors uppercase tracking-wider"
        id="btn-back-catalog"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Catalog
      </button>

      {/* Main product card detail panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left: Gallery Module */}
        <div className="space-y-4">
          <div className="aspect-square rounded overflow-hidden bg-zinc-50 border border-zinc-200 relative">
            <img
              src={product.images[activeImage] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80'}
              alt={product.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {isSoldOut && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-black text-white font-bold px-4 py-2 rounded uppercase text-xs tracking-widest shadow">
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
                  className={`w-14 h-14 rounded overflow-hidden border bg-zinc-50 transition-all ${
                    activeImage === idx
                      ? 'border-black ring-1 ring-black'
                      : 'border-zinc-200 opacity-75 hover:opacity-100'
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
          <div className="space-y-2.5">
            <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-800 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded">
              {product.category}
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight leading-snug">
              {product.title}
            </h1>
            
            {/* Review Block */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-zinc-900 fill-zinc-900" />
                ))}
              </div>
              <span className="text-[11px] font-bold text-zinc-850">4.9 / 5.0 Rating</span>
              <span className="text-[11px] text-zinc-400 font-medium">(418 Verified Buyers)</span>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="p-4 rounded bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-zinc-950">
                ₹{product.salePrice.toLocaleString('en-IN')}
              </span>
              {product.regularPrice > product.salePrice && (
                <>
                  <span className="text-xs text-zinc-400 line-through font-bold">
                    ₹{product.regularPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] font-bold text-black bg-white border border-zinc-200 px-2 py-0.5 rounded">
                    Save {discountPercentage}%
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">Free Express Cash on Delivery (COD) Shipping Applied.</p>
          </div>

          {/* Dynamic Variant Selector (Color) */}
          <div className="space-y-3" id="variant-color-selector">
            <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Select Device Color</h4>
            <div className="flex flex-wrap gap-2">
              {['Tactical Black', 'Arctic Silver', 'Olive Drab'].map((color) => {
                const colorCode = color === 'Tactical Black' ? 'bg-zinc-900' : color === 'Arctic Silver' ? 'bg-zinc-300' : 'bg-zinc-700';
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 border rounded text-xs font-bold transition-all flex items-center gap-2 ${
                      selectedColor === color
                        ? 'border-black bg-black text-white'
                        : 'border-zinc-200 bg-white hover:border-black text-zinc-600'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${colorCode} border border-zinc-300 block shrink-0`} />
                    <span>{color}</span>
                    {selectedColor === color && <Check className="w-3 h-3 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Variant Selector (Specs/Size Edition) */}
          <div className="space-y-3" id="variant-edition-selector">
            <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Select Edition</h4>
            <div className="flex gap-2.5">
              {['Standard Edition', 'Pro Elite Pro Max'].map((edition) => {
                const priceAdder = edition.includes('Elite') ? ' (+ ₹999)' : ' (Base)';
                return (
                  <button
                    key={edition}
                    onClick={() => setSelectedSize(edition)}
                    className={`flex-1 px-4 py-2.5 border rounded text-xs font-bold text-left transition-all ${
                      selectedSize === edition
                        ? 'border-black bg-black text-white'
                        : 'border-zinc-200 bg-white hover:border-black text-zinc-600'
                    }`}
                  >
                    <div className="font-extrabold">{edition}</div>
                    <div className={`text-[9px] font-semibold ${selectedSize === edition ? 'text-zinc-300' : 'text-zinc-400'}`}>{priceAdder}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock availability status alert */}
          <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-700">
            <span>Availability Status:</span>
            {isSoldOut ? (
              <span className="text-black font-extrabold">Out of Stock</span>
            ) : product.stockCount < 5 ? (
              <span className="text-black font-extrabold">Hurry: Only {product.stockCount} units left!</span>
            ) : (
              <span className="text-zinc-950 font-extrabold">In Stock (Dispatches in 12 hours)</span>
            )}
          </div>

          {/* Pincode eligibility checker */}
          <div className="p-4 border border-zinc-200 rounded bg-white space-y-3" id="pincode-checker-block">
            <h4 className="text-[10px] font-bold text-zinc-900 flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-zinc-900" />
              Verify Delivery Pincode
            </h4>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                placeholder="Enter 6-digit PIN Code"
                className="flex-1 px-3 py-2 border border-zinc-200 rounded text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-black"
                id="pincode-input"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black hover:bg-zinc-900 text-white font-bold rounded text-xs transition-colors shrink-0 uppercase tracking-wide"
                id="pincode-submit"
              >
                Verify
              </button>
            </form>
            {pincodeStatus.checked && (
              <div 
                className={`text-[11px] p-2.5 rounded flex items-start gap-2 leading-relaxed border ${
                  pincodeStatus.valid
                    ? 'bg-zinc-50 text-zinc-800 border-zinc-200'
                    : 'bg-zinc-50 text-zinc-500 border-zinc-200'
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
              className="flex-1 py-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded text-xs transition-all flex items-center justify-center gap-2"
              id="details-add-to-cart"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isSoldOut}
              className="flex-1 py-2.5 bg-black hover:bg-zinc-900 text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded text-xs transition-all flex items-center justify-center gap-2"
              id="details-buy-now"
            >
              <Zap className="w-4 h-4 fill-white text-white" />
              Buy Now
            </button>
          </div>

          {/* Collapsible Info Accordions (Specs & Description Overview) */}
          <div className="border border-zinc-200 rounded overflow-hidden divide-y divide-zinc-200 bg-white" id="details-accordions">
            {/* Specifications Accordion */}
            <div>
              <button
                onClick={() => setIsSpecsOpen(!isSpecsOpen)}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-zinc-900 hover:bg-zinc-50 transition-colors uppercase tracking-wider"
                id="accordion-toggle-specs"
              >
                <span>Device Specifications</span>
                {isSpecsOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
              </button>
              <AnimatePresence initial={false}>
                {isSpecsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-zinc-50 text-xs text-zinc-600 space-y-2 border-t border-zinc-200">
                      {Object.entries(product.specs).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-3 py-1 border-b border-zinc-100 last:border-b-0">
                          <span className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">{key}</span>
                          <span className="col-span-2 text-zinc-800 font-bold">{value}</span>
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
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-zinc-900 hover:bg-zinc-50 transition-colors uppercase tracking-wider"
                id="accordion-toggle-desc"
              >
                <span>Full Product Overview</span>
                {isDescOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
              </button>
              <AnimatePresence initial={false}>
                {isDescOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 text-xs text-zinc-600 bg-zinc-50 leading-relaxed font-semibold space-y-2 border-t border-zinc-200">
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
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-zinc-200 z-40 flex items-center justify-between gap-3 md:hidden shadow-lg">
        <div className="flex items-center gap-2 max-w-[40%]">
          <img 
            src={product.images[0]} 
            alt={product.title} 
            className="w-8 h-8 rounded object-cover bg-zinc-50 border border-zinc-100 shrink-0" 
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h4 className="text-[10px] font-bold text-zinc-800 truncate">{product.title}</h4>
            <span className="text-xs font-black text-zinc-950">₹{product.salePrice.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="flex-1 flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className="flex-1 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isSoldOut}
            className="flex-1 py-2 bg-black hover:bg-zinc-900 text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            Buy COD
          </button>
        </div>
      </div>

    </div>
  );
};
