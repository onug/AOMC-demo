'use client';

import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  scenario: 0 | 1 | 2;
  stepTitle: string;
}

export default function StepIndicator({ currentStep, totalSteps, scenario, stepTitle }: StepIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const scenarioLabel = scenario === 0
    ? ''
    : scenario === 1
    ? 'SCENARIO 1: CATASTROPHIC CASCADE'
    : 'SCENARIO 2: LAYERED DEFENSE';

  const scenarioColor = scenario === 1 ? 'text-red-400' : scenario === 2 ? 'text-green-400' : 'text-cyan-400';
  const barColor = scenario === 1 ? 'bg-red-500' : scenario === 2 ? 'bg-green-500' : 'bg-cyan-500';

  return (
    <div className="h-full flex items-center gap-4 px-4 bg-gray-900/50 rounded-lg border border-gray-800">
      {/* Keyboard hints */}
      <div className="flex items-center gap-2 text-gray-600 text-[10px] font-[family-name:var(--font-mono)] flex-shrink-0">
        <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 border border-gray-700">&larr;</kbd>
        <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 border border-gray-700">&rarr;</kbd>
        <span>navigate</span>
        <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 border border-gray-700">F</kbd>
        <span>fullscreen</span>
        <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 border border-gray-700">R</kbd>
        <span>reset</span>
      </div>

      {/* Scenario label */}
      {scenarioLabel && (
        <span className={`text-[10px] font-bold uppercase tracking-wider ${scenarioColor} flex-shrink-0`}>
          {scenarioLabel}
        </span>
      )}

      {/* Step title (truncated) */}
      <span className="text-xs text-gray-400 truncate flex-1 min-w-0">
        {stepTitle}
      </span>

      {/* Progress bar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${barColor} rounded-full`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[11px] font-[family-name:var(--font-mono)] text-gray-500 w-10 text-right">
          {currentStep + 1}/{totalSteps}
        </span>
      </div>
    </div>
  );
}
