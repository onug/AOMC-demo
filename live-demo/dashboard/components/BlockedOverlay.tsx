'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface BlockedOverlayProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  vendorName?: string;
}

export default function BlockedOverlay({ visible, title, subtitle, vendorName }: BlockedOverlayProps) {
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
            <div className="bg-green-950/90 border-4 border-green-500 rounded-2xl px-12 py-8 glow-green backdrop-blur-sm max-w-4xl">
              <div className="flex items-center gap-5">
                <span className="text-6xl">{'\ud83d\udee1\ufe0f'}</span>
                <div>
                  <h3 className="text-green-400 font-bold text-4xl">{title}</h3>
                  {subtitle && <p className="text-green-300/80 text-xl mt-2">{subtitle}</p>}
                  {vendorName && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-purple-400 font-bold text-lg tracking-wide uppercase">
                        Protected by {vendorName}
                      </span>
                    </div>
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
