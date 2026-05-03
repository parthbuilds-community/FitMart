import React, { useEffect } from 'react';
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { auth } from "../auth/firebase";
import { signOut } from "firebase/auth";
import { useState } from "react";

const PrivacyPolicy = () => {
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
              Legal Information
            </p>
            <h1 className="font-['DM_Serif_Display'] text-4xl sm:text-5xl md:text-6xl text-stone-900 leading-[1.15] mb-4 sm:mb-6">
              Privacy Policy
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
              We take your privacy seriously. This policy explains how FitMart collects, uses, and protects your personal information.
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
            <p className="text-xs tracking-[0.1em] uppercase text-stone-400 font-semibold mb-4">Quick Links</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Information We Collect",
                "How We Use Your Information",
                "Sharing Your Information",
                "Data Security",
                "Your Privacy Rights",
                "Contact Us"
              ].map((item, idx) => (
                <a key={idx} href={`#section-${idx + 1}`} className="text-sm text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-2">
                  <span className="text-stone-300">→</span> {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 sm:space-y-14">

          {/* Section 1 */}
          <section id="section-1" className="fade-up delay-3 scroll-mt-20">
            <div className="border-l-4 border-stone-900 pl-6 sm:pl-8">
              <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl text-stone-900 mb-4">
                1. Information We Collect
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-5">
                FitMart collects information to provide better services to our customers through various methods:
              </p>
              
              <div className="space-y-6">
                <div className="bg-stone-50 rounded-lg p-4 sm:p-5">
                  <h3 className="font-semibold text-stone-800 mb-3 text-sm sm:text-base">Information You Provide Directly</h3>
                  <ul className="space-y-2 text-sm text-stone-700">
                    <li className="flex gap-3">
                      <span className="text-stone-400 flex-shrink-0">•</span>
                      <span>Name, email address, phone number, and shipping address</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-stone-400 flex-shrink-0">•</span>
                      <span>Payment information (processed securely through third-party providers)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-stone-400 flex-shrink-0">•</span>
                      <span>Account credentials and user preferences</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-stone-400 flex-shrink-0">•</span>
                      <span>Product reviews and customer feedback</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-stone-50 rounded-lg p-4 sm:p-5">
                  <h3 className="font-semibold text-stone-800 mb-3 text-sm sm:text-base">Information Collected Automatically</h3>
                  <ul className="space-y-2 text-sm text-stone-700">
                    <li className="flex gap-3">
                      <span className="text-stone-400 flex-shrink-0">•</span>
                      <span>Device information including IP address and browser type</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-stone-400 flex-shrink-0">•</span>
                      <span>Usage data and browsing patterns</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-stone-400 flex-shrink-0">•</span>
                      <span>Location information (with your consent)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-stone-400 flex-shrink-0">•</span>
                      <span>Cookies and tracking technologies</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="fade-up scroll-mt-20">
            <div className="border-l-4 border-stone-900 pl-6 sm:pl-8">
              <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl text-stone-900 mb-4">
                2. How We Use Your Information
              </h2>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 sm:p-5 mb-5">
                <p className="text-sm text-stone-700 leading-relaxed">
                  We use your information to provide, improve, and personalize our services while maintaining your trust and security.
                </p>
              </div>
              <ul className="space-y-3 text-sm sm:text-base text-stone-600">
                <li className="flex gap-3">
                  <span className="text-stone-400 flex-shrink-0 font-bold">✓</span>
                  <span>Process and fulfill your orders including shipping and returns</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-stone-400 flex-shrink-0 font-bold">✓</span>
                  <span>Communicate with you about your account and orders</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-stone-400 flex-shrink-0 font-bold">✓</span>
                  <span>Send you marketing communications with your consent</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-stone-400 flex-shrink-0 font-bold">✓</span>
                  <span>Improve and personalize your experience on our platform</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-stone-400 flex-shrink-0 font-bold">✓</span>
                  <span>Detect and prevent fraud and security incidents</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-stone-400 flex-shrink-0 font-bold">✓</span>
                  <span>Comply with legal obligations and requirements</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="fade-up scroll-mt-20">
            <div className="border-l-4 border-stone-900 pl-6 sm:pl-8">
              <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl text-stone-900 mb-4">
                3. Sharing Your Information
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-5">
                FitMart does not sell your personal information. We may share your information in the following circumstances:
              </p>
              <div className="space-y-3">
                <div className="border border-stone-200 rounded-lg p-4 sm:p-5">
                  <p className="font-semibold text-stone-800 text-sm mb-2">Service Providers</p>
                  <p className="text-sm text-stone-600">Shipping carriers, payment processors, and analytics partners who help us operate our platform</p>
                </div>
                <div className="border border-stone-200 rounded-lg p-4 sm:p-5">
                  <p className="font-semibold text-stone-800 text-sm mb-2">Legal Requirements</p>
                  <p className="text-sm text-stone-600">To comply with applicable laws, regulations, or legal processes</p>
                </div>
                <div className="border border-stone-200 rounded-lg p-4 sm:p-5">
                  <p className="font-semibold text-stone-800 text-sm mb-2">Business Transfers</p>
                  <p className="text-sm text-stone-600">In connection with a merger, acquisition, or sale of assets</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="fade-up scroll-mt-20">
            <div className="border-l-4 border-stone-900 pl-6 sm:pl-8">
              <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl text-stone-900 mb-4">
                4. Data Security
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-5">
                FitMart implements reasonable administrative, technical, and physical safeguards to protect your personal information against unauthorized access and alteration.
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-400 rounded p-4 sm:p-5">
                <p className="text-sm text-stone-700 font-medium mb-2">Important Notice</p>
                <p className="text-sm text-stone-600 leading-relaxed">
                  While we implement industry-standard security measures, no method of transmission over the Internet is 100% secure. We regularly review and update our security practices to maintain the integrity of your information.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="fade-up scroll-mt-20">
            <div className="border-l-4 border-stone-900 pl-6 sm:pl-8">
              <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl text-stone-900 mb-4">
                5. Your Privacy Rights
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-6">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-stone-200 rounded-lg p-4 flex items-start gap-3">
                  <span className="text-stone-900 font-bold text-lg flex-shrink-0">✓</span>
                  <span className="text-sm text-stone-700">Access and receive a copy of your data</span>
                </div>
                <div className="border border-stone-200 rounded-lg p-4 flex items-start gap-3">
                  <span className="text-stone-900 font-bold text-lg flex-shrink-0">✓</span>
                  <span className="text-sm text-stone-700">Correct inaccurate information</span>
                </div>
                <div className="border border-stone-200 rounded-lg p-4 flex items-start gap-3">
                  <span className="text-stone-900 font-bold text-lg flex-shrink-0">✓</span>
                  <span className="text-sm text-stone-700">Request deletion of your data</span>
                </div>
                <div className="border border-stone-200 rounded-lg p-4 flex items-start gap-3">
                  <span className="text-stone-900 font-bold text-lg flex-shrink-0">✓</span>
                  <span className="text-sm text-stone-700">Opt out of marketing communications</span>
                </div>
              </div>
              <p className="text-sm text-stone-600 mt-6">
                To exercise these rights, please contact our Privacy Team using the information below.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="fade-up scroll-mt-20">
            <div className="border-l-4 border-stone-900 pl-6 sm:pl-8">
              <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl text-stone-900 mb-4">
                6. Contact Information
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-5">
                If you have questions or concerns about our privacy practices, please contact us:
              </p>
              <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-2">Email</p>
                  <p className="text-base text-stone-900 font-medium">privacy@fitmart.com</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-2">Phone</p>
                  <p className="text-base text-stone-900 font-medium">1-800-FITMART (Option 3)</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-2">Mailing Address</p>
                  <p className="text-base text-stone-900 font-medium">
                    Privacy Compliance Officer<br/>
                    123 Fitness Avenue<br/>
                    Mumbai, India
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer CTA */}
        <div className="mt-16 sm:mt-20 pt-8 sm:pt-12 border-t border-stone-200 fade-up">
          <div className="bg-stone-100 rounded-xl p-6 sm:p-8 text-center">
            <p className="text-sm text-stone-700 leading-relaxed max-w-2xl mx-auto">
              Your privacy is important to us. FitMart is committed to protecting and respecting your personal information while providing you with an excellent service experience.
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

export default PrivacyPolicy;
