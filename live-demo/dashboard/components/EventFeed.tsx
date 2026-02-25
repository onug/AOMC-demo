'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveEvent } from '@/lib/types';

interface EventFeedProps {
  events: LiveEvent[];
  attackPhase: number | null;
  rogueRunning: boolean;
}

function eventColor(type: string): string {
  if (type.includes('REJECTED') || type.includes('QUARANTINED') || type === 'violation') return 'text-red-400';
  if (type.includes('BLOCKED') || type === 'blocked') return 'text-green-400';
  if (type === 'enable') return 'text-orange-400';
  if (type === 'disable') return 'text-yellow-400';
  if (type === 'approval_required') return 'text-amber-400';
  if (type === 'info') return 'text-cyan-400';
  return 'text-gray-400';
}

function eventIcon(type: string): string {
  if (type.includes('REJECTED') || type.includes('QUARANTINED') || type === 'violation') return '\u26a0';
  if (type.includes('BLOCKED') || type === 'blocked') return '\ud83d\udee1';
  if (type === 'enable') return '\u2713';
  if (type === 'disable') return '\u2717';
  if (type === 'approval_required') return '\u23f3';
  if (type === 'info') return '\u25b6';
  return '\u203a';
}

function formatEvent(ev: LiveEvent): string {
  if (ev.message) return ev.message;
  if (ev.detail) return ev.detail;
  return `${ev.type}: ${ev.result || 'unknown'}`;
}

const PHASE_MAESTRO: Record<number, string> = {
  1: 'Identity & Zero Trust',
  2: 'Rogue Agent Detection',
  3: 'Data Exfil Prevention',
  4: 'Cross-Domain Trust',
  5: 'Access Control',
  6: 'Governance & Audit',
};

export default function EventFeed({ events, attackPhase, rogueRunning }: EventFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  // Determine color from event result or type
  function resolveColor(ev: LiveEvent): string {
    if (ev.result === 'REJECTED' || ev.result === 'QUARANTINED') return 'text-red-400';
    if (ev.result === 'BLOCKED') return 'text-green-400';
    if (ev.result === 'PENDING') return 'text-amber-400';
    if (ev.result === 'ALLOWED' || ev.result === 'SKIPPED') return 'text-gray-500';
    return eventColor(ev.type);
  }

  function isRogueEvent(ev: LiveEvent): boolean {
    return ev.agent === 'agent-ROGUE-7749' || ev.agent === 'agent-rogue-7749';
  }

  return (
    <div className="h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-800">
      <div className="px-3 py-2 border-b border-gray-800 flex-shrink-0 flex items-center gap-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Live Event Feed</h2>
        {attackPhase !== null && (
          <span className="ml-auto text-[10px] font-bold text-orange-400 animate-pulse">
            PHASE {attackPhase}/6
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-1 font-[family-name:var(--font-mono)] text-[11px] leading-relaxed space-y-0.5">
        <AnimatePresence initial={false}>
          {events.map((ev, i) => {
            // --- Narrative: attack_phase banner ---
            if (ev.type === 'attack_phase') {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="my-1.5 rounded-md bg-orange-500/15 border border-orange-500/40 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-black text-[10px] font-black flex-shrink-0">
                      {ev.phase}
                    </span>
                    <span className="font-bold text-orange-300 text-xs uppercase tracking-wide">
                      {ev.title}
                    </span>
                  </div>
                  {ev.phase && PHASE_MAESTRO[ev.phase] && (
                    <div className="ml-7 mt-1">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        MAESTRO: {PHASE_MAESTRO[ev.phase]}
                      </span>
                    </div>
                  )}
                  {ev.detail && (
                    <div className="text-orange-400/70 text-[10px] mt-0.5 ml-7">
                      {ev.detail}
                    </div>
                  )}
                </motion.div>
              );
            }

            // --- Narrative: attack_success (violation) ---
            if (ev.type === 'attack_success') {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="my-1 rounded border-l-2 border-red-500 bg-red-500/10 px-2 py-1.5"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-400">&#x1F4A5;</span>
                    <span className="font-bold text-red-300 text-[11px]">{ev.title}</span>
                  </div>
                  {ev.detail && (
                    <div className="text-red-400/70 text-[10px] mt-0.5 ml-5">
                      {ev.detail}
                    </div>
                  )}
                </motion.div>
              );
            }

            // --- Narrative: attack_blocked ---
            if (ev.type === 'attack_blocked') {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="my-1 rounded border-l-2 border-green-500 bg-green-500/10 px-2 py-1.5"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-green-400">&#x1F6E1;&#xFE0F;</span>
                    <span className="font-bold text-green-300 text-[11px]">{ev.title}</span>
                  </div>
                  {ev.detail && (
                    <div className="text-green-400/70 text-[10px] mt-0.5 ml-5">
                      {ev.detail}
                    </div>
                  )}
                </motion.div>
              );
            }

            // --- Raw events ---
            const rogue = isRogueEvent(ev);
            const dimmed = rogueRunning && ev.type === 'action' && !rogue;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: dimmed ? 0.3 : 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`${resolveColor(ev)} py-0.5 flex ${
                  rogue ? 'border-l-2 border-l-red-500 bg-red-500/10 pl-1 rounded-r' : ''
                }`}
              >
                <span className="w-4 flex-shrink-0 text-center">{eventIcon(ev.type)}</span>
                <span className="flex-1 min-w-0">
                  {ev.timestamp && <span className="text-gray-600 mr-1">{ev.timestamp}</span>}
                  {ev.agent && (
                    <span className={`font-bold mr-1 ${rogue ? 'text-red-400' : ''}`}>
                      {rogue && <span className="mr-0.5">&#x26a0;</span>}
                      {ev.agent}:
                    </span>
                  )}
                  {formatEvent(ev)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
