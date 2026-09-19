// src/components/ScrollToTopFAB.jsx
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SHOW_AFTER_PX = 500;

export default function ScrollToTopFAB() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setVisible(window.scrollY > SHOW_AFTER_PX);
        };

        // In case the page is already scrolled on mount (e.g. back/forward nav)
        onScroll();

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    type="button"
                    onClick={scrollToTop}
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.9 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Scroll to top"
                    className="fixed z-50 bottom-24 right-5 w-12 h-12 bg-stone-900 text-white
                     rounded-full shadow-lg flex items-center justify-center
                     hover:bg-stone-700 transition-colors"
                >
                    <span className="text-lg leading-none">↑</span>
                </motion.button>
            )}
        </AnimatePresence>
    );
}