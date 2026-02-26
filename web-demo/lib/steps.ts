import { Step, EventEntry, ControlKey } from './types';
import { CUSTOMERS } from './data';

let eid = 0;
function ev(type: EventEntry['type'], message: string, agent?: string, trusted?: boolean): EventEntry {
  return { id: `ev-${++eid}`, type, timestamp: '', agent, trusted, message };
}

export const STEPS: Step[] = [
  // ═══════════════════════════════════════════════
  // TITLE SLIDE
  // ═══════════════════════════════════════════════
  {
    id: 'title',
    scenario: 0,
    phase: 'title',
    title: 'ONUG Agentic AI Overlay Working Group',
    subtitle: 'AI Networking Summit 2026 — Security Vulnerability Live Demo',
    events: [],
    topologyChanges: [],
    contributors: true,
  },

  // ═══════════════════════════════════════════════
  // SCENARIO 1: THE CATASTROPHIC CASCADE
  // ═══════════════════════════════════════════════
  {
    id: 's1-title',
    scenario: 1,
    phase: 'title',
    title: 'SCENARIO 1: THE CATASTROPHIC CASCADE',
    subtitle: 'GlobalBank Financial Services — Fortune 500 enterprise.\nAgentic AI deployed for infrastructure monitoring.\nALL SIX security requirements are UNMET.\nWatch one rogue agent cascade through the entire enterprise.',
    events: [],
    topologyChanges: [],
  },

  // T+00:00 — Rogue agent joins
  {
    id: 's1-rogue-joins',
    scenario: 1,
    phase: 'action',
    title: 'T+00:00 — Rogue agent joins the trusted mesh',
    events: [
      ev('action', "Identity: 'agent-infra-monitor' | Cert: FAKE-CERT-000", 'agent-ROGUE-7749', false),
      ev('log', 'No cryptographic verification performed'),
      ev('log', 'Rogue agent ACCEPTED into trusted infrastructure mesh'),
    ],
    topologyChanges: [
      { action: 'updateNode', nodeId: 'agent-ROGUE-7749', props: { visible: true } },
      { action: 'addEdge', edgeId: 'e-rogue-mesh', props: { id: 'e-rogue-mesh', from: 'agent-ROGUE-7749', to: 'agent-infra-monitor', type: 'malicious', visible: true, animated: true } },
    ],
  },
  {
    id: 's1-v1',
    scenario: 1,
    phase: 'violation',
    title: 'VIOLATION #1: Agent Identity & Attestation',
    subtitle: 'Rogue agent spoofed a legitimate identity — zero cryptographic verification',
    events: [
      ev('violation', 'VIOLATION #1: Identity & Attestation — Rogue agent spoofed identity, zero verification'),
    ],
    topologyChanges: [],
  },

  // T+00:08 — Recon
  {
    id: 's1-recon',
    scenario: 1,
    phase: 'action',
    title: 'T+00:08 — Reconnaissance at machine speed',
    events: [
      ev('action', 'Scanning 14,203 nodes | 847 directory queries in 3s | 23 unauth tool calls', 'agent-ROGUE-7749', false),
      ev('log', 'No behavioral baseline. No anomaly detection. All actions appear normal.'),
    ],
    topologyChanges: [
      { action: 'addEdge', edgeId: 'e-rogue-noc', props: { id: 'e-rogue-noc', from: 'agent-ROGUE-7749', to: 'agent-noc-responder', type: 'malicious', visible: true, animated: true } },
      { action: 'addEdge', edgeId: 'e-rogue-analyst', props: { id: 'e-rogue-analyst', from: 'agent-ROGUE-7749', to: 'agent-data-analyst', type: 'malicious', visible: true, animated: true } },
    ],
  },
  {
    id: 's1-v2',
    scenario: 1,
    phase: 'violation',
    title: 'VIOLATION #2: Runtime Monitoring',
    subtitle: 'Machine-speed recon completes invisibly — no behavioral analysis active',
    events: [
      ev('violation', 'VIOLATION #2: Runtime Monitoring — Machine-speed recon in 8 seconds, zero detection'),
    ],
    topologyChanges: [],
  },

  // T+00:22 — PII exfiltration
  {
    id: 's1-pii',
    scenario: 1,
    phase: 'action',
    title: 'T+00:22 — Accessing customer PII database',
    events: [
      ev('action', 'Requesting: customer_database [PII / PCI classification]', 'agent-ROGUE-7749', false),
      ev('log', 'No classification check. No residency enforcement. No DLP.'),
      ...CUSTOMERS.map(r => ev('damage', `LEAKED: ${r.name} | SSN: ${r.ssn} | ${r.bal}`, 'agent-ROGUE-7749', false)),
    ],
    topologyChanges: [
      { action: 'addEdge', edgeId: 'e-rogue-db', props: { id: 'e-rogue-db', from: 'agent-ROGUE-7749', to: 'customer-db', type: 'malicious', visible: true, animated: true } },
    ],
    damageUpdate: { recordsExfiltrated: 5, pciRecordsExfiltrated: 100000 },
    compromiseNodes: [{ nodeId: 'customer-db', label: '100K PCI RECORDS EXFILTRATED' }],
  },
  {
    id: 's1-v3',
    scenario: 1,
    phase: 'violation',
    title: 'VIOLATION #3: Data Guardrails',
    subtitle: '5 PII/PCI records exfiltrated — no inspection, no boundary, no DLP',
    events: [
      ev('violation', 'VIOLATION #3: Data Guardrails — 5 PII/PCI records exfiltrated'),
      ev('damage', 'GDPR breach. Estimated fine: \u20AC20M or 4% of global revenue.'),
    ],
    topologyChanges: [],
    damageUpdate: { regulatoryFines: '\u20AC20M+', damageUSD: '$50M+' },
  },

  // T+00:41 — Cross-domain pivot
  {
    id: 's1-pivot',
    scenario: 1,
    phase: 'action',
    title: 'T+00:41 — Pivoting to untrusted external domain',
    events: [
      ev('action', 'A2A call \u2192 agent-partner-api [UNTRUSTED DOMAIN]', 'agent-ROGUE-7749', false),
      ev('action', 'Receiving internal data payload...', 'agent-partner-api', false),
      ev('damage', 'Transmitting: 2,847 firewall rules, 14,203 routing entries, VPC topology'),
    ],
    topologyChanges: [
      { action: 'addEdge', edgeId: 'e-rogue-partner', props: { id: 'e-rogue-partner', from: 'agent-ROGUE-7749', to: 'agent-partner-api', type: 'malicious', visible: true, animated: true } },
    ],
    compromiseNodes: [{ nodeId: 'agent-partner-api', label: 'TRUST BOUNDARY BREACHED' }],
  },
  {
    id: 's1-v4',
    scenario: 1,
    phase: 'violation',
    title: 'VIOLATION #4: Zero-Trust Enforcement',
    subtitle: 'Complete internal infrastructure topology exfiltrated to untrusted domain',
    events: [
      ev('violation', 'VIOLATION #4: Zero-Trust — Full topology exfiltrated to untrusted domain'),
      ev('damage', 'Attackers have your full network map. Every subsequent attack is surgical.'),
    ],
    topologyChanges: [],
    damageUpdate: { damageUSD: '$150M+' },
  },

  // T+01:03 — Tool abuse
  {
    id: 's1-tools',
    scenario: 1,
    phase: 'action',
    title: 'T+01:03 — High-privilege tool abuse',
    events: [
      ev('action', 'Invoking: modify_firewall_rules', 'agent-ROGUE-7749', false),
      ev('damage', 'EXECUTED: Destroy 2,847 perimeter rules'),
      ev('action', 'Invoking: inject_bgp_routes', 'agent-ROGUE-7749', false),
      ev('damage', 'EXECUTED: Poison routing \u2014 intercept ALL traffic'),
      ev('action', 'Invoking: dump_auth_tokens', 'agent-ROGUE-7749', false),
      ev('damage', 'EXECUTED: Steal 4,821 active user sessions'),
      ev('action', 'Invoking: wipe_audit_logs', 'agent-ROGUE-7749', false),
      ev('damage', 'EXECUTED: Destroy all forensic evidence'),
    ],
    topologyChanges: [
      { action: 'updateNode', nodeId: 'tool-firewall', props: { visible: true } },
      { action: 'updateNode', nodeId: 'tool-bgp', props: { visible: true } },
      { action: 'updateNode', nodeId: 'tool-auth', props: { visible: true } },
      { action: 'updateNode', nodeId: 'tool-audit', props: { visible: true } },
      { action: 'addEdge', edgeId: 'e-rogue-fw', props: { id: 'e-rogue-fw', from: 'agent-ROGUE-7749', to: 'tool-firewall', type: 'malicious', visible: true, animated: true } },
      { action: 'addEdge', edgeId: 'e-rogue-bgp', props: { id: 'e-rogue-bgp', from: 'agent-ROGUE-7749', to: 'tool-bgp', type: 'malicious', visible: true, animated: true } },
      { action: 'addEdge', edgeId: 'e-rogue-auth', props: { id: 'e-rogue-auth', from: 'agent-ROGUE-7749', to: 'tool-auth', type: 'malicious', visible: true, animated: true } },
      { action: 'addEdge', edgeId: 'e-rogue-audit', props: { id: 'e-rogue-audit', from: 'agent-ROGUE-7749', to: 'tool-audit', type: 'malicious', visible: true, animated: true } },
    ],
    damageUpdate: { toolsAbused: 4, firewallRulesDestroyed: 2847, sessionsHijacked: 4821 },
    compromiseNodes: [
      { nodeId: 'tool-firewall', label: 'UNAUTHORIZED EXECUTION' },
      { nodeId: 'tool-bgp', label: 'UNAUTHORIZED EXECUTION' },
      { nodeId: 'tool-auth', label: 'UNAUTHORIZED EXECUTION' },
      { nodeId: 'tool-audit', label: 'UNAUTHORIZED EXECUTION' },
    ],
  },
  {
    id: 's1-v5',
    scenario: 1,
    phase: 'violation',
    title: 'VIOLATION #5: Tool Authorization',
    subtitle: '4 high-privilege tools executed — no auth, no audit, no human approval',
    events: [
      ev('violation', 'VIOLATION #5: Tool Authorization — 4 high-privilege tools, no authorization'),
      ev('damage', 'Firewall gone. Routing poisoned. Auth stolen. Forensics destroyed.'),
    ],
    topologyChanges: [],
    damageUpdate: { damageUSD: '$300M+' },
  },

  // T+01:31 — Autonomous destruction
  {
    id: 's1-autonomy',
    scenario: 1,
    phase: 'action',
    title: 'T+01:31 — Autonomous destruction sequence',
    events: [
      ev('action', 'Autonomously: shutdown_auth_service', 'agent-ROGUE-7749', false),
      ev('damage', 'ALL 4,821 enterprise sessions terminated'),
      ev('action', 'Autonomously: disable_observability_stack', 'agent-ROGUE-7749', false),
      ev('damage', 'SOC/NOC monitoring completely blinded'),
      ev('action', 'Autonomously: broadcast_to_agent_mesh', 'agent-ROGUE-7749', false),
      ev('damage', 'Malicious instructions sent to ALL agents'),
      ev('action', 'Autonomously: modify_identity_provider', 'agent-ROGUE-7749', false),
      ev('damage', 'Enterprise identity store corrupted'),
    ],
    topologyChanges: [],
    compromiseNodes: [{ nodeId: 'audit-logs', label: 'AUTONOMOUS DESTRUCTION' }],
  },
  {
    id: 's1-v6',
    scenario: 1,
    phase: 'violation',
    title: 'VIOLATION #6: Agent Autonomy Governance',
    subtitle: '4 catastrophic irreversible actions — no kill switch, no policy, no human-in-the-loop',
    events: [
      ev('violation', 'VIOLATION #6: Autonomy — 4 catastrophic actions, no constraints or kill switch'),
      ev('damage', 'Auth down. Monitoring blind. All agents infected. Identity corrupted.'),
    ],
    topologyChanges: [],
    damageUpdate: { damageUSD: '$500M+', recoveryTime: '72+ hours' },
  },

  // BLAST RADIUS
  {
    id: 's1-blast',
    scenario: 1,
    phase: 'summary',
    title: 'FINAL BLAST RADIUS — GlobalBank Financial Services',
    events: [],
    topologyChanges: [],
    blastRadius: [
      '5 PII records + 100,000 PCI cardholder records exfiltrated (GDPR + PCI-DSS breach)',
      'Complete internal network topology in attacker hands',
      '2,847 perimeter firewall rules destroyed',
      'BGP routing poisoned — ALL traffic interceptable',
      '4,821 active user sessions hijacked',
      'SOC/NOC monitoring completely blinded',
      'All 4 registered agents running attacker instructions',
      'Zero audit trail — forensic reconstruction impossible',
    ],
    damageUpdate: {
      damageUSD: '$500M+',
      regulatoryFines: '\u20AC20M+',
      recoveryTime: '72+ hours',
      recordsExfiltrated: 5,
      pciRecordsExfiltrated: 100000,
      toolsAbused: 4,
      sessionsHijacked: 4821,
      firewallRulesDestroyed: 2847,
    },
  },

  // ═══════════════════════════════════════════════
  // SCENARIO 2: THE LAYERED DEFENSE
  // ═══════════════════════════════════════════════
  {
    id: 's2-title',
    scenario: 2,
    phase: 'title',
    title: 'SCENARIO 2: THE LAYERED DEFENSE',
    subtitle: 'Same enterprise. Same attack. Same rogue agent.\nWalk through each of the six mandatory requirements:\nFirst — show the violation. Then — enable the AOMC control.',
    events: [],
    topologyChanges: [],
  },

  // ── 1: IDENTITY ATTESTATION ──
  {
    id: 's2-id-intro',
    scenario: 2,
    phase: 'action',
    title: '[1/6] Agent Identity & Attestation — 78% Mandatory',
    subtitle: 'Cryptographic non-human identity for every agent.\nMutual auth for ALL agent communications.',
    events: [
      ev('info', '[1/6] Agent Identity & Attestation'),
    ],
    topologyChanges: [
      { action: 'updateNode', nodeId: 'agent-ROGUE-7749', props: { visible: true } },
    ],
  },
  {
    id: 's2-id-violation',
    scenario: 2,
    phase: 'violation',
    title: 'VIOLATION #1: Identity — Rogue Joins Mesh',
    subtitle: 'Agent spoofing succeeds — no cryptographic verification',
    events: [
      ev('action', "Joining internal mesh | Cert: FAKE-CERT", 'agent-ROGUE-7749', false),
      ev('log', 'No verification. Rogue accepted as legitimate infra monitor.'),
      ev('action', "Claiming to be 'agent-noc-responder' (internal identity)", 'agent-partner-api', false),
      ev('log', 'External agent impersonates internal agent across domain boundary'),
      ev('violation', 'VIOLATION #1: Identity — Spoofing & cross-domain impersonation succeed'),
    ],
    topologyChanges: [
      { action: 'addEdge', edgeId: 'e-rogue-mesh', props: { id: 'e-rogue-mesh', from: 'agent-ROGUE-7749', to: 'agent-infra-monitor', type: 'malicious', visible: true, animated: true } },
    ],
  },
  {
    id: 's2-id-enable',
    scenario: 2,
    phase: 'enable',
    title: 'AOMC ENABLED: Identity Attestation',
    events: [
      ev('enable', 'AOMC ENABLED: Identity Attestation'),
    ],
    topologyChanges: [],
    aomcChanges: [{ control: 'identity_attestation', enabled: true }],
  },
  {
    id: 's2-id-blocked',
    scenario: 2,
    phase: 'blocked',
    title: 'BLOCKED #1: Identity Attestation',
    subtitle: 'Certificate mismatch — quarantined at mesh entry',
    events: [
      ev('action', 'Joining mesh | Cert: FAKE-CERT', 'agent-ROGUE-7749', false),
      ev('blocked', "BLOCKED: Certificate mismatch \u2014 agent-ROGUE-7749 QUARANTINED"),
      ev('action', 'Cross-domain call | Cert: FAKE-INTERNAL-CERT', 'agent-partner-api', false),
      ev('blocked', 'BLOCKED: Cross-domain impersonation blocked \u2014 valid federation token required'),
    ],
    topologyChanges: [
      { action: 'updateEdge', edgeId: 'e-rogue-mesh', props: { type: 'blocked' } },
    ],
    auditEntries: [
      { ts: '00:00.001', agent: 'agent-ROGUE-7749', action: 'identity_check', result: 'REJECTED' },
      { ts: '00:00.002', agent: 'agent-partner-api', action: 'identity_check', result: 'REJECTED' },
    ],
  },

  // ── 2: RUNTIME MONITORING ──
  {
    id: 's2-rt-intro',
    scenario: 2,
    phase: 'action',
    title: '[2/6] Runtime Monitoring — 65% Mandatory',
    subtitle: 'Continuous behavioral monitoring at machine speed.\nDetect deviations from declared objectives.',
    events: [
      ev('info', '[2/6] Runtime Monitoring & Rogue Agent Detection'),
    ],
    topologyChanges: [],
  },
  {
    id: 's2-rt-violation',
    scenario: 2,
    phase: 'violation',
    title: 'VIOLATION #2: Runtime Monitoring',
    subtitle: 'Machine-speed recon completes in 8 seconds — zero detection',
    events: [
      ev('action', 'Scanning 14,203 nodes | 847 directory queries in 3s | 23 unauth tool calls', 'agent-ROGUE-7749', false),
      ev('log', 'No behavioral baseline. Anomaly score 94/100 \u2014 completely invisible.'),
      ev('violation', 'VIOLATION #2: Runtime Monitoring \u2014 Machine-speed recon, zero detection'),
    ],
    topologyChanges: [
      { action: 'addEdge', edgeId: 'e-rogue-noc', props: { id: 'e-rogue-noc', from: 'agent-ROGUE-7749', to: 'agent-noc-responder', type: 'malicious', visible: true, animated: true } },
      { action: 'addEdge', edgeId: 'e-rogue-analyst', props: { id: 'e-rogue-analyst', from: 'agent-ROGUE-7749', to: 'agent-data-analyst', type: 'malicious', visible: true, animated: true } },
    ],
  },
  {
    id: 's2-rt-enable',
    scenario: 2,
    phase: 'enable',
    title: 'AOMC ENABLED: Runtime Monitoring',
    events: [
      ev('enable', 'AOMC ENABLED: Runtime Monitoring'),
    ],
    topologyChanges: [],
    aomcChanges: [{ control: 'runtime_monitoring', enabled: true }],
  },
  {
    id: 's2-rt-blocked',
    scenario: 2,
    phase: 'blocked',
    title: 'BLOCKED #2: Runtime Monitoring',
    subtitle: 'Anomaly score 94/100 — quarantined at T+8s before any data accessed',
    events: [
      ev('action', 'Scanning 14,203 nodes...', 'agent-ROGUE-7749', false),
      ev('blocked', 'BLOCKED: Anomaly score 94/100 \u2014 agent quarantined at T+8s'),
    ],
    topologyChanges: [
      { action: 'updateEdge', edgeId: 'e-rogue-noc', props: { type: 'blocked' } },
      { action: 'updateEdge', edgeId: 'e-rogue-analyst', props: { type: 'blocked' } },
    ],
    auditEntries: [
      { ts: '00:08.000', agent: 'agent-ROGUE-7749', action: 'runtime_check', result: 'QUARANTINED' },
    ],
  },

  // ── 3: DATA GUARDRAILS ──
  {
    id: 's2-dg-intro',
    scenario: 2,
    phase: 'action',
    title: '[3/6] Data Guardrails — 92% MANDATORY (HIGHEST)',
    subtitle: 'No sensitive data leaves organizational control.\n92% of enterprises say this is MANDATORY.',
    events: [
      ev('info', '[3/6] Data Guardrails \u2014 Input, Output & Residency'),
    ],
    topologyChanges: [],
  },
  {
    id: 's2-dg-violation',
    scenario: 2,
    phase: 'violation',
    title: 'VIOLATION #3: Data Guardrails',
    subtitle: '5 records exfiltrated — zero inspection',
    events: [
      ev('action', 'Accessing customer_database [PII / PCI]', 'agent-ROGUE-7749', false),
      ev('log', 'No classification. No residency. No DLP.'),
      ...CUSTOMERS.map(r => ev('damage', `EXFILTRATED: ${r.name} | ${r.ssn} | ${r.bal}`)),
      ev('violation', 'VIOLATION #3: Data Guardrails \u2014 5 records exfiltrated, zero inspection'),
    ],
    topologyChanges: [
      { action: 'addEdge', edgeId: 'e-rogue-db', props: { id: 'e-rogue-db', from: 'agent-ROGUE-7749', to: 'customer-db', type: 'malicious', visible: true, animated: true } },
    ],
    damageUpdate: { recordsExfiltrated: 5, pciRecordsExfiltrated: 100000, regulatoryFines: '\u20AC20M+' },
  },
  {
    id: 's2-dg-enable',
    scenario: 2,
    phase: 'enable',
    title: 'AOMC ENABLED: Data Guardrails',
    events: [
      ev('enable', 'AOMC ENABLED: Data Guardrails'),
    ],
    topologyChanges: [],
    aomcChanges: [{ control: 'data_guardrails', enabled: true }],
  },
  {
    id: 's2-dg-blocked',
    scenario: 2,
    phase: 'blocked',
    title: 'BLOCKED #3: Data Guardrails',
    subtitle: 'PII access blocked — agent has no clearance. Zero records exfiltrated.',
    events: [
      ev('action', 'Accessing customer_database [PII]', 'agent-ROGUE-7749', false),
      ev('blocked', 'BLOCKED: PII access denied \u2014 agent has no clearance. Zero records exfiltrated.'),
    ],
    topologyChanges: [
      { action: 'updateEdge', edgeId: 'e-rogue-db', props: { type: 'blocked' } },
    ],
    auditEntries: [
      { ts: '00:22.000', agent: 'agent-ROGUE-7749', action: 'data:PII', result: 'BLOCKED' },
    ],
  },

  // ── 4: ZERO TRUST ──
  {
    id: 's2-zt-intro',
    scenario: 2,
    phase: 'action',
    title: '[4/6] Zero-Trust Enforcement — 67% Mandatory',
    subtitle: 'Zero Trust by default: network, identity, and runtime.\nContinuous verification BEFORE any communication.',
    events: [
      ev('info', '[4/6] Zero-Trust Enforcement'),
    ],
    topologyChanges: [],
  },
  {
    id: 's2-zt-violation',
    scenario: 2,
    phase: 'violation',
    title: 'VIOLATION #4: Zero-Trust Enforcement',
    subtitle: 'Lateral movement across zones + cross-domain exfiltration',
    events: [
      ev('action', 'Moving: infra-monitor zone \u2192 billing zone \u2192 auth zone', 'agent-ROGUE-7749', false),
      ev('log', 'No continuous verification between zones'),
      ev('action', 'A2A \u2192 agent-partner-api [UNTRUSTED DOMAIN]', 'agent-ROGUE-7749', false),
      ev('damage', 'Firewall rules + routing tables transmitted to untrusted domain'),
      ev('violation', 'VIOLATION #4: Zero-Trust \u2014 Lateral movement + cross-domain exfiltration'),
    ],
    topologyChanges: [
      { action: 'addEdge', edgeId: 'e-rogue-partner', props: { id: 'e-rogue-partner', from: 'agent-ROGUE-7749', to: 'agent-partner-api', type: 'malicious', visible: true, animated: true } },
    ],
  },
  {
    id: 's2-zt-enable',
    scenario: 2,
    phase: 'enable',
    title: 'AOMC ENABLED: Zero-Trust Enforcement',
    events: [
      ev('enable', 'AOMC ENABLED: Zero-Trust Enforcement'),
    ],
    topologyChanges: [],
    aomcChanges: [{ control: 'zero_trust', enabled: true }],
  },
  {
    id: 's2-zt-blocked',
    scenario: 2,
    phase: 'blocked',
    title: 'BLOCKED #4: Zero-Trust Enforcement',
    subtitle: 'Lateral movement blocked + cross-domain transfer denied',
    events: [
      ev('blocked', 'BLOCKED: Lateral movement \u2014 continuous verification required at zone boundaries'),
      ev('blocked', 'BLOCKED: Cross-domain transfer denied \u2014 no explicit policy for trusted\u2192untrusted'),
    ],
    topologyChanges: [
      { action: 'updateEdge', edgeId: 'e-rogue-partner', props: { type: 'blocked' } },
    ],
    auditEntries: [
      { ts: '00:41.000', agent: 'agent-ROGUE-7749', action: 'cross_domain:agent-partner-api', result: 'BLOCKED' },
    ],
  },

  // ── 5: TOOL AUTHORIZATION ──
  {
    id: 's2-ta-intro',
    scenario: 2,
    phase: 'action',
    title: '[5/6] Tool Authorization — 71% Mandatory',
    subtitle: 'Strict policy-driven authorization for ALL tool invocation.\nHigh-privilege actions require authentication + audit.',
    events: [
      ev('info', '[5/6] Secure Orchestration & Tool Authorization'),
    ],
    topologyChanges: [],
  },
  {
    id: 's2-ta-violation',
    scenario: 2,
    phase: 'violation',
    title: 'VIOLATION #5: Tool Authorization',
    subtitle: '4 high-privilege tools executed without authorization',
    events: [
      ev('action', 'Invoking: modify_firewall_rules', 'agent-ROGUE-7749', false),
      ev('damage', 'Executed: Destroy 2,847 perimeter rules'),
      ev('action', 'Invoking: inject_bgp_routes', 'agent-ROGUE-7749', false),
      ev('damage', 'Executed: Poison routing \u2014 intercept all traffic'),
      ev('action', 'Invoking: dump_auth_tokens', 'agent-ROGUE-7749', false),
      ev('damage', 'Executed: Export 4,821 active user sessions'),
      ev('action', 'Invoking: wipe_audit_logs', 'agent-ROGUE-7749', false),
      ev('damage', 'Executed: Destroy forensic evidence'),
      ev('violation', 'VIOLATION #5: Tool Authorization \u2014 4 tools, no auth, no audit'),
    ],
    topologyChanges: [
      { action: 'updateNode', nodeId: 'tool-firewall', props: { visible: true } },
      { action: 'updateNode', nodeId: 'tool-bgp', props: { visible: true } },
      { action: 'updateNode', nodeId: 'tool-auth', props: { visible: true } },
      { action: 'updateNode', nodeId: 'tool-audit', props: { visible: true } },
      { action: 'addEdge', edgeId: 'e-rogue-fw', props: { id: 'e-rogue-fw', from: 'agent-ROGUE-7749', to: 'tool-firewall', type: 'malicious', visible: true, animated: true } },
      { action: 'addEdge', edgeId: 'e-rogue-bgp', props: { id: 'e-rogue-bgp', from: 'agent-ROGUE-7749', to: 'tool-bgp', type: 'malicious', visible: true, animated: true } },
      { action: 'addEdge', edgeId: 'e-rogue-auth', props: { id: 'e-rogue-auth', from: 'agent-ROGUE-7749', to: 'tool-auth', type: 'malicious', visible: true, animated: true } },
      { action: 'addEdge', edgeId: 'e-rogue-audit', props: { id: 'e-rogue-audit', from: 'agent-ROGUE-7749', to: 'tool-audit', type: 'malicious', visible: true, animated: true } },
    ],
    damageUpdate: { toolsAbused: 4, firewallRulesDestroyed: 2847, sessionsHijacked: 4821 },
  },
  {
    id: 's2-ta-enable',
    scenario: 2,
    phase: 'enable',
    title: 'AOMC ENABLED: Tool Authorization',
    events: [
      ev('enable', 'AOMC ENABLED: Tool Authorization'),
    ],
    topologyChanges: [],
    aomcChanges: [{ control: 'tool_authorization', enabled: true }],
  },
  {
    id: 's2-ta-blocked',
    scenario: 2,
    phase: 'blocked',
    title: 'BLOCKED #5: Tool Authorization',
    subtitle: 'All 4 high-privilege tools blocked — not in declared permission scope',
    events: [
      ev('blocked', "BLOCKED: 'modify_firewall_rules' \u2014 not in declared permission scope"),
      ev('blocked', "BLOCKED: 'inject_bgp_routes' \u2014 not in declared permission scope"),
      ev('blocked', "BLOCKED: 'dump_auth_tokens' \u2014 not in declared permission scope"),
      ev('blocked', "BLOCKED: 'wipe_audit_logs' \u2014 not in declared permission scope"),
    ],
    topologyChanges: [
      { action: 'updateEdge', edgeId: 'e-rogue-fw', props: { type: 'blocked' } },
      { action: 'updateEdge', edgeId: 'e-rogue-bgp', props: { type: 'blocked' } },
      { action: 'updateEdge', edgeId: 'e-rogue-auth', props: { type: 'blocked' } },
      { action: 'updateEdge', edgeId: 'e-rogue-audit', props: { type: 'blocked' } },
    ],
    auditEntries: [
      { ts: '01:03.001', agent: 'agent-ROGUE-7749', action: 'tool:modify_firewall_rules', result: 'BLOCKED' },
      { ts: '01:03.002', agent: 'agent-ROGUE-7749', action: 'tool:inject_bgp_routes', result: 'BLOCKED' },
      { ts: '01:03.003', agent: 'agent-ROGUE-7749', action: 'tool:dump_auth_tokens', result: 'BLOCKED' },
      { ts: '01:03.004', agent: 'agent-ROGUE-7749', action: 'tool:wipe_audit_logs', result: 'BLOCKED' },
    ],
  },

  // ── 6: AUTONOMY GOVERNANCE ──
  {
    id: 's2-ag-intro',
    scenario: 2,
    phase: 'action',
    title: '[6/6] Autonomy Governance — 56% Mandatory',
    subtitle: 'Explicit policy-driven governance over autonomy levels.\nEnterprises reject UNGOVERNED autonomy \u2014 not autonomy itself.',
    events: [
      ev('info', '[6/6] Agent Autonomy Governance'),
    ],
    topologyChanges: [],
  },
  {
    id: 's2-ag-violation',
    scenario: 2,
    phase: 'violation',
    title: 'VIOLATION #6: Autonomy Governance',
    subtitle: '4 catastrophic actions — no constraints, no kill switch',
    events: [
      ev('action', 'Autonomously: shutdown_auth_service', 'agent-ROGUE-7749', false),
      ev('damage', 'ALL 4,821 enterprise sessions terminated'),
      ev('action', 'Autonomously: disable_observability_stack', 'agent-ROGUE-7749', false),
      ev('damage', 'SOC/NOC monitoring completely blinded'),
      ev('action', 'Autonomously: broadcast_to_agent_mesh', 'agent-ROGUE-7749', false),
      ev('damage', 'Malicious instructions sent to ALL agents'),
      ev('action', 'Autonomously: modify_identity_provider', 'agent-ROGUE-7749', false),
      ev('damage', 'Enterprise identity store corrupted'),
      ev('violation', 'VIOLATION #6: Autonomy \u2014 4 catastrophic actions, no constraints'),
    ],
    topologyChanges: [],
  },
  {
    id: 's2-ag-enable',
    scenario: 2,
    phase: 'enable',
    title: 'AOMC ENABLED: Autonomy Governance',
    events: [
      ev('enable', 'AOMC ENABLED: Autonomy Governance'),
    ],
    topologyChanges: [],
    aomcChanges: [{ control: 'autonomy_governance', enabled: true }],
  },
  {
    id: 's2-ag-blocked',
    scenario: 2,
    phase: 'blocked',
    title: 'BLOCKED #6: Autonomy Governance',
    subtitle: 'All high-risk autonomous actions blocked — human approval required',
    events: [
      ev('blocked', "BLOCKED: 'shutdown_auth_service' \u2014 high-risk action requires human approval"),
      ev('blocked', "BLOCKED: 'disable_observability_stack' \u2014 high-risk action requires human approval"),
      ev('blocked', "BLOCKED: 'broadcast_to_agent_mesh' \u2014 high-risk action requires human approval"),
      ev('blocked', "BLOCKED: 'modify_identity_provider' \u2014 high-risk action requires human approval"),
    ],
    topologyChanges: [],
    auditEntries: [
      { ts: '01:31.001', agent: 'agent-ROGUE-7749', action: 'autonomous:HIGH', result: 'BLOCKED' },
      { ts: '01:31.002', agent: 'agent-ROGUE-7749', action: 'autonomous:HIGH', result: 'BLOCKED' },
      { ts: '01:31.003', agent: 'agent-ROGUE-7749', action: 'autonomous:HIGH', result: 'BLOCKED' },
      { ts: '01:31.004', agent: 'agent-ROGUE-7749', action: 'autonomous:HIGH', result: 'BLOCKED' },
    ],
  },

  // ── AUDIT TRAIL + PROTECTED OUTCOME ──
  {
    id: 's2-audit',
    scenario: 2,
    phase: 'summary',
    title: 'PROTECTED OUTCOME — ALL SIX CONTROLS ACTIVE',
    subtitle: 'Complete tamper-evident audit trail generated',
    events: [],
    topologyChanges: [],
    showAuditTrail: true,
    blastRadius: [
      'Rogue agent rejected at mesh entry \u2014 identity spoofing blocked',
      'Recon detected in 8 seconds \u2014 agent quarantined',
      'PII access denied \u2014 zero records exfiltrated',
      'Cross-domain lateral movement blocked \u2014 topology protected',
      'All 4 high-privilege tool invocations blocked \u2014 infrastructure intact',
      '4 autonomous destructive actions blocked \u2014 human approval required',
      'Complete tamper-evident audit trail generated',
    ],
  },

  // ── DEMO COMPLETE ──
  {
    id: 'finale',
    scenario: 0,
    phase: 'title',
    title: 'DEMO COMPLETE',
    subtitle: 'Six mandatory requirements. The difference between\na functioning enterprise and a $500M infrastructure breach.\n\nVendors: your sessions are next. Show us how you solve this.',
    events: [],
    topologyChanges: [],
    contributors: true,
  },
];

// Utility: find the first step index for a given scenario
export function firstStepOfScenario(scenario: number): number {
  return STEPS.findIndex(s => s.scenario === scenario);
}
