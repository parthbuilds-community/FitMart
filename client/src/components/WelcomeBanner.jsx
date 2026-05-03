// src/components/WelcomeBanner.jsx
import { useEffect, useState } from "react";

export default function WelcomeBanner({ onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss?.(), 350);
  };

  return (
    <div
      style={{
        transform: visible && !leaving ? "translateY(0)" : "translateY(-100%)",
        opacity: visible && !leaving ? 1 : 0,
        transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease",
      }}
      className="w-full bg-stone-900 px-4 sm:px-5 lg:px-10 py-3 sm:py-3.5
                 flex items-center justify-between gap-3 sm:gap-4"
    >
      {/* Left: message */}
      <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0">
        <span className="text-stone-400 shrink-0 text-sm sm:text-base mt-0.5 sm:mt-0">
          ✓
        </span>
        {/* Stack on very small screens, inline on sm+ */}
        <p className="text-xs sm:text-sm text-white leading-snug">
          <span className="font-medium">Welcome to FitMart!</span>{" "}
          <span className="text-stone-300">
            Enjoy{" "}
            <span
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-white text-sm sm:text-base"
            >
              10% off
            </span>{" "}
            your first order
            {/* Hide secondary text on very small screens to save space */}
            <span className="hidden xs:inline">
              {" "}— applied automatically at checkout
            </span>
            .
          </span>
        </p>
      </div>

      {/* Right: dismiss — large tap target */}
      <button
        onClick={dismiss}
        aria-label="Dismiss welcome banner"
        className="shrink-0 text-stone-500 hover:text-white transition-colors
                   text-xl leading-none min-w-9 min-h-9 flex items-center
                   justify-center rounded-full hover:bg-white/10 active:scale-95"
      >
        ×
      </button>
    </div>
  );
}