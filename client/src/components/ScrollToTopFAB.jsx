import { useState, useEffect, useCallback } from "react";

/**
 * ScrollToTopFAB — Floating Action Button that appears after scrolling
 * past a threshold and smoothly scrolls back to the top on click.
 *
 * @param {Object} props
 * @param {number} [props.threshold=500] - Scroll Y threshold to show the button
 * @param {number} [props.size=44] - Button diameter in px
 * @param {string} [props.position="bottom-6 right-6"] - Tailwind position classes
 */
export default function ScrollToTopFAB({
  threshold = 500,
  size = 44,
  position = "bottom-6 right-6",
}) {
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > threshold);
  }, [threshold]);

  useEffect(() => {
    // Check initial scroll position in case page loads mid-scroll
    setVisible(window.scrollY > threshold);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll, threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sizeStyle = { width: size, height: size };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      tabIndex={visible ? 0 : -1}
      style={sizeStyle}
      className={`
        fixed ${position} z-50
        flex items-center justify-center
        rounded-full bg-stone-900 text-white
        shadow-lg shadow-stone-900/20
        transition-all duration-300 ease-out
        hover:bg-stone-800 hover:shadow-xl hover:shadow-stone-900/30
        hover:-translate-y-0.5
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400
        focus-visible:ring-offset-2
        active:scale-95
        ${visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
        }
      `}
    >
      {/* Chevron-up icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ width: size * 0.45, height: size * 0.45 }}
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
