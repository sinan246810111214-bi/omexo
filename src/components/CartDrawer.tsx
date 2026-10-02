import React from 'react';
import { useStore } from '../hooks/useStore';
import { useToast } from './Toast';
import { X, Plus, Minus, ShoppingBag, Truck, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const { cart, updateCartQuantity } = useStore();
  const { toast } = useToast();

  const subtotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);

  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      toast('Your cart is empty!', 'error');
      return;
    }
    onClose();
    onNavigate('checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-pine-green/70 z-40"
            id="cart-drawer-backdrop"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-warm-white shadow-2xl z-50 flex flex-col border-l border-pine-green/10"
            id="cart-drawer-panel"
          >
            {/* Header */}
            <div className="p-5 border-b border-pine-green/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-pine-green" />
                <h2 className="text-base font-extrabold text-pine-green uppercase tracking-wider font-display">Your Shopping Bag</h2>
                <span className="bg-pine-green/10 text-pine-green text-xs font-black px-2.5 py-0.5 rounded-full">
                  {cart.length} item{cart.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-pine-green/40 hover:text-pine-green hover:bg-pine-green/5 rounded-full transition-colors cursor-pointer"
                id="cart-drawer-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-12 h-12 bg-pine-green/5 border border-pine-green/10 text-pine-green rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-pine-green">Your bag is empty</h3>
                    <p className="text-[11px] text-pine-green/60 max-w-xs leading-relaxed font-semibold">
                      Add some premium devices and tactile desk accessories to get started!
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-pine-green hover:bg-pine-green-hover text-warm-white font-extrabold text-[10px] uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-sm"
                    id="cart-drawer-shop-now"
                  >
                    Explore Products
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-3 rounded-[20px] bg-white/50 border border-pine-green/10 hover:border-pine-green/25 transition-all"
                    id={`cart-item-${item.product.id}`}
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded-xl bg-white border border-pine-green/5 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 text-left flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-pine-green truncate">
                          {item.product.title}
                        </h4>
                        <p className="text-[9px] text-pine-green/40 font-bold tracking-widest uppercase">{item.product.category}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-1">
                        {/* Price */}
                        <div className="text-xs font-extrabold text-pine-green">
                          ₹{item.product.salePrice.toLocaleString('en-IN')}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center border border-pine-green/10 rounded-full bg-white p-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 px-2 text-pine-green/40 hover:text-pine-green hover:bg-pine-green/5 rounded-full transition-colors cursor-pointer"
                            id={`cart-qty-dec-${item.product.id}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-[11px] font-black text-pine-green w-6 text-center select-none tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 px-2 text-pine-green/40 hover:text-pine-green hover:bg-pine-green/5 rounded-full transition-colors cursor-pointer"
                            id={`cart-qty-inc-${item.product.id}`}
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
              <div className="p-5 border-t border-pine-green/5 bg-soft-beige/30 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-pine-green/50 uppercase tracking-widest">Subtotal</span>
                  <span className="text-xl font-black text-pine-green font-mono">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3 bg-pine-green hover:bg-pine-green-hover text-warm-white font-extrabold text-xs uppercase tracking-widest rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  id="cart-drawer-checkout-btn"
                >
                  Proceed to Checkout
                </button>

                {/* Trust indications */}
                <div className="pt-3 border-t border-pine-green/5 grid grid-cols-2 gap-2 text-center text-[9px] text-pine-green/40 font-bold uppercase tracking-wider">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-pine-green" />
                    <span>Free India Delivery</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5 text-pine-green/60" />
                    <span>7-Day Replacement</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
