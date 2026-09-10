import React from 'react';
import { useStore } from '../hooks/useStore';
import { useToast } from './Toast';
import { X, Plus, Minus, ShoppingBag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const { cart, updateCartQuantity, removeFromCart } = useStore();
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
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
            id="cart-drawer-backdrop"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            id="cart-drawer-panel"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-zinc-900" />
                <h2 className="text-base font-bold text-zinc-900 uppercase tracking-wide">Your Cart</h2>
                <span className="bg-zinc-100 text-zinc-800 text-xs font-bold px-2 py-0.5 rounded">
                  {cart.length} item{cart.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-50 rounded transition-colors"
                id="cart-drawer-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 text-zinc-400 rounded flex items-center justify-center mb-4">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-900 mb-1">Your cart is empty</h3>
                  <p className="text-[11px] text-zinc-500 max-w-xs mb-6 leading-relaxed">
                    Add some cutting-edge gadgets and premium accessories from our store to get started!
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-black hover:bg-zinc-900 text-white font-bold text-xs uppercase tracking-wide rounded transition-colors"
                    id="cart-drawer-shop-now"
                  >
                    Shop Now
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-3 rounded border border-zinc-200 bg-white hover:border-black transition-colors"
                    id={`cart-item-${item.product.id}`}
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded bg-zinc-50 border border-zinc-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-zinc-900 truncate">
                        {item.product.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase mb-2">{item.product.category}</p>
                      
                      <div className="flex items-center justify-between">
                        {/* Price */}
                        <div className="text-xs font-bold text-zinc-950">
                          ₹{item.product.salePrice.toLocaleString('en-IN')}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center border border-zinc-200 rounded bg-zinc-50">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 px-2 text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
                            id={`cart-qty-dec-${item.product.id}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-[11px] font-bold text-zinc-800 w-6 text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 px-2 text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
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

            {/* Footer summary */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-zinc-200 bg-zinc-50">
                <div className="flex justify-between mb-4">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Subtotal</span>
                  <span className="text-base font-black text-zinc-950">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
                  id="cart-drawer-checkout-btn"
                >
                  Proceed to Checkout
                </button>

                {/* Trust Badges */}
                <div className="mt-4 pt-3 border-t border-zinc-200 grid grid-cols-2 gap-2 text-center text-[9px] text-zinc-500">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-zinc-900" />
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
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
