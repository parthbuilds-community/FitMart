// src/components/CartDrawer.jsx
import { useEffect, useRef } from "react";
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
  const closeBtnRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Escape key + focus management
  useEffect(() => {
    if (!isOpen) return;

    // store previously focused element
    previousFocusRef.current = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // focus close button when drawer opens
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // restore focus when closing
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`overlay fixed inset-0 bg-black/30 z-50 ${isOpen ? "show" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart drawer"
        className={`cart-slide fixed right-0 top-0 h-full z-50 shadow-2xl flex flex-col
                    bg-white w-full sm:max-w-sm ${isOpen ? "open" : ""}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-5 sm:py-6 border-b border-stone-200 shrink-0">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-0.5">
              Your
            </p>
            <h2 className="font-['DM_Serif_Display'] text-xl sm:text-2xl text-stone-900 leading-tight">
              Cart
              {cartCount > 0 && (
                <span className="text-stone-400"> — {cartCount}</span>
              )}
            </h2>
          </div>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close cart"
            className="text-stone-400 hover:text-stone-900 transition-colors text-2xl
                       leading-none min-w-11 min-h-11 flex items-center justify-center
                       rounded-full hover:bg-stone-100 active:scale-95"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-12">
              <p className="text-sm text-stone-500">Your cart is empty</p>

              <button
                onClick={onClose}
                className="bg-stone-900 text-white text-sm px-8 py-3 rounded-full"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 items-start py-4 border-b border-stone-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-stone-700 mt-1">
                      {fmt(item.price)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-stone-400 hover:text-stone-900"
                    >
                      Remove
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span className="text-xs">{item.qty}</span>

                      <button
                        onClick={() => updateQty(item.id, 1)}
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

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-stone-200 px-5 py-5 space-y-3">
            <div className="flex justify-between">
              <span className="text-xs uppercase text-stone-400">
                Subtotal
              </span>
              <span className="text-xl text-stone-900">{fmt(cartTotal)}</span>
            </div>

            <Link to="/checkout" onClick={onClose}>
              <button className="w-full bg-stone-900 text-white py-4 rounded-full">
                Checkout →
              </button>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
