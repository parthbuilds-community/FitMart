// src/pages/ProductPage.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../auth/firebase";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import { fmt } from "../utils/formatters";
import CartDrawer from "../components/CartDrawer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Stars = ({ rating = 0, size = "sm" }) => {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const starPath = "M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 19.897 4.665 24 6 15.595 0 9.748l8.332-1.73L12 .587z";
  const sizeClass = size === "lg" ? "w-4 h-4" : "w-3 h-3";

  return (
    <span className={`inline-flex items-center gap-0.5 ${size === "lg" ? "text-base" : "text-xs"}`} aria-hidden>
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`full-${i}`} className={`${sizeClass} text-stone-700`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d={starPath} fill="currentColor" />
        </svg>
      ))}

      {half ? (() => {
        const id = `half-${Math.random().toString(36).slice(2)}`;
        return (
          <svg key="half" className={`${sizeClass} text-stone-700`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id={id}><rect x="0" y="0" width="12" height="24" /></clipPath>
            </defs>
            <path d={starPath} fill="currentColor" className="text-stone-300" style={{ fill: 'currentColor', opacity: 0.28 }} />
            <path d={starPath} fill="currentColor" clipPath={`url(#${id})`} />
          </svg>
        );
      })() : null}

      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`empty-${i}`} className={`${sizeClass} text-stone-300`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d={starPath} fill="currentColor" style={{ opacity: 0.28 }} />
        </svg>
      ))}
    </span>
  );
};

const FEATURE_MAP = {
  Equipment: ["Free shipping", "Assembly guide included", "2-year warranty", "Returns within 30 days"],
  Nutrition: ["Lab tested", "100% authentic", "FSSAI certified", "Free shipping above ₹999"],
  Wearables: ["1-year warranty", "Water resistant", "Free shipping", "Returns within 15 days"],
};

async function apiAddToCart(userId, productId, quantity) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API}/api/cart/${userId}/add`, {
    method: "POST", headers, credentials: "include",
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
}

async function apiGetCart(userId) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API}/api/cart/${userId}`, { headers, credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
}

