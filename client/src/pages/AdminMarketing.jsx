// src/pages/AdminMarketing.jsx
import { useState } from "react";
import AdminNavbar from "../components/AdminNavbar";

const StrategyCard = ({ strategy }) => (
  <div
    className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7
               hover:border-stone-300 hover:shadow-lg transition-all duration-300"
  >
    {/* Title */}
    <div className="mb-3 sm:mb-4">
      <h3
        style={{ fontFamily: "'DM Serif Display', serif" }}
        className="text-lg sm:text-xl text-stone-900"
      >
        {strategy.name}
      </h3>
    </div>

    {/* Short Explanation */}
    <p className="text-sm text-stone-600 leading-relaxed mb-4">
      {strategy.explanation}
    </p>

    {/* How it helps e-commerce */}
    <div className="mb-4 pb-4 border-b border-stone-100">
      <p className="text-xs tracking-widest uppercase text-stone-400 mb-2">
        For FitMart
      </p>
      <p className="text-sm text-stone-700">{strategy.ecommerceBenefit}</p>
    </div>

    {/* Key Benefits */}
    <div>
      <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">
        Key Benefits
      </p>
      <ul className="space-y-2">
        {strategy.benefits.map((benefit, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2.5 text-sm text-stone-700"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full
                            bg-stone-100 text-stone-600 shrink-0 mt-0.5">
              {/* No emoji, just a checkmark */}
            </span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const BenefitHighlight = ({ title, description }) => (
  <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 sm:p-5">
    <h4
      style={{ fontFamily: "'DM Serif Display', serif" }}
      className="text-base sm:text-lg text-stone-900 mb-2"
    >
      {title}
    </h4>
    <p className="text-sm text-stone-600 leading-relaxed">{description}</p>
  </div>
);

export default function AdminMarketing() {
  const [menuOpen, setMenuOpen] = useState(false);

  const strategies = [
    {
      name: "Content Marketing",
      explanation:
        "Create valuable, educational content like fitness guides, nutrition tips, workout routines, and product reviews that engage your audience and establish trust.",
      ecommerceBenefit:
        "Drives organic traffic through SEO, improves brand authority, and helps customers make informed purchasing decisions on your fitness products.",
      benefits: [
        "Increase website traffic through blog posts and guides",
        "Build customer trust and brand credibility",
        "Provide value that encourages repeat visits and purchases",
        "Generate qualified leads who understand your products",
      ],
    },
    {
      name: "SEO Marketing",
      explanation:
        "Optimize your website and product pages for search engines by targeting fitness-related keywords like 'best protein supplements,' 'workout equipment,' and 'nutrition plans.'",
      ecommerceBenefit:
        "Improves your visibility in search results, brings highly qualified customers searching for fitness products, and reduces dependency on paid advertising.",
      benefits: [
        "Higher organic search rankings for fitness-related keywords",
        "Lower customer acquisition cost compared to paid ads",
        "Consistent long-term traffic growth",
        "Better product discoverability across search engines",
      ],
    },
    {
      name: "Influencer Marketing",
      explanation:
        "Partner with fitness influencers, gym trainers, and nutrition experts to promote FitMart products. They share authentic reviews and recommendations with their engaged audiences.",
      ecommerceBenefit:
        "Leverages trusted voices in the fitness community, reaches targeted fitness enthusiasts, and builds brand credibility through third-party endorsement.",
      benefits: [
        "Access to large, highly engaged fitness audiences",
        "Authentic product reviews from trusted figures",
        "Social media amplification and viral potential",
        "Higher conversion rates from motivated followers",
      ],
    },
    {
      name: "Email & WhatsApp Marketing",
      explanation:
        "Build subscriber lists and send personalized product recommendations, exclusive discounts, fitness tips, and order updates directly to customers on email and WhatsApp.",
      ecommerceBenefit:
        "Maintains direct communication channels, drives repeat purchases through personalized offers, and helps customers stay engaged with new FitMart products.",
      benefits: [
        "Direct access to customer inboxes and WhatsApp chats",
        "High open and click-through rates on personalized messages",
        "Drive repeat purchases with exclusive offers and upsells",
        "Improve customer retention and lifetime value",
      ],
    },
  ];

  return (
    <div
      className="min-h-screen bg-stone-50"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <AdminNavbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        .fade-in { animation: fmFadeIn 0.5s ease forwards; }
        @keyframes fmFadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-10 sm:mb-12">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2 sm:mb-3">
            Strategic Overview
          </p>
          <h1
            style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-3xl sm:text-4xl md:text-5xl text-stone-900 mb-4 sm:mb-6"
          >
            Marketing Strategies
          </h1>
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
            FitMart's growth depends on reaching fitness-conscious customers through multiple channels. Each strategy below plays a critical role in building awareness, trust, and driving conversions.
          </p>
        </div>

        {/* Strategies Grid */}
        <div className="mb-10 sm:mb-12">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-4 sm:mb-6">
            Four Core Approaches
          </p>
          <div className="fade-in grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {strategies.map((strategy, idx) => (
              <StrategyCard key={idx} strategy={strategy} />
            ))}
          </div>
        </div>

        {/* Why This Matters Section */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3 sm:mb-4">
            Implementation
          </p>
          <h2
            style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-2xl sm:text-3xl text-stone-900 mb-6 sm:mb-8"
          >
            Why This Matters
          </h2>

          <p className="text-base text-stone-700 leading-relaxed mb-6 sm:mb-8">
            These four strategies work together as an integrated marketing ecosystem. Content marketing provides the foundation of trust and value. SEO ensures discovery. Influencer partnerships amplify reach. Email and WhatsApp marketing seal customer relationships and drive repeat purchases.
          </p>

          <p className="text-base text-stone-700 leading-relaxed mb-8 sm:mb-10">
            When executed together, they create a flywheel effect: satisfied customers share their experience, influencers recommend products, search engines rank content higher, and email campaigns keep customers coming back. This multiplier effect is how FitMart achieves sustainable growth in a competitive fitness e-commerce market.
          </p>

          {/* Benefit highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <BenefitHighlight
              title="Long-term Growth"
              description="These strategies build compound advantages—each success feeds into the next, creating sustainable momentum rather than short-term spikes."
            />
            <BenefitHighlight
              title="Lower CAC, Higher LTV"
              description="Organic and referral-based strategies reduce customer acquisition cost while maintaining high customer lifetime value through repeat purchases."
            />
            <BenefitHighlight
              title="Brand Authority"
              description="Consistent marketing across channels establishes FitMart as a trusted authority in the fitness and nutrition e-commerce space."
            />
            <BenefitHighlight
              title="Customer Engagement"
              description="Multiple touchpoints keep customers engaged, informed, and excited about new products and content, increasing overall platform stickiness."
            />
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-xs text-stone-400 tracking-widest">
            These strategies form the backbone of FitMart's growth initiatives
          </p>
        </div>
      </div>
    </div>
  );
}
