import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 h-full border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Shopping Cart ({items.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-20 text-center text-slate-500 space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">Your cart is currently empty</p>
              <p className="text-[11px] text-slate-500">
                Explore tech gadgets, streetwear, and native wear across Nigeria!
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex gap-3 items-center"
              >
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{item.product.title}</h4>
                  <div className="text-[11px] text-emerald-400 font-extrabold mt-0.5">
                    {item.product.priceFormatted}
                  </div>
                  {item.selectedSize && (
                    <span className="text-[10px] text-slate-400">Size: {item.selectedSize}</span>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800 text-xs">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="text-slate-400 hover:text-white px-1 font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="text-slate-400 hover:text-white px-1 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Checkout */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Subtotal:</span>
              <span className="text-lg font-black text-emerald-400">
                ₦{subtotal.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onCheckout();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-500 to-purple-600 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-teal-500/20 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
