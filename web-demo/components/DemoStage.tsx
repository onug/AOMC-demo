'use client';

import { useReducer, useEffect, useCallback, useRef } from 'react';
import { DemoState, ControlKey, TopologyState, DamageMetrics, AuditEntry, EventEntry, Step } from '@/lib/types';
import { INITIAL_CONTROLS, INITIAL_DAMAGE, BASE_NODES, BASE_EDGES } from '@/lib/data';
import { STEPS, firstStepOfScenario } from '@/lib/steps';

import TitleSlide from './TitleSlide';
import NetworkTopology from './NetworkTopology';
import AOMCPanel from './AOMCPanel';
import EventFeed from './EventFeed';
import BlastRadius from './BlastRadius';
import AuditTrail from './AuditTrail';
import ViolationOverlay from './ViolationOverlay';
import BlockedOverlay from './BlockedOverlay';
import StepIndicator from './StepIndicator';

// ─── Reducer ──────────────────────────────────────────
type Action =
  | { type: 'GOTO_STEP'; step: number }
  | { type: 'RESET' }
  | { type: 'CLEAR_OVERLAYS' };

function buildStateForStep(targetStep: number): DemoState {
  const controls = { ...INITIAL_CONTROLS } as Record<ControlKey, boolean>;
  const damage = { ...INITIAL_DAMAGE } as DamageMetrics;
  const events: EventEntry[] = [];
  const audit: AuditEntry[] = [];
  const quarantined = new Set<string>();

  // Build topology from base
  const topology: TopologyState = {
    nodes: BASE_NODES.map(n => ({ ...n })),
    edges: BASE_EDGES.map(e => ({ ...e })),
  };

  // Replay all steps up to and including targetStep
  for (let i = 0; i <= targetStep && i < STEPS.length; i++) {
    const step = STEPS[i];
    applyStepToState(step, controls, damage, events, audit, quarantined, topology);
  }

  const currentStep = STEPS[targetStep];
  return {
    currentStep: targetStep,
    scenario: currentStep?.scenario ?? 0,
    events,
    aomcControls: controls,
    damage,
    topology,
    audit,
    quarantined,
    activeViolation: currentStep?.phase === 'violation'
      ? { number: 0, name: currentStep.title, detail: currentStep.subtitle || '' }
      : null,
    activeBlocked: currentStep?.phase === 'blocked'
      ? { number: 0, name: currentStep.title, detail: currentStep.subtitle || '' }
      : null,
  };
}

function applyStepToState(
  step: Step,
  controls: Record<ControlKey, boolean>,
  damage: DamageMetrics,
  events: EventEntry[],
  audit: AuditEntry[],
  quarantined: Set<string>,
  topology: TopologyState,
) {
  // Assign timestamps to events
  const ts = new Date();
  step.events.forEach((ev, idx) => {
    const evWithTs = { ...ev, timestamp: ev.timestamp || formatTs(ts, idx) };
    events.push(evWithTs);
  });

  // AOMC changes
  if (step.aomcChanges) {
    for (const change of step.aomcChanges) {
      controls[change.control] = change.enabled;
    }
  }

  // Damage update
  if (step.damageUpdate) {
    Object.assign(damage, step.damageUpdate);
  }

  // Audit entries
  if (step.auditEntries) {
    audit.push(...step.auditEntries);
  }

  // Topology changes
  for (const tc of step.topologyChanges) {
    switch (tc.action) {
      case 'addNode':
      case 'updateNode': {
        const existing = topology.nodes.find(n => n.id === tc.nodeId);
        if (existing && tc.props) {
          Object.assign(existing, tc.props);
        }
        break;
      }
      case 'removeNode': {
        const idx = topology.nodes.findIndex(n => n.id === tc.nodeId);
        if (idx !== -1) topology.nodes.splice(idx, 1);
        break;
      }
      case 'addEdge': {
        if (tc.props && tc.edgeId) {
          const existing = topology.edges.find(e => e.id === tc.edgeId);
          if (existing) {
            Object.assign(existing, tc.props);
          } else {
            topology.edges.push(tc.props as typeof topology.edges[0]);
          }
        }
        break;
      }
      case 'updateEdge': {
        const existing = topology.edges.find(e => e.id === tc.edgeId);
        if (existing && tc.props) {
          Object.assign(existing, tc.props);
        }
        break;
      }
      case 'removeEdge': {
        const idx = topology.edges.findIndex(e => e.id === tc.edgeId);
        if (idx !== -1) topology.edges.splice(idx, 1);
        break;
      }
    }
  }

  // Handle blocked phase — add to quarantined
  if (step.phase === 'blocked' && step.auditEntries) {
    for (const entry of step.auditEntries) {
      if (entry.result === 'REJECTED' || entry.result === 'QUARANTINED') {
        quarantined.add(entry.agent);
      }
    }
  }
}

