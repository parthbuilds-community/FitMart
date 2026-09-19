import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * ScrollToTopFAB
 *
 * A floating action button that stays hidden while the user is near the
 * top of the page, then fades/slides into view (bottom-right, fixed)
 * once they've scrolled past a threshold. Clicking it smooth-scrolls
 * back to the top of the page.
 *
 * Drop it once near the root of a page (e.g. HomePage, ProductPage) —
 * it's fully self-contained and reads `window.scrollY` itself.
 *
 * Props
 * ------
 * threshold    number   Scroll distance (px) before the button appears. Default 500.
 * bottomOffset string   Tailwind bottom-* class, used to stack above other
 *                       FABs (e.g. FitnessChatBot / ReportBugButton) on
 *                       pages that already have floating widgets. Default "bottom-6".
 */
export default function ScrollToTopFAB({
    threshold = 500,
    bottomOffset = "bottom-6",
}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let ticking = false;

        const evaluate = () => {
            setVisible(window.scrollY > threshold);
            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(evaluate);
                ticking = true;
            }
        };

        // Set correct initial state (e.g. on refresh mid-scroll or back-nav).
        evaluate();

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [threshold]);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    type="button"
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                    initial={{ opacity: 0, y: 16, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.85 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`fixed right-6 ${bottomOffset} z-50 flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                    >
                        <path d="M12 19V5" />
                        <path d="M5 12l7-7 7 7" />
                    </svg>
                </motion.button>
            )}
        </AnimatePresence>
    );
}