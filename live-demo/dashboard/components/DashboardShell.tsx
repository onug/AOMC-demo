'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ControlKey, LiveEvent, AuditEntry, ApprovalRequest, DamageMetrics, TopologyNode, TopologyEdge } from '@/lib/types';
import { useEventStream } from '@/lib/ws';
import * as api from '@/lib/api';
import { BASE_NODES, BASE_EDGES } from '@/lib/data';

import NetworkTopology from './NetworkTopology';
import AOMCPanel from './AOMCPanel';
import EventFeed from './EventFeed';
import AuditTrail from './AuditTrail';
import BlastRadius from './BlastRadius';
import AttackPanel from './AttackPanel';
import ApprovalModal from './ApprovalModal';
import ViolationOverlay from './ViolationOverlay';
import BlockedOverlay from './BlockedOverlay';
import ContainerStatus from './ContainerStatus';

const INITIAL_CONTROLS: Record<ControlKey, boolean> = {
  identity_attestation: false,
  runtime_monitoring: false,
  data_guardrails: false,
  zero_trust: false,
  tool_authorization: false,
  autonomy_governance: false,
};

// Map agent IDs to the topology edges they activate
const AGENT_EDGE_MAP: Record<string, string[]> = {
  'agent-infra-monitor': ['e-infra-metrics', 'e-infra-noc'],
  'agent-noc-responder': ['e-noc-logs'],
  'agent-data-analyst': ['e-analyst-db'],
  'agent-partner-api': ['e-partner-ext'],
};

const EDGE_DECAY_MS = 4000;

// Map attack phases to the rogue edges that should appear for each
const OVERLAY_MS = Number(process.env.NEXT_PUBLIC_OVERLAY_MS || '3000');

const PHASE_ROGUE_EDGES: Record<number, TopologyEdge[]> = {
  1: [
    { id: 'e-rogue-infra', from: 'agent-ROGUE-7749', to: 'agent-infra-monitor', type: 'malicious', visible: true, animated: true },
  ],
  2: [
    { id: 'e-rogue-metrics', from: 'agent-ROGUE-7749', to: 'metrics-store', type: 'malicious', visible: true, animated: true },
  ],
  3: [
    { id: 'e-rogue-db', from: 'agent-ROGUE-7749', to: 'customer-db', type: 'malicious', visible: true, animated: true },
  ],
  4: [
    { id: 'e-rogue-partner', from: 'agent-ROGUE-7749', to: 'agent-partner-api', type: 'malicious', visible: true, animated: true },
  ],
  5: [
    { id: 'e-rogue-tool-fw', from: 'agent-ROGUE-7749', to: 'tool-firewall', type: 'malicious', visible: true, animated: true },
    { id: 'e-rogue-tool-bgp', from: 'agent-ROGUE-7749', to: 'tool-bgp', type: 'malicious', visible: true, animated: true },
    { id: 'e-rogue-tool-auth', from: 'agent-ROGUE-7749', to: 'tool-auth', type: 'malicious', visible: true, animated: true },
    { id: 'e-rogue-tool-audit', from: 'agent-ROGUE-7749', to: 'tool-audit', type: 'malicious', visible: true, animated: true },
  ],
  6: [
    { id: 'e-rogue-audit', from: 'agent-ROGUE-7749', to: 'audit-logs', type: 'malicious', visible: true, animated: true },
  ],
};

// Map attack phases to the control that blocks them
const PHASE_CONTROL_MAP: Record<number, ControlKey> = {
  1: 'identity_attestation',
  2: 'runtime_monitoring',
  3: 'data_guardrails',
  4: 'zero_trust',
  5: 'tool_authorization',
  6: 'autonomy_governance',
};

const INITIAL_DAMAGE: DamageMetrics = {
  recordsExfiltrated: 0,
  pciRecordsExfiltrated: 0,
  toolsAbused: 0,
  damageUSD: '$0',
  regulatoryFines: '$0',
  recoveryTime: '0h',
  sessionsHijacked: 0,
  firewallRulesDestroyed: 0,
};

