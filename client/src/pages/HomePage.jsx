// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { signOut } from "firebase/auth";
import { auth } from "../auth/firebase";
import CartDrawer from "../components/CartDrawer";
import { fmt } from "../utils/formatters";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import FitnessChatBot from "../components/FitnessChatBot";
import WelcomeBanner from "../components/WelcomeBanner";
import { useWelcomeDiscount } from "../auth/useWelcomeDiscount";
import BMICalculator from "../components/BMICalculator";
import CalorieCalculator from "../components/CalorieCalculator";
import NearbyFitnessCenters from "../components/NearbyFitnessCenters";
import { normalizeProduct } from "../utils/normalizeProduct.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CATEGORIES = [
  { name: "All", value: "all" },
  { name: "Equipment", value: "Equipment" },
  { name: "Nutrition", value: "Nutrition" },
  { name: "Wearables", value: "Wearables" },
];

const PLANS = [
  { name: "Weight Loss", duration: "12 Weeks", desc: "Caloric-deficit nutrition + cardio-focused programming", tag: "MOST POPULAR", route: "/plans/weight-loss" },
  { name: "Muscle Building", duration: "16 Weeks", desc: "Progressive overload training + protein-optimized meal plans", tag: null, route: "/plans/muscle-building" },
  { name: "Mobility & Recovery", duration: "8 Weeks", desc: "Flexibility-first programming, ideal for desk workers", tag: null, route: "/plans/mobility-recovery" },
];

