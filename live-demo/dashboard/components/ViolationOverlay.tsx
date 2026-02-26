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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0.1, 0.2, 0] }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-40 bg-red-600 pointer-events-none"
          />
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-red-950/90 border-4 border-red-500 rounded-2xl px-12 py-8 glow-red backdrop-blur-sm max-w-4xl">
              <div className="flex items-center gap-5">
                <span className="text-6xl">{'\u26a0\ufe0f'}</span>
                <div>
                  <h3 className="text-red-400 font-bold text-4xl">{title}</h3>
                  {subtitle && <p className="text-red-300/80 text-xl mt-2">{subtitle}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