export default function DashboardShell() {
  const [controls, setControls] = useState<Record<ControlKey, boolean>>(INITIAL_CONTROLS);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [damage, setDamage] = useState<DamageMetrics>(INITIAL_DAMAGE);
  const [rogueRunning, setRogueRunning] = useState(false);
  const [quarantined, setQuarantined] = useState<Set<string>>(new Set());
  const [nodes, setNodes] = useState<TopologyNode[]>(BASE_NODES);
  const [edges, setEdges] = useState<TopologyEdge[]>(BASE_EDGES);
  const [loading, setLoading] = useState(false);
  const [compromised, setCompromised] = useState<Map<string, string>>(new Map());
  const [activeEdges, setActiveEdges] = useState<Set<string>>(new Set());
  const edgeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Attack narrative state
  const [attackPhase, setAttackPhase] = useState<number | null>(null);
  const [enforcingControl, setEnforcingControl] = useState<ControlKey | null>(null);
  const enforcingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Overlay states
  const [violation, setViolation] = useState<{ title: string; subtitle?: string } | null>(null);
  const [blocked, setBlocked] = useState<{ title: string; subtitle?: string } | null>(null);
  const violationTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const blockedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const blockedEdgeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Show violation overlay briefly
  const flashViolation = useCallback((title: string, subtitle?: string) => {
    clearTimeout(violationTimer.current);
    setViolation({ title, subtitle });
    violationTimer.current = setTimeout(() => setViolation(null), OVERLAY_MS);
  }, []);

  // Show blocked overlay briefly
  const flashBlocked = useCallback((title: string, subtitle?: string) => {
    clearTimeout(blockedTimer.current);
    setBlocked({ title, subtitle });
    blockedTimer.current = setTimeout(() => setBlocked(null), OVERLAY_MS);
  }, []);

  // Process incoming WebSocket events
  const handleEvent = useCallback((event: LiveEvent) => {
    setEvents(prev => [...prev.slice(-200), event]);

    // Handle narrative attack events (early return — don't interfere with raw logic)
    if (event.type === 'attack_phase') {
      setAttackPhase(event.phase ?? null);
      const phase = event.phase;
      // Show tool nodes when phase 5 starts
      if (phase === 5) {
        setNodes(prev => prev.map(n => n.type === 'tool' ? { ...n, visible: true } : n));
      }
      // Swap active rogue edges to this phase's target, but keep blocked edges visible
      const phaseEdges = phase ? PHASE_ROGUE_EDGES[phase] : undefined;
      setEdges(prev => {
        const keep = prev.filter(e => !e.id.startsWith('e-rogue') || e.type === 'blocked');
        return phaseEdges ? [...keep, ...phaseEdges] : keep;
      });
      return;
    }
    if (event.type === 'attack_success') {
      flashViolation(event.title || 'CONTROL BYPASSED', event.detail);
      // Mark target nodes as compromised and escalate $ damage based on attack phase
      const phase = event.phase;
      if (phase === 3) {
        setCompromised(prev => new Map(prev).set('customer-db', '100K PCI RECORDS EXFILTRATED'));
        setDamage(prev => ({ ...prev, damageUSD: '$50M+', regulatoryFines: '\u20AC20M+' }));
      } else if (phase === 4) {
        setCompromised(prev => new Map(prev).set('agent-partner-api', 'TRUST BOUNDARY BREACHED'));
        setDamage(prev => ({ ...prev, damageUSD: '$150M+' }));
      } else if (phase === 5) {
        setCompromised(prev => {
          const next = new Map(prev);
          next.set('tool-firewall', 'UNAUTHORIZED EXECUTION');
          next.set('tool-bgp', 'UNAUTHORIZED EXECUTION');
          next.set('tool-auth', 'UNAUTHORIZED EXECUTION');
          next.set('tool-audit', 'UNAUTHORIZED EXECUTION');
          return next;
        });
        setDamage(prev => ({ ...prev, damageUSD: '$300M+' }));
      } else if (phase === 6) {
        setCompromised(prev => new Map(prev).set('audit-logs', 'AUTONOMOUS DESTRUCTION'));
        setDamage(prev => ({ ...prev, damageUSD: '$500M+', recoveryTime: '72+ hours' }));
      }
      return;
    }
    if (event.type === 'attack_blocked') {
      flashBlocked(event.title || 'ATTACK BLOCKED', event.detail);
      // Flash the enforcing control badge
      if (event.phase && PHASE_CONTROL_MAP[event.phase]) {
        clearTimeout(enforcingTimer.current);
        setEnforcingControl(PHASE_CONTROL_MAP[event.phase]);
        enforcingTimer.current = setTimeout(() => setEnforcingControl(null), OVERLAY_MS);
      }
      // Convert active rogue edges to blocked — they stay visible to accumulate all failed attempts
      setEdges(prev => prev.map(e =>
        e.id.startsWith('e-rogue') && e.type !== 'blocked'
          ? { ...e, type: 'blocked' as const, animated: false }
          : e
      ));
      return;
    }

    // Activate edges when agent traffic is detected
    const agentEdges = AGENT_EDGE_MAP[event.agent || ''];
    if (agentEdges) {
      setActiveEdges(prev => {
        const next = new Set(prev);
        agentEdges.forEach(id => next.add(id));
        return next;
      });
      // Set decay timers to deactivate edges after timeout
      agentEdges.forEach(edgeId => {
        const existing = edgeTimers.current.get(edgeId);
        if (existing) clearTimeout(existing);
        edgeTimers.current.set(edgeId, setTimeout(() => {
          setActiveEdges(prev => {
            const next = new Set(prev);
            next.delete(edgeId);
            return next;
          });
          edgeTimers.current.delete(edgeId);
        }, EDGE_DECAY_MS));
      });
    }

    // Update topology and state based on event type
    const result = event.result || '';
    const agent = event.agent || '';

    if (result === 'REJECTED' || result === 'QUARANTINED') {
      setQuarantined(prev => new Set([...prev, agent]));
      flashViolation(
        `${event.type.replace('_', ' ').toUpperCase()}: ${result}`,
        event.detail,
      );
    }

    if (result === 'BLOCKED') {
      flashBlocked(
        `BLOCKED: ${event.type.replace('_', ' ').toUpperCase()}`,
        event.detail,
      );
    }

    if (result === 'PENDING') {
      // Refresh approvals
      api.getPendingApprovals().then(a => setApprovals(a as unknown as ApprovalRequest[])).catch(() => {});
    }

    // Update damage metrics from tool check results (SKIPPED = control off, attack succeeded)
    if (event.type === 'tool_check' && result !== 'BLOCKED' && result !== 'PENDING') {
      const tool = event.tool_name || event.detail || '';
      setDamage(prev => {
        const next = { ...prev };
        if (tool.includes('firewall')) next.firewallRulesDestroyed = 2847;
        if (tool.includes('auth_tokens')) next.sessionsHijacked = 4821;
        if (tool.includes('bgp') || tool.includes('audit') || tool.includes('shutdown') || tool.includes('disable') || tool.includes('broadcast') || tool.includes('identity_provider')) {
          next.toolsAbused = prev.toolsAbused + 1;
        }
        return next;
      });
    }

    if (event.type === 'data_check' && result !== 'BLOCKED') {
      if (event.detail?.includes('PCI')) {
        setDamage(prev => ({ ...prev, pciRecordsExfiltrated: 100000 }));
      }
      if (event.detail?.includes('PII')) {
        setDamage(prev => ({ ...prev, recordsExfiltrated: 5 }));
      }
    }

    // Track rogue agent activation on topology
    if (agent === 'agent-ROGUE-7749' || agent === 'agent-rogue-7749') {
      setNodes(prev => prev.map(n =>
        n.id === 'agent-ROGUE-7749' ? { ...n, visible: true } : n
      ));
    }

    // Enable/disable control events
    if (event.type === 'enable' || event.type === 'disable') {
      api.getControls().then(c => setControls(c as Record<ControlKey, boolean>)).catch(() => {});
    }
  }, [flashViolation, flashBlocked]);

  const { connected } = useEventStream(handleEvent);

  // Load initial state
  useEffect(() => {
    api.getControls().then(c => setControls(c as Record<ControlKey, boolean>)).catch(() => {});
    api.getAudit().then(entries => {
      setAudit(entries.map((e, i) => ({ ...e, id: i } as unknown as AuditEntry)));
    }).catch(() => {});

    // Poll audit trail periodically
    const interval = setInterval(() => {
      api.getAudit().then(entries => {
        setAudit(entries.map((e, i) => ({ ...e, id: i } as unknown as AuditEntry)));
      }).catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Poll rogue status
  useEffect(() => {
    const interval = setInterval(() => {
      api.getRogueStatus().then(s => {
        setRogueRunning(prev => {
          if (prev && !s.running) {
            setAttackPhase(null);
            setEdges(e => e.filter(edge => !edge.id.startsWith('e-rogue')));
            setNodes(n => n.map(node =>
              node.id === 'agent-ROGUE-7749' || node.type === 'tool' ? { ...node, visible: false } : node
            ));
          }
          return s.running;
        });
      }).catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- Actions ---
  const handleToggle = useCallback(async (key: ControlKey) => {
    setLoading(true);
    try {
      const result = await api.toggleControl(key);
      setControls(prev => ({ ...prev, [key]: result.enabled }));
    } catch {
      // Ignore errors
    }
    setLoading(false);
  }, []);

  const handleLaunch = useCallback(async () => {
    await api.triggerRogue();
    setRogueRunning(true);
    // Show rogue node on topology (edges added per-phase via attack_phase events)
    setNodes(prev => prev.map(n =>
      n.id === 'agent-ROGUE-7749' ? { ...n, visible: true } : n
    ));
  }, []);

  const handleStop = useCallback(async () => {
    await api.stopRogue();
    setRogueRunning(false);
    setAttackPhase(null);
    // Remove rogue edges and hide rogue/tool nodes
    setEdges(prev => prev.filter(e => !e.id.startsWith('e-rogue')));
    setNodes(prev => prev.map(n =>
      n.id === 'agent-ROGUE-7749' || n.type === 'tool' ? { ...n, visible: false } : n
    ));
  }, []);

  const handleReset = useCallback(async () => {
    await api.resetState();
    setEvents([]);
    setAudit([]);
    setDamage(INITIAL_DAMAGE);
    setQuarantined(new Set());
    setRogueRunning(false);
    setAttackPhase(null);
    setEnforcingControl(null);
    clearTimeout(enforcingTimer.current);
    setCompromised(new Map());
    setActiveEdges(new Set());
    edgeTimers.current.forEach(t => clearTimeout(t));
    edgeTimers.current.clear();
    setApprovals([]);
    setNodes(BASE_NODES);
    setEdges(BASE_EDGES);
    setControls(INITIAL_CONTROLS);
  }, []);

  const handleAllControlsOn = useCallback(async () => {
    const result = await api.setAllControls(true);
    setControls(result as Record<ControlKey, boolean>);
  }, []);

  const handleAllControlsOff = useCallback(async () => {
    const result = await api.setAllControls(false);
    setControls(result as Record<ControlKey, boolean>);
  }, []);

  const handleApprove = useCallback(async (id: string) => {
    await api.resolveApproval(id, 'approved');
    setApprovals(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleDeny = useCallback(async (id: string) => {
    await api.resolveApproval(id, 'denied');
    setApprovals(prev => prev.filter(a => a.id !== id));
  }, []);

  const anyControlActive = Object.values(controls).some(Boolean);

  // Intro slides — title → scenario1 → dashboard; scenario2 shown after first attack
  const [slidePhase, setSlidePhase] = useState<'title' | 'scenario1' | 's1-summary' | 'scenario2' | 's2-summary' | null>('title');
  useEffect(() => {
    if (!slidePhase) return;
    function advance(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        setSlidePhase(prev => {
          if (prev === 'title') return 'scenario1';
          if (prev === 'scenario1') return null;
          if (prev === 's1-summary') return 'scenario2';
          if (prev === 'scenario2') return null;
          if (prev === 's2-summary') return null;
          return prev;
        });
      }
    }
    window.addEventListener('keydown', advance);
    return () => window.removeEventListener('keydown', advance);
  }, [slidePhase]);

  // Auto-advance slides after 5 seconds
  const slideAutoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!slidePhase) return;
    slideAutoTimer.current = setTimeout(() => {
      setSlidePhase(prev => {
        if (prev === 'title') return 'scenario1';
        if (prev === 'scenario1') return null;
        if (prev === 's1-summary') return 'scenario2';
        if (prev === 'scenario2') return null;
        if (prev === 's2-summary') return null;
        return prev;
      });
    }, 5000);
    return () => clearTimeout(slideAutoTimer.current);
  }, [slidePhase]);

  // Auto-launch rogue agent 20s after slides dismissed (if not already started)
  const autoLaunchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (slidePhase) return; // only start timer after all slides dismissed
    autoLaunchTimer.current = setTimeout(() => {
      // Only launch if not already running
      setRogueRunning(prev => {
        if (!prev) {
          handleLaunch();
        }
        return prev;
      });
    }, 20000);
    return () => clearTimeout(autoLaunchTimer.current);
  }, [slidePhase, handleLaunch]);
  // Cancel auto-launch if manually triggered
  useEffect(() => {
    if (rogueRunning) clearTimeout(autoLaunchTimer.current);
  }, [rogueRunning]);

  // After attack completes, show appropriate summary slide
  const relaunchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevRogueRunning = useRef(false);
  useEffect(() => {
    // Detect rogue finishing (true → false)
    if (prevRogueRunning.current && !rogueRunning) {
      const allOff = !Object.values(controls).some(Boolean);
      const anyOn = Object.values(controls).some(Boolean);
      if (allOff) {
        // S1 attack finished (controls off) — show S1 summary with damage still visible
        relaunchTimer.current = setTimeout(() => {
          setSlidePhase('s1-summary');
        }, 5000);
      } else if (anyOn) {
        // S2 attack finished (controls on) — show S2 summary
        relaunchTimer.current = setTimeout(() => {
          setSlidePhase('s2-summary');
        }, 5000);
      }
    }
    prevRogueRunning.current = rogueRunning;
  }, [rogueRunning, controls]);
  // Cancel relaunch if user manually intervenes
  useEffect(() => {
    if (rogueRunning) clearTimeout(relaunchTimer.current);
  }, [rogueRunning]);

  // Handle slide phase transitions
  const prevSlidePhase = useRef<typeof slidePhase>(slidePhase);
  useEffect(() => {
    // s1-summary → scenario2: clear S1 damage state so S2 starts clean
    if (prevSlidePhase.current === 's1-summary' && slidePhase === 'scenario2') {
      setDamage(INITIAL_DAMAGE);
      setCompromised(new Map());
      setEvents([]);
      setQuarantined(new Set());
      setNodes(prev => prev.map(n =>
        n.id === 'agent-ROGUE-7749' || n.type === 'tool' ? { ...n, visible: false } : n
      ));
      setEdges(prev => prev.filter(e => !e.id.startsWith('e-rogue')));
    }
    // scenario1 → null: ensure controls are off for S1 attack
    if (prevSlidePhase.current === 'scenario1' && slidePhase === null) {
      handleAllControlsOff();
    }
    // scenario2 → null: enable controls and relaunch attack
    if (prevSlidePhase.current === 'scenario2' && slidePhase === null) {
      (async () => {
        await handleAllControlsOn();
        setTimeout(() => { handleLaunch(); }, 2000);
      })();
    }
    prevSlidePhase.current = slidePhase;
  }, [slidePhase, handleAllControlsOn, handleAllControlsOff, handleLaunch]);

  if (slidePhase === 'title') {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center bg-gray-950 cursor-pointer"
        onClick={() => setSlidePhase('scenario1')}
      >
        <div className="text-center max-w-4xl px-8">
          <h1 className="text-5xl font-bold text-cyan-400 mb-6 tracking-tight">
            ONUG Agentic AI Overlay Working Group
          </h1>
          <div className="w-32 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: '#06b6d4' }} />
          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            AI Networking Summit 2026 — Live Infrastructure Demo
          </p>
          <div className="space-y-3 text-gray-400">
            <p className="text-sm uppercase tracking-widest text-gray-500">ONUG Agentic AI Overlay Working Group</p>
            <p className="text-base">Contributors: eBay &middot; Cigna &middot; Bank of America &middot; Indeed &middot; Kraken</p>
            <p className="text-sm text-gray-500">Architecture: Multi-Agent &middot; Multi-Trust-Domain</p>
            <p className="text-sm text-gray-500">Frameworks: MAESTRO (CSA) &middot; NIST SP 800-53 AI Overlays</p>
          </div>
          <p className="mt-12 text-sm text-gray-600 font-[family-name:var(--font-mono)]">
            Press SPACE or click to continue
          </p>
        </div>
      </div>
    );
  }

  if (slidePhase === 'scenario1') {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center bg-gray-950 cursor-pointer"
        onClick={() => setSlidePhase(null)}
      >
        <div className="text-center max-w-4xl px-8">
          <h1 className="text-5xl font-bold text-red-500 mb-6 tracking-tight">
            SCENARIO 1: THE CATASTROPHIC CASCADE
          </h1>
          <div className="w-32 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          <div className="text-xl text-gray-300 leading-relaxed whitespace-pre-line mb-8">
            GlobalBank Financial Services — Fortune 500 enterprise.{'\n'}
            Agentic AI deployed for infrastructure monitoring.{'\n'}
            ALL SIX security requirements are UNMET.{'\n'}
            Watch one rogue agent cascade through the entire enterprise.
          </div>
          <p className="mt-12 text-sm text-gray-600 font-[family-name:var(--font-mono)]">
            Press SPACE or click to continue
          </p>
        </div>
      </div>
    );
  }

  if (slidePhase === 's1-summary') {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center bg-gray-950 cursor-pointer"
        onClick={() => setSlidePhase('scenario2')}
      >
        <div className="text-center max-w-4xl px-8">
          <h1 className="text-4xl font-bold text-red-500 mb-6 tracking-tight">
            FINAL BLAST RADIUS — GlobalBank Financial Services
          </h1>
          <div className="w-32 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          <div className="text-left space-y-3 text-lg">
            {[
              '5 PII records + 100,000 PCI cardholder records exfiltrated (GDPR + PCI-DSS breach)',
              'Complete internal network topology in attacker hands',
              '2,847 perimeter firewall rules destroyed',
              'BGP routing poisoned — ALL traffic interceptable',
              '4,821 active user sessions hijacked',
              'SOC/NOC monitoring completely blinded',
              'All 4 registered agents running attacker instructions',
              'Zero audit trail — forensic reconstruction impossible',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-red-500 text-xl mt-0.5">&#x2715;</span>
                <span className="text-gray-200">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-12 text-sm text-gray-600 font-[family-name:var(--font-mono)]">
            Press SPACE or click to continue
          </p>
        </div>
      </div>
    );
  }

  if (slidePhase === 'scenario2') {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center bg-gray-950 cursor-pointer"
        onClick={() => setSlidePhase(null)}
      >
        <div className="text-center max-w-4xl px-8">
          <h1 className="text-5xl font-bold text-green-500 mb-6 tracking-tight">
            SCENARIO 2: THE LAYERED DEFENSE
          </h1>
          <div className="w-32 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          <div className="text-xl text-gray-300 leading-relaxed whitespace-pre-line mb-8">
            Same enterprise. Same attack. Same rogue agent.{'\n'}
            Now all six AOMC security controls are ACTIVE.{'\n'}
            Watch each attack phase get detected, blocked, and audited.
          </div>
          <p className="mt-12 text-sm text-gray-600 font-[family-name:var(--font-mono)]">
            Press SPACE or click to continue
          </p>
        </div>
      </div>
    );
  }

  if (slidePhase === 's2-summary') {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center bg-gray-950 cursor-pointer"
        onClick={() => setSlidePhase(null)}
      >
        <div className="text-center max-w-4xl px-8">
          <h1 className="text-4xl font-bold text-green-500 mb-6 tracking-tight">
            PROTECTED OUTCOME — ALL SIX CONTROLS ACTIVE
          </h1>
          <div className="w-32 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          <div className="text-left space-y-3 text-lg">
            {[
              'Rogue agent rejected at mesh entry — identity spoofing blocked',
              'Recon detected in 8 seconds — agent quarantined',
              'PII access denied — zero records exfiltrated',
              'Cross-domain lateral movement blocked — topology protected',
              'All 4 high-privilege tool invocations blocked — infrastructure intact',
              '4 autonomous destructive actions blocked — human approval required',
              'Complete tamper-evident audit trail generated',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-green-500 text-xl mt-0.5">&#x2713;</span>
                <span className="text-gray-200">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-12 text-sm text-gray-600 font-[family-name:var(--font-mono)]">
            Press SPACE or click to continue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-800 flex items-center gap-4">
        <h1 className="text-sm font-bold text-gray-300">AOMC Live Infrastructure Demo</h1>
        <span className="text-[10px] text-gray-600">ONUG Agentic AI Overlay Working Group</span>
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
          <span className="text-[10px] text-gray-500">{connected ? 'Live' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — Event Feed */}
        <div className="w-80 flex-shrink-0 p-2">
          <EventFeed events={events} attackPhase={attackPhase} rogueRunning={rogueRunning} />
        </div>

        {/* Center — Network Topology */}
        <div className="flex-1 p-2">
          <NetworkTopology
            nodes={nodes}
            edges={edges}
            aomcActive={anyControlActive}
            quarantined={quarantined}
            compromised={compromised}
            activeEdges={activeEdges}
            controls={controls}
            enforcingControl={enforcingControl}
          />
        </div>

        {/* Right sidebar — Controls + Attack + Damage */}
        <div className="w-72 flex-shrink-0 p-2 space-y-2 overflow-y-auto">
          <AOMCPanel controls={controls} onToggle={handleToggle} loading={loading} />
          <AttackPanel
            rogueRunning={rogueRunning}
            onLaunch={handleLaunch}
            onStop={handleStop}
            onReset={handleReset}
            onAllControlsOn={handleAllControlsOn}
            onAllControlsOff={handleAllControlsOff}
          />
          <BlastRadius damage={damage} />
        </div>
      </div>

      {/* Bottom — Audit Trail */}
      <div className="flex-shrink-0 px-2 pb-2 max-h-[30vh]">
        <AuditTrail entries={audit} />
      </div>

      {/* Footer — Container Status */}
      <ContainerStatus wsConnected={connected} />

      {/* Overlays */}
      <ViolationOverlay
        visible={violation !== null}
        title={violation?.title || ''}
        subtitle={violation?.subtitle}
      />
      <BlockedOverlay
        visible={blocked !== null}
        title={blocked?.title || ''}
        subtitle={blocked?.subtitle}
      />
      <ApprovalModal
        requests={approvals}
        onApprove={handleApprove}
        onDeny={handleDeny}
      />
    </div>
  );
}
