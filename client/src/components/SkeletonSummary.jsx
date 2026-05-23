import { motion } from 'framer-motion';

export default function SkeletonSummary() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className="bg-stone-900 rounded-2xl p-6 sm:p-8"
    >
      <div className="h-2.5 w-16 bg-stone-700 rounded-full mb-6" />

      <div className="space-y-4 mb-6">
        {/* Address block */}
        <div className="bg-stone-800 rounded-lg p-3 space-y-2">
          <div className="h-3 w-24 bg-stone-700 rounded-full" />
          <div className="h-3 w-40 bg-stone-700 rounded-full" />
          <div className="h-3 w-32 bg-stone-700 rounded-full" />
        </div>

        {/* Line items */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 w-28 bg-stone-700 rounded-full" />
            <div className="h-3 w-14 bg-stone-700 rounded-full" />
          </div>
        ))}

        <div className="h-px bg-stone-700 my-2" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <div className="h-3 w-10 bg-stone-700 rounded-full" />
          <div className="h-7 w-24 bg-stone-700 rounded-full" />
        </div>
      </div>

      {/* Button */}
      <div className="h-12 w-full bg-stone-700 rounded-full" />
    </motion.div>
  );
}
