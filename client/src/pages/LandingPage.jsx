// src/pages/LandingPage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { auth } from "../auth/firebase";
import { fmt } from "../utils/formatters";


// ── Static data ────────────────────────────────────────────────────────────
// Real repo stats from GitHub API
const STATS = [
  { value: "105", label: "GitHub Stars" },
  { value: "144", label: "Forks" },
  { value: "20", label: "Contributors" },
  { value: "82+", label: "Commits" },
];

const CATEGORIES = [
  {
    title: "Home Gym Hardware",
    desc: "Professional-grade equipment, curated for your space.",
    tag: "EQUIPMENT",
    bg: "bg-stone-900", text: "text-white", sub: "text-stone-400",
    btn: "border-stone-600 text-stone-300 hover:bg-stone-800",
    filter: "Equipment",
  },
  {
    title: "Certified Nutrition",
    desc: "100% authenticated supplements, sourced direct.",
    tag: "NUTRITION",
    bg: "bg-stone-100", text: "text-stone-900", sub: "text-stone-500",
    btn: "border-stone-300 text-stone-700 hover:bg-stone-200",
    filter: "Nutrition",
  },
  {
    title: "Digital Coaching",
    desc: "Personalized plans built around your goals.",
    tag: "PROGRAMS",
    bg: "bg-stone-200", text: "text-stone-900", sub: "text-stone-500",
    btn: "border-stone-400 text-stone-700 hover:bg-stone-300",
    filter: "Programs",
  },
];

const PROGRAMS = [
  { name: "Weight Loss", duration: "12 Weeks", desc: "Caloric-deficit nutrition + cardio-focused programming", level: "Beginner to Intermediate" },
  { name: "Muscle Building", duration: "16 Weeks", desc: "Progressive overload training + protein-optimized meal plans", level: "Intermediate to Advanced" },
  { name: "Mobility & Recovery", duration: "8 Weeks", desc: "Flexibility-first programming, ideal for desk workers", level: "All Levels" },
];

const TESTIMONIALS = [
  { quote: "FitMart replaced three different subscriptions for me. Equipment, nutrition and coaching — finally in one place.", name: "Arjun M.", role: "Software Engineer, Powai" },
  { quote: "The authenticity guarantee is real. I've never doubted a single supplement I've ordered here.", name: "Priya S.", role: "Fitness Coach, Bandra" },
  { quote: "Set up a complete home gym through FitMart. The setup guide that came with it was genuinely useful.", name: "Rohan K.", role: "Architect, Andheri" },
];

// ── SVG Icons ──────────────────────────────────────────────────────────────
const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483
         0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608
         1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338
         -2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65
         0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027
         2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566
         4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02
         0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const StarIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069
             1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058
             -1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265
             -.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057
             1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014
             8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986
             8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073
             -1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014
             15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110
             -8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const GITHUB_REPO = "https://github.com/parthnarkar/FitMart";
