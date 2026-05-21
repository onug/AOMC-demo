'use client';

import { useEffect, useRef, useState } from 'react';

interface NarrationPanelProps {
  text: string;
  stepIndex: number;
  totalSteps: number;
}

export default function NarrationPanel({ text, stepIndex, totalSteps }: NarrationPanelProps) {
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (muted || !text || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    utteranceRef.current = utterance;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    };
  }, [text, stepIndex, muted]);

  return (
    <div className="absolute bottom-12 left-0 right-0 z-40 px-4 pb-1">
      <div className="mx-auto max-w-5xl bg-gray-950/90 border border-cyan-900/60 rounded-lg px-5 py-3 backdrop-blur-sm shadow-xl">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 mt-0.5 text-xs font-bold text-cyan-600 uppercase tracking-widest">
            Narration
          </span>
          <p className="text-sm text-gray-200 leading-relaxed flex-1">
            {text}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            {speaking && !muted && (
              <span className="flex gap-0.5 items-end h-3">
                <span className="w-0.5 bg-cyan-500 rounded animate-[soundbar_0.6s_ease-in-out_infinite]" style={{ height: '40%' }} />
                <span className="w-0.5 bg-cyan-500 rounded animate-[soundbar_0.6s_ease-in-out_infinite_0.1s]" style={{ height: '100%' }} />
                <span className="w-0.5 bg-cyan-500 rounded animate-[soundbar_0.6s_ease-in-out_infinite_0.2s]" style={{ height: '60%' }} />
                <span className="w-0.5 bg-cyan-500 rounded animate-[soundbar_0.6s_ease-in-out_infinite_0.05s]" style={{ height: '80%' }} />
              </span>
            )}
            <button
              onClick={() => {
                if (!muted) window.speechSynthesis.cancel();
                setMuted(v => !v);
              }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer select-none"
              title={muted ? 'Unmute narration' : 'Mute narration'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <span className="text-xs text-gray-600 font-mono">
              {stepIndex + 1}/{totalSteps}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
