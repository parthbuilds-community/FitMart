// client\src\pages\TrackerPage.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import WorkoutCalendar from "../components/WorkoutCalendar";

/**
 * TrackerPage
 * Dedicated page for the fitness calendar.
 * Maintains FitMart's editorial layout and minimalism.
 */
export default function TrackerPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const slideUp = {
    hidden: { y: "100%" },
    visible: {
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-['DM_Sans',sans-serif] overflow-x-hidden">
      <Navbar variant="home" />

      <main className="max-w-7xl mx-auto px-5 lg:px-10 py-16">
        {/* Navigation / Header */}
        <motion.div
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/home")}
              className="text-xs tracking-[0.2em] uppercase text-stone-500 hover:text-stone-900 transition-all duration-300 mb-6 flex items-center gap-2 group px-4 py-2 border border-stone-200 hover:border-stone-400 rounded-full w-fit bg-white"
            >
              <motion.span
                className="inline-block group-hover:-translate-x-1 transition-transform duration-300"
                whileHover={{ x: -4 }}
              >
                ←
              </motion.span>
              <span>Back to Shop</span>
            </motion.button>

            <div>
              <motion.p
                className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-stone-400 mb-3 font-semibold flex items-center gap-2"
                animate={{ opacity: [0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-stone-900"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Personal Progress
              </motion.p>
              <motion.h1
                className="font-['DM_Serif_Display'] text-4xl md:text-5xl lg:text-7xl text-stone-900 leading-[1.05] tracking-tight"
                variants={fadeUp}
              >
                Workout tracker
              </motion.h1>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ delay: 0.15 }}
            className="max-w-sm md:text-right flex flex-col md:items-end mt-4 md:mt-0"
          >
            <motion.p
              className="text-sm text-stone-500 leading-relaxed bg-white border border-stone-100 p-4 rounded-2xl shadow-sm"
              whileHover={{ y: -2, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
              transition={{ duration: 0.2 }}
            >
              Plan your sessions, log your PRs, and visualize your consistency in one minimalist view. Every day counts.
            </motion.p>
          </motion.div>
        </motion.div>

        {/* The Calendar Component */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        >
          <WorkoutCalendar />
        </motion.div>
      </main>
    </div>
  );
}