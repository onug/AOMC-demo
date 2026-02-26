'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DamageMetrics } from '@/lib/types';

interface BlastRadiusProps {
  damage: DamageMetrics;
  blastItems?: string[];
  isScenario1Summary?: boolean;
}

function AnimatedNumber({ value, label }: { value: number | string; label: string }) {
  const [displayed, setDisplayed] = useState<number | string>(typeof value === 'number' ? 0 : '$0');
  const [pulsing, setPulsing] = useState(false);
  const prevValue = useRef<number | string>(typeof value === 'number' ? 0 : '$0');

  useEffect(() => {
    if (typeof value === 'string') {
      // Detect 0-string to non-zero-string transition (e.g. '$0' -> '$50M+')
      const wasZero = prevValue.current === '$0' || prevValue.current === '0h' || prevValue.current === 0;
      const isNonZero = value !== '$0' && value !== '0h';
      if (wasZero && isNonZero) {
        setPulsing(true);
        setTimeout(() => setPulsing(false), 600);
      }
      prevValue.current = value;
      setDisplayed(value);
      return;
    }
    if (value === 0) { setDisplayed(0); prevValue.current = 0; return; }

    // Trigger pulse when value transitions from 0 to non-zero
    if ((prevValue.current === 0 || prevValue.current === '$0') && value > 0) {
      setPulsing(true);
      setTimeout(() => setPulsing(false), 600);
    }
    prevValue.current = value;

    const duration = 800;
    const steps = 20;
    const increment = value / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setDisplayed(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const isZero = displayed === 0 || displayed === '$0' || displayed === '0h';
  return (
    <div className={`text-center ${isZero ? 'opacity-40' : ''}`}>
      <div className={`text-lg font-bold font-[family-name:var(--font-mono)] ${
        isZero ? 'text-gray-600' : 'text-red-400'
      } ${pulsing ? 'animate-count-pulse' : ''}`}>
        {typeof displayed === 'number' ? displayed.toLocaleString() : displayed}
      </div>
      <div className="text-[10px] text-gray-500 uppercase">{label}</div>
    </div>
  );
}

export default function BlastRadius({ damage, blastItems, isScenario1Summary }: BlastRadiusProps) {
  return (
    <div className={`rounded-lg border bg-gray-900/50 ${
      isScenario1Summary ? 'border-red-500/40 glow-red' : 'border-gray-800'
    }`}>
      <div className="px-3 py-2 border-b border-gray-800">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
          {isScenario1Summary ? 'BLAST RADIUS' : 'Damage Metrics'}
        </h2>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-3 gap-3 mb-3">
          <AnimatedNumber value={damage.recordsExfiltrated} label="PII Leaked" />
          <AnimatedNumber value={damage.pciRecordsExfiltrated} label="PCI Cards" />
          <AnimatedNumber value={damage.toolsAbused} label="Tools Abused" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <AnimatedNumber value={damage.damageUSD} label="Est. Damage" />
          <AnimatedNumber value={damage.regulatoryFines} label="Reg. Fines" />
        </div>

        {damage.sessionsHijacked > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <AnimatedNumber value={damage.sessionsHijacked} label="Sessions Hijacked" />
            <AnimatedNumber value={damage.firewallRulesDestroyed} label="FW Rules Lost" />
          </div>
        )}

        {damage.recoveryTime !== '0h' && (
          <div className="text-center py-1">
            <span className="text-xs text-gray-500">Recovery: </span>
            <span className="text-sm font-bold text-red-400 font-[family-name:var(--font-mono)]">{damage.recoveryTime}</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {blastItems && blastItems.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-3 pb-3 space-y-1 border-t border-gray-800 pt-2"
          >
            {blastItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`text-[11px] font-[family-name:var(--font-mono)] flex items-start gap-1.5 ${
                  isScenario1Summary ? 'text-red-400' : 'text-green-400'
                }`}
              >
                <span className="flex-shrink-0 mt-0.5">{isScenario1Summary ? '\u2022' : '\u2713'}</span>
                <span>{item}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
