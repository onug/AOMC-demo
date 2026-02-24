'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AuditEntry } from '@/lib/types';

interface AuditTrailProps {
  entries: AuditEntry[];
  visible: boolean;
}

function resultColor(result: string): string {
  if (result === 'ALLOWED') return 'text-green-400';
  if (result === 'SKIPPED') return 'text-yellow-400';
  return 'text-red-400';
}

function resultBg(result: string): string {
  if (result === 'ALLOWED') return 'bg-green-400/5';
  if (result === 'SKIPPED') return 'bg-yellow-400/5';
  return 'bg-red-400/5';
}

export default function AuditTrail({ entries, visible }: AuditTrailProps) {
  return (
    <AnimatePresence>
      {visible && entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg border border-cyan-500/30 bg-gray-900/80 backdrop-blur-sm overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-gray-800 flex items-center gap-2">
            <span className="text-base">{'\ud83d\udccb'}</span>
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              AOMC Tamper-Evident Audit Trail
            </h2>
          </div>
          <div className="overflow-auto max-h-[280px]">
            <table className="w-full text-[11px] font-[family-name:var(--font-mono)]">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="px-3 py-1.5 text-left">TIME</th>
                  <th className="px-3 py-1.5 text-left">AGENT</th>
                  <th className="px-3 py-1.5 text-left">ACTION</th>
                  <th className="px-3 py-1.5 text-left">RESULT</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`border-b border-gray-800/50 ${resultBg(entry.result)}`}
                  >
                    <td className="px-3 py-1 text-gray-500">{entry.ts}</td>
                    <td className="px-3 py-1 font-bold text-gray-300">{entry.agent}</td>
                    <td className="px-3 py-1 text-gray-400">{entry.action}</td>
                    <td className={`px-3 py-1 font-bold ${resultColor(entry.result)}`}>{entry.result}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
