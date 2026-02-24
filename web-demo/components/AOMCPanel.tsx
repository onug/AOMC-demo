'use client';

import { motion } from 'framer-motion';
import { ControlKey } from '@/lib/types';
import { CONTROLS } from '@/lib/data';

interface AOMCPanelProps {
  controls: Record<ControlKey, boolean>;
}

export default function AOMCPanel({ controls }: AOMCPanelProps) {
  const anyActive = Object.values(controls).some(Boolean);

  return (
    <div className={`rounded-lg border transition-all duration-500 ${
      anyActive ? 'border-orange-500/60 glow-orange' : 'border-gray-800'
    } bg-gray-900/50`}>
      <div className="px-3 py-2 border-b border-gray-800 flex items-center gap-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">AOMC Controls</h2>
        {anyActive && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full font-bold"
          >
            ACTIVE
          </motion.span>
        )}
      </div>
      <div className="p-2 space-y-1.5">
        {CONTROLS.map((ctrl) => {
          const isOn = controls[ctrl.key];
          return (
            <motion.div
              key={ctrl.key}
              layout
              className={`flex items-center gap-2 px-2 py-1.5 rounded transition-all duration-500 ${
                isOn ? 'bg-green-500/10' : 'bg-gray-800/30'
              }`}
            >
              {/* Toggle indicator */}
              <div className={`relative w-8 h-4 rounded-full transition-all duration-500 flex-shrink-0 ${
                isOn ? 'bg-green-500' : 'bg-red-900/60'
              }`}>
                <motion.div
                  animate={{ x: isOn ? 16 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full ${
                    isOn ? 'bg-white' : 'bg-red-400'
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-bold ${isOn ? 'text-green-400' : 'text-gray-400'}`}>
                    {ctrl.number}
                  </span>
                  <span className={`text-[11px] font-medium truncate ${isOn ? 'text-green-300' : 'text-gray-400'}`}>
                    {ctrl.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-bold ${
                    ctrl.pollPct >= 90 ? 'text-red-400' : ctrl.pollPct >= 70 ? 'text-yellow-400' : 'text-gray-500'
                  }`}>
                    {ctrl.pollPct}%
                  </span>
                  <span className="text-[9px] text-gray-600 uppercase">{ctrl.maestroLayer}</span>
                </div>
              </div>

              {isOn && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-400 text-xs flex-shrink-0"
                >
                  \u2713
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
