import React from 'react';
import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-2 border-stone-200 border-t-stone-900 rounded-full"
      />
    </div>
  );
}
