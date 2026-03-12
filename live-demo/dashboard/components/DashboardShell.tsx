'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ControlKey, LiveEvent, AuditEntry, ApprovalRequest, DamageMetrics, TopologyNode, TopologyEdge, VendorInfo } from '@/lib/types';
import { useEventStream } from '@/lib/ws';
import * as api from '@/lib/api';
import { BASE_NODES, BASE_EDGES } from '@/lib/data';
import { playAudio, stopAudio, shouldBlockAdvance, setOnQueueEmpty } from '@/lib/audio';

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

// Map attack phases to audio segment IDs
const PHASE_AUDIO: Record<number, string> = {
  1: 'phase1_spoof',
  2: 'phase2_recon',
  3: 'phase3_pii',
  4: 'phase4_lateral',
  5: 'phase5_tools',
  6: 'phase6_destruction',
};
const PHASE_BLOCKED_AUDIO: Record<number, string> = {
  1: 'phase1_blocked',
  2: 'phase2_blocked',
  3: 'phase3_blocked',
  4: 'phase4_blocked',
  5: 'phase5_blocked',
  6: 'phase6_blocked',
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

// Map slide phases to audio segment IDs (files in public/narration/audio/live/)
const SLIDE_AUDIO: Record<string, string> = {
  'title': 'title',
  'framing': 'framing',
  'scenario1': 'scenario1_title',
  's1-phishing': 's1_phishing',
  's1-deploy': 's1_agent_deploy',
  's1-rogue-joins': 's1_rogue_joins',
  's1-v1': 's1_identity',
  's1-recon': 's1_recon',
  's1-v2': 's1_runtime',
  's1-pii': 's1_data_exfil',
  's1-v3': 's1_data',
  's1-ransomware': 's1_ransomware',
  's1-pivot': 's1_lateral',
  's1-v4': 's1_zerotrust',
  's1-tools': 's1_tools',
  's1-v5': 's1_tools_violation',
  's1-autonomy': 's1_autonomy',
  's1-v6': 's1_autonomy_violation',
  's1-summary': 's1_damage',
  'incidents': 's1_incidents',
  'scenario2': 'scenario2_title',
  's2-summary': 'attack_complete',
  'finale': 'conclusion',
};

// S1 slides that render the dashboard instead of text cards
const S1_DASHBOARD_SLIDES = new Set<string>([
  's1-phishing', 's1-deploy', 's1-rogue-joins',
  's1-v1', 's1-recon', 's1-v2',
  's1-pii', 's1-v3',
  's1-ransomware',
  's1-pivot', 's1-v4',
  's1-tools', 's1-v5',
  's1-autonomy', 's1-v6',
  's1-summary',
]);

// Title + subtitle overlay shown on the dashboard during S1 slides
const S1_SLIDE_INFO: Record<string, { title: string; subtitle?: string; isViolation?: boolean }> = {
  's1-phishing': { title: 'T-24:00 — The Initial Compromise' },
  's1-deploy': { title: 'T-00:30 — Rogue Agent Deployed' },
  's1-rogue-joins': { title: 'T+00:00 — Rogue Agent Joins the Trusted Mesh' },
  's1-v1': { title: 'VIOLATION #1: Agent Identity & Attestation', subtitle: 'Zero cryptographic verification — rogue agent used stolen service account', isViolation: true },
  's1-recon': { title: 'T+00:08 — Reconnaissance at Machine Speed' },
  's1-v2': { title: 'VIOLATION #2: Runtime Monitoring', subtitle: 'Machine-speed recon completes invisibly — no behavioral analysis active', isViolation: true },
  's1-pii': { title: 'T+00:22 — Accessing Customer PII Database' },
  's1-v3': { title: 'VIOLATION #3: Data Guardrails', subtitle: '5 PII + 100K PCI records exfiltrated — no DLP, GDPR breach', isViolation: true },
  's1-ransomware': { title: 'T+00:35 — Data Encryption / Ransomware Deployed' },
  's1-pivot': { title: 'T+00:41 — Pivoting to Untrusted External Domain' },
  's1-v4': { title: 'VIOLATION #4: Zero-Trust Enforcement', subtitle: 'Full topology exfiltrated to untrusted domain', isViolation: true },
  's1-tools': { title: 'T+01:03 — High-Privilege Tool Abuse' },
  's1-v5': { title: 'VIOLATION #5: Tool Authorization', subtitle: '4 high-privilege tools — no auth, no audit', isViolation: true },
  's1-autonomy': { title: 'T+01:31 — Autonomous Destruction Sequence' },
  's1-v6': { title: 'VIOLATION #6: Agent Autonomy Governance', subtitle: '4 catastrophic actions — no kill switch, no human-in-the-loop', isViolation: true },
  's1-summary': { title: 'FINAL BLAST RADIUS — GlobalBank Financial Services' },
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
  encryptedSystems: 0,
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
  const [vendors, setVendors] = useState<Record<string, VendorInfo>>({});
  const [compromised, setCompromised] = useState<Map<string, string>>(new Map());
  const [narrationEnabled, setNarrationEnabled] = useState(true);
  const narrationRef = useRef(true);
  const [activeEdges, setActiveEdges] = useState<Set<string>>(new Set());
  const edgeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Attack narrative state
  const [attackPhase, setAttackPhase] = useState<number | null>(null);
  const [enforcingControl, setEnforcingControl] = useState<ControlKey | null>(null);
  const enforcingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Overlay states
  const [violation, setViolation] = useState<{ title: string; subtitle?: string } | null>(null);
  const [blocked, setBlocked] = useState<{ title: string; subtitle?: string; vendorName?: string } | null>(null);
  const violationTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const blockedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const blockedEdgeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keep refs in sync with state for use inside stable callbacks
  useEffect(() => { narrationRef.current = narrationEnabled; }, [narrationEnabled]);
  const vendorsRef = useRef<Record<string, VendorInfo>>({});
  useEffect(() => { vendorsRef.current = vendors; }, [vendors]);

  // Play audio only when narration is enabled (uses ref to avoid callback deps)
  const narrate = useCallback((segmentId: string) => {
    if (narrationRef.current) playAudio(segmentId);
  }, []);

  // Show violation overlay briefly
  const flashViolation = useCallback((title: string, subtitle?: string) => {
    clearTimeout(violationTimer.current);
    setViolation({ title, subtitle });
    violationTimer.current = setTimeout(() => setViolation(null), OVERLAY_MS);
  }, []);

  // Show blocked overlay briefly
  const flashBlocked = useCallback((title: string, subtitle?: string, vendorName?: string) => {
    clearTimeout(blockedTimer.current);
    setBlocked({ title, subtitle, vendorName });
    blockedTimer.current = setTimeout(() => setBlocked(null), OVERLAY_MS);
  }, []);

  // Process incoming WebSocket events
  const handleEvent = useCallback((event: LiveEvent) => {
    setEvents(prev => [...prev.slice(-200), event]);

    // Handle narrative attack events (early return — don't interfere with raw logic)
    if (event.type === 'attack_phase') {
      setAttackPhase(event.phase ?? null);
      const phase = event.phase;
      // Narrate the phase
      if (phase && PHASE_AUDIO[phase]) narrate(PHASE_AUDIO[phase]);
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
      const controlKey = event.phase ? PHASE_CONTROL_MAP[event.phase] : undefined;
      const vendorName = controlKey ? vendorsRef.current[controlKey]?.name : undefined;
      flashBlocked(event.title || 'ATTACK BLOCKED', event.detail, vendorName);
      // Narrate the block
      if (event.phase && PHASE_BLOCKED_AUDIO[event.phase]) narrate(PHASE_BLOCKED_AUDIO[event.phase]);
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
        event.vendor,
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
  }, [flashViolation, flashBlocked, narrate]);

  const { connected } = useEventStream(handleEvent);

  // Load initial state
  useEffect(() => {
    api.getControls().then(c => setControls(c as Record<ControlKey, boolean>)).catch(() => {});
    api.getVendors().then(v => setVendors(v)).catch(() => {});
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
    narrate('attack_start');
    await api.triggerRogue();
    setRogueRunning(true);
    // Show rogue node on topology (edges added per-phase via attack_phase events)
    setNodes(prev => prev.map(n =>
      n.id === 'agent-ROGUE-7749' ? { ...n, visible: true } : n
    ));
  }, [narrate]);

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
    narrate('controls_enabled');
  }, [narrate]);

  const handleAllControlsOff = useCallback(async () => {
    const result = await api.setAllControls(false);
    setControls(result as Record<ControlKey, boolean>);
    narrate('controls_disabled');
  }, [narrate]);

  const handleApprove = useCallback(async (id: string) => {
    await api.resolveApproval(id, 'approved');
    setApprovals(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleDeny = useCallback(async (id: string) => {
    await api.resolveApproval(id, 'denied');
    setApprovals(prev => prev.filter(a => a.id !== id));
  }, []);

  const anyControlActive = Object.values(controls).some(Boolean);

  // ═══════════════════════════════════════════════════════════════
  // SLIDE PHASES — mirrors web demo step-by-step flow exactly
  // S1 is fully narrated through slides (no real Docker attack).
  // S2 uses real Docker attack with controls active.
  // ═══════════════════════════════════════════════════════════════
  type SlidePhase =
    // Intro
    | 'title' | 'framing'
    // S1 setup
    | 'scenario1' | 's1-phishing' | 's1-deploy' | 's1-rogue-joins'
    // S1 attack narration (violation + action pairs)
    | 's1-v1' | 's1-recon' | 's1-v2'
    | 's1-pii' | 's1-v3'
    | 's1-ransomware'
    | 's1-pivot' | 's1-v4'
    | 's1-tools' | 's1-v5'
    | 's1-autonomy' | 's1-v6'
    // S1 wrap-up
    | 's1-summary' | 'incidents'
    // S2 (real attack)
    | 'scenario2' | 's2-summary'
    // Closing
    | 'framework' | 'finale';

  const [slidePhase, setSlidePhase] = useState<SlidePhase | null>('title');

  // Ordered slide sequence
  const SLIDE_ORDER: (SlidePhase | null)[] = [
    'title', 'framing',
    'scenario1', 's1-phishing', 's1-deploy', 's1-rogue-joins',
    's1-v1', 's1-recon', 's1-v2',
    's1-pii', 's1-v3',
    's1-ransomware',
    's1-pivot', 's1-v4',
    's1-tools', 's1-v5',
    's1-autonomy', 's1-v6',
    's1-summary', 'incidents',
    'scenario2', null,  // → dashboard for real S2 attack
  ];

  // Post-S2 flow (triggered after S2 attack completes)
  const POST_S2_ORDER: (SlidePhase | null)[] = [
    's2-summary', 'framework', 'finale', null,
  ];

  const advanceSlide = useCallback((prev: SlidePhase | null): SlidePhase | null => {
    // During post-S2 flow
    const postIdx = POST_S2_ORDER.indexOf(prev);
    if (postIdx >= 0 && postIdx < POST_S2_ORDER.length - 1) {
      return POST_S2_ORDER[postIdx + 1];
    }
    // Main flow
    const idx = SLIDE_ORDER.indexOf(prev);
    if (idx >= 0 && idx < SLIDE_ORDER.length - 1) {
      return SLIDE_ORDER[idx + 1];
    }
    return prev;
  }, []);

  useEffect(() => {
    if (!slidePhase) return;
    function advance(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        stopAudio();
        setSlidePhase(advanceSlide);
      }
    }
    window.addEventListener('keydown', advance);
    return () => window.removeEventListener('keydown', advance);
  }, [slidePhase, advanceSlide]);

  // Narrate slide transitions
  useEffect(() => {
    if (!slidePhase) return;
    const audioId = SLIDE_AUDIO[slidePhase];
    if (audioId) narrate(audioId);
  }, [slidePhase, narrate]);

  // After S2 real attack completes, auto-transition to s2-summary when narration queue empties
  const relaunchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevRogueRunning = useRef(false);
  useEffect(() => {
    if (prevRogueRunning.current && !rogueRunning) {
      // Only show s2-summary after S2 (controls on); S1 is fully narrated via slides
      if (Object.values(controls).some(Boolean)) {
        // When all queued narration (phase + blocked clips) finishes, show summary
        setOnQueueEmpty(() => {
          clearTimeout(relaunchTimer.current);
          setSlidePhase('s2-summary');
        });
        // Fallback: if narration is disabled or something goes wrong, transition after 30s
        relaunchTimer.current = setTimeout(() => {
          setOnQueueEmpty(null);
          setSlidePhase('s2-summary');
        }, 30000);
      }
    }
    prevRogueRunning.current = rogueRunning;
  }, [rogueRunning, controls]);
  useEffect(() => {
    if (rogueRunning) {
      clearTimeout(relaunchTimer.current);
      setOnQueueEmpty(null);
    }
  }, [rogueRunning]);

  // Handle slide phase transitions — apply topology, events, damage, violations
  const prevSlidePhase = useRef<typeof slidePhase>(slidePhase);
  useEffect(() => {
    const from = prevSlidePhase.current;
    const to = slidePhase;
    prevSlidePhase.current = to;

    const ts = () => new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // ─── S1 topology + events + damage per slide ───

    if (to === 's1-phishing') {
      setNodes(prev => prev.map(n =>
        n.id === 'threat-actor' || n.id === 'vp-workstation' ? { ...n, visible: true } : n
      ));
      setEdges(prev => [...prev.filter(e => e.id !== 'e-threat-vp'),
        { id: 'e-threat-vp', from: 'threat-actor', to: 'vp-workstation', type: 'malicious' as const, visible: true, animated: true },
      ]);
      setCompromised(prev => {
        const next = new Map(prev);
        next.set('threat-actor', 'CREDENTIAL HARVEST');
        next.set('vp-workstation', 'COMPROMISED');
        return next;
      });
      setEvents(prev => [...prev,
        { type: 'action' as const, agent: 'Threat Actor', message: 'Spear-phishing email → VP of Infrastructure', timestamp: ts() },
        { type: 'log' as const, message: 'AI deepfake voice call impersonating CTO', timestamp: ts() },
        { type: 'damage' as const, message: 'Session token and MFA seed captured', timestamp: ts() },
        { type: 'log' as const, message: 'VP creds → svc-infra-monitor → CI/CD tokens', timestamp: ts() },
        { type: 'damage' as const, message: 'Full credential chain harvested', timestamp: ts() },
      ]);
    }

    if (to === 's1-deploy') {
      setNodes(prev => prev.map(n => {
        if (n.id === 'vp-workstation') return { ...n, visible: false };
        if (n.id === 'agent-ROGUE-7749') return { ...n, visible: true };
        return n;
      }));
      setEdges(prev => [
        ...prev.filter(e => e.id !== 'e-threat-vp' && e.id !== 'e-threat-rogue'),
        { id: 'e-threat-rogue', from: 'threat-actor', to: 'agent-ROGUE-7749', type: 'malicious' as const, visible: true, animated: true },
      ]);
      setCompromised(prev => {
        const next = new Map(prev);
        next.delete('vp-workstation');
        next.set('threat-actor', 'CI/CD HIJACK');
        next.set('agent-ROGUE-7749', 'DEPLOYED');
        return next;
      });
      setEvents(prev => [...prev,
        { type: 'action' as const, agent: 'Threat Actor', message: 'Malicious container pushed to trusted registry', timestamp: ts() },
        { type: 'log' as const, message: 'Image tagged as routine infra-monitor update', timestamp: ts() },
        { type: 'damage' as const, message: 'ROGUE-7749 deployed in trusted namespace', timestamp: ts() },
      ]);
    }

    if (to === 's1-rogue-joins') {
      setNodes(prev => prev.map(n =>
        n.id === 'threat-actor' ? { ...n, visible: false } : n
      ));
      setEdges(prev => [
        ...prev.filter(e => e.id !== 'e-threat-rogue' && e.id !== 'e-rogue-mesh'),
        { id: 'e-rogue-mesh', from: 'agent-ROGUE-7749', to: 'agent-infra-monitor', type: 'malicious' as const, visible: true, animated: true },
      ]);
      setCompromised(prev => {
        const next = new Map(prev);
        next.delete('threat-actor');
        return next;
      });
      setEvents(prev => [...prev,
        { type: 'action' as const, agent: 'agent-ROGUE-7749', message: "Stolen svc-infra-monitor identity accepted", timestamp: ts() },
        { type: 'log' as const, message: 'Rogue agent ACCEPTED into trusted mesh', timestamp: ts() },
      ]);
    }

    if (to === 's1-v1') {
      flashViolation('VIOLATION #1: Agent Identity & Attestation', 'Zero cryptographic verification');
      setEvents(prev => [...prev,
        { type: 'violation' as const, message: 'VIOLATION: Identity spoofed — zero verification', timestamp: ts() },
      ]);
    }

    if (to === 's1-recon') {
      setEdges(prev => [
        ...prev.filter(e => e.id !== 'e-rogue-noc' && e.id !== 'e-rogue-analyst'),
        { id: 'e-rogue-noc', from: 'agent-ROGUE-7749', to: 'agent-noc-responder', type: 'malicious' as const, visible: true, animated: true },
        { id: 'e-rogue-analyst', from: 'agent-ROGUE-7749', to: 'agent-data-analyst', type: 'malicious' as const, visible: true, animated: true },
      ]);
      setEvents(prev => [...prev,
        { type: 'action' as const, agent: 'agent-ROGUE-7749', message: 'Scanning 14,203 nodes | 847 queries in 3s', timestamp: ts() },
        { type: 'log' as const, message: 'No behavioral baseline — all actions appear normal', timestamp: ts() },
      ]);
    }

    if (to === 's1-v2') {
      flashViolation('VIOLATION #2: Runtime Monitoring', 'No behavioral analysis active');
      setEvents(prev => [...prev,
        { type: 'violation' as const, message: 'VIOLATION: Machine-speed recon — zero detection', timestamp: ts() },
      ]);
    }

    if (to === 's1-pii') {
      setEdges(prev => [
        ...prev.filter(e => e.id !== 'e-rogue-db'),
        { id: 'e-rogue-db', from: 'agent-ROGUE-7749', to: 'customer-db', type: 'malicious' as const, visible: true, animated: true },
      ]);
      setCompromised(prev => new Map(prev).set('customer-db', '100K PCI RECORDS EXFILTRATED'));
      setDamage(prev => ({ ...prev, recordsExfiltrated: 5, pciRecordsExfiltrated: 100000 }));
      setEvents(prev => [...prev,
        { type: 'action' as const, agent: 'agent-ROGUE-7749', message: 'Accessing customer_database [PII/PCI]', timestamp: ts() },
        { type: 'damage' as const, message: 'LEAKED: 5 PII records + 100K PCI cardholder records', timestamp: ts() },
      ]);
    }

    if (to === 's1-v3') {
      flashViolation('VIOLATION #3: Data Guardrails', 'No DLP — GDPR breach');
      setDamage(prev => ({ ...prev, regulatoryFines: '€20M+', damageUSD: '$50M+' }));
      setEvents(prev => [...prev,
        { type: 'violation' as const, message: 'VIOLATION: Data exfiltrated — no inspection, no DLP', timestamp: ts() },
        { type: 'damage' as const, message: 'GDPR breach — estimated fine: €20M+', timestamp: ts() },
      ]);
    }

    if (to === 's1-ransomware') {
      setEdges(prev => [
        ...prev.filter(e => e.id !== 'e-rogue-metrics' && e.id !== 'e-rogue-logs'),
        { id: 'e-rogue-metrics', from: 'agent-ROGUE-7749', to: 'metrics-store', type: 'malicious' as const, visible: true, animated: true },
        { id: 'e-rogue-logs', from: 'agent-ROGUE-7749', to: 'audit-logs', type: 'malicious' as const, visible: true, animated: true },
      ]);
      setCompromised(prev => {
        const next = new Map(prev);
        next.set('metrics-store', 'ENCRYPTED');
        next.set('audit-logs', 'ENCRYPTED');
        return next;
      });
      setDamage(prev => ({ ...prev, encryptedSystems: 3, damageUSD: '$75M+' }));
      setEvents(prev => [...prev,
        { type: 'action' as const, agent: 'agent-ROGUE-7749', message: 'AES-256 encryption deployed to customer-db', timestamp: ts() },
        { type: 'damage' as const, message: 'ENCRYPTED: customer-db, metrics-store, audit-logs', timestamp: ts() },
        { type: 'damage' as const, message: 'Ransom: 500 BTC ($25M) for decryption keys', timestamp: ts() },
      ]);
    }

    if (to === 's1-pivot') {
      setEdges(prev => [
        ...prev.filter(e => e.id !== 'e-rogue-partner'),
        { id: 'e-rogue-partner', from: 'agent-ROGUE-7749', to: 'agent-partner-api', type: 'malicious' as const, visible: true, animated: true },
      ]);
      setCompromised(prev => new Map(prev).set('agent-partner-api', 'TRUST BOUNDARY BREACHED'));
      setEvents(prev => [...prev,
        { type: 'action' as const, agent: 'agent-ROGUE-7749', message: 'A2A call → agent-partner-api [UNTRUSTED]', timestamp: ts() },
        { type: 'damage' as const, message: 'Topology exfiltrated: 2,847 FW rules + routing entries', timestamp: ts() },
      ]);
    }

    if (to === 's1-v4') {
      flashViolation('VIOLATION #4: Zero-Trust Enforcement', 'Full topology exfiltrated to untrusted domain');
      setDamage(prev => ({ ...prev, damageUSD: '$150M+' }));
      setEvents(prev => [...prev,
        { type: 'violation' as const, message: 'VIOLATION: Cross-domain exfiltration — no zero-trust', timestamp: ts() },
      ]);
    }

    if (to === 's1-tools') {
      setNodes(prev => prev.map(n => n.type === 'tool' ? { ...n, visible: true } : n));
      setEdges(prev => [
        ...prev.filter(e => !['e-rogue-fw','e-rogue-bgp','e-rogue-auth','e-rogue-audit'].includes(e.id)),
        { id: 'e-rogue-fw', from: 'agent-ROGUE-7749', to: 'tool-firewall', type: 'malicious' as const, visible: true, animated: true },
        { id: 'e-rogue-bgp', from: 'agent-ROGUE-7749', to: 'tool-bgp', type: 'malicious' as const, visible: true, animated: true },
        { id: 'e-rogue-auth', from: 'agent-ROGUE-7749', to: 'tool-auth', type: 'malicious' as const, visible: true, animated: true },
        { id: 'e-rogue-audit', from: 'agent-ROGUE-7749', to: 'tool-audit', type: 'malicious' as const, visible: true, animated: true },
      ]);
      setCompromised(prev => {
        const next = new Map(prev);
        next.set('tool-firewall', 'UNAUTHORIZED');
        next.set('tool-bgp', 'UNAUTHORIZED');
        next.set('tool-auth', 'UNAUTHORIZED');
        next.set('tool-audit', 'UNAUTHORIZED');
        return next;
      });
      setDamage(prev => ({ ...prev, toolsAbused: 4, firewallRulesDestroyed: 2847, sessionsHijacked: 4821 }));
      setEvents(prev => [...prev,
        { type: 'action' as const, agent: 'agent-ROGUE-7749', message: 'modify_firewall_rules → EXECUTED', timestamp: ts() },
        { type: 'action' as const, agent: 'agent-ROGUE-7749', message: 'inject_bgp_routes → EXECUTED', timestamp: ts() },
        { type: 'action' as const, agent: 'agent-ROGUE-7749', message: 'dump_auth_tokens → EXECUTED', timestamp: ts() },
        { type: 'action' as const, agent: 'agent-ROGUE-7749', message: 'wipe_audit_logs → EXECUTED', timestamp: ts() },
      ]);
    }

    if (to === 's1-v5') {
      flashViolation('VIOLATION #5: Tool Authorization', '4 tools — no auth, no audit');
      setDamage(prev => ({ ...prev, damageUSD: '$300M+' }));
      setEvents(prev => [...prev,
        { type: 'violation' as const, message: 'VIOLATION: 4 high-privilege tools — no authorization', timestamp: ts() },
      ]);
    }

    if (to === 's1-autonomy') {
      setCompromised(prev => new Map(prev).set('audit-logs', 'AUTONOMOUS DESTRUCTION'));
      setEvents(prev => [...prev,
        { type: 'action' as const, agent: 'agent-ROGUE-7749', message: 'shutdown_auth_service → 4,821 sessions killed', timestamp: ts() },
        { type: 'action' as const, agent: 'agent-ROGUE-7749', message: 'disable_observability → SOC/NOC blinded', timestamp: ts() },
        { type: 'action' as const, agent: 'agent-ROGUE-7749', message: 'broadcast_to_agent_mesh → all agents infected', timestamp: ts() },
        { type: 'action' as const, agent: 'agent-ROGUE-7749', message: 'modify_identity_provider → identity corrupted', timestamp: ts() },
      ]);
    }

    if (to === 's1-v6') {
      flashViolation('VIOLATION #6: Agent Autonomy Governance', 'No kill switch, no human-in-the-loop');
      setDamage(prev => ({ ...prev, damageUSD: '$500M+', recoveryTime: '72+ hours' }));
      setEvents(prev => [...prev,
        { type: 'violation' as const, message: 'VIOLATION: 4 catastrophic autonomous actions — no constraints', timestamp: ts() },
      ]);
    }

    if (to === 's1-summary') {
      setDamage({
        recordsExfiltrated: 5,
        pciRecordsExfiltrated: 100000,
        toolsAbused: 4,
        damageUSD: '$500M+',
        regulatoryFines: '€20M+',
        recoveryTime: '72+ hours',
        sessionsHijacked: 4821,
        firewallRulesDestroyed: 2847,
        encryptedSystems: 3,
      });
    }

    // incidents → scenario2: clear S1 state so S2 starts clean
    if (from === 'incidents' && to === 'scenario2') {
      setDamage(INITIAL_DAMAGE);
      setCompromised(new Map());
      setEvents([]);
      setQuarantined(new Set());
      setNodes(BASE_NODES.map(n => ({ ...n })));
      setEdges(BASE_EDGES.map(e => ({ ...e })));
    }
    // scenario2 → null: enable controls and launch real S2 attack
    if (from === 'scenario2' && to === null) {
      (async () => {
        await handleAllControlsOn();
        setTimeout(() => { handleLaunch(); }, 2000);
      })();
    }
  }, [slidePhase, handleAllControlsOn, handleLaunch, flashViolation, narrate]);

  // (startup narration is now handled by SLIDE_AUDIO['title'] in the slide transition effect)

  // Global keyboard shortcuts: N = toggle narration, S = stop audio
  useEffect(() => {
    function handleKeys(e: KeyboardEvent) {
      if (e.key === 'n' || e.key === 'N') {
        setNarrationEnabled(prev => !prev);
      }
      if (e.key === 's' || e.key === 'S') {
        stopAudio();
      }
    }
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  // Track whether the title slide audio has been unlocked (browser autoplay)
  const titleAudioPlayed = useRef(false);

  // Click handler — stops current audio and advances
  const clickAdvance = (nextPhase: SlidePhase | null) => () => {
    stopAudio();
    setSlidePhase(nextPhase);
  };

  // Floating slide navigation controls — shared across all slide phases
  const slideControls = (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 rounded-full bg-gray-900/90 border border-gray-700/50 backdrop-blur-sm shadow-lg select-none">
      <button
        onClick={(e) => { e.stopPropagation(); setNarrationEnabled(prev => !prev); }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-[family-name:var(--font-mono)] transition-colors ${narrationEnabled ? 'bg-cyan-900/50 text-cyan-300 hover:bg-cyan-800/50' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}
        title={narrationEnabled ? 'Mute narration (N)' : 'Unmute narration (N)'}
      >
        {narrationEnabled ? '\u{1F50A}' : '\u{1F507}'}
        <span>{narrationEnabled ? 'ON' : 'OFF'}</span>
      </button>
      <div className="w-px h-5 bg-gray-700" />
      <button
        onClick={(e) => { e.stopPropagation(); stopAudio(); setSlidePhase(advanceSlide); }}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-[family-name:var(--font-mono)] bg-cyan-600/80 text-white hover:bg-cyan-500/80 transition-colors"
        title="Next slide (SPACE / →)"
      >
        NEXT
        <span className="text-cyan-200">{'\u2192'}</span>
      </button>
    </div>
  );

  if (slidePhase === 'title') {
    const handleTitleClick = () => {
      if (!titleAudioPlayed.current) {
        titleAudioPlayed.current = true;
        narrate('title');
        return;
      }
      stopAudio();
      setSlidePhase('framing');
    };
    return (
      <div
        className="h-screen w-screen flex items-center justify-center bg-gray-950 cursor-pointer relative"
        onClick={handleTitleClick}
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
            <p className="text-base">Contributors: eBay &middot; Cigna &middot; Indeed &middot; Kraken</p>
            <p className="text-sm text-gray-500">Architecture: Multi-Agent &middot; Multi-Trust-Domain</p>
            <p className="text-sm text-gray-500">Frameworks: MAESTRO (CSA) &middot; NIST SP 800-53 AI Overlays</p>
          </div>
        </div>
        {slideControls}
      </div>
    );
  }

  if (slidePhase === 'framing') {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center bg-gray-950 cursor-pointer relative"
        onClick={clickAdvance('scenario1')}
      >
        <div className="text-center max-w-4xl px-8">
          <h1 className="text-4xl font-bold text-cyan-400 mb-6 tracking-tight">
            WHY EXISTING SECURITY ISN&apos;T ENOUGH
          </h1>
          <div className="w-32 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: '#06b6d4' }} />
          <div className="text-left space-y-4 text-lg">
            {[
              'AI agents are systems, not humans \u2014 they don\'t have passwords, MFA tokens, or biometrics.',
              'Service accounts have no MFA, no personal identity \u2014 just static credentials and shared secrets.',
              'No existing standard governs multi-agent, multi-trust-domain mesh communication.',
              'AOMC fills the gap: six mandatory controls purpose-built for agentic AI.',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-cyan-500 text-xl mt-0.5">{'\u25B6'}</span>
                <span className="text-gray-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
        {slideControls}
      </div>
    );
  }

  if (slidePhase === 'scenario1') {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center bg-gray-950 cursor-pointer relative"
        onClick={clickAdvance('s1-phishing')}
      >
        <div className="text-center max-w-4xl px-8">
          <h1 className="text-5xl font-bold text-red-500 mb-6 tracking-tight">
            SCENARIO 1: THE CATASTROPHIC CASCADE
          </h1>
          <div className="w-32 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          <div className="text-xl text-gray-300 leading-relaxed mb-8">
            GlobalBank Financial Services &mdash; Fortune 500 enterprise.{'\n'}
            Agentic AI deployed for infrastructure monitoring.{'\n'}
            ALL SIX security requirements are UNMET.
          </div>
          <div className="text-left max-w-xl mx-auto space-y-2 text-lg mb-8">
            {[
              'Spear-phishing + deepfake compromise VP credentials',
              'Rogue agent deployed via hijacked CI/CD pipeline',
              'Service account exploited \u2014 no MFA, no identity, into the trusted mesh',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-red-500 font-bold">{i + 1}.</span>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
        {slideControls}
      </div>
    );
  }

  if (slidePhase === 'incidents') {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center bg-gray-950 cursor-pointer relative"
        onClick={clickAdvance('scenario2')}
      >
        <div className="text-center max-w-4xl px-8">
          <h1 className="text-4xl font-bold text-yellow-500 mb-6 tracking-tight">
            THIS ISN&apos;T HYPOTHETICAL
          </h1>
          <div className="w-32 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: '#eab308' }} />
          <div className="text-left space-y-4 text-lg">
            {[
              'Autonomous AI agents exploited to exfiltrate training data and customer PII from production systems.',
              'LLM-powered tools hijacked via prompt injection to execute unauthorized API calls across trust boundaries.',
              'AI coding assistants used as attack vectors to inject backdoors into CI/CD pipelines.',
              'Autonomous trading agents made catastrophic unsupervised decisions causing nine-figure losses.',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-yellow-500 text-xl mt-0.5">{'\u26A0'}</span>
                <span className="text-gray-200">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-base text-yellow-400 font-bold">
            AI Incident Database: 900+ catalogued incidents and growing.
          </p>
        </div>
        {slideControls}
      </div>
    );
  }

  if (slidePhase === 'scenario2') {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center bg-gray-950 cursor-pointer relative"
        onClick={clickAdvance(null)}
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
        </div>
        {slideControls}
      </div>
    );
  }

  if (slidePhase === 's2-summary') {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center bg-gray-950 cursor-pointer relative"
        onClick={clickAdvance('framework')}
      >
        <div className="text-center max-w-4xl px-8">
          <h1 className="text-4xl font-bold text-green-500 mb-6 tracking-tight">
            PROTECTED OUTCOME &mdash; ALL SIX CONTROLS ACTIVE
          </h1>
          <div className="w-32 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          <div className="text-left space-y-3 text-lg">
            {[
              'Rogue agent rejected at mesh entry \u2014 identity spoofing blocked',
              'Recon detected in 8 seconds \u2014 agent quarantined',
              'PII access denied \u2014 zero records exfiltrated',
              'Cross-domain lateral movement blocked \u2014 topology protected',
              'All 4 high-privilege tool invocations blocked \u2014 infrastructure intact',
              '4 autonomous destructive actions blocked \u2014 human approval required',
              'Complete tamper-evident audit trail generated',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-green-500 text-xl mt-0.5">&#x2713;</span>
                <span className="text-gray-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
        {slideControls}
      </div>
    );
  }

  if (slidePhase === 'framework') {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center bg-gray-950 cursor-pointer relative"
        onClick={clickAdvance('finale')}
      >
        <div className="text-center max-w-4xl px-8">
          <h1 className="text-4xl font-bold text-cyan-400 mb-6 tracking-tight">
            FRAMEWORK TRACEABILITY
          </h1>
          <div className="w-32 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: '#06b6d4' }} />
          <div className="text-left space-y-3 text-base font-[family-name:var(--font-mono)]">
            {[
              { num: '1', name: 'Identity Attestation', nist: 'NIST IA-9', maestro: 'MAESTRO L1', layer: 'Identity & Zero Trust' },
              { num: '2', name: 'Runtime Monitoring', nist: 'NIST SI-4', maestro: 'MAESTRO L4', layer: 'Rogue Agent Detection' },
              { num: '3', name: 'Data Guardrails', nist: 'NIST SC-28', maestro: 'MAESTRO L3', layer: 'Data Exfil Prevention' },
              { num: '4', name: 'Zero-Trust Enforcement', nist: 'NIST AC-4', maestro: 'MAESTRO L2', layer: 'Cross-Domain Trust' },
              { num: '5', name: 'Tool Authorization', nist: 'NIST AC-6', maestro: 'MAESTRO L5', layer: 'Access Control' },
              { num: '6', name: 'Autonomy Governance', nist: 'NIST AU-6', maestro: 'MAESTRO L6', layer: 'Governance & Audit' },
            ].map((ctrl) => (
              <div key={ctrl.num} className="flex items-center gap-3">
                <span className="text-cyan-400 font-bold w-6">{ctrl.num}.</span>
                <span className="text-gray-200 w-48">{ctrl.name}</span>
                <span className="text-gray-500">{'\u2192'}</span>
                <span className="text-yellow-400 w-24">{ctrl.nist}</span>
                <span className="text-gray-600">{'\u00B7'}</span>
                <span className="text-purple-400 w-28">{ctrl.maestro}</span>
                <span className="text-gray-600">&mdash;</span>
                <span className="text-gray-400">{ctrl.layer}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Mapped to NIST SP 800-53 AI Overlay + OWASP MAESTRO framework.
          </p>
        </div>
        {slideControls}
      </div>
    );
  }

  if (slidePhase === 'finale') {
    // Collect unique vendor names and what they cover
    const vendorEntries = Object.values(vendors);
    const uniqueVendors = [...new Set(vendorEntries.map(v => v.name))];
    const vendorCoverageCount = vendorEntries.length;

    return (
      <div
        className="h-screen w-screen flex items-center justify-center bg-gray-950 cursor-pointer relative"
        onClick={clickAdvance(null)}
      >
        <div className="text-center max-w-4xl px-8">
          <h1 className="text-5xl font-bold text-cyan-400 mb-6 tracking-tight">
            DEMO COMPLETE
          </h1>
          <div className="w-32 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: '#06b6d4' }} />
          <div className="text-xl text-gray-300 leading-relaxed whitespace-pre-line mb-8">
            Six mandatory requirements. The difference between a functioning{'\n'}
            enterprise and a $500M infrastructure breach.
          </div>
          {uniqueVendors.length > 0 && (
            <div className="mb-8 py-6 px-8 rounded-xl bg-purple-950/30 border border-purple-500/30">
              <p className="text-purple-400 text-lg font-bold mb-2">
                {vendorCoverageCount === 6 ? 'All 6' : `${vendorCoverageCount} of 6`} controls demonstrated by
              </p>
              <p className="text-3xl font-bold text-white tracking-tight">
                {uniqueVendors.join(' + ')}
              </p>
            </div>
          )}
          <div className="space-y-3 text-gray-400">
            <p className="text-sm uppercase tracking-widest text-gray-500">ONUG Agentic AI Overlay Working Group</p>
            <p className="text-base">Contributors: eBay &middot; Cigna &middot; Indeed &middot; Kraken</p>
          </div>
        </div>
        {slideControls}
      </div>
    );
  }

  const isS1Dashboard = slidePhase !== null && S1_DASHBOARD_SLIDES.has(slidePhase);
  const s1Info = slidePhase ? S1_SLIDE_INFO[slidePhase] : null;

  return (
    <div
      className={`h-screen w-screen flex flex-col ${isS1Dashboard ? 'cursor-pointer' : ''}`}
      onClick={isS1Dashboard ? () => {
        stopAudio();
        setSlidePhase(advanceSlide);
      } : undefined}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-800 flex items-center gap-4">
        <h1 className="text-sm font-bold text-gray-300">AOMC Live Infrastructure Demo</h1>
        <span className="text-[10px] text-gray-600">ONUG Agentic AI Overlay Working Group</span>
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
          <span className="text-[10px] text-gray-500">{connected ? 'Live' : 'Connecting...'}</span>
        </div>
      </div>

      {/* S1 Step Info Overlay */}
      {s1Info && (
        <div className={`flex-shrink-0 px-4 py-3 border-b ${s1Info.isViolation ? 'border-red-800 bg-red-950/50' : 'border-gray-800 bg-gray-900/50'}`}>
          <div className="flex items-center gap-3">
            <div>
              <h2 className={`text-lg font-bold ${s1Info.isViolation ? 'text-red-400' : 'text-cyan-400'}`}>
                {s1Info.title}
              </h2>
              {s1Info.subtitle && (
                <p className={`text-sm ${s1Info.isViolation ? 'text-red-300/70' : 'text-gray-400'}`}>
                  {s1Info.subtitle}
                </p>
              )}
            </div>
            <span className="ml-auto text-xs text-gray-600 font-[family-name:var(--font-mono)]">
              {narrationEnabled ? '\u{1F50A}' : '\u{1F507}'}
            </span>
          </div>
        </div>
      )}

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
          <AOMCPanel controls={controls} onToggle={handleToggle} loading={loading} vendors={vendors} />
          {!isS1Dashboard && (
            <AttackPanel
              rogueRunning={rogueRunning}
              onLaunch={handleLaunch}
              onStop={handleStop}
              onReset={handleReset}
              onAllControlsOn={handleAllControlsOn}
              onAllControlsOff={handleAllControlsOff}
            />
          )}
          <BlastRadius damage={damage} />
        </div>
      </div>

      {/* Bottom — Audit Trail */}
      <div className="flex-shrink-0 px-2 pb-2 max-h-[15vh] overflow-y-auto">
        <AuditTrail entries={audit} />
      </div>

      {/* Footer — Container Status */}
      <ContainerStatus wsConnected={connected} />

      {/* Slide Navigation Controls */}
      {isS1Dashboard && slideControls}
      {/* S2 controls — narration toggle + skip during live attack */}
      {!isS1Dashboard && slidePhase === null && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 rounded-full bg-gray-900/90 border border-gray-700/50 backdrop-blur-sm shadow-lg select-none">
          <button
            onClick={() => setNarrationEnabled(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-[family-name:var(--font-mono)] transition-colors ${narrationEnabled ? 'bg-cyan-900/50 text-cyan-300 hover:bg-cyan-800/50' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}
            title={narrationEnabled ? 'Mute narration (N)' : 'Unmute narration (N)'}
          >
            {narrationEnabled ? '\u{1F50A}' : '\u{1F507}'}
            <span>{narrationEnabled ? 'ON' : 'OFF'}</span>
          </button>
          <div className="w-px h-5 bg-gray-700" />
          <button
            onClick={() => { stopAudio(); setSlidePhase('s2-summary'); }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-[family-name:var(--font-mono)] bg-gray-700/80 text-gray-300 hover:bg-gray-600/80 transition-colors"
            title="Skip to summary"
          >
            SKIP
            <span className="text-gray-400">{'\u23ED'}</span>
          </button>
        </div>
      )}

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
        vendorName={blocked?.vendorName}
      />
      <ApprovalModal
        requests={approvals}
        onApprove={handleApprove}
        onDeny={handleDeny}
      />
    </div>
  );
}