function formatTs(base: Date, idx: number): string {
  const d = new Date(base.getTime() + idx * 100);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'GOTO_STEP':
      return buildStateForStep(Math.max(0, Math.min(action.step, STEPS.length - 1)));
    case 'RESET':
      return buildStateForStep(0);
    case 'CLEAR_OVERLAYS':
      return { ...state, activeViolation: null, activeBlocked: null };
    default:
      return state;
  }
}

// ─── Component ──────────────────────────────────────────
export default function DemoStage() {
  const [state, dispatch] = useReducer(reducer, 0, buildStateForStep);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStepData = STEPS[state.currentStep];
  const isTitle = currentStepData?.phase === 'title';
  const isS1Summary = currentStepData?.id === 's1-blast';
  const isS2Summary = currentStepData?.id === 's2-audit';

  const goToStep = useCallback((step: number) => {
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    dispatch({ type: 'GOTO_STEP', step });
  }, []);

  // Auto-clear overlays after 3s
  useEffect(() => {
    if (state.activeViolation || state.activeBlocked) {
      overlayTimerRef.current = setTimeout(() => {
        dispatch({ type: 'CLEAR_OVERLAYS' });
      }, 3000);
      return () => {
        if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
      };
    }
  }, [state.currentStep, state.activeViolation, state.activeBlocked]);

  // Keyboard handler
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Ignore if in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
        case 'ArrowRight':
          e.preventDefault();
          goToStep(state.currentStep + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToStep(state.currentStep - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          dispatch({ type: 'RESET' });
          break;
        case '1':
          e.preventDefault();
          goToStep(firstStepOfScenario(1));
          break;
        case '2':
          e.preventDefault();
          goToStep(firstStepOfScenario(2));
          break;
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state.currentStep, goToStep]);

  const aomcActive = Object.values(state.aomcControls).some(Boolean);

  return (
    <div className={`h-screen w-screen flex flex-col bg-gray-950 relative ${
      state.activeViolation ? 'animate-shake' : ''
    }`}>
      {/* Header */}
      <header className="h-12 flex-shrink-0 flex items-center justify-between px-6 border-b border-gray-800/50 bg-gray-950">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-cyan-400 tracking-wide">
            ONUG Agentic AI Overlay
          </h1>
          {state.scenario > 0 && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              state.scenario === 1 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}>
              {state.scenario === 1 ? 'CATASTROPHIC CASCADE' : 'LAYERED DEFENSE'}
            </span>
          )}
        </div>
        <div className="text-xs font-[family-name:var(--font-mono)] text-gray-600">
          Step {state.currentStep + 1} / {STEPS.length}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex gap-2 p-2 min-h-0">
        {/* Left: Event Feed */}
        <div className="w-72 flex-shrink-0">
          <EventFeed events={state.events} />
        </div>

        {/* Center: Network Topology + Audit Trail */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex-1 min-h-0">
            <NetworkTopology
              topology={state.topology}
              aomcActive={aomcActive}
              quarantined={state.quarantined}
            />
          </div>
          {isS2Summary && (
            <div className="flex-shrink-0">
              <AuditTrail entries={state.audit} visible={true} />
            </div>
          )}
        </div>

        {/* Right: AOMC Panel + Damage Metrics */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-2">
          <AOMCPanel controls={state.aomcControls} />
          <div className="flex-1 min-h-0">
            <BlastRadius
              damage={state.damage}
              blastItems={currentStepData?.blastRadius}
              isScenario1Summary={isS1Summary}
            />
          </div>
        </div>
      </main>

      {/* Footer: Step Indicator */}
      <footer className="h-10 flex-shrink-0 px-2 pb-2">
        <StepIndicator
          currentStep={state.currentStep}
          totalSteps={STEPS.length}
          scenario={state.scenario}
          stepTitle={currentStepData?.title || ''}
        />
      </footer>

      {/* Overlays */}
      <ViolationOverlay
        visible={state.activeViolation !== null}
        title={state.activeViolation?.name || ''}
        subtitle={state.activeViolation?.detail}
      />
      <BlockedOverlay
        visible={state.activeBlocked !== null}
        title={state.activeBlocked?.name || ''}
        subtitle={state.activeBlocked?.detail}
      />

      {/* Title Slide */}
      <TitleSlide
        title={currentStepData?.title || ''}
        subtitle={currentStepData?.subtitle}
        scenario={currentStepData?.scenario ?? 0}
        contributors={currentStepData?.contributors}
        visible={isTitle}
      />
    </div>
  );
}
