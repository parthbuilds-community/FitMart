// src/pages/Checkout.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../auth/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fmt } from "../utils/formatters";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import Navbar from "../components/Navbar";

const API = import.meta.env.VITE_API_URL;

export default function Checkout() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discountEligible, setDiscountEligible] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(10);
  const [profile, setProfile] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { document.title = "My Cart - FitMart"; }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate("/auth"); return; }
      const userId = user.uid;

      try {
        const headers = await getAuthHeaders();

        const [cartRes, prodRes, discountRes, profileRes] = await Promise.all([
          fetch(`${API}/api/cart/${userId}`, { headers, credentials: "include" }),
          fetch(`${API}/api/products`),
          fetch(`${API}/api/user/discount-status/${userId}`, { credentials: "include" }),
          fetch(`${API}/api/user/profile/${userId}`, { headers, credentials: "include" }),
        ]);

        if (!cartRes.ok) throw new Error("Failed to fetch cart");
        if (!prodRes.ok) throw new Error("Failed to fetch products");

        const cart = await cartRes.json();
        const products = await prodRes.json();

        if (discountRes.ok) {
          const d = await discountRes.json();
          setDiscountEligible(d.eligible);
          setDiscountPercent(d.discountPercent ?? 10);
        }

        if (profileRes && profileRes.ok) {
          const p = await profileRes.json();
          setProfile(p);
          const def = p?.defaultAddressId ? (p.addresses || []).find(a => a.id === p.defaultAddressId) : null;
          setSelectedAddress(def || (p?.addresses && p.addresses[0]) || null);
        }

        if (!cart.items?.length) { setItems([]); setLoading(false); return; }

        const productMap = Object.fromEntries(products.map(p => [p.productId, p]));
        const enriched = cart.items
          .map(item => ({ ...item, product: productMap[item.productId] }))
          .filter(item => item.product);

        setItems(enriched);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const subtotal = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
  const discountAmt = discountEligible ? Math.round(subtotal * discountPercent / 100) : 0;
  const total = subtotal - discountAmt;

  const handleProceed = () => {
    navigate("/payment", {
      state: {
        items, total, subtotal, discountAmt,
        discountPercent: discountEligible ? discountPercent : 0,
        discountApplied: discountEligible,
        address: selectedAddress,
      },
    });
  };

  if (loading) return (
    <PageShell menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
      <Spinner />
    </PageShell>
  );

  if (error) return (
    <PageShell menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
      <ErrorMsg msg={error} />
    </PageShell>
  );

  if (!items.length) return (
    <PageShell menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
      <EmptyCart navigate={navigate} />
    </PageShell>
  );

  return (
    <PageShell menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-8 sm:py-12">

        {/* Back + heading */}
        <div className="mb-8 sm:mb-10">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 border border-stone-200 hover:border-stone-300
                       bg-white text-stone-700 hover:text-stone-900 text-sm px-4 sm:px-5 py-2.5
                       rounded-full transition-all duration-300 hover:shadow-md group cursor-pointer mb-5 sm:mb-6"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
            Back to Shop
          </button>

          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Review</p>
          <h1
            style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-3xl sm:text-4xl md:text-5xl text-stone-900"
          >
            Your Order
          </h1>
        </div>

        {/* On mobile: summary appears ABOVE product list for quick visibility */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* ── Order summary — top on mobile, sidebar on lg ── */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="bg-stone-900 rounded-2xl p-6 sm:p-8 lg:sticky lg:top-24">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-5 sm:mb-6">Summary</p>
              <div className="space-y-3 mb-5 sm:mb-6">
                {selectedAddress && (
                  <div className="bg-stone-800 text-white rounded-lg p-3">
                    <div className="text-sm font-medium">Shipping to</div>
                    <div className="text-sm">{selectedAddress.label} — {selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''}</div>
                    <div className="text-sm text-stone-200">{selectedAddress.city}{selectedAddress.state ? `, ${selectedAddress.state}` : ''} {selectedAddress.zip}</div>
                    <div className="text-xs mt-2"><button onClick={() => navigate('/profile')} className="underline">Edit addresses</button></div>
                  </div>
                )}

                <div className="flex justify-between text-sm text-stone-300">
                  <span>Subtotal ({items.length} item{items.length > 1 ? "s" : ""})</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                {discountEligible && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-400">Welcome {discountPercent}% off</span>
                    <span className="text-stone-300">−{fmt(discountAmt)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-stone-300">
                  <span>Shipping</span>
                  <span className="text-stone-400">Free</span>
                </div>
                <div className="h-px bg-stone-700 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white font-medium">Total</span>
                  <span
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                    className="text-2xl sm:text-3xl text-white"
                  >
                    {fmt(total)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleProceed}
                className="w-full bg-white text-stone-900 text-sm px-8 py-3.5 rounded-full
                           hover:bg-stone-100 transition-colors font-medium min-h-12"
              >
                Proceed to Payment →
              </button>
              <p className="text-xs text-stone-500 text-center mt-4">Secured by Razorpay</p>
            </div>
          </div>

          {/* ── Product list ── */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4 order-last lg:order-first">
            {items.map(({ product, quantity }) => (
              <div
                key={product.productId}
                className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6
                           flex gap-3 sm:gap-5 hover:border-stone-300 hover:shadow-lg
                           transition-all duration-300"
              >
                {/* Product image — smaller on mobile */}
                <img
                  src={product.image} alt={product.name}
                  className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-xl shrink-0 bg-stone-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-1">
                    {product.brand}
                  </p>
                  <h3
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                    className="text-base sm:text-xl text-stone-900 leading-tight mb-1 sm:mb-2
                               line-clamp-2 sm:truncate"
                  >
                    {product.name}
                  </h3>
                  {product.badge && (
                    <span className="text-[10px] tracking-widest uppercase bg-stone-900
                                     text-white px-2.5 py-1 rounded-full">
                      {product.badge}
                    </span>
                  )}
                  {/* Price visible on mobile inline */}
                  <div className="mt-2 sm:hidden">
                    <p className="text-xs text-stone-400">Qty {quantity}</p>
                    <p
                      style={{ fontFamily: "'DM Serif Display', serif" }}
                      className="text-lg text-stone-900"
                    >
                      {fmt(product.price * quantity)}
                    </p>
                  </div>
                </div>

                {/* Desktop-only right-aligned price */}
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-xs text-stone-400 mb-1">Qty {quantity}</p>
                  <p
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                    className="text-2xl text-stone-900"
                  >
                    {fmt(product.price * quantity)}
                  </p>
                  {product.originalPrice > product.price && (
                    <p className="text-xs text-stone-400 line-through">
                      {fmt(product.originalPrice * quantity)}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Welcome discount callout */}
            {discountEligible && (
              <div className="bg-stone-100 border border-stone-200 rounded-2xl px-4 sm:px-6 py-4
                              flex items-center gap-3 sm:gap-4">
                <span className="text-stone-900 text-lg shrink-0">✓</span>
                <div>
                  <p className="text-sm font-medium text-stone-900">Welcome discount applied</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {discountPercent}% off your first order — saving you {fmt(discountAmt)}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </PageShell>
  );
}

function PageShell({ children, menuOpen, setMenuOpen }) {
  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar variant="home" menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <div className="max-w-md mx-auto mt-16 sm:mt-24 bg-red-50 border border-red-100
                    rounded-2xl p-6 sm:p-8 text-center sm:mx-auto">
      <p className="text-red-600 text-sm">{msg}</p>
    </div>
  );
}

function EmptyCart({ navigate }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center gap-4 px-4">
      <p className="text-4xl text-stone-300">∅</p>
      <p className="text-stone-500 text-sm">Your cart is empty</p>
      <button
        onClick={() => navigate("/home")}
        className="bg-stone-900 text-white text-sm px-8 py-3 rounded-full
                   hover:bg-stone-700 transition-colors min-h-11"
      >
        Continue Shopping
      </button>
    </div>
  );
}