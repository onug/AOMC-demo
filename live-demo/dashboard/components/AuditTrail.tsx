'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuditEntry } from '@/lib/types';

interface AuditTrailProps {
  entries: AuditEntry[];
}

function resultColor(result: string): string {
  if (result === 'ALLOWED') return 'text-green-400';
  if (result === 'SKIPPED') return 'text-yellow-400';
  return 'text-red-400';
}

function resultBg(result: string, isRogue: boolean): string {
  if (isRogue) return 'bg-red-500/10';
  if (result === 'ALLOWED') return 'bg-green-400/5';
  if (result === 'SKIPPED') return 'bg-yellow-400/5';
  return 'bg-red-400/5';
}

function isRogueAgent(agent: string): boolean {
  return agent === 'agent-ROGUE-7749' || agent === 'agent-rogue-7749';
}

export default function AuditTrail({ entries }: AuditTrailProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  if (entries.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border border-cyan-500/30 bg-gray-900/80 backdrop-blur-sm overflow-hidden"
    >
      <div className="px-3 py-2 border-b border-gray-800 flex items-center gap-2">
        <span className="text-base">{'\ud83d\udccb'}</span>
        <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
          Tamper-Evident Audit Trail
        </h2>
        <span className="text-[10px] text-gray-500 ml-auto">{entries.length} entries</span>
      </div>
      <div className="overflow-auto max-h-[280px]">
        <table className="w-full text-[11px] font-[family-name:var(--font-mono)]">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="px-3 py-1.5 text-left sticky top-0 bg-gray-900 z-10">TIME</th>
              <th className="px-3 py-1.5 text-left sticky top-0 bg-gray-900 z-10">AGENT</th>
              <th className="px-3 py-1.5 text-left sticky top-0 bg-gray-900 z-10">ACTION</th>
              <th className="px-3 py-1.5 text-left sticky top-0 bg-gray-900 z-10">RESULT</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {entries.map((entry) => {
                const rogue = isRogueAgent(entry.agent);
                return (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`border-b border-gray-800/50 ${resultBg(entry.result, rogue)} ${
                      rogue ? 'border-l-2 border-l-red-500' : ''
                    }`}
                  >
                    <td className="px-3 py-1 text-gray-500">{entry.ts}</td>
                    <td className={`px-3 py-1 font-bold ${rogue ? 'text-red-400' : 'text-gray-300'}`}>
                      {rogue && <span className="mr-1">&#x26a0;</span>}
                      {entry.agent}
                    </td>
                    <td className="px-3 py-1 text-gray-400">{entry.action}</td>
                    <td className={`px-3 py-1 font-bold ${resultColor(entry.result)}`}>{entry.result}</td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        <div ref={bottomRef} />
      </div>
    </motion.div>
  );
}
