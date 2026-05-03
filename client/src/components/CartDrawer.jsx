// src/components/CartDrawer.jsx
import { useEffect } from "react";
import { fmt } from "../utils/formatters";
import { Link } from "react-router-dom";

function CartDrawer({
  isOpen,
  onClose,
  cart,
  cartCount,
  cartTotal,
  updateQty,
  removeFromCart,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`overlay fixed inset-0 bg-black/30 z-50 ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      {/* Drawer — full-width on mobile, max-sm on larger screens */}
      <aside
        className={`cart-slide fixed right-0 top-0 h-full z-50 shadow-2xl flex flex-col
                    bg-white w-full sm:max-w-sm ${isOpen ? "open" : ""}`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-5 sm:py-6
                        border-b border-stone-200 shrink-0">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-0.5">
              Your
            </p>
            <h2 className="font-['DM_Serif_Display'] text-xl sm:text-2xl text-stone-900
                           leading-tight">
              Cart
              {cartCount > 0 && (
                <span className="text-stone-400"> — {cartCount}</span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="text-stone-400 hover:text-stone-900 transition-colors
                       text-2xl leading-none min-w-11 min-h-11 flex items-center
                       justify-center rounded-full hover:bg-stone-100 active:scale-95"
          >
            ×
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-4">
          {cart.length === 0 ? (

            /* ── Empty State ── */
            <div className="h-full flex flex-col items-center justify-center
                            text-center gap-5 sm:gap-6 py-12">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-stone-100
                              flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                  stroke="#d6d3d1" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="5" y1="5" x2="19" y2="19" />
                </svg>
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">
                  Nothing here yet
                </p>
                <p className="font-['DM_Serif_Display'] text-xl sm:text-2xl text-stone-900 mb-2">
                  Your cart is empty
                </p>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Add something from the store<br />and it'll appear here.
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-stone-900 text-white text-sm px-8 py-3 rounded-full
                           hover:bg-stone-700 transition-colors min-h-11 active:scale-[0.98]"
              >
                Continue Shopping
              </button>
            </div>

          ) : (

            /* ── Cart Items ── */
            <div className="flex flex-col">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 sm:gap-4 items-start py-4 sm:py-5
                             border-b border-stone-200 last:border-0"
                >
                  {/* Product image */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-stone-100 rounded-2xl
                                  flex items-center justify-center shrink-0 overflow-hidden
                                  border border-stone-200">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="#d6d3d1" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="9" />
                        <line x1="5" y1="5" x2="19" y2="19" />
                      </svg>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    {item.brand && (
                      <p className="text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-0.5">
                        {item.brand}
                      </p>
                    )}
                    <p className="font-['DM_Serif_Display'] text-sm sm:text-base text-stone-900
                                  leading-snug truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-stone-700 mt-1">{fmt(item.price)}</p>
                  </div>

                  {/* Qty + Remove */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-stone-300 hover:text-stone-900 transition-colors
                                 min-h-7 flex items-center"
                    >
                      Remove
                    </button>
                    <div className="flex items-center gap-1.5 sm:gap-2 border border-stone-200
                                    rounded-full px-2.5 sm:px-3 py-1">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="text-stone-500 hover:text-stone-900 transition-colors
                                   text-sm w-5 h-5 flex items-center justify-center"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="text-xs text-stone-900 min-w-4 text-center
                                       select-none">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="text-stone-500 hover:text-stone-900 transition-colors
                                   text-sm w-5 h-5 flex items-center justify-center"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {cart.length > 0 && (
          <div className="border-t border-stone-200 px-5 sm:px-7 py-5 sm:py-6
                          space-y-3 sm:space-y-4 shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400">
                Subtotal
              </p>
              <p className="font-['DM_Serif_Display'] text-xl sm:text-2xl text-stone-900">
                {fmt(cartTotal)}
              </p>
            </div>
            <p className="text-[10px] text-stone-400 -mt-1 sm:-mt-2">
              Taxes and shipping calculated at checkout
            </p>
            <Link to="/checkout" onClick={onClose}>
              <button className="w-full bg-stone-900 text-white text-sm py-4 rounded-full
                                 hover:bg-stone-700 transition-colors min-h-13
                                 active:scale-[0.98]">
                Checkout →
              </button>
            </Link>
            <button
              onClick={onClose}
              className="w-full border border-stone-300 text-stone-700 text-sm py-3.5
                         rounded-full hover:bg-stone-100 transition-colors min-h-12
                         active:scale-[0.98]"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;