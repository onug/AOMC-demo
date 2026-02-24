'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ViolationOverlayProps {
  visible: boolean;
  title: string;
  subtitle?: string;
}

export default function ViolationOverlay({ visible, title, subtitle }: ViolationOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Red flash overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0.1, 0.2, 0] }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-40 bg-red-600 pointer-events-none"
          />

          {/* Violation banner */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-red-950/90 border-2 border-red-500 rounded-xl px-8 py-4 glow-red backdrop-blur-sm max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{'\u26a0\ufe0f'}</span>
                <div>
                  <h3 className="text-red-400 font-bold text-lg">{title}</h3>
                  {subtitle && (
                    <p className="text-red-300/80 text-sm mt-1">{subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
