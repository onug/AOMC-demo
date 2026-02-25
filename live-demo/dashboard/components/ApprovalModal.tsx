'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ApprovalRequest } from '@/lib/types';

interface ApprovalModalProps {
  requests: ApprovalRequest[];
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
}

export default function ApprovalModal({ requests, onApprove, onDeny }: ApprovalModalProps) {
  return (
    <AnimatePresence>
      {requests.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gray-900 border-2 border-amber-500/60 rounded-xl p-6 max-w-lg w-full mx-4 glow-orange"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{'\u23f3'}</span>
              <div>
                <h3 className="text-amber-400 font-bold text-lg">Human Approval Required</h3>
                <p className="text-gray-400 text-sm">Autonomy Governance — HIGH-risk action needs human decision</p>
              </div>
            </div>

            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-400 font-bold text-sm">{req.agent_id}</span>
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">
                      {req.risk}
                    </span>
                  </div>
                  <div className="text-gray-300 text-sm mb-3 font-[family-name:var(--font-mono)]">
                    Tool: <span className="text-amber-400 font-bold">{req.tool_name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onDeny(req.id)}
                      className="flex-1 py-2 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 font-bold text-sm hover:bg-red-600/30 transition-colors"
                    >
                      {'\u2717'} Deny
                    </button>
                    <button
                      onClick={() => onApprove(req.id)}
                      className="flex-1 py-2 rounded-lg bg-green-600/20 border border-green-500/40 text-green-400 font-bold text-sm hover:bg-green-600/30 transition-colors"
                    >
                      {'\u2713'} Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