const INSTAGRAM = "https://instagram.com/parth.builds";

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [visible, setVisible] = useState(false);

  const categoriesRef = useRef(null);
  const programsRef = useRef(null);
  const aboutRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [backendError, setBackendError] = useState(false);

  const API = import.meta.env.VITE_API_URL;
  useEffect(() => {
    document.title = "FitMart - Fitness & Nutrition Store";
  }, []);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingProducts(true);
      setBackendError(false);
      try {
        const res = await fetch(`${API}/api/products`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProducts(data.map(p => ({ ...p, id: p.productId || p.id })));
      } catch (err) {
        console.error("Error loading products:", err);
        setBackendError(true);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  const navOpaque = scrollY > 60;

  return (
    <div className="min-h-screen bg-white font-['DM_Sans',sans-serif] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        .fade-up { opacity:0; transform:translateY(28px); transition:opacity .7s ease,transform .7s ease; }
        .fade-up.visible { opacity:1; transform:translateY(0); }
        .delay-1 { transition-delay:.1s; }
        .delay-2 { transition-delay:.25s; }
        .delay-3 { transition-delay:.4s; }
        .delay-4 { transition-delay:.55s; }
        .delay-5 { transition-delay:.7s; }
        .hero-line { overflow:hidden; }
        .slide-up { display:inline-block; transform:translateY(100%); transition:transform .8s cubic-bezier(.16,1,.3,1); }
        .slide-up.visible { transform:translateY(0); }
        .cat-card { transition:transform .35s ease,box-shadow .35s ease; }
        @media(hover:hover){ .cat-card:hover { transform:translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,.1); } }
        .testimonial-enter { animation:tFadeIn .6s ease forwards; }
        @keyframes tFadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .stat-card { transition: transform .25s ease; }
        .stat-card:hover { transform: translateY(-2px); }
        .gh-star-btn { transition: background .2s ease, color .2s ease, border-color .2s ease; }
      `}</style>

      {/* ── NAVBAR ── */}
      <NavbarWithGithub
        navOpaque={navOpaque}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col justify-center pt-16 bg-stone-50 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-24 relative z-10 w-full">
          <div className="max-w-4xl">

            {/* Badge */}
            <div className={`fade-up ${visible ? "visible" : ""} delay-1 mb-5 sm:mb-6`}>
              <span className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase
                               text-stone-500 border border-stone-200 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse" />
                Mumbai's Fitness Marketplace
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-['DM_Serif_Display'] text-[2.4rem] sm:text-6xl md:text-7xl lg:text-8xl
                           text-stone-900 leading-[1.05] mb-5 sm:mb-6 tracking-tight">
              <div className="hero-line">
                <span className={`slide-up ${visible ? "visible" : ""} delay-1`}>
                  Everything fitness.
                </span>
              </div>
              <div className="hero-line">
                <span className={`slide-up ${visible ? "visible" : ""} delay-2`}>
                  Nothing <em className="not-italic text-stone-400">extra.</em>
                </span>
              </div>
            </h1>

            {/* Subheading */}
            <p className={`fade-up ${visible ? "visible" : ""} delay-3 text-base sm:text-lg text-stone-500
                           max-w-xl leading-relaxed mb-8 sm:mb-10`}>
              Curated equipment, verified nutrition, and digital coaching — built for people
              who take their health seriously.
            </p>

            {/* CTA buttons */}
            <div className={`fade-up ${visible ? "visible" : ""} delay-4
                             flex flex-col sm:flex-row gap-3`}>
              <button
                onClick={() => navigate(auth.currentUser ? "/home" : "/auth")}
                className="bg-stone-900 text-white text-sm px-8 py-3.5 rounded-full
                           hover:bg-stone-700 transition-colors w-full sm:w-auto text-center
                           min-h-12 active:scale-[0.98]"
              >
                Start Shopping
              </button>

              {/* GitHub Star CTA */}
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="gh-star-btn flex items-center justify-center gap-2 text-sm px-6 py-3.5
                rounded-full border border-stone-200 text-stone-600
                hover:bg-stone-900 hover:text-white hover:border-stone-900
                transition-all w-full sm:w-auto min-h-12 active:scale-[0.98]"
              >
                <GithubIcon />
                <StarIcon className="w-3.5 h-3.5" />
                <span>Star on GitHub</span>
                <span className="bg-stone-100 text-stone-700 text-xs px-2 py-0.5 rounded-full
                                   font-medium min-w-7 text-center group-hover:bg-stone-800">
                  105
                </span>
              </a>
            </div>

            {/* Open-source community note */}
            <div className={`fade-up ${visible ? "visible" : ""} delay-5 mt-6`}>
              <p className="text-xs text-stone-400 flex items-center gap-1.5 flex-wrap">
                <GithubIcon className="w-3.5 h-3.5" />
                Open-source · Built by{" "}
                <a
                  href={INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 decoration-stone-300 hover:text-stone-700
                  transition-colors"
                >
                  parth.builds community
                </a>
                {" "}
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats bar — real GitHub stats ── */}
        <div className="border-t border-stone-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8
                          grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {STATS.map((s, i) => (
              <div key={i} className="stat-card text-center md:text-left">
                <div className="font-['DM_Serif_Display'] text-2xl sm:text-3xl text-stone-900 leading-none">
                  {s.value}
                </div>
                <div className="text-xs text-stone-500 mt-1.5 tracking-wide uppercase leading-tight">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section ref={categoriesRef} className="py-12 sm:py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-10 sm:mb-14">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3">What We Offer</p>
            <h2 className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl text-stone-900">
              Shop by category
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {CATEGORIES.map((c, i) => (
              <div
                key={i}
                className={`cat-card rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col justify-between
                              min-h-56 sm:min-h-64 md:min-h-72 cursor-pointer ${c.bg}`}
                onClick={() => navigate("/home", { state: { category: c.filter } })}
              >
                <div>
                  <span className={`text-[10px] tracking-[0.2em] uppercase font-medium
                                      ${c.sub} mb-3 sm:mb-4 block`}>
                    {c.tag}
                  </span>
                  <h3 className={`font-['DM_Serif_Display'] text-2xl md:text-3xl ${c.text}
                                    leading-snug mb-2 sm:mb-3`}>
                    {c.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${c.sub}`}>{c.desc}</p>
                </div>
                <button
                  className={`mt-6 sm:mt-8 self-start text-xs border px-5 py-2.5 rounded-full
                                transition-colors ${c.btn} min-h-10 active:scale-[0.97]`}
                  onClick={e => {
                    e.stopPropagation();
                    navigate("/home", { state: { category: c.filter } });
                  }}
                >
                  Browse →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── FEATURED PRODUCTS (first 4) ── */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-6 sm:mb-8">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Featured</p>
            <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl text-stone-900">
              Popular products
            </h2>
          </div>

          {loadingProducts ? (
            <div className="text-center py-12 text-stone-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4
                              border-stone-300 border-t-stone-900 mb-4" />
              <p className="text-sm">Loading products...</p>
            </div>
          ) : backendError ? (
            <div className="text-center py-12 text-stone-400">
              <p className="text-3xl mb-2">🔌</p>
              <p className="text-sm mb-1">Cannot connect to the server</p>
              <p className="text-xs">Make sure the backend is running on port 5000</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {products.slice(0, 4).map((p) => (
                <div key={p.productId || p.id}
                  onClick={() => navigate(`/product/${p.productId || p.id}`)}
                  className="bg-white border border-stone-100 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200">
                  <div className="relative bg-stone-100 aspect-square flex items-center justify-center overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <div className="text-4xl opacity-20 select-none">
                        {p.category === "Nutrition" ? "🧴" : p.category === "Wearables" ? "⌚" : "🏋️"}
                      </div>
                    )}
                  </div>
                  <div className="p-3 text-left">
                    <p className="text-[10px] text-stone-400 mb-1 truncate">{p.brand}</p>
                    <h3 className="text-sm font-medium text-stone-900 mb-1 line-clamp-2">{p.name}</h3>
                    <div className="text-sm font-semibold text-stone-900">{fmt(p.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section ref={programsRef} className="py-16 sm:py-24 bg-stone-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-10 sm:mb-14">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3">Digital Coaching</p>
            <h2 className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl text-stone-900">
              Our programs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {PROGRAMS.map((program, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 hover:shadow-lg
                           transition-all cursor-pointer active:scale-[0.99]"
                onClick={() => navigate(auth.currentUser ? "/home" : "/auth")}
              >
                <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-3 block">
                  {program.level}
                </span>
                <h3 className="font-['DM_Serif_Display'] text-2xl text-stone-900 mb-2">
                  {program.name}
                </h3>
                <p className="text-sm text-stone-500 mb-3 sm:mb-4">{program.duration}</p>
                <p className="text-sm text-stone-600 leading-relaxed mb-5 sm:mb-6">{program.desc}</p>
                <button className="text-xs border border-stone-300 text-stone-700 px-5 py-2.5
                                     rounded-full hover:bg-stone-900 hover:text-white hover:border-stone-900
                                     transition-all min-h-10 active:scale-[0.97]">
                  Learn More →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE STRIP ── */}
      <section className="py-14 sm:py-20 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12
                            divide-y divide-stone-800 md:divide-y-0 md:divide-x md:divide-stone-800">
            {[
              { icon: "✓", title: "100% Authenticity", desc: "Every supplement sourced direct from manufacturer with QR batch verification." },
              { icon: "⚡︎", title: "Mumbai-Speed Delivery", desc: "24-hour fulfillment within MMR. Real-time tracking via WhatsApp and email." },
              { icon: "◎", title: "Fitness-as-a-Service", desc: "Buy a product, unlock a plan. Equipment and coaching aren't separate here." },
            ].map((f, i) => (
              <div key={i} className={`flex flex-col gap-3 ${i > 0 ? "pt-8 md:pt-0 md:pl-12" : ""}`}>
                <span className="text-stone-400 text-lg">{f.icon}</span>
                <h3 className="font-['DM_Serif_Display'] text-xl">{f.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section ref={aboutRef} className="py-16 sm:py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3">About FitMart</p>
            <h2 className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl text-stone-900
                             mb-6 sm:mb-8">
              Built for Mumbai's fitness community
            </h2>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed mb-8 sm:mb-12">
              We started FitMart because we believe fitness shouldn't be complicated.
              By bringing together equipment, nutrition, and coaching under one roof,
              we've created Mumbai's first integrated fitness ecosystem.
            </p>
            <div className="grid grid-cols-2 gap-6 sm:gap-8 max-w-xs sm:max-w-sm md:max-w-2xl mx-auto">
              <div className="text-center">
                <div className="font-['DM_Serif_Display'] text-3xl text-stone-900">2024</div>
                <p className="text-xs text-stone-500 mt-0.5">Founded</p>
              </div>
              <div className="text-center">
                <div className="font-['DM_Serif_Display'] text-3xl text-stone-900">1000+</div>
                <p className="text-xs text-stone-500 mt-0.5">Happy Customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 sm:py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-8 sm:mb-10">
              From the Community
            </p>
            <div key={activeTestimonial} className="testimonial-enter">
              <blockquote className="font-['DM_Serif_Display'] text-xl sm:text-2xl md:text-3xl
                                       text-stone-800 leading-relaxed mb-6 sm:mb-8">
                "{TESTIMONIALS[activeTestimonial].quote}"
              </blockquote>
              <p className="text-sm font-medium text-stone-900">
                {TESTIMONIALS[activeTestimonial].name}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                {TESTIMONIALS[activeTestimonial].role}
              </p>
            </div>

            <div className="flex justify-center items-center gap-2 mt-8 sm:mt-10">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-1.5 rounded-full transition-all
                      ${i === activeTestimonial ? "bg-stone-900 w-5" : "bg-stone-200 w-1.5"}`}
                  style={{ minWidth: "6px", minHeight: "24px", display: "flex", alignItems: "center" }}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANS TEASER ── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3">Membership Plans</p>
            <h2 className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl text-stone-900">
              Choose your level
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              { name: "Freemium", price: 0, perks: ["Store access", "Public workout blogs", "Product reviews"], cta: "Start Free" },
              { name: "Pro", price: 499, perks: ["Personalized nutrition plans", "5% discount on all products", "Priority support"], cta: "Go Pro", highlight: true },
              { name: "Elite", price: 1499, perks: ["1-on-1 digital coaching", "Early access to drops", "Biometric data sync"], cta: "Go Elite" },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 sm:p-8 flex flex-col gap-4 sm:gap-5 cursor-pointer
                              transition-all hover:shadow-lg active:scale-[0.99]
                              ${plan.highlight
                    ? "bg-stone-900 text-white hover:bg-stone-800"
                    : "bg-white border border-stone-200 hover:border-stone-300"
                  }`}
                onClick={() => navigate(auth.currentUser ? "/home" : "/auth")}
              >
                <div>
                  <p className="text-xs tracking-widest uppercase text-stone-400">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`font-['DM_Serif_Display'] text-4xl
                                        ${plan.highlight ? "text-white" : "text-stone-900"}`}>
                      {fmt(plan.price)}
                    </span>
                    {plan.price !== 0 && (
                      <span className="text-xs text-stone-400">/mo</span>
                    )}
                  </div>
                </div>
                <ul className="flex flex-col gap-2 sm:gap-2.5 flex-1">
                  {plan.perks.map((p, j) => (
                    <li key={j} className={`text-sm flex items-start gap-2
                                              ${plan.highlight ? "text-stone-300" : "text-stone-600"}`}>
                      <span className="mt-0.5 text-stone-400 shrink-0">─</span>{p}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={e => { e.stopPropagation(); navigate(auth.currentUser ? "/home" : "/auth"); }}
                  className={`text-sm py-3 rounded-full transition-colors min-h-11
                                ${plan.highlight
                      ? "bg-white text-stone-900 hover:bg-stone-100"
                      : "border border-stone-300 text-stone-700 hover:bg-stone-50"
                    }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 sm:py-32 bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-4 sm:mb-5">
            Get Started Today
          </p>
          <h2 className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-6xl text-white
                           max-w-2xl mx-auto leading-tight mb-7 sm:mb-8">
            Your fitness journey starts with one decision.
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => navigate(auth.currentUser ? "/home" : "/auth")}
              className="bg-white text-stone-900 text-sm px-8 sm:px-10 py-4 rounded-full
                           hover:bg-stone-100 transition-colors min-h-12 w-full sm:w-auto
                           active:scale-[0.98]"
            >
              Create your account →
            </button>

            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm px-8 py-4 rounded-full
              border border-stone-700 text-stone-400 hover:border-stone-500
              hover:text-stone-200 transition-all min-h-12 w-full sm:w-auto
              active:scale-[0.98]"
            >
              <GithubIcon />
              View Source
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <LandingFooter aboutRef={aboutRef} />
    </div>
  );
}

// ── NavbarWithGithub — extends Navbar with a GitHub star button ────────────
function NavbarWithGithub({ navOpaque, menuOpen, setMenuOpen }) {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isOpaque = navOpaque || scrollY > 60;
  const textColor = isOpaque ? "text-stone-900" : "text-white";
  const mutedColor = isOpaque ? "text-stone-500" : "text-white/70";
  const borderColor = isOpaque ? "border-stone-200" : "border-white/20";
  const bgClass = isOpaque
    ? "bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm"
    : "bg-transparent";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 sm:h-16
                      flex items-center justify-between gap-3">

        {/* Brand */}
        <span
          className={`font-['DM_Serif_Display'] text-lg sm:text-xl tracking-tight cursor-pointer
                       transition-colors ${textColor}`}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          FitMart
        </span>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* GitHub Star — visible on sm+ in nav, hidden on mobile to save space */}
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full
                          border transition-all min-h-8.5
                          ${isOpaque
                ? "border-stone-200 text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900"
                : "border-white/30 text-white/80 hover:bg-white/10"
              }`}
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <StarIcon className="w-3 h-3" />
            <span>Star</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                                ${isOpaque ? "bg-stone-100 text-stone-700" : "bg-white/10 text-white/70"}`}>
              105
            </span>
          </a>

          {/* Get Started */}
          <button
            onClick={() => navigate(auth.currentUser ? "/home" : "/auth")}
            className={`text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full transition-colors
                           min-h-9 active:scale-[0.97]
                           ${isOpaque
                ? "bg-stone-900 text-white hover:bg-stone-700"
                : "bg-white text-stone-900 hover:bg-stone-100"
              }`}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── LandingFooter — rich footer with community + links ────────────────────
function LandingFooter({ aboutRef }) {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const links = {
    Community: [
      { label: "parth.builds on Instagram", href: INSTAGRAM },
      { label: "GitHub Repository", href: GITHUB_REPO },
      { label: "Contribute", href: `${GITHUB_REPO}/fork` },
      { label: "Open Issues", href: `${GITHUB_REPO}/issues` },
    ],
  };

  return (
    <footer className="bg-stone-950 text-white">

      {/* ── Main footer body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-14 sm:pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="font-['DM_Serif_Display'] text-2xl text-white block mb-3">
              FitMart
            </span>
            <p className="text-sm text-stone-400 leading-relaxed mb-5 max-w-xs">
              Mumbai's open-source fitness marketplace — built in public, powered by community.
            </p>

            {/* Community badge */}
            <div className="inline-flex items-center gap-2.5 bg-stone-900 border border-stone-800
                            rounded-xl px-4 py-3 mb-5">
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 via-pink-500
                                  to-orange-400 flex items-center justify-center shrink-0">
                  <InstagramIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-white group-hover:text-stone-200
                                  transition-colors leading-tight">
                    parth.builds
                  </p>
                  <p className="text-[10px] text-stone-500 leading-tight">Tech Content · Mumbai</p>
                </div>
              </a>
            </div>

            {/* GitHub stats pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <StarIcon className="w-3 h-3" />, label: "105 stars" },
                { icon: <GithubIcon className="w-3 h-3" />, label: "144 forks" },
              ].map(({ icon, label }) => (
                <a
                  key={label}
                  href={GITHUB_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-stone-400 bg-stone-900
                             border border-stone-800 px-2.5 py-1 rounded-full
                             hover:border-stone-600 hover:text-stone-200 transition-all"
                >
                  {icon}
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading} className="lg:ml-auto">
              <p className="text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-4 font-medium">
                {heading}
              </p>
              <ul className="space-y-3">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-stone-400 hover:text-white transition-colors
            inline-flex items-center gap-1.5 group"
                    >
                      {label === "parth.builds on Instagram" && (
                        <InstagramIcon className="w-3.5 h-3.5 text-stone-600
                                      group-hover:text-pink-400 transition-colors" />
                      )}
                      {(label === "GitHub Repository" || label === "Contribute" || label === "Open Issues") && (
                        <GithubIcon className="w-3.5 h-3.5 text-stone-600 group-hover:text-white
                                   transition-colors" />
                      )}
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer bottom bar ── */}
      <div className="border-t border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5
                        flex flex-col sm:flex-row items-center justify-between gap-3">

          <p className="text-xs text-stone-600 text-center sm:text-left">
            © {year} FitMart · Built by Parth Builds Community
          </p>

          <div className="flex items-center gap-4">
            {/* Instagram */}
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-pink-400 transition-colors"
              aria-label="parth.builds on Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            {/* GitHub */}
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-white transition-colors"
              aria-label="FitMart on GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            {/* Star pill */}
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-stone-500 bg-stone-900
                           border border-stone-800 px-3 py-1.5 rounded-full
                           hover:border-stone-600 hover:text-stone-200 transition-all"
            >
              <StarIcon className="w-3 h-3" />
              Star the repo
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}