import { useEffect } from "react";
import { fmt } from "../utils/formatters";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

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
      <div
        className={`overlay fixed inset-0 bg-black/30 z-50 ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      <aside
        className={`cart-slide fixed right-0 top-0 h-full z-50 shadow-2xl flex flex-col
                    bg-white w-full sm:max-w-sm ${isOpen ? "open" : ""}`}
      >
        {/* (rest of your JSX unchanged) */}
      </aside>
    </>
  );
}

export default CartDrawer;

/* ✅ PropTypes */
CartDrawer.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  cart: PropTypes.array,
  cartCount: PropTypes.number,
  cartTotal: PropTypes.number,
  updateQty: PropTypes.func,
  removeFromCart: PropTypes.func,
};