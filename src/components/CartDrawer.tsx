import React from 'react';
import { useStore } from '../hooks/useStore';
import { useToast } from './Toast';
import { X, Plus, Minus, ShoppingBag, Truck, MessageCircle } from 'lucide-react';
import { useHashRouter } from '../hooks/useHashRouter';
import { getSiteBrandConfig, getWhatsAppNumberForCategory } from '../config/categories';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const { cart, updateCartQuantity, storeSettings } = useStore();
  const { siteSlug } = useHashRouter();
  const { toast } = useToast();

  if (!isOpen) return null;

  const activeBrand = getSiteBrandConfig(siteSlug);
  const storeDisplayName = storeSettings?.storeName || activeBrand.name;
  const subtotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  const whatsappNumber = getWhatsAppNumberForCategory(siteSlug, storeSettings);

  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      toast('Your cart is empty!', 'error');
      return;
    }
    onClose();
    onNavigate('checkout');
  };

  const whatsappCartUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi ${storeDisplayName}, I want to order (COD):\n` +
      cart
        .map((i) => `• ${i.product.title} × ${i.quantity} = ₹${i.product.salePrice * i.quantity}`)
        .join('\n') +
      `\nTotal: ₹${subtotal}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-pine-green/55"
        id="cart-drawer-backdrop"
      />

      {/* Drawer Panel */}
      <div
        className="relative w-full max-w-md bg-warm-white shadow-2xl z-10 flex flex-col border-l border-pine-green/10 h-full"
        id="cart-drawer-panel"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-pine-green/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-pine-green" />
            <h2 className="text-sm sm:text-base font-extrabold text-pine-green uppercase tracking-wider font-display">
              Your Bag ({cart.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-pine-green/60 hover:text-pine-green hover:bg-pine-green/5 rounded-full transition-colors cursor-pointer"
            id="cart-drawer-close"
            aria-label="Close bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-12 h-12 bg-pine-green/5 border border-pine-green/10 text-pine-green rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-pine-green">
                  Your bag is empty
                </h3>
                <p className="text-xs text-pine-green/60 max-w-xs leading-relaxed">
                  Add items from {storeDisplayName} to place a quick Cash on Delivery order.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-pine-green hover:bg-pine-green-hover text-warm-white font-extrabold text-xs uppercase tracking-widest rounded-full transition-colors cursor-pointer"
                id="cart-drawer-shop-now"
              >
                Browse Products
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-3 p-3 rounded-2xl bg-white border border-pine-green/10"
                id={`cart-item-${item.product.id}`}
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.title}
                  className="w-16 h-16 object-cover rounded-xl bg-soft-beige/40 border border-pine-green/10 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0 text-left flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-pine-green truncate">
                      {item.product.title}
                    </h4>
                    <p className="text-[10px] text-pine-green/55 font-semibold">
                      {item.product.category}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs font-extrabold text-pine-green tabular-nums">
                      ₹{(item.product.salePrice * item.quantity).toLocaleString('en-IN')}
                    </div>

                    <div className="flex items-center border border-pine-green/15 rounded-full bg-warm-white p-0.5">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-pine-green/70 hover:text-pine-green rounded-full cursor-pointer"
                        id={`cart-qty-dec-${item.product.id}`}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-black text-pine-green min-w-6 text-center select-none tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-pine-green/70 hover:text-pine-green rounded-full cursor-pointer"
                        id={`cart-qty-inc-${item.product.id}`}
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-pine-green/10 bg-white space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-pine-green/60 uppercase tracking-wider">
                Subtotal
              </span>
              <span className="text-xl font-black text-pine-green tabular-nums">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckoutClick}
              className="w-full py-3.5 bg-pine-green hover:bg-pine-green-hover text-warm-white font-extrabold text-xs uppercase tracking-widest rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              id="cart-drawer-checkout-btn"
            >
              Proceed to Checkout (COD)
            </button>

            <a
              href={whatsappCartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-[#1E8E3E] hover:bg-[#167330] text-white font-bold text-xs uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              Order Cart via WhatsApp
            </a>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-pine-green/60 font-semibold pt-1">
              <Truck className="w-3.5 h-3.5 text-pine-green" />
              <span>Free Delivery · Cash on Delivery Across India</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
