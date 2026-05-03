// src/pages/WeightLossPlans.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { signOut } from "firebase/auth";
import { auth } from "../auth/firebase";

const PLANS = [
  {
    name: "Lean & Burn",
    duration: "12 Weeks",
    difficulty: "Beginner",
    tag: "MOST POPULAR",
    desc: "A caloric-deficit nutrition plan paired with structured cardio sessions. Perfect for those starting their weight loss journey.",
    features: ["Custom meal plans", "5-day cardio schedule", "Weekly check-ins", "Progress tracking dashboard"],
  },
  {
    name: "Shred Protocol",
    duration: "8 Weeks",
    difficulty: "Intermediate",
    tag: null,
    desc: "High-intensity interval training combined with macro-counted meals for accelerated fat loss while preserving muscle.",
    features: ["HIIT workout library", "Macro tracking guide", "Supplement recommendations", "Body composition analysis"],
  },
  {
    name: "Metabolic Reset",
    duration: "6 Weeks",
    difficulty: "Beginner",
    tag: null,
    desc: "Repair and boost your metabolism through strategic re-feeds, mindful eating habits, and low-impact steady-state cardio.",
    features: ["Metabolic rate assessment", "Re-feed scheduling", "Mindful eating practices", "LISS cardio routines"],
  },
  {
    name: "Elite Cut",
    duration: "16 Weeks",
    difficulty: "Advanced",
    tag: "BEST RESULTS",
    desc: "Competition-grade cutting protocol with periodized training, precise calorie cycling, and bi-weekly coach adjustments.",
    features: ["Periodized training blocks", "Calorie cycling strategy", "Bi-weekly coaching calls", "Posing & physique feedback"],
  },
];

export default function WeightLossPlans() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Weight Loss Plans — FitMart";
    setTimeout(() => setVisible(true), 80);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-stone-50 font-['DM_Sans',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        .fade-in { opacity:0; transform:translateY(16px); transition:opacity .5s ease,transform .5s ease; }
        .fade-in.show { opacity:1; transform:translateY(0); }
        .d1{transition-delay:.05s} .d2{transition-delay:.15s}
        .d3{transition-delay:.25s} .d4{transition-delay:.35s}
      `}</style>

      <Navbar
        variant="home"
        onSearchToggle={() => { }}
        onCartOpen={() => { }}
        cartCount={0}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onSignOut={handleSignOut}
      />

      {/* ── Hero ── */}
      <section className="bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-12 sm:py-16 md:py-20">
          <div className={`fade-in d1 ${visible ? "show" : ""}`}>
            {/* Stack on mobile, row on sm+ */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5 sm:gap-8">
              <div className="flex-1">
                <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3">
                  Digital Coaching
                </p>
                <h1 className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-6xl
                               text-white leading-tight max-w-2xl mb-4">
                  Weight Loss{" "}
                  <em className="not-italic text-stone-400">Plans</em>
                </h1>
                <p className="text-sm text-stone-300 max-w-lg leading-relaxed">
                  Caloric-deficit nutrition, cardio-focused programming, and expert coaching
                  designed to help you shed weight sustainably.
                </p>
              </div>

              <button
                onClick={() => navigate("/home")}
                className="text-xs tracking-[0.15em] uppercase text-stone-400
                           hover:text-stone-200 transition-colors inline-flex items-center
                           gap-2 self-start sm:self-auto min-h-11"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Plans Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-12 sm:py-16 space-y-12 sm:space-y-16">

        {/* Available programs */}
        <section>
          <div className={`fade-in d1 ${visible ? "show" : ""} mb-6 sm:mb-8`}>
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">
              Choose Your Path
            </p>
            <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl text-stone-900">
              Available programs
            </h2>
          </div>

          {/* Single col on mobile, 2-col on md+ */}
          <div className={`fade-in d2 ${visible ? "show" : ""} grid sm:grid-cols-2 gap-4 sm:gap-5`}>
            {PLANS.map((plan, i) => (
              <div
                key={i}
                className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7
                           flex flex-col gap-4 transition-all duration-300
                           hover:shadow-lg hover:border-stone-300"
              >
                <div className="flex items-center justify-between">
                  {plan.tag ? (
                    <span className="text-[9px] tracking-[0.2em] uppercase rounded-full
                                     px-2.5 py-1 bg-stone-900 text-white">
                      {plan.tag}
                    </span>
                  ) : <span />}
                  <span className="text-[10px] tracking-[0.15em] uppercase px-3 py-1.5
                                   rounded-full border text-stone-500 border-stone-200">
                    {plan.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="font-['DM_Serif_Display'] text-xl sm:text-2xl text-stone-900">
                    {plan.name}
                  </h3>
                  <p className="text-xs mt-1 text-stone-400">{plan.duration}</p>
                </div>

                <p className="text-sm leading-relaxed flex-1 text-stone-500">
                  {plan.desc}
                </p>

                <ul className="space-y-2">
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-xs flex items-center gap-2 text-stone-500">
                      <span className="text-stone-900 shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>

                <button className="text-sm py-3 rounded-full transition-all mt-2 border
                                   border-stone-300 text-stone-700 hover:bg-stone-900
                                   hover:text-white hover:border-stone-900 min-h-11
                                   active:scale-[0.98]">
                  Start Plan →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Science section */}
        <section>
          <div className={`fade-in d3 ${visible ? "show" : ""}`}>
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Why It Works</p>
            <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl
                           text-stone-900 mb-6 sm:mb-8">
              The science behind the plan
            </h2>
            {/* Single col on mobile, 3-col on md+ */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              {[
                {
                  icon: "◎",
                  title: "Caloric Deficit",
                  desc: "Precisely calculated energy balance tailored to your body composition and activity level.",
                },
                {
                  icon: "⚡",
                  title: "Metabolic Adaptation",
                  desc: "Strategic re-feeds and diet breaks prevent metabolic slowdown during extended cuts.",
                },
                {
                  icon: "✓",
                  title: "Sustainable Habits",
                  desc: "No crash diets — build lasting nutritional habits that keep the weight off for good.",
                },
              ].map((tip, i) => (
                <div key={i} className="bg-stone-100 rounded-2xl p-5 sm:p-7">
                  <span className="text-2xl mb-4 block">{tip.icon}</span>
                  <h3 className="font-['DM_Serif_Display'] text-lg text-stone-900 mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-6 sm:py-8
                        flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <span className="font-['DM_Serif_Display'] text-lg text-stone-900">FitMart</span>
          <p className="text-xs text-stone-400">© 2026 FitMart. Built at VESIT, Mumbai.</p>
          <div className="flex gap-4 sm:gap-5">
            {["Privacy", "Terms", "Support"].map(l => (
              <button key={l}
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors
                           min-h-11 flex items-center">
                {l}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}