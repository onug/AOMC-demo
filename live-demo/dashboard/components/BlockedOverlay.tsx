'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface BlockedOverlayProps {
  visible: boolean;
  title: string;
  subtitle?: string;
}

export default function BlockedOverlay({ visible, title, subtitle }: BlockedOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0.05, 0] }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-40 bg-green-500 pointer-events-none"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.8] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="text-8xl opacity-30">{'\ud83d\udee1\ufe0f'}</div>
          </motion.div>
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-green-950/90 border-2 border-green-500 rounded-xl px-8 py-4 glow-green backdrop-blur-sm max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{'\ud83d\udee1\ufe0f'}</span>
                <div>
                  <h3 className="text-green-400 font-bold text-lg">{title}</h3>
                  {subtitle && <p className="text-green-300/80 text-sm mt-1">{subtitle}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