const Stars = ({ rating = 0, size = "sm" }) => {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const starPath = "M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 19.897 4.665 24 6 15.595 0 9.748l8.332-1.73L12 .587z";
  const sizeClass = size === "lg" ? "w-4 h-4" : "w-3 h-3";

  return (
    <span className={`inline-flex items-center gap-0.5 ${size === "lg" ? "text-base" : "text-xs"}`} aria-hidden>
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`full-${i}`} className={`${sizeClass} text-stone-500`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d={starPath} fill="currentColor" />
        </svg>
      ))}

      {half ? (() => {
        const id = `half-${Math.random().toString(36).slice(2)}`;
        return (
          <svg key="half" className={`${sizeClass} text-stone-500`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id={id}><rect x="0" y="0" width="12" height="24" /></clipPath>
            </defs>
            {/* faint empty star behind */}
            <path d={starPath} fill="currentColor" className="text-stone-300" style={{ fill: 'currentColor', opacity: 0.28 }} />
            {/* filled half */}
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

function mapCart(cartDoc, products) {
  return cartDoc.items.map(it => {
    const prod = products.find(p => Number(p.productId) === Number(it.productId));
    if (!prod) return { id: it.productId, qty: it.quantity, name: "Unknown", price: 0 };
    return { ...prod, id: prod.id || prod.productId, qty: it.quantity };
  });
}

// ── ProductCard ───────────────────────────────────────────────────────────
function ProductCard({ product, onAdd, cartItems = [], updateQty }) {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const cartItem = cartItems.find(item => item.id === (product.productId || product.id));
  const quantity = cartItem?.qty || 0;
  const productId = product.productId || product.id;

  const handleAdd = (e) => {
    e.stopPropagation();
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="group bg-white border border-stone-100 rounded-2xl overflow-hidden
            hover:border-stone-200 hover:shadow-lg transition-all duration-300
            flex flex-col h-full">

      {/* Clickable image */}
      <div
        onClick={() => navigate(`/product/${productId}`)}
        className="relative bg-stone-100 aspect-square flex items-center justify-center
                   overflow-hidden cursor-pointer"
      >
        {product.image ? (
          <img
            src={product.image} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <div className="text-4xl sm:text-5xl opacity-20 select-none group-hover:scale-110 transition-transform duration-500">
            {product.category === "Nutrition" ? "🧴" : product.category === "Wearables" ? "⌚" : "🏋️"}
          </div>
        )}
        {product.badge && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[9px] sm:text-[10px]
                           tracking-widest uppercase bg-stone-900 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
            {product.badge}
          </span>
        )}
        {discount && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[9px] sm:text-[10px]
                           font-medium text-stone-600 bg-white px-1.5 sm:px-2 py-0.5 sm:py-1
                           rounded-full border border-stone-200">
            −{discount}%
          </span>
        )}
      </div>

      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <p className="text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-1">
          {product.brand}
        </p>

        {/* Clickable name */}
        <h3
          onClick={() => navigate(`/product/${productId}`)}
          onPointerDown={(e) => { if (e?.nativeEvent?.pointerType === 'touch') e.preventDefault(); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/product/${productId}`); } }}
          role="button"
          tabIndex={0}
          className="text-xs sm:text-sm font-medium text-stone-900 leading-snug mb-1.5 sm:mb-2
                     line-clamp-2 cursor-pointer hover:text-stone-600 transition-colors select-none sm:select-auto"
        >
          {product.name}
        </h3>

        <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3">
          <Stars rating={product.rating} />
          <span className="text-[9px] sm:text-[10px] text-stone-400">({product.reviews})</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-1 mt-auto w-full">
          <div className="min-w-0 pr-2 text-left sm:text-left w-full sm:w-auto">
            <div className="text-sm sm:text-base font-semibold text-stone-900 truncate">{fmt(product.price)}</div>
            <div className="text-[10px] sm:text-xs text-stone-400 line-through mt-0.5">
              {product.originalPrice ? fmt(product.originalPrice) : <span className="invisible">&nbsp;</span>}
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-end shrink-0 w-full sm:w-auto">
            {quantity > 0 ? (
              <div
                className="flex items-center border border-stone-300 rounded-full overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={e => { e.stopPropagation(); updateQty(productId, -1); }}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center
                             text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  <span className="text-base sm:text-lg leading-none">−</span>
                </button>
                <span className="w-6 sm:w-8 text-xs text-stone-900 text-center font-medium">{quantity}</span>
                <button
                  onClick={e => { e.stopPropagation(); updateQty(productId, 1); }}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center
                             text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  <span className="text-base sm:text-lg leading-none">+</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className={`relative z-10 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 text-center text-[10px] sm:text-xs px-2.5 sm:px-4 py-1.5 sm:py-2
                            rounded-full transition-all duration-200 whitespace-nowrap
                            ${added
                    ? "bg-stone-900 text-white"
                    : "border border-stone-300 text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900"
                  }`}
              >
                {added ? "Added ✓" : "Add to Cart"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [backendError, setBackendError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const { showBanner, dismissBanner } = useWelcomeDiscount(user);

  useEffect(() => { document.title = "FitMart - Fitness & Nutrition Store"; }, []);

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
    const unsub = auth.onAuthStateChanged(u => {
      setUser(u);
      if (!u) navigate("/auth");
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setBackendError(false);
      try {
        const res = await fetch(`${API}/api/products`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const normalizedProducts = data.map(normalizeProduct);
        setProducts(normalizedProducts);
        
      } catch (err) {
        console.error("Error loading products:", err);
        setBackendError(true);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user || !products.length) return;
    (async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API}/api/cart/${user.uid}`, { headers, credentials: "include" });
        if (!res.ok) return;
        const cartDoc = await res.json();
        setCart(mapCart(cartDoc, products));
      } catch (err) {
        console.error("Error loading cart:", err);
      }
    })();
  }, [user, products]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  const addToCart = async (product) => {
    if (!user) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API}/api/cart/${user.uid}/add`, {
        method: "POST", headers, credentials: "include",
        body: JSON.stringify({ productId: product.productId || product.id, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      const cartDoc = await res.json();
      setCart(mapCart(cartDoc, products));
    } catch (err) { console.error("Add to cart failed:", err); }
  };

  const removeFromCart = async (id) => {
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
      setCart(mapCart(cartDoc, products));
    } catch (err) { console.error("Remove from cart failed:", err); }
  };

  const updateQty = async (id, delta) => {
    if (!user) return;
    try {
      const url = delta > 0 ? "add" : "remove";
      const headers = await getAuthHeaders();
      await fetch(`${API}/api/cart/${user.uid}/${url}`, {
        method: "POST", headers, credentials: "include",
        body: JSON.stringify({ productId: id, quantity: Math.abs(delta) }),
      });
      const res = await fetch(`${API}/api/cart/${user.uid}`, { headers, credentials: "include" });
      const cartDoc = await res.json();
      setCart(mapCart(cartDoc, products));
    } catch (err) { console.error("Update qty failed:", err); }
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const firstName = user?.displayName?.split(" ")[0] || "there";

  const filtered = products.filter(p => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchSearch = !searchQuery
      || p.name.toLowerCase().includes(searchQuery.toLowerCase())
      || p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const renderProductGrid = () => {
    if (loading) return (
      <div className="text-center py-12 text-stone-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4
                        border-stone-300 border-t-stone-900 mb-4" />
        <p className="text-sm">Loading products...</p>
      </div>
    );
    if (backendError) return (
      <div className="text-center py-12 text-stone-400">
        <p className="text-3xl mb-2">🔌</p>
        <p className="text-sm mb-1">Cannot connect to the server</p>
        <p className="text-xs">Make sure the backend is running on port 5000</p>
        <button onClick={() => window.location.reload()}
          className="mt-4 text-xs bg-stone-900 text-white px-4 py-2 rounded-full
                     hover:bg-stone-700 transition-colors">
          Retry Connection
        </button>
      </div>
    );
    if (!filtered.length) return (
      <div className="text-center py-12 text-stone-400">
        <p className="text-3xl mb-2">∅</p>
        <p className="text-sm">No products match your search.</p>
      </div>
    );

    // Limit to 8 products if in "all" category and showAll is false
    const displayedProducts = activeCategory === "all" && !showAll
      ? filtered.slice(0, 8)
      : filtered;

    return (
      // 2-col on mobile, 3-col on md, 4-col on lg
      <div className={`fade-in d3 ${visible ? "show" : ""}
                       grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5`}>
        {displayedProducts.map(p => (
          <ProductCard key={p.id} product={p} onAdd={addToCart} cartItems={cart} updateQty={updateQty} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 font-['DM_Sans',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        .fade-in { opacity:0; transform:translateY(16px); transition:opacity .5s ease,transform .5s ease; }
        .fade-in.show { opacity:1; transform:translateY(0); }
        .d1{transition-delay:.05s} .d2{transition-delay:.15s} .d3{transition-delay:.25s}
        .cart-slide { transform:translateX(100%); transition:transform .35s cubic-bezier(.16,1,.3,1); }
        .cart-slide.open { transform:translateX(0); }
        .overlay { opacity:0; pointer-events:none; transition:opacity .3s ease; }
        .overlay.show { opacity:1; pointer-events:auto; }
        .search-expand { max-height:0; overflow:hidden; transition:max-height .3s ease; }
        .search-expand.open { max-height:80px; }
      `}</style>

      {showBanner && <WelcomeBanner onDismiss={dismissBanner} />}

      <Navbar
        variant="home"
        onSearchToggle={() => { setSearchOpen(p => !p); setSearchQuery(""); }}
        onCartOpen={() => setCartOpen(true)}
        cartCount={cartCount}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onSignOut={handleSignOut}
      />

      {/* Search bar */}
      <div className={`search-expand ${searchOpen ? "open" : ""} border-t border-stone-100`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-3">
          <input
            autoFocus={searchOpen} type="text"
            placeholder="Search products, brands…"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-sm text-stone-800 placeholder-stone-300 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Hero banner */}
      <section className="bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-10 sm:py-14">
          <div className={`fade-in d1 ${visible ? "show" : ""}`}>
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2 sm:mb-3">
              Welcome back, {firstName}
            </p>
            <h1 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-5xl text-white
                           leading-tight max-w-xl mb-4 sm:mb-5">
              Build something <em className="not-italic text-stone-400">stronger</em> today.
            </h1>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button className="text-sm bg-white text-stone-900 px-5 sm:px-6 py-2.5 rounded-full
                                 hover:bg-stone-100 transition-colors">
                Shop Now
              </button>
              <button
                onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
                className="text-sm border border-stone-700 text-stone-300 px-5 sm:px-6 py-2.5
                           rounded-full hover:bg-stone-800 transition-colors"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-8 sm:py-10 space-y-12 sm:space-y-16">

        {/* ── Products section ── */}
        <section>
          <div className={`fade-in d1 ${visible ? "show" : ""}
                           flex items-center justify-between mb-4 sm:mb-6`}>
            <h2 className="font-['DM_Serif_Display'] text-xl sm:text-2xl md:text-3xl text-stone-900">
              Featured Products
            </h2>
            {!backendError && !loading && (
              <span className="text-xs text-stone-400">{filtered.length} items</span>
            )}
          </div>

          {/* Category pills — horizontal scroll on mobile */}
          {!backendError && !loading && (
            <div className={`fade-in d2 ${visible ? "show" : ""}
                             flex gap-2 mb-5 sm:mb-8 overflow-x-auto pb-1
                             scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap`}>
              {CATEGORIES.map(c => (
                <button key={c.value} onClick={() => { setActiveCategory(c.value); setShowAll(false); }}
                  className={`text-xs px-4 py-2 rounded-full transition-all whitespace-nowrap shrink-0
                              ${activeCategory === c.value
                      ? "bg-stone-900 text-white"
                      : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
          {renderProductGrid()}

          {/* "See More" button */}
          {!backendError && !loading && activeCategory === "all" && !showAll && filtered.length > 8 && (
            <div className="mt-8 sm:mt-10 flex justify-center">
              <button
                onClick={() => setShowAll(true)}
                className="text-sm px-8 sm:px-10 py-3 rounded-full transition-all
                           border border-stone-300 text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900
                           font-medium"
              >
                See More Products
              </button>
            </div>
          )}
        </section>

        {/* Nearby fitness centers */}
        <NearbyFitnessCenters visible={visible} />

        {/* ── Plans section ── */}
        <section id="plans">
          <div className="mb-6 sm:mb-8">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Digital Coaching</p>
            <h2 className="font-['DM_Serif_Display'] text-xl sm:text-2xl md:text-3xl text-stone-900">
              Fitness plans
            </h2>
          </div>
          {/* Stack on mobile, 3-col on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {PLANS.map((plan, i) => (
              <div key={i}
                className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 flex flex-col gap-3 sm:gap-4
                           hover:border-stone-300 hover:shadow-lg transition-all duration-300">
                {plan.tag && (
                  <span className="text-[9px] tracking-[0.2em] uppercase text-stone-400">{plan.tag}</span>
                )}
                <div>
                  <h3 className="font-['DM_Serif_Display'] text-xl text-stone-900">{plan.name}</h3>
                  <p className="text-xs mt-0.5 text-stone-400">{plan.duration}</p>
                </div>
                <p className="text-sm leading-relaxed flex-1 text-stone-500">{plan.desc}</p>
                <button onClick={() => navigate(plan.route)}
                  className="text-xs py-2.5 rounded-full transition-all mt-1 border border-stone-300
                             text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900
                             min-h-10">
                  View Plan →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Workout Tracking section ── */}
        <section id="tracking" className="py-12 sm:py-16 border-y border-stone-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-12">
            <div className="text-center md:text-left">
              <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-stone-400 mb-3 font-medium">Personal Progress</p>
              <h2 className="font-['DM_Serif_Display'] text-3xl sm:text-4xl lg:text-5xl text-stone-900 leading-tight">
                Track your fitness routine
              </h2>
            </div>
            <button
              onClick={() => navigate("/tracker")}
              className="bg-stone-900 text-white text-xs sm:text-sm px-8 sm:px-10 py-3.5 sm:py-4 rounded-full 
                         hover:bg-stone-700 transition-all duration-300 font-medium
                         shadow-lg shadow-stone-200/50 self-center md:self-auto w-full sm:w-auto"
            >
              Open Calendar →
            </button>
          </div>
        </section>

        {/* ── Loyalty banner ── */}
        <section>
          <div className="bg-stone-100 rounded-2xl p-6 sm:p-8 md:p-10
                          flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Loyalty Program</p>
              <h3 className="font-['DM_Serif_Display'] text-xl sm:text-2xl md:text-3xl text-stone-900 mb-2">
                Earn FitRewards
              </h3>
              <p className="text-sm text-stone-500 max-w-md leading-relaxed">
                Points for every purchase and every fitness milestone. Redeem against equipment, supplements, or coaching.
              </p>
            </div>
            <button className="shrink-0 bg-stone-900 text-white text-sm px-6 sm:px-7 py-3 rounded-full
                               hover:bg-stone-700 transition-colors self-start md:self-auto w-full sm:w-auto
                               text-center">
              Learn More
            </button>
          </div>
        </section>

        {/* ── BMI Calculator ── */}
        <section>
          <BMICalculator />
        </section>

        {/* ── Calorie Calculator ── */}
        <section>
          <CalorieCalculator />
        </section>

        {/* ── Membership upgrade ── */}
        <section className="pb-6 sm:pb-8">
          <div className="mb-6 sm:mb-8">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Membership</p>
            <h2 className="font-['DM_Serif_Display'] text-xl sm:text-2xl md:text-3xl text-stone-900">
              Upgrade your experience
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {[
              { tier: "Pro", price: "₹499/mo", desc: "Personalized nutrition plans + 5% flat discount on everything.", cta: "Upgrade to Pro" },
              { tier: "Elite", price: "₹1,499/mo", desc: "1-on-1 coaching, early access to limited equipment drops, biometric sync.", cta: "Upgrade to Elite" },
            ].map((p, i) => (
              <div key={i}
                className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7
                           flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
                <div>
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="font-['DM_Serif_Display'] text-2xl text-stone-900">{p.tier}</span>
                    <span className="text-sm text-stone-400">{p.price}</span>
                  </div>
                  <p className="text-sm text-stone-500 leading-relaxed">{p.desc}</p>
                </div>
                <button className="shrink-0 text-xs border border-stone-300 text-stone-700 px-5 py-2.5
                                   rounded-full hover:bg-stone-900 hover:text-white hover:border-stone-900
                                   transition-all self-start min-h-10">
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-7 sm:py-8
                        flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
          <span className="font-['DM_Serif_Display'] text-lg text-stone-900">FitMart</span>
          <p className="text-xs text-stone-400 text-center">© 2026 FitMart. Built at VESIT, Mumbai.</p>
          <div className="flex gap-4 sm:gap-5">
            {["Privacy", "Terms", "Support"].map(l => (
              <button key={l}
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors min-h-9 px-1">
                {l}
              </button>
            ))}
          </div>
        </div>
      </footer>

      <CartDrawer
        isOpen={cartOpen} onClose={() => setCartOpen(false)}
        cart={cart} cartCount={cartCount} cartTotal={cartTotal}
        updateQty={updateQty} removeFromCart={removeFromCart}
      />
      <FitnessChatBot />
    </div>
  );
}