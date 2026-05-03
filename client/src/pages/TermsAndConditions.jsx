import React, { useEffect } from 'react';
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { auth } from "../auth/firebase";
import { signOut } from "firebase/auth";
import { useState } from "react";

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  useEffect(() => {
    // Trigger fade-up animations
    const fadeElements = document.querySelectorAll('.fade-up');
    setTimeout(() => {
      fadeElements.forEach(el => el.classList.add('visible'));
    }, 80);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        .fade-up { opacity:0; transform:translateY(16px); transition:opacity .5s ease,transform .5s ease; }
        .fade-up.visible { opacity:1; transform:translateY(0); }
        .delay-1 { transition-delay: 100ms; }
        .delay-2 { transition-delay: 200ms; }
        .delay-3 { transition-delay: 300ms; }
      `}</style>

      <Navbar
        variant="home"
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onSignOut={handleSignOut}
      />

      {/* Hero Section */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-5 lg:px-10 py-16 sm:py-20 md:py-24">
          <div className="fade-up">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3 sm:mb-4 font-medium">
              Legal Agreement
            </p>
            <h1 className="font-['DM_Serif_Display'] text-4xl sm:text-5xl md:text-6xl text-stone-900 leading-[1.15] mb-4 sm:mb-6">
              Terms & Conditions
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
              Please review these terms carefully. By accessing FitMart, you agree to be bound by these conditions and our policies.
            </p>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-stone-100 fade-up delay-1">
            <p className="text-xs sm:text-sm text-stone-500">
              <span className="font-semibold text-stone-600">Last updated:</span> April 13, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-5 lg:px-10 py-12 sm:py-16 md:py-20">

        {/* Quick Navigation */}
        <div className="mb-12 sm:mb-16 fade-up delay-2">
          <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8">
            <p className="text-xs tracking-widest uppercase text-stone-400 font-semibold mb-4">Quick Links</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Acceptance of Terms",
                "Account Registration",
                "Product Listings",
                "Orders & Payments",
                "Shipping & Delivery",
                "Intellectual Property",
                "Limitation of Liability",
                "Contact Information"
              ].map((item, idx) => (
                <a key={idx} href={`#section-${idx + 1}`} className="text-sm text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-2">
                  <span className="text-stone-300">→</span> {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Grid of Sections - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">

          {/* Section 1 */}
          <section id="section-1" className="fade-up delay-3">
            <div className="border-l-4 border-stone-900 pl-5 h-full">
              <h3 className="font-['DM_Serif_Display'] text-lg sm:text-xl text-stone-900 mb-2">
                1. Acceptance of Terms
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                By using FitMart, you agree to these Terms. We reserve the right to update them anytime.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="fade-up">
            <div className="border-l-4 border-stone-900 pl-5 h-full">
              <h3 className="font-['DM_Serif_Display'] text-lg sm:text-xl text-stone-900 mb-2">
                2. Account Registration
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                You're responsible for your account security and all activity on it. Notify us of unauthorized use immediately.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="fade-up">
            <div className="border-l-4 border-stone-900 pl-5 h-full">
              <h3 className="font-['DM_Serif_Display'] text-lg sm:text-xl text-stone-900 mb-2">
                3. Product Listings
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Prices and availability may change without notice. We reserve the right to refuse orders at incorrect prices.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="fade-up">
            <div className="border-l-4 border-stone-900 pl-5 h-full">
              <h3 className="font-['DM_Serif_Display'] text-lg sm:text-xl text-stone-900 mb-2">
                4. Orders & Payments
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Place an order as an offer to purchase. All payments are processed securely through third-party processors.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="fade-up">
            <div className="border-l-4 border-stone-900 pl-5 h-full">
              <h3 className="font-['DM_Serif_Display'] text-lg sm:text-xl text-stone-900 mb-2">
                5. Shipping & Delivery
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Delivery times are estimates. Risk transfers upon delivery to the shipping carrier.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="fade-up">
            <div className="border-l-4 border-stone-900 pl-5 h-full">
              <h3 className="font-['DM_Serif_Display'] text-lg sm:text-xl text-stone-900 mb-2">
                6. Returns & Refunds
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Accept returns within 30 days of delivery for unworn merchandise with original tags.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="fade-up">
            <div className="border-l-4 border-stone-900 pl-5 h-full">
              <h3 className="font-['DM_Serif_Display'] text-lg sm:text-xl text-stone-900 mb-2">
                7. Intellectual Property
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                All content is FitMart property. Reproduction or commercial use without permission is prohibited.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="section-8" className="fade-up">
            <div className="border-l-4 border-stone-900 pl-5 h-full">
              <h3 className="font-['DM_Serif_Display'] text-lg sm:text-xl text-stone-900 mb-2">
                8. Limitation of Liability
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                FitMart is not liable for indirect, consequential, or punitive damages from using our Platform.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section id="section-9" className="fade-up">
            <div className="border-l-4 border-stone-900 pl-5 h-full">
              <h3 className="font-['DM_Serif_Display'] text-lg sm:text-xl text-stone-900 mb-2">
                9. Governing Law
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                These Terms are governed by the laws of India, without regard to conflict of law provisions.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section id="section-10" className="fade-up">
            <div className="border-l-4 border-stone-900 pl-5 h-full">
              <h3 className="font-['DM_Serif_Display'] text-lg sm:text-xl text-stone-900 mb-2">
                10. Contact
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                <span className="block mb-1">legal@fitmart.com</span>
                <span className="block">1-800-FITMART</span>
              </p>
            </div>
          </section>

        </div>

        {/* Footer CTA */}
        <div className="mt-16 sm:mt-20 pt-8 sm:pt-12 border-t border-stone-200 fade-up">
          <div className="bg-stone-100 rounded-xl p-6 sm:p-8 text-center">
            <p className="text-sm text-stone-700 leading-relaxed max-w-2xl mx-auto">
              By using FitMart, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. If you disagree with any part, please discontinue use of the Platform.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="font-['DM_Serif_Display'] text-lg text-stone-900">FitMart</span>
            <p className="text-xs text-stone-400">© 2026 FitMart. Built at VESIT, Mumbai.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndConditions;
