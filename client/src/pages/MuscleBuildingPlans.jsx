// src/pages/MuscleBuildingPlans.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { signOut } from "firebase/auth";
import { auth } from "../auth/firebase";

const PLANS = [
  {
    name: "Hypertrophy Foundation",
    duration: "12 Weeks",
    difficulty: "Beginner",
    tag: "RECOMMENDED",
    desc: "Master the fundamentals of muscle growth with progressive overload, compound lifts, and a protein-optimized meal plan.",
    features: ["5-day split programming", "Form video library", "Protein-rich meal plans", "Weekly volume tracking"],
  },
  {
    name: "Mass Architecture",
    duration: "16 Weeks",
    difficulty: "Intermediate",
    tag: null,
    desc: "Periodized training blocks designed to maximize lean mass gains with intelligent calorie surplus management.",
    features: ["Periodized mesocycles", "Calorie surplus planning", "Supplement stack guide", "Deload protocols"],
  },
  {
    name: "Strength & Size",
    duration: "10 Weeks",
    difficulty: "Intermediate",
    tag: null,
    desc: "Powerbuilding approach that blends heavy compound movements with hypertrophy-focused accessory work.",
    features: ["Powerlifting base program", "Hypertrophy accessory work", "RPE-based progression", "Mobility warm-ups"],
  },
  {
    name: "Advanced Bodybuilding",
    duration: "20 Weeks",
    difficulty: "Advanced",
    tag: "ELITE",
    desc: "Contest-prep level programming with advanced techniques — drop sets, giant sets, and precision nutrition for stage-ready physiques.",
    features: ["Advanced training techniques", "Peak week protocols", "Bi-weekly coaching calls", "Physique assessment photos"],
  },
];

export default function MuscleBuildingPlans() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Muscle Building Plans — FitMart";
    setTimeout(() => setVisible(true), 80);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

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
        .d1{transition-delay:.05s} .d2{transition-delay:.15s} .d3{transition-delay:.25s} .d4{transition-delay:.35s}
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

      {/* Hero */}
      <section className="bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-12 sm:py-16 md:py-20">
          <div className={`fade-in d1 ${visible ? "show" : ""}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3">Digital Coaching</p>
                <h1 className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-6xl text-white
                               leading-tight max-w-2xl mb-3 sm:mb-4">
                  Muscle Building <em className="not-italic text-stone-400">Plans</em>
                </h1>
                <p className="text-sm text-stone-300 max-w-lg leading-relaxed">
                  Progressive overload training, protein-optimized nutrition, and expert programming to build lean mass and strength.
                </p>
              </div>
              <button
                onClick={() => navigate("/home")}
                className="text-xs tracking-[0.15em] uppercase text-stone-400 hover:text-stone-200
                           transition-colors inline-flex items-center gap-2 self-start
                           border border-stone-700 px-4 py-2 rounded-full sm:border-0 sm:p-0"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-10 sm:py-16 space-y-12 sm:space-y-16">

        <section>
          <div className={`fade-in d1 ${visible ? "show" : ""} mb-6 sm:mb-8`}>
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Choose Your Path</p>
            <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl text-stone-900">
              Available programs
            </h2>
          </div>

          <div className={`fade-in d2 ${visible ? "show" : ""} grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5`}>
            {PLANS.map((plan, i) => (
              <div key={i}
                className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 flex flex-col gap-3 sm:gap-4
                           transition-all duration-300 hover:shadow-lg hover:border-stone-300">
                <div className="flex items-center justify-between">
                  {plan.tag ? (
                    <span className="text-[9px] tracking-[0.2em] uppercase rounded-full px-2.5 py-1
                                     bg-stone-900 text-white">
                      {plan.tag}
                    </span>
                  ) : <span />}
                  <span className="text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full
                                   border text-stone-500 border-stone-200">
                    {plan.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="font-['DM_Serif_Display'] text-xl md:text-2xl text-stone-900">{plan.name}</h3>
                  <p className="text-xs mt-1 text-stone-400">{plan.duration}</p>
                </div>

                <p className="text-sm leading-relaxed flex-1 text-stone-500">{plan.desc}</p>

                <ul className="space-y-1.5 sm:space-y-2">
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-xs flex items-start gap-2 text-stone-500">
                      <span className="text-stone-900 shrink-0 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>

                <button className="text-xs py-2.5 rounded-full transition-all mt-1 border border-stone-300
                                   text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900
                                   min-h-10">
                  Start Plan →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Why It Works */}
        <section>
          <div className={`fade-in d3 ${visible ? "show" : ""}`}>
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Why It Works</p>
            <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl text-stone-900 mb-6 sm:mb-8">
              The science behind the plan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {[
                { icon: "◎", title: "Progressive Overload", desc: "Systematically increasing training stimulus to drive continuous muscle adaptation and growth." },
                { icon: "⚡", title: "Protein Synthesis", desc: "Optimized protein timing and distribution to maximize muscle protein synthesis throughout the day." },
                { icon: "✓", title: "Recovery Protocols", desc: "Structured rest days and deload weeks ensure your body rebuilds stronger between sessions." },
              ].map((tip, i) => (
                <div key={i} className="bg-stone-100 rounded-2xl p-5 sm:p-7">
                  <span className="text-2xl mb-3 sm:mb-4 block">{tip.icon}</span>
                  <h3 className="font-['DM_Serif_Display'] text-lg text-stone-900 mb-2">{tip.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

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
    </div>
  );
}