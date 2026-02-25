'use client';

import { useEffect, useRef, useState } from 'react';
import { DamageMetrics } from '@/lib/types';

interface BlastRadiusProps {
  damage: DamageMetrics;
}

function AnimatedNumber({ value, label }: { value: number; label: string }) {
  const [displayed, setDisplayed] = useState(0);
  const [pulsing, setPulsing] = useState(false);
  const prevValue = useRef(0);

  useEffect(() => {
    if (value === 0) { setDisplayed(0); prevValue.current = 0; return; }

    // Trigger pulse when value transitions from 0 to non-zero
    if (prevValue.current === 0 && value > 0) {
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

  const isZero = displayed === 0;
  return (
    <div className={`text-center ${isZero ? 'opacity-40' : ''}`}>
      <div className={`text-lg font-bold font-[family-name:var(--font-mono)] ${
        isZero ? 'text-gray-600' : 'text-red-400'
      } ${pulsing ? 'animate-count-pulse' : ''}`}>
        {displayed.toLocaleString()}
      </div>
      <div className="text-[10px] text-gray-500 uppercase">{label}</div>
    </div>
  );
}

export default function BlastRadius({ damage }: BlastRadiusProps) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50">
      <div className="px-3 py-2 border-b border-gray-800">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Damage Metrics</h2>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-3 gap-3">
          <AnimatedNumber value={damage.recordsExfiltrated} label="PII Leaked" />
          <AnimatedNumber value={damage.pciRecordsExfiltrated} label="PCI Cards" />
          <AnimatedNumber value={damage.toolsAbused} label="Tools Abused" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <AnimatedNumber value={damage.sessionsHijacked} label="Sessions Hijacked" />
          <AnimatedNumber value={damage.firewallRulesDestroyed} label="FW Rules Lost" />
        </div>
      </div>
    </div>
  );
}