function enrichCart(cartDoc, products) {
  return (cartDoc.items || []).map(it => {
    const prod = products.find(p => Number(p.productId) === Number(it.productId));
    if (!prod) return { id: it.productId, qty: it.quantity, name: "Unknown", price: 0 };
    return { ...prod, id: prod.productId, qty: it.quantity };
  });
}

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);

  const imgRef = useRef(null);
  const stickyRef = useRef(null);

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;
  const features = FEATURE_MAP[product?.category] || [
    "Free shipping on orders above ₹499", "Authentic products",
    "Easy returns", "Secure checkout",
  ];
  const busy = adding || buyingNow;

  const refreshCart = async (productsList = products) => {
    const user = auth.currentUser;
    if (!user || !productsList.length) return;
    try {
      const cartDoc = await apiGetCart(user.uid);
      setCart(enrichCart(cartDoc, productsList));
    } catch (err) {
      console.error("refreshCart error:", err);
    }
  };

  useEffect(() => {
    setVisible(false);
    setImgLoaded(false);
    setAdded(false);
    setQuantity(1);
    window.scrollTo({ top: 0 });

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API}/api/products`);
        if (!res.ok) throw new Error("Failed to load products");
        const all = res.ok ? await res.json() : [];
        const normalised = all.map(p => ({ ...p, id: p.productId }));
        setProducts(normalised);
        const found = normalised.find(p => String(p.productId) === String(productId));
        if (!found) throw new Error("Product not found");
        setProduct(found);
        setRelated(
          normalised
            .filter(p => p.category === found.category && String(p.productId) !== String(productId))
            .slice(0, 4)
        );
        const user = auth.currentUser;
        if (user) {
          const cartDoc = await apiGetCart(user.uid);
          setCart(enrichCart(cartDoc, normalised));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 80);
      }
    })();
  }, [productId]);

  useEffect(() => {
    if (product) document.title = `${product.name} — FitMart`;
  }, [product]);

  const handleAddToCart = async () => {
    const user = auth.currentUser;
    if (!user) { navigate("/auth"); return; }
    setAdding(true);
    try {
      const cartDoc = await apiAddToCart(user.uid, product.productId, quantity);
      setCart(enrichCart(cartDoc, products));
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    const user = auth.currentUser;
    if (!user) { navigate("/auth"); return; }
    setBuyingNow(true);
    try {
      await apiAddToCart(user.uid, product.productId, quantity);
      navigate("/checkout");
    } catch (err) {
      console.error("Buy Now failed:", err);
      setBuyingNow(false);
    }
  };

  const removeFromCart = async (id) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const existing = cart.find(i => i.id === id);
      const headers = await getAuthHeaders();
      const res = await fetch(`${API}/api/cart/${user.uid}/remove`, {
        method: "POST", headers, credentials: "include",
        body: JSON.stringify({ productId: id, quantity: existing?.qty || 1 }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      const cartDoc = await res.json();
      setCart(enrichCart(cartDoc, products));
    } catch (err) {
      console.error("removeFromCart error:", err);
    }
  };

  const updateQty = async (id, delta) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const url = delta > 0 ? "add" : "remove";
      const headers = await getAuthHeaders();
      const res = await fetch(`${API}/api/cart/${user.uid}/${url}`, {
        method: "POST", headers, credentials: "include",
        body: JSON.stringify({ productId: id, quantity: Math.abs(delta) }),
      });
      if (!res.ok) throw new Error("Failed to update qty");
      const cartDoc = await res.json();
      setCart(enrichCart(cartDoc, products));
    } catch (err) {
      console.error("updateQty error:", err);
    }
  };

  if (loading) return (
    <Shell cartCount={0} onCartOpen={() => setCartOpen(true)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-10 sm:py-24
                      grid lg:grid-cols-2 gap-8 lg:gap-16">
        <div className="aspect-square bg-stone-100 rounded-2xl animate-pulse" />
        <div className="space-y-5 pt-4">
          <div className="h-3 w-24 bg-stone-100 rounded-full animate-pulse" />
          <div className="h-8 w-3/4 bg-stone-100 rounded-full animate-pulse" />
          <div className="h-5 w-1/3 bg-stone-100 rounded-full animate-pulse" />
          <div className="h-10 w-1/2 bg-stone-100 rounded-full animate-pulse" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-3 bg-stone-100 rounded-full animate-pulse"
              style={{ width: `${70 - i * 10}%` }} />
          ))}
        </div>
      </div>
    </Shell>
  );

  if (error) return (
    <Shell cartCount={cartCount} onCartOpen={() => setCartOpen(true)}>
      <div className="max-w-md mx-auto mt-20 sm:mt-32 text-center px-5">
        <p className="text-4xl text-stone-200 mb-4">∅</p>
        <p className="text-stone-500 text-sm mb-6">{error}</p>
        <button onClick={() => navigate("/home")}
          className="bg-stone-900 text-white text-sm px-8 py-3 rounded-full
                     hover:bg-stone-700 transition-colors min-h-11">
          Back to Store
        </button>
      </div>
    </Shell>
  );

  return (
    <>
      <Shell cartCount={cartCount} onCartOpen={() => setCartOpen(true)}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
          .pd-fade { opacity:0; transform:translateY(20px); transition:opacity .6s ease,transform .6s ease; }
          .pd-fade.in { opacity:1; transform:translateY(0); }
          .pd-fade-img { opacity:0; transition:opacity .5s ease; }
          .pd-fade-img.in { opacity:1; }
          .pd-d1{transition-delay:.05s} .pd-d2{transition-delay:.15s}
          .pd-d3{transition-delay:.25s} .pd-d4{transition-delay:.35s}
          .pd-d5{transition-delay:.45s} .pd-d6{transition-delay:.55s}
          .qty-btn { transition:background .15s ease,color .15s ease; }
          .qty-btn:not(:disabled):hover { background:#1c1917; color:white; }
          .tab-active   { border-bottom:2px solid #1c1917; color:#1c1917; }
          .tab-inactive { border-bottom:2px solid transparent; color:#78716c; }
          .tab-inactive:hover { color:#44403c; }
          .related-card:hover .related-img { transform:scale(1.06); }
          .related-img { transition:transform .4s ease; }
          @keyframes pdPulse { 0%,100%{opacity:1} 50%{opacity:.6} }
          .adding-pulse { animation:pdPulse .8s ease infinite; }
          .cart-slide { transform:translateX(100%); transition:transform .35s cubic-bezier(.16,1,.3,1); }
          .cart-slide.open { transform:translateX(0); }
          .overlay { opacity:0; pointer-events:none; transition:opacity .3s ease; }
          .overlay.show { opacity:1; pointer-events:auto; }
        `}</style>

        {/* ── Breadcrumb ── */}
        <div className={`pd-fade ${visible ? "in" : ""} border-b border-stone-100 bg-white`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-3 sm:py-3.5
                          flex items-center gap-1.5 sm:gap-2 text-xs text-stone-400 overflow-x-auto
                          whitespace-nowrap scrollbar-none">
            <button onClick={() => navigate("/")}
              className="hover:text-stone-700 transition-colors shrink-0">Home</button>
            <span className="shrink-0">→</span>
            <button onClick={() => navigate("/home")}
              className="hover:text-stone-700 transition-colors shrink-0">Shop</button>
            <span className="shrink-0">→</span>
            <button onClick={() => navigate("/home")}
              className="hover:text-stone-700 transition-colors shrink-0">
              {product.category}
            </button>
            <span className="shrink-0">→</span>
            <span className="text-stone-600 truncate">{product.name}</span>
          </div>
        </div>

        {/* ── Two-column main ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-8 sm:py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 xl:gap-20">

            {/* LEFT — image + feature pills */}
            <div className={`pd-fade pd-d1 ${visible ? "in" : ""}`}>
              <div className="relative bg-stone-100 rounded-2xl overflow-hidden aspect-square
                              border border-stone-200 shadow-sm">
                {product.image ? (
                  <img
                    ref={imgRef}
                    src={product.image}
                    alt={product.name}
                    onLoad={() => setImgLoaded(true)}
                    className={`pd-fade-img w-full h-full object-cover ${imgLoaded ? "in" : ""}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">
                    {product.category === "Nutrition" ? "🧴"
                      : product.category === "Wearables" ? "⌚" : "🏋️"}
                  </div>
                )}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-2">
                  {product.badge && (
                    <span className="text-[10px] tracking-widest uppercase bg-stone-900 text-white
                                     px-3 py-1.5 rounded-full shadow-lg">
                      {product.badge}
                    </span>
                  )}
                  {discount && (
                    <span className="text-[10px] font-medium bg-white text-stone-700
                                     px-3 py-1.5 rounded-full border border-stone-200 shadow-sm">
                      −{discount}% off
                    </span>
                  )}
                </div>
              </div>

              {/* Feature pills — 2-col on all sizes */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-2.5 bg-stone-50
                                          border border-stone-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                    <span className="text-stone-400 text-sm shrink-0">✓</span>
                    <span className="text-xs text-stone-600 leading-snug">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — product info */}
            <div className="flex flex-col" ref={stickyRef}>

              {/* Brand + category */}
              <div className={`pd-fade pd-d1 ${visible ? "in" : ""} flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4`}>
                <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400 border
                                 border-stone-200 px-3 py-1.5 rounded-full">
                  {product.brand}
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400">
                  {product.category}
                </span>
              </div>

              {/* Name */}
              <h1
                style={{ fontFamily: "'DM Serif Display', serif" }}
                className={`pd-fade pd-d2 ${visible ? "in" : ""}
                            text-3xl sm:text-4xl lg:text-5xl text-stone-900 leading-[1.1]
                            tracking-tight mb-3 sm:mb-4`}
              >
                {product.name}
              </h1>

              {/* Rating */}
              <div className={`pd-fade pd-d2 ${visible ? "in" : ""}
                               flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6 flex-wrap`}>
                <Stars rating={product.rating} size="lg" />
                <span className="text-sm text-stone-500">{product.rating.toFixed(1)}</span>
                <div className="w-px h-4 bg-stone-200" />
                <span className="text-sm text-stone-500">
                  {product.reviews?.toLocaleString("en-IN")} reviews
                </span>
              </div>

              {/* Price card */}
              <div className={`pd-fade pd-d3 ${visible ? "in" : ""}
                               bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-6 mb-5 sm:mb-6`}>
                <div className="flex items-end gap-3 mb-1 flex-wrap">
                  <span
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                    className="text-3xl sm:text-4xl text-stone-900 leading-none"
                  >
                    {fmt(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-base sm:text-lg text-stone-400 line-through
                                     leading-none mb-0.5">
                      {fmt(product.originalPrice)}
                    </span>
                  )}
                </div>
                {discount && (
                  <p className="text-xs text-stone-500 mt-1">
                    You save{" "}
                    <span className="font-medium text-stone-700">
                      {fmt(product.originalPrice - product.price)}
                    </span>{" "}
                    ({discount}% off)
                  </p>
                )}
                <p className="text-[10px] text-stone-400 mt-2">
                  Inclusive of all taxes · Free shipping
                </p>
              </div>

              {/* Quantity selector */}
              <div className={`pd-fade pd-d4 ${visible ? "in" : ""} mb-4`}>
                <label className="block text-xs text-stone-500 mb-2 tracking-wide uppercase">
                  Quantity
                </label>
                <div className="flex items-center border border-stone-200 rounded-full w-fit overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || busy}
                    className="qty-btn w-11 h-11 flex items-center justify-center text-stone-600
                               disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl leading-none select-none">−</span>
                  </button>
                  <span className="w-12 text-center text-sm font-medium text-stone-900 select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    disabled={quantity >= 10 || busy}
                    className="qty-btn w-11 h-11 flex items-center justify-center text-stone-600
                               disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl leading-none select-none">+</span>
                  </button>
                </div>
                {quantity >= 10 && (
                  <p className="text-[10px] text-stone-400 mt-1.5">
                    Maximum 10 units per order
                  </p>
                )}
              </div>

              {/* CTA buttons — stack on very small screens */}
              <div className={`pd-fade pd-d5 ${visible ? "in" : ""}
                               flex flex-col xs:flex-row gap-3 mb-6 sm:mb-8`}>
                <button
                  onClick={handleAddToCart}
                  disabled={busy}
                  className={`flex-1 text-sm py-4 rounded-full font-medium transition-all
                              flex items-center justify-center gap-2 disabled:cursor-not-allowed
                              min-h-13 active:scale-[0.98]
                              ${added
                      ? "bg-stone-700 text-white"
                      : adding
                        ? "bg-stone-900 text-white adding-pulse"
                        : "bg-stone-900 text-white hover:bg-stone-700"
                    }`}
                >
                  {added ? (
                    <>✓ Added to Cart</>
                  ) : adding ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent
                                       rounded-full animate-spin" />
                      Adding…
                    </>
                  ) : (
                    `Add to Cart${quantity > 1 ? ` (${quantity})` : ""} →`
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={busy}
                  className={`border border-stone-300 text-stone-700 text-sm px-6 py-4
                              rounded-full transition-all flex items-center justify-center gap-2
                              min-h-13 active:scale-[0.98]
                              ${buyingNow
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-stone-900 hover:text-white hover:border-stone-900"
                    }`}
                >
                  {buyingNow ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current border-t-transparent
                                       rounded-full animate-spin" />
                      <span>Processing…</span>
                    </>
                  ) : "Buy Now"}
                </button>
              </div>

              {/* Trust strip — wraps gracefully on small screens */}
              <div className={`pd-fade pd-d6 ${visible ? "in" : ""}
                               flex items-center gap-3 sm:gap-5 pt-4 sm:pt-5
                               border-t border-stone-100 flex-wrap`}>
                {[
                  { icon: "◎", text: "Authentic product" },
                  { icon: "⚡", text: "Fast delivery" },
                  { icon: "✓", text: "Easy returns" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <span className="text-stone-400 text-sm">{icon}</span>
                    <span className="text-xs text-stone-500">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="border-t border-stone-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10">
            {/* Scrollable tab bar on mobile */}
            <div className="flex gap-4 sm:gap-8 border-b border-stone-100 overflow-x-auto
                            scrollbar-none -mx-4 sm:mx-0 px-4 sm:px-0">
              {[
                { key: "details", label: "Details" },
                { key: "specs", label: "Specs" },
                { key: "shipping", label: "Shipping" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-sm py-4 whitespace-nowrap transition-colors shrink-0
                              ${activeTab === tab.key ? "tab-active" : "tab-inactive"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="py-8 sm:py-10 max-w-2xl">
              {activeTab === "details" && (
                <div className="space-y-4">
                  <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3">
                    About this product
                  </p>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {product.name} by {product.brand} is a premium {product.category?.toLowerCase()} product
                    trusted by fitness enthusiasts across Mumbai.
                    {product.badge ? ` Rated as "${product.badge}" by our community.` : ""}
                    {" "}Sourced directly from the manufacturer and verified for authenticity.
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4">
                    {[
                      { label: "Brand", value: product.brand },
                      { label: "Category", value: product.category },
                      { label: "Rating", value: `${product.rating} / 5` },
                      { label: "Reviews", value: product.reviews?.toLocaleString("en-IN") },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-stone-50 rounded-xl px-3 sm:px-4 py-3">
                        <p className="text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-1">
                          {label}
                        </p>
                        <p className="text-sm text-stone-900 font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "specs" && (
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-5">
                    Technical specifications
                  </p>
                  {[
                    { label: "Product ID", value: `#${product.productId}` },
                    { label: "Brand", value: product.brand },
                    { label: "Category", value: product.category },
                    { label: "MRP", value: fmt(product.originalPrice || product.price) },
                    { label: "Offer Price", value: fmt(product.price) },
                    ...(discount ? [{ label: "Discount", value: `${discount}%` }] : []),
                    { label: "Rating", value: `${product.rating} ★` },
                    { label: "Reviews", value: product.reviews?.toLocaleString("en-IN") },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-3
                                                border-b border-stone-100 last:border-0 gap-4">
                      <span className="text-xs text-stone-500 uppercase tracking-wide shrink-0">
                        {label}
                      </span>
                      <span className="text-sm text-stone-900 font-medium text-right">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3">
                    Delivery & Returns
                  </p>
                  {[
                    { icon: "⚡", title: "Fast Delivery", body: "Orders dispatched within 24 hours. Delivery within 2–5 business days across MMR." },
                    { icon: "✓", title: "Free Shipping", body: "Free shipping on all orders above ₹499. Standard charges of ₹49 apply below that threshold." },
                    { icon: "◎", title: "Easy Returns", body: `${product.category === "Wearables" ? "15" : "30"}-day hassle-free returns. Item must be unused and in original packaging.` },
                  ].map(({ icon, title, body }) => (
                    <div key={title} className="flex gap-3 sm:gap-4 p-4 sm:p-5 bg-stone-50
                                                rounded-2xl border border-stone-200">
                      <span className="text-stone-500 text-lg shrink-0 mt-0.5">{icon}</span>
                      <div>
                        <p className="text-sm font-medium text-stone-900 mb-1">{title}</p>
                        <p className="text-sm text-stone-500 leading-relaxed">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="bg-stone-50 border-t border-stone-200 py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">
                More from {product.category}
              </p>
              <h2
                style={{ fontFamily: "'DM Serif Display', serif" }}
                className="text-2xl sm:text-3xl text-stone-900 mb-7 sm:mb-10"
              >
                You may also like
              </h2>
              {/* 2-col on mobile → 4-col on md */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {related.map(rel => {
                  const rd = rel.originalPrice
                    ? Math.round(((rel.originalPrice - rel.price) / rel.originalPrice) * 100)
                    : null;
                  return (
                    <div
                      key={rel.productId}
                      onClick={() => navigate(`/product/${rel.productId}`)}
                      className="related-card bg-white border border-stone-200 rounded-2xl
                                 overflow-hidden cursor-pointer hover:border-stone-300
                                 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative bg-stone-100 aspect-square overflow-hidden">
                        {rel.image ? (
                          <img src={rel.image} alt={rel.name}
                            className="related-img w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center
                                          text-4xl opacity-20">
                            {rel.category === "Nutrition" ? "🧴"
                              : rel.category === "Wearables" ? "⌚" : "🏋️"}
                          </div>
                        )}
                        {rel.badge && (
                          <span className="absolute top-2 left-2 text-[9px] tracking-widest uppercase
                                           bg-stone-900 text-white px-2 py-1 rounded-full">
                            {rel.badge}
                          </span>
                        )}
                        {rd && (
                          <span className="absolute top-2 right-2 text-[9px] bg-white text-stone-600
                                           border border-stone-200 px-2 py-1 rounded-full">
                            −{rd}%
                          </span>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="text-[10px] tracking-[0.12em] uppercase text-stone-400 mb-0.5">
                          {rel.brand}
                        </p>
                        <p className="text-sm text-stone-900 font-medium leading-snug
                                      line-clamp-2 mb-2">
                          {rel.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span style={{ fontFamily: "'DM Serif Display', serif" }}
                            className="text-base sm:text-lg text-stone-900">
                            {fmt(rel.price)}
                          </span>
                          <Stars rating={rel.rating} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Shell>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        updateQty={updateQty}
        removeFromCart={removeFromCart}
      />
    </>
  );
}

function Shell({ children, cartCount = 0, onCartOpen }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 h-14 sm:h-16
                        flex items-center justify-between">
          <span
            style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-lg sm:text-xl text-stone-900 tracking-tight cursor-pointer"
            onClick={() => navigate("/home")}
          >
            FitMart
          </span>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onCartOpen}
              className="relative p-2 text-stone-500 hover:text-stone-900 transition-colors
                         min-h-11 min-w-11 flex items-center justify-center"
              aria-label="Open cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor"
                strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-stone-900 text-white
                                 text-[9px] w-4 h-4 rounded-full flex items-center
                                 justify-center font-semibold leading-none">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate("/home")}
              className="border border-stone-200 text-stone-600 text-xs px-3 sm:px-5 py-2
                         rounded-full hover:bg-stone-900 hover:text-white hover:border-stone-900
                         transition-all min-h-9"
            >
              <span className="hidden sm:inline">← Back to Shop</span>
              <span className="sm:hidden">← Shop</span>
            </button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}