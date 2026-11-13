import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useHashRouter } from '../hooks/useHashRouter';
import { useToast } from '../components/Toast';
import { trackViewContent } from '../lib/metaPixel';
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  Zap,
  ShieldAlert,
  MapPin,
  Truck,
  MessageCircle,
  Plus,
  Minus,
} from 'lucide-react';
import {
  buildProductWhatsAppUrl,
  getSiteBrandConfig,
  resolveCategorySlug,
} from '../config/categories';

interface ProductDetailsProps {
  productId: string;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ productId }) => {
  const { products, addToCart, getStoreSettingsForSite } = useStore();
  const { siteSlug, navigate } = useHashRouter();
  const { toast } = useToast();

  const product = products.find((p) => p.id === productId);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<{
    checked: boolean;
    valid: boolean;
    message: string;
  }>({ checked: false, valid: false, message: '' });

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    if (product) {
      trackViewContent(product);
    }
  }, [product]);

  if (!product) {
    const activeBrand = getSiteBrandConfig(siteSlug);
    return (
      <div className="py-16 text-center" id="product-not-found">
        <ShieldAlert className="w-10 h-10 text-pine-green mx-auto mb-3" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-pine-green mb-2">
          Product Not Found
        </h2>
        <p className="text-xs text-pine-green/60 mb-5 font-semibold">
          This product is unavailable in {activeBrand.name}.
        </p>
        <button
          type="button"
          onClick={() => navigate('home', undefined, siteSlug)}
          className="px-6 py-2.5 bg-pine-green hover:bg-pine-green-hover text-warm-white font-bold text-xs uppercase tracking-wide rounded-full cursor-pointer"
          id="btn-return-home"
        >
          Back to {activeBrand.name}
        </button>
      </div>
    );
  }

  const discountPercentage =
    product.regularPrice > product.salePrice
      ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
      : 0;
  const isSoldOut = product.stockCount <= 0;

  const resolvedProdSlug = resolveCategorySlug(product.categorySlug || product.category);
  const productSiteSlug = resolvedProdSlug && resolvedProdSlug !== 'All' ? resolvedProdSlug : siteSlug;
  const productBrand = getSiteBrandConfig(productSiteSlug);
  const productStoreSettings = getStoreSettingsForSite(productSiteSlug);
  const whatsappOrderUrl = buildProductWhatsAppUrl(product, productStoreSettings);

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(product, quantity, productSiteSlug);
    toast(`Added ${quantity} × "${product.title}" to bag`, 'success');
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    addToCart(product, quantity, productSiteSlug);
    navigate('checkout', undefined, productSiteSlug);
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeStatus({
        checked: true,
        valid: false,
        message: 'Please enter a valid 6-digit PIN code.',
      });
      return;
    }

    const firstDigit = parseInt(pincode[0], 10);
    const days = firstDigit % 2 === 0 ? '2–3 Days' : '4–5 Days';

    setPincodeStatus({
      checked: true,
      valid: true,
      message: `Delivery available to ${pincode} (${days}) · Cash on Delivery eligible.`,
    });
  };

  return (
    <div
      className="space-y-8 pb-24 md:pb-8 text-left"
      id={`product-details-${product.id}`}
    >
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate('home', undefined, productSiteSlug)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-pine-green/75 hover:text-pine-green uppercase tracking-wider cursor-pointer py-1"
          id="btn-back-catalog"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {productStoreSettings.storeName || productBrand.name}
        </button>
      </div>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Left: Product Image Gallery */}
        <div className="lg:col-span-6 space-y-3">
          <div className="aspect-square rounded-3xl overflow-hidden bg-soft-beige/30 border border-pine-green/10 p-3 relative shadow-sm">
            <img
              src={product.images[activeImage] || product.images[0]}
              alt={product.title}
              onError={(e) => {
                e.currentTarget.style.opacity = '0';
              }}
              className="w-full h-full object-cover rounded-2xl"
              referrerPolicy="no-referrer"
            />
            {isSoldOut && (
              <div className="absolute inset-0 bg-warm-white/85 flex items-center justify-center">
                <span className="bg-pine-green text-warm-white font-bold px-4 py-2 rounded-full uppercase text-xs tracking-widest">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2.5 justify-center" id="gallery-thumbnails">
              {product.images.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-16 rounded-2xl overflow-hidden border bg-white p-1 transition-all cursor-pointer ${
                    activeImage === idx
                      ? 'border-pine-green ring-1 ring-pine-green'
                      : 'border-pine-green/15 opacity-75 hover:opacity-100'
                  }`}
                  id={`thumbnail-btn-${idx}`}
                >
                  <img
                    src={img}
                    alt={`${product.title} ${idx + 1}`}
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Quick Order Panel */}
        <div className="lg:col-span-6 space-y-5 bg-white p-5 sm:p-7 rounded-3xl border border-pine-green/10 shadow-sm">
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-pine-green/60">
              {productBrand.name} · {isSoldOut ? 'Out of Stock' : 'In Stock'}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-pine-green tracking-tight leading-tight text-balance">
              {product.title}
            </h1>

            <div className="flex items-center gap-1.5 text-xs">
              <Star className="w-3.5 h-3.5 fill-pine-green text-pine-green" />
              <span className="font-extrabold text-pine-green tabular-nums">4.9</span>
              <span className="text-pine-green/55 font-medium">· Verified Reviews</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-warm-white border border-pine-green/10 space-y-1">
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="text-3xl font-black text-pine-green tabular-nums">
                ₹{product.salePrice.toLocaleString('en-IN')}
              </span>
              {product.regularPrice > product.salePrice && (
                <>
                  <span className="text-sm text-pine-green/45 line-through font-bold tabular-nums">
                    ₹{product.regularPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-extrabold text-pine-green">
                    Save {discountPercentage}%
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-pine-green/70 font-semibold">
              Free Delivery · Cash on Delivery Across India
            </p>
          </div>

          <p className="text-xs sm:text-sm text-pine-green/80 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-xs uppercase font-bold text-pine-green/60 tracking-wider">
              Quantity
            </span>
            <div className="flex items-center gap-2 bg-warm-white border border-pine-green/15 rounded-full p-1">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1 || isSoldOut}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-pine-green hover:bg-pine-green hover:text-warm-white transition-colors cursor-pointer disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black px-2 text-pine-green min-w-6 text-center tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.min(product.stockCount, prev + 1))}
                disabled={quantity >= product.stockCount || isSoldOut}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-pine-green hover:bg-pine-green hover:text-warm-white transition-colors cursor-pointer disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="space-y-2.5 pt-1">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isSoldOut}
                className="flex-1 min-h-[46px] px-5 bg-pine-green hover:bg-pine-green-hover text-warm-white font-extrabold rounded-full text-xs uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                id="details-buy-now"
              >
                <Zap className="w-4 h-4 fill-warm-white" />
                Buy Now (COD)
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className="flex-1 min-h-[46px] px-5 bg-white hover:bg-pine-green/5 border border-pine-green/20 text-pine-green font-extrabold rounded-full text-xs uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                id="details-add-to-cart"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Bag
              </button>
            </div>

            <a
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[46px] px-5 bg-[#1E8E3E] hover:bg-[#167330] text-white font-extrabold rounded-full text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm"
              id="details-order-whatsapp"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>Order on WhatsApp (COD)</span>
            </a>
          </div>

          {/* Quick Pincode Check */}
          <div
            className="p-4 border border-pine-green/10 rounded-2xl bg-warm-white space-y-2.5"
            id="pincode-checker-block"
          >
            <div className="text-[11px] font-bold text-pine-green flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              Check Delivery Pincode
            </div>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                placeholder="6-digit PIN Code"
                className="flex-1 px-4 py-2.5 bg-white border border-pine-green/15 rounded-full text-xs text-pine-green placeholder-pine-green/40 focus:outline-none focus:border-pine-green font-bold"
                id="pincode-input"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-pine-green hover:bg-pine-green-hover text-warm-white font-bold rounded-full text-xs uppercase tracking-wider cursor-pointer shrink-0"
                id="pincode-submit"
              >
                Check
              </button>
            </form>
            {pincodeStatus.checked && (
              <div
                className="text-xs p-2.5 rounded-xl bg-white border border-pine-green/10 text-pine-green flex items-center gap-2 font-medium"
                id="pincode-response"
              >
                <Truck className="w-4 h-4 shrink-0 text-pine-green" />
                <span>{pincodeStatus.message}</span>
              </div>
            )}
          </div>

          {/* Specifications List (Only when specs exist) */}
          {Object.keys(product.specs || {}).length > 0 && (
            <div className="pt-3 border-t border-pine-green/10 space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-pine-green">
                Specifications
              </h3>
              <div className="text-xs text-pine-green divide-y divide-pine-green/5">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 py-2 gap-2">
                    <span className="font-bold text-pine-green/55 uppercase text-[10px]">
                      {key}
                    </span>
                    <span className="col-span-2 text-pine-green font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Mobile Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] bg-warm-white/95 backdrop-blur-sm border-t border-pine-green/15 z-50 flex items-center justify-between gap-2 md:hidden shadow-lg">
        <div className="min-w-0 max-w-[30%]">
          <div className="text-[11px] font-bold text-pine-green truncate">{product.title}</div>
          <div className="text-sm font-black text-pine-green tabular-nums">
            ₹{product.salePrice.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="flex-1 flex gap-1.5 justify-end">
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isSoldOut}
            className="min-h-[44px] px-3.5 bg-pine-green text-warm-white font-bold rounded-full text-[11px] uppercase tracking-wider whitespace-nowrap"
          >
            Buy COD
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className="min-h-[44px] px-3 bg-white border border-pine-green/20 text-pine-green font-bold rounded-full text-[11px] uppercase tracking-wider whitespace-nowrap"
          >
            Cart
          </button>
          <a
            href={whatsappOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-3 bg-[#1E8E3E] text-white font-bold rounded-full text-[11px] uppercase tracking-wider inline-flex items-center gap-1 whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WA
          </a>
        </div>
      </div>
    </div>
  );
};
