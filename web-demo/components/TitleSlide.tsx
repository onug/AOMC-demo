'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface TitleSlideProps {
  title: string;
  subtitle?: string;
  scenario: 0 | 1 | 2;
  contributors?: boolean;
  visible: boolean;
}

export default function TitleSlide({ title, subtitle, scenario, contributors, visible }: TitleSlideProps) {
  const color = scenario === 1 ? 'text-red-500' : scenario === 2 ? 'text-green-500' : 'text-cyan-400';
  const glowClass = scenario === 1 ? 'glow-red' : scenario === 2 ? 'glow-green' : 'glow-cyan';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="text-center max-w-4xl px-8">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className={`text-5xl font-bold ${color} mb-6 tracking-tight`}>
                {title}
              </h1>
              <div className={`w-32 h-1 mx-auto mb-8 rounded-full ${glowClass}`}
                style={{ backgroundColor: scenario === 1 ? '#ef4444' : scenario === 2 ? '#22c55e' : '#06b6d4' }}
              />
            </motion.div>

            {subtitle && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-xl text-gray-300 leading-relaxed whitespace-pre-line mb-8"
              >
                {subtitle}
              </motion.div>
            )}

            {contributors && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="space-y-3 text-gray-400"
              >
                <p className="text-sm uppercase tracking-widest text-gray-500">ONUG Agentic AI Overlay Working Group</p>
                <p className="text-base">Contributors: eBay &middot; Cigna &middot; Bank of America &middot; Indeed &middot; Kraken</p>
                <p className="text-sm text-gray-500">
                  Architecture: Multi-Agent &middot; Multi-Trust-Domain
                </p>
                <p className="text-sm text-gray-500">
                  Frameworks: MAESTRO (CSA) &middot; NIST SP 800-53 AI Overlays
                </p>
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="mt-12 text-sm text-gray-600 font-[family-name:var(--font-mono)]"
            >
              Press SPACE or &rarr; to continue
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
