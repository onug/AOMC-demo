'use client';

import { motion } from 'framer-motion';

interface AttackPanelProps {
  rogueRunning: boolean;
  onLaunch: () => void;
  onStop: () => void;
  onReset: () => void;
  onAllControlsOn: () => void;
  onAllControlsOff: () => void;
}

export default function AttackPanel({
  rogueRunning,
  onLaunch,
  onStop,
  onReset,
  onAllControlsOn,
  onAllControlsOff,
}: AttackPanelProps) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50">
      <div className="px-3 py-2 border-b border-gray-800">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Attack Control</h2>
      </div>
      <div className="p-3 space-y-2">
        {/* Launch / Stop */}
        {rogueRunning ? (
          <motion.button
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={onStop}
            className="w-full py-2 px-3 rounded-lg bg-yellow-600/20 border border-yellow-500/40 text-yellow-400 font-bold text-sm hover:bg-yellow-600/30 transition-colors"
          >
            {'\u25a0'} Stop Rogue Agent
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLaunch}
            className="w-full py-2 px-3 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 font-bold text-sm hover:bg-red-600/30 transition-colors"
          >
            {'\u2620\ufe0f'} Launch Rogue Agent
          </motion.button>
        )}

        {/* Status indicator */}
        <div className="flex items-center gap-2 px-2">
          <div className={`w-2 h-2 rounded-full ${rogueRunning ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-[10px] text-gray-500 uppercase">
            {rogueRunning ? 'Attack in progress' : 'Idle'}
          </span>
        </div>

        <hr className="border-gray-800" />

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onAllControlsOn}
            className="py-1.5 px-2 rounded bg-green-900/20 border border-green-500/30 text-green-400 text-[10px] font-bold hover:bg-green-900/30 transition-colors"
          >
            All Controls ON
          </button>
          <button
            onClick={onAllControlsOff}
            className="py-1.5 px-2 rounded bg-red-900/20 border border-red-500/30 text-red-400 text-[10px] font-bold hover:bg-red-900/30 transition-colors"
          >
            All Controls OFF
          </button>
        </div>

        <button
          onClick={onReset}
          className="w-full py-1.5 px-3 rounded bg-gray-800/50 border border-gray-700 text-gray-400 text-[10px] font-bold hover:bg-gray-800 transition-colors"
        >
          {'\u21ba'} Reset All State
        </button>
      </div>
    </div>
  );
}
