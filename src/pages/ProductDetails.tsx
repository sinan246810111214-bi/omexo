import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useHashRouter } from '../hooks/useHashRouter';
import { useToast } from '../components/Toast';
import { 
  ArrowLeft, Star, ShoppingBag, Zap, ShieldAlert, 
  MapPin, Truck, Check, ShieldCheck, Plus, Minus 
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
  
  // Selected quantity
  const [quantity, setQuantity] = useState(1);

  // Selected Variants state
  const [selectedColor, setSelectedColor] = useState('Tactical Black');

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
        <ShieldAlert className="w-10 h-10 text-pine-green mx-auto mb-4" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-pine-green mb-2">Product Not Found</h2>
        <p className="text-xs text-pine-green/60 mb-6 font-semibold">The gadget you are looking for does not exist or has been discontinued.</p>
        <button
          onClick={() => navigate('home')}
          className="px-6 py-2 bg-pine-green hover:bg-pine-green-hover text-warm-white font-bold text-xs uppercase tracking-wide rounded-full transition-colors"
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
    addToCart(product, quantity);
    toast(`Added ${quantity} × "${product.title}" (${selectedColor}) to your cart!`, 'success');
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    addToCart(product, quantity);
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
    <div className="space-y-12 pb-24 animate-in fade-in duration-300 text-left" id={`product-details-${product.id}`}>
      
      {/* Back to Catalog button */}
      <button
        onClick={() => navigate('home')}
        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-pine-green/60 hover:text-pine-green transition-colors uppercase tracking-wider cursor-pointer"
        id="btn-back-catalog"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Catalog
      </button>

      {/* Main product card detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Large Product Image & Thumbnail Gallery (Columns 1-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-[32px] overflow-hidden bg-white/50 border border-white/40 p-4 relative shadow-md">
            <img
              src={product.images[activeImage] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80'}
              alt={product.title}
              className="w-full h-full object-cover rounded-2xl shadow-inner"
              referrerPolicy="no-referrer"
            />
            {isSoldOut && (
              <div className="absolute inset-0 bg-warm-white/80 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-pine-green text-warm-white font-bold px-4 py-2 rounded-full uppercase text-xs tracking-widest shadow-md">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails gallery */}
          {product.images.length > 1 && (
            <div className="flex gap-3 justify-center" id="gallery-thumbnails">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-16 rounded-2xl overflow-hidden border bg-white/40 p-1.5 transition-all ${
                    activeImage === idx
                      ? 'border-pine-green ring-1 ring-pine-green scale-102'
                      : 'border-white/40 opacity-75 hover:opacity-100'
                  }`}
                  id={`thumbnail-btn-${idx}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Meta Details & Configuration (Columns 7-12) */}
        <div className="lg:col-span-6 space-y-6 glass-card p-6 md:p-8 rounded-[32px]">
          <div className="space-y-3">
            <span className="inline-block text-[9px] uppercase font-bold tracking-widest text-pine-green bg-pine-green/5 border border-pine-green/10 px-3 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="text-xl md:text-3xl font-extrabold text-pine-green tracking-tight leading-tight">
              {product.title}
            </h1>
            
            {/* Review Block */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-pine-green">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-pine-green" />
                ))}
              </div>
              <span className="text-[11px] font-extrabold text-pine-green">4.9 Rating</span>
              <span className="text-[11px] text-pine-green/40 font-semibold">(418 Verified Buyers)</span>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="p-5 rounded-[24px] bg-white/40 border border-white/30 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-pine-green">
                ₹{product.salePrice.toLocaleString('en-IN')}
              </span>
              {product.regularPrice > product.salePrice && (
                <>
                  <span className="text-sm text-pine-green/40 line-through font-bold">
                    ₹{product.regularPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] font-bold text-pine-green bg-soft-beige px-2.5 py-1 rounded-full">
                    Save {discountPercentage}%
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] text-pine-green/60 font-semibold">Free Express Cash on Delivery (COD) Shipping Applied.</p>
          </div>

          {/* Short description */}
          <p className="text-xs text-pine-green/70 leading-relaxed font-semibold">
            {product.description}
          </p>

          {/* Quantity selector */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase font-bold text-pine-green/45 tracking-wider">Select Quantity</h4>
            <div className="flex items-center gap-3 bg-white/50 border border-pine-green/10 rounded-full w-fit p-1">
              <button
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1 || isSoldOut}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-pine-green hover:bg-pine-green hover:text-warm-white transition-colors cursor-pointer disabled:opacity-40"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black px-2 text-pine-green w-6 text-center tabular-nums">{quantity}</span>
              <button
                onClick={() => setQuantity(prev => Math.min(product.stockCount, prev + 1))}
                disabled={quantity >= product.stockCount || isSoldOut}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-pine-green hover:bg-pine-green hover:text-warm-white transition-colors cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className="flex-1 py-3 bg-white/50 hover:bg-white border border-pine-green/15 text-pine-green font-extrabold rounded-full text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              id="details-add-to-cart"
            >
              <ShoppingBag className="w-4 h-4 text-pine-green/60" />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isSoldOut}
              className="flex-1 py-3 bg-pine-green hover:bg-pine-green-hover text-warm-white font-extrabold rounded-full text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md"
              id="details-buy-now"
            >
              <Zap className="w-4 h-4 fill-warm-white" />
              Buy Now
            </button>
          </div>

          {/* Delivery & Pincode verified */}
          <div className="p-5 border border-pine-green/10 rounded-[24px] bg-white/30 space-y-3" id="pincode-checker-block">
            <h4 className="text-[10px] font-bold text-pine-green flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              Verify Delivery Pincode
            </h4>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                placeholder="Enter 6-digit PIN Code"
                className="flex-1 px-4 py-2 bg-white border border-pine-green/10 rounded-full text-xs text-pine-green placeholder-pine-green/40 focus:outline-none focus:border-pine-green font-bold"
                id="pincode-input"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-pine-green hover:bg-pine-green-hover text-warm-white font-bold rounded-full text-xs transition-colors shrink-0 uppercase tracking-wider cursor-pointer"
                id="pincode-submit"
              >
                Verify
              </button>
            </form>
            {pincodeStatus.checked && (
              <div 
                className="text-[10px] p-3 rounded-[16px] bg-white/50 border border-pine-green/10 leading-relaxed text-pine-green/80 flex gap-2 font-medium"
                id="pincode-response"
              >
                <Truck className="w-4 h-4 shrink-0 text-pine-green mt-0.5" />
                <span>{pincodeStatus.message}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Below Details Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-pine-green/10">
        {/* Features / Details */}
        <div className="glass-card p-6 rounded-[24px] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-pine-green">Product Details</h4>
          <p className="text-xs text-pine-green/70 leading-relaxed font-semibold">
            All Omexo premium goods are manufactured with high standards of design and durability. Each piece undergoes 3 stages of functional verification.
          </p>
        </div>

        {/* Specifications Table */}
        <div className="glass-card p-6 rounded-[24px] space-y-3 md:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-pine-green">Device Specifications</h4>
          <div className="text-xs text-pine-green space-y-2">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 py-1.5 border-b border-pine-green/5 last:border-0">
                <span className="font-bold text-pine-green/40 uppercase tracking-wider text-[9px]">{key}</span>
                <span className="col-span-2 text-pine-green font-extrabold text-left">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky mobile action bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-warm-white/90 backdrop-blur-md border-t border-pine-green/10 z-40 flex items-center justify-between gap-3 md:hidden shadow-lg">
        <div className="flex items-center gap-2 max-w-[40%] text-left">
          <img 
            src={product.images[0]} 
            alt={product.title} 
            className="w-8 h-8 rounded-lg object-cover bg-white border border-pine-green/5 shrink-0" 
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h4 className="text-[10px] font-bold text-pine-green truncate">{product.title}</h4>
            <span className="text-xs font-black text-pine-green">₹{product.salePrice}</span>
          </div>
        </div>
        <div className="flex-1 flex gap-2 justify-end">
          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className="py-2.5 px-4 bg-white/70 border border-pine-green/10 text-pine-green font-bold rounded-full text-[10px] uppercase tracking-wider transition-all"
          >
            Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isSoldOut}
            className="py-2.5 px-4 bg-pine-green text-warm-white font-bold rounded-full text-[10px] uppercase tracking-wider transition-all"
          >
            Buy COD
          </button>
        </div>
      </div>

    </div>
  );
};
