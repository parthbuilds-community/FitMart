import { motion } from 'framer-motion';

export default function SkeletonItem() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 flex gap-3 sm:gap-5"
    >
      {/* Image placeholder */}
      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-stone-100 rounded-xl shrink-0" />

      <div className="flex-1 space-y-2">
        {/* Brand */}
        <div className="h-2.5 w-16 bg-stone-100 rounded-full" />
        {/* Name */}
        <div className="h-4 w-48 bg-stone-100 rounded-full" />
        <div className="h-4 w-32 bg-stone-100 rounded-full" />
        {/* Mobile price */}
        <div className="mt-3 sm:hidden space-y-1">
          <div className="h-2.5 w-12 bg-stone-100 rounded-full" />
          <div className="h-5 w-20 bg-stone-100 rounded-full" />
        </div>
      </div>

      {/* Desktop price */}
      <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
        <div className="h-2.5 w-10 bg-stone-100 rounded-full" />
        <div className="h-6 w-20 bg-stone-100 rounded-full" />
      </div>
    </motion.div>
  );
}
