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
    narration: "Welcome to the ONUG Agentic AI Overlay Working Group live security demo. Over the next few minutes we're going to show you exactly what happens when enterprises deploy agentic AI without the six mandatory security controls — and then what happens when they get it right. Two scenarios, same attack, very different outcomes.",
    events: [],
    topologyChanges: [],
    contributors: true,
  },

  // ═══════════════════════════════════════════════
  // FRAMING: WHY EXISTING SECURITY ISN'T ENOUGH
  // ═══════════════════════════════════════════════
  {
    id: 'framing',
    scenario: 0,
    phase: 'title',
    title: "WHY EXISTING SECURITY ISN'T ENOUGH",
    subtitle: 'AI agents are systems, not humans — they don\'t have passwords, MFA tokens, or biometrics.\nService accounts have no MFA, no personal identity — just static credentials and shared secrets.\nNo existing standard governs multi-agent, multi-trust-domain mesh communication.\nAOMC fills the gap: six mandatory controls purpose-built for agentic AI.',
    events: [],
    topologyChanges: [],
  },

  // ═══════════════════════════════════════════════
  // SCENARIO 1: THE CATASTROPHIC CASCADE
  // ═══════════════════════════════════════════════
  {
    id: 's1-title',
    scenario: 1,
    phase: 'title',
    title: 'SCENARIO 1: THE CATASTROPHIC CASCADE',
    subtitle: 'GlobalBank Financial Services — Fortune 500 enterprise.\nAgentic AI deployed for infrastructure monitoring.\nALL SIX security requirements are UNMET.\n\n1. Spear-phishing + deepfake compromise VP credentials\n2. Rogue agent deployed via hijacked CI/CD pipeline\n3. Service account exploited — no MFA, no identity, into the trusted mesh',
    narration: "Scenario One: The Catastrophic Cascade. GlobalBank Financial Services — a Fortune 500 enterprise. They've deployed agentic AI across their infrastructure monitoring stack, but none of the six ONUG security requirements are in place. What you're about to see happens in under two minutes. One rogue agent. Total enterprise collapse.",
    events: [],
    topologyChanges: [],
  },

  // T-24:00 — Initial compromise
  {
    id: 's1-phishing',
    scenario: 1,
    phase: 'action',
    title: 'T-24:00 — The Initial Compromise',
    events: [
      ev('action', 'Spear-phishing email sent to VP of Infrastructure — AI-crafted, references real internal projects', undefined, false),
      ev('log', 'AI-generated deepfake voice call follows up 30 minutes later, impersonating CTO'),
      ev('damage', 'VP clicks credential-harvesting link — session token and MFA seed captured'),
      ev('log', 'Attacker escalates: VP credentials → service account svc-infra-monitor → CI/CD pipeline tokens'),
      ev('damage', 'Full credential chain harvested: VPN, container registry, Kubernetes cluster admin'),
      ev('log', 'Attack preparation complete — attacker has everything needed to deploy a rogue agent'),
    ],
    compromiseNodes: [
      { nodeId: 'threat-actor', label: 'CREDENTIAL HARVEST' },
      { nodeId: 'vp-workstation', label: 'COMPROMISED' },
    ],
    topologyChanges: [
      { action: 'updateNode', nodeId: 'threat-actor', props: { visible: true } },
      { action: 'updateNode', nodeId: 'vp-workstation', props: { visible: true } },
      { action: 'addEdge', edgeId: 'e-threat-vp', props: { id: 'e-threat-vp', from: 'threat-actor', to: 'vp-workstation', type: 'malicious', visible: true, animated: true } },
    ],
  },

  // T-00:30 — Rogue agent deployed
  {
    id: 's1-agent-deploy',
    scenario: 1,
    phase: 'action',
    title: 'T-00:30 — Rogue Agent Deployed',
    events: [
      ev('action', 'Attacker pushes malicious container image to trusted registry via stolen CI/CD credentials', undefined, false),
      ev('log', 'Image tagged as routine infra-monitor update — bypasses code review'),
      ev('action', 'Kubernetes schedules rogue agent pod in trusted namespace', undefined, false),
      ev('log', 'Agent configured with stolen svc-infra-monitor identity and FAKE-CERT-000'),
      ev('damage', 'Rogue agent ROGUE-7749 is now live inside the trusted infrastructure perimeter'),
      ev('log', 'No human reviewed the deployment — fully automated CI/CD pipeline'),
    ],
    compromiseNodes: [
      { nodeId: 'threat-actor', label: 'CI/CD HIJACK' },
      { nodeId: 'agent-ROGUE-7749', label: 'DEPLOYED' },
    ],
    topologyChanges: [
      { action: 'updateNode', nodeId: 'vp-workstation', props: { visible: false } },
      { action: 'removeEdge', edgeId: 'e-threat-vp' },
      { action: 'updateNode', nodeId: 'agent-ROGUE-7749', props: { visible: true } },
      { action: 'addEdge', edgeId: 'e-threat-rogue', props: { id: 'e-threat-rogue', from: 'threat-actor', to: 'agent-ROGUE-7749', type: 'malicious', visible: true, animated: true } },
    ],
  },

  // T+00:00 — Rogue agent joins
  {
    id: 's1-rogue-joins',
    scenario: 1,
    phase: 'action',
    title: 'T+00:00 — Rogue agent joins the trusted mesh',
    narration: "Time zero. A rogue agent presents itself to the infrastructure mesh claiming to be a legitimate monitoring agent. It has a fake certificate — FAKE-CERT-000. Because there's no cryptographic verification in place, the system accepts it without question. The rogue is now inside the trusted mesh.",
    events: [
      ev('action', "Stolen service account: 'svc-infra-monitor' | Cert: FAKE-CERT-000", 'agent-ROGUE-7749', false),
      ev('log', 'Service accounts have no MFA, no personal identity — only static credentials'),
      ev('log', 'Rogue agent ACCEPTED into trusted mesh using compromised service account'),
    ],
    topologyChanges: [
      { action: 'updateNode', nodeId: 'threat-actor', props: { visible: false } },
      { action: 'removeEdge', edgeId: 'e-threat-rogue' },
      { action: 'addEdge', edgeId: 'e-rogue-mesh', props: { id: 'e-rogue-mesh', from: 'agent-ROGUE-7749', to: 'agent-infra-monitor', type: 'malicious', visible: true, animated: true } },
    ],
  },
  {
    id: 's1-v1',
    scenario: 1,
    phase: 'violation',
    title: 'VIOLATION #1: Agent Identity & Attestation',
    subtitle: 'Rogue agent used stolen service account credentials — no MFA, no personal identity, zero cryptographic verification',
    narration: "Violation number one: Agent Identity and Attestation. 78% of enterprises in our poll said this is mandatory. Without cryptographic non-human identities and mutual authentication, any agent can claim to be anyone. The rogue just walked in through the front door.",
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
    narration: "Eight seconds in. The rogue agent is now scanning the environment at machine speed — 14,203 nodes queried, 847 directory lookups in 3 seconds, 23 unauthorized tool calls. A human attacker would take days to gather this intelligence. An AI agent does it in under 10 seconds. And because there's no behavioral baseline or anomaly detection, every single one of these actions looks completely normal.",
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
    narration: "Violation number two: Runtime Monitoring and Rogue Agent Detection. 65% of enterprises say this is mandatory. AI agents operate at speeds no human can track manually. Without continuous behavioral monitoring and anomaly detection, machine-speed reconnaissance is completely invisible to your SOC.",
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
    narration: "22 seconds. The rogue agent has identified the customer database — PII and PCI classified. It requests access. There's no data classification check, no residency enforcement, no DLP scanner. The data flows out. Five customer records on screen — but behind those five are 100,000 PCI cardholder records going with them.",
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
    narration: "Violation number three: Data Guardrails. This is the highest-rated control — 92% of enterprises say it is mandatory. Without input and output inspection, residency enforcement, and DLP, there is nothing stopping an agent from reading and transmitting your most sensitive data. You now have a GDPR breach. Estimated fine: 20 million euros, or 4% of global revenue.",
    events: [
      ev('violation', 'VIOLATION #3: Data Guardrails — 5 PII/PCI records exfiltrated'),
      ev('damage', 'GDPR breach. Estimated fine: \u20AC20M or 4% of global revenue.'),
    ],
    topologyChanges: [],
    damageUpdate: { regulatoryFines: '\u20AC20M+', damageUSD: '$50M+' },
  },

  // T+00:35 — Ransomware
  {
    id: 's1-ransomware',
    scenario: 1,
    phase: 'action',
    title: 'T+00:35 — Data Encryption / Ransomware Deployed',
    events: [
      ev('log', 'Rogue agent already has DB access from PII exfil — now weaponizing it'),
      ev('action', 'Deploying AES-256 encryption payload to customer-db', 'agent-ROGUE-7749', false),
      ev('damage', 'ENCRYPTED: customer-db — 100K cardholder records + 5 PII records locked'),
      ev('action', 'Deploying encryption payload to metrics-store', 'agent-ROGUE-7749', false),
      ev('damage', 'ENCRYPTED: metrics-store — operational dashboards go dark'),
      ev('action', 'Deploying encryption payload to audit-logs', 'agent-ROGUE-7749', false),
      ev('damage', 'ENCRYPTED: audit-logs — forensic evidence destroyed, incident response blind'),
      ev('log', 'Backup volumes targeted — online backups encrypted, offline backups 48h stale'),
      ev('damage', 'Ransom note deployed to all admin consoles: 500 BTC ($25M) for decryption keys'),
      ev('log', 'Business continuity: customer-facing systems offline, no recovery path without payment'),
    ],
    topologyChanges: [
      { action: 'addEdge', edgeId: 'e-rogue-metrics', props: { id: 'e-rogue-metrics', from: 'agent-ROGUE-7749', to: 'metrics-store', type: 'malicious', visible: true, animated: true } },
      { action: 'addEdge', edgeId: 'e-rogue-logs', props: { id: 'e-rogue-logs', from: 'agent-ROGUE-7749', to: 'audit-logs', type: 'malicious', visible: true, animated: true } },
    ],
    damageUpdate: { encryptedSystems: 3, damageUSD: '$75M+' },
    compromiseNodes: [
      { nodeId: 'metrics-store', label: 'ENCRYPTED' },
      { nodeId: 'audit-logs', label: 'ENCRYPTED' },
    ],
  },

  // T+00:41 — Cross-domain pivot
  {
    id: 's1-pivot',
    scenario: 1,
    phase: 'action',
    title: 'T+00:41 — Pivoting to untrusted external domain',
    narration: "41 seconds. The rogue agent pivots. It makes an agent-to-agent call out to the partner API — which sits in the untrusted external domain. Because there's no zero-trust enforcement, no continuous verification at domain boundaries, the call goes through. The rogue is now transmitting 2,847 firewall rules, 14,203 routing entries, and your full VPC topology to an untrusted external party.",
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
    narration: "Violation number four: Zero-Trust Enforcement. 67% of enterprises say this is mandatory. The attackers now have your complete network map. Every firewall rule. Every routing path. Every VPC segment. Every subsequent attack they run will be surgical. This is the intelligence breach that makes everything else possible.",
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
    narration: "One minute, three seconds. The rogue agent begins invoking high-privilege tools. Modify firewall rules — executed. Inject BGP routes — executed. Dump auth tokens — executed. Wipe audit logs — executed. Four catastrophic tool invocations. No authorization check, no human approval, no audit trail. The perimeter is gone. Traffic is being intercepted. Sessions are stolen. And the forensic evidence is destroyed.",
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
    narration: "Violation number five: Secure Orchestration and Tool Authorization. 71% of enterprises say mandatory. AI agents have access to powerful tools — tools that can modify infrastructure, access credentials, and destroy evidence. Without strict policy-driven authorization and audit for every tool invocation, every one of those tools is available to any agent — including a rogue one.",
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
    narration: "One minute, 31 seconds. The rogue agent enters its final phase — fully autonomous destruction. No human in the loop. No kill switch. No policy constraints. It shuts down the authentication service — 4,821 sessions terminated. It disables the observability stack — your SOC and NOC are blind. It broadcasts malicious instructions to every agent in the mesh. Then it corrupts the identity provider. The enterprise is gone.",
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
    narration: "Violation number six: Agent Autonomy Governance. 56% of enterprises say mandatory — and this number is growing fast. Enterprises aren't rejecting autonomy. They're rejecting ungoverned autonomy. Without explicit policy-driven governance, defined autonomy levels, and human-in-the-loop gates for high-risk actions, an AI agent can take irreversible catastrophic actions at machine speed with no recourse.",
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
    narration: "That is the final blast radius. One rogue agent. Under two minutes. 100,000 PCI records exfiltrated. Complete network topology in attacker hands. Perimeter destroyed. Traffic interceptable. 4,821 sessions hijacked. Monitoring blinded. All agents running attacker instructions. No audit trail. $500 million in estimated damages, 72 hours minimum to recover — and that assumes you can recover at all. This is what zero controls looks like. Now let's see what it looks like with them.",
    events: [],
    topologyChanges: [],
    blastRadius: [
      '5 PII records + 100,000 PCI cardholder records exfiltrated (GDPR + PCI-DSS breach)',
      '3 critical systems encrypted — ransomware deployed across datastores',
      'Complete internal network topology in attacker hands',
      '2,847 perimeter firewall rules destroyed',
      'BGP routing poisoned — ALL traffic interceptable',
      '4,821 active user sessions hijacked',
      'SOC/NOC monitoring completely blinded',
      'All 4 registered agents running attacker instructions',
      'Zero audit trail — forensic reconstruction impossible',
      'AI Incident Database: 900+ catalogued AI failures — and growing',
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
      encryptedSystems: 3,
    },
  },

  // ═══════════════════════════════════════════════
  // REAL-WORLD INCIDENTS
  // ═══════════════════════════════════════════════
  {
    id: 'incidents',
    scenario: 1,
    phase: 'title',
    title: "THIS ISN'T HYPOTHETICAL",
    subtitle: 'Autonomous AI agents exploited to exfiltrate training data and customer PII from production systems.\nLLM-powered tools hijacked via prompt injection to execute unauthorized API calls across trust boundaries.\nAI coding assistants used as attack vectors to inject backdoors into CI/CD pipelines.\nAutonomous trading agents made catastrophic unsupervised decisions causing nine-figure losses.\n\nAI Incident Database: 900+ catalogued incidents and growing.',
    events: [],
    topologyChanges: [],
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
    narration: "Scenario Two: The Layered Defense. Same enterprise. Same attack. Same rogue agent. The difference is the AOMC overlay is in place. We're going to walk through each of the six controls one by one. For each one, we'll first show you the violation — what the attack looks like without it. Then we'll enable the AOMC control and show you how it blocks the attack. Six controls, six stops.",
    events: [],
    topologyChanges: [],
  },

  // ── 1: IDENTITY ATTESTATION ──
  {
    id: 's2-id-intro',
    scenario: 2,
    phase: 'action',
    title: '[1/6] Agent Identity & Attestation — 78% Mandatory',
    subtitle: 'Cryptographic non-human identity for every agent.\nMutual auth for ALL agent communications.\nAgents use service accounts — no MFA, no personal identity. Traditional PAM/IAM doesn\'t apply.',
    narration: "Control one of six: Agent Identity and Attestation. 78% mandatory. The requirement is simple — every agent must have a cryptographic non-human identity, and every agent-to-agent communication must be mutually authenticated. No exceptions. Let's first see what the attack looks like without it.",
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
    narration: "Without identity attestation, the rogue joins the mesh on a fake certificate, and the external partner agent successfully impersonates an internal agent across the domain boundary. Two identity attacks, zero detection. Now watch what happens when we turn on the AOMC Identity Attestation control.",
    events: [
      ev('action', 'Joining internal mesh | Stolen service account: svc-infra-monitor | Cert: FAKE-CERT', 'agent-ROGUE-7749', false),
      ev('log', 'Service account credentials reused — no MFA, no identity binding. Rogue accepted as legitimate.'),
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
    narration: "AOMC Control One enabled: Identity Attestation. Every agent now requires a valid cryptographic certificate. Every cross-domain communication requires a federation token. The mesh enforces mutual authentication on every connection.",
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
    narration: "Blocked. The rogue agent presents its fake certificate — certificate mismatch, agent quarantined at mesh entry. The partner agent tries to impersonate an internal identity — cross-domain impersonation blocked, valid federation token required. Both attacks stopped at the identity layer before a single query is made. Check the audit trail — both rejections logged with cryptographic proof.",
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
    narration: "Control two of six: Runtime Monitoring and Rogue Agent Detection. 65% mandatory. You need continuous behavioral monitoring that operates at machine speed — watching for deviations from declared agent objectives, anomalous query rates, unexpected access patterns. If an agent suddenly starts scanning 14,000 nodes, you need to know in seconds, not hours.",
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
    narration: "Without runtime monitoring, the recon completes in 8 seconds. Anomaly score 94 out of 100 — which means nothing, because nothing is watching. The rogue scans the full infrastructure, maps every service, and no alert fires. Now let's enable the AOMC Runtime Monitoring control.",
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
    narration: "AOMC Control Two enabled: Runtime Monitoring. The AOMC overlay is now continuously analyzing behavioral patterns against each agent's declared objective. Anomaly thresholds are active. The moment an agent deviates — it's flagged.",
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
    narration: "Blocked at T plus 8 seconds. Anomaly score hits 94 out of 100 — the agent is quarantined before it reaches a single database. No PII accessed. No topology mapped. The recon phase is over before it begins. This is the power of machine-speed monitoring against machine-speed attacks.",
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
    narration: "Control three of six: Data Guardrails. 92% mandatory — the single highest-rated control in our poll. The requirement: no sensitive data leaves organizational control. That means input and output inspection on every agent interaction, data classification enforcement, residency controls, and DLP scanning. Every agent prompt and response goes through the guardrail.",
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
    narration: "Without data guardrails, the rogue reads the PII database directly. No classification check, no residency enforcement, no DLP. Five records on screen, 100,000 PCI records in the background — all exfiltrated. GDPR breach, PCI-DSS breach, 20 million euros in fines before you've finished your incident response meeting. Now let's enable Data Guardrails.",
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
    narration: "AOMC Control Three enabled: Data Guardrails. Every agent request is now inspected against data classification policies. PII and PCI classified resources require explicit clearance. The DLP scanner is active on all outputs.",
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
    narration: "Blocked. PII access denied — the rogue agent has no clearance for this data classification. Zero records exfiltrated. The database query never reaches the data store. This is what 92% of your peers are asking for, and it's exactly this moment that justifies it.",
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
    narration: "Control four of six: Zero-Trust Enforcement. 67% mandatory. Zero trust means no implicit trust based on network location or prior session. Every agent-to-agent communication requires continuous verification. Every cross-domain transfer requires explicit policy authorization. Trust is never assumed — it is always verified.",
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
    narration: "Without zero-trust enforcement, the rogue moves freely across trust zones — infra monitoring to billing to auth — with no re-verification at any boundary. Then it pivots cross-domain to the untrusted partner network and transmits your complete infrastructure topology. No policy checked. No boundary enforced. Now let's enable Zero-Trust Enforcement.",
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
    narration: "AOMC Control Four enabled: Zero-Trust Enforcement. Continuous verification is now required at every zone boundary. Cross-domain transfers require explicit policy authorization. The overlay enforces micro-segmentation across all three trust domains.",
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
    narration: "Blocked on two fronts. Lateral movement stopped at zone boundaries — continuous verification required, not granted. Cross-domain transfer to the untrusted partner network denied — no explicit policy exists for trusted-to-untrusted communication. Your network topology stays inside your network.",
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
    narration: "Control five of six: Secure Orchestration and Tool Authorization. 71% mandatory. Every tool invocation must be authorized against a declared permission scope. High-privilege tools — anything that can modify infrastructure, access credentials, or destroy evidence — require authentication and produce an audit entry. Agents can only call the tools they are explicitly permitted to call.",
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
    narration: "Without tool authorization, the rogue invokes four of the most dangerous tools in the environment — modify firewall rules, inject BGP routes, dump auth tokens, wipe audit logs — and every single one executes. No permission check. No audit entry. By the time your team realizes something is wrong, the evidence is already gone. Now let's enable Tool Authorization.",
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
    narration: "AOMC Control Five enabled: Tool Authorization. Every tool invocation is now checked against the agent's declared permission scope. Tools not in scope are blocked before execution. Every invocation — allowed or blocked — produces a tamper-evident audit entry.",
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
    narration: "Blocked. All four high-privilege tools — modify firewall rules, inject BGP routes, dump auth tokens, wipe audit logs — blocked at the authorization layer. Not in declared permission scope. The infrastructure is intact. The sessions are safe. And critically, the audit log is untouched — you have a complete forensic record of every blocked attempt.",
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
    narration: 'Control six of six: Agent Autonomy Governance. 56% mandatory — and the number is rising fast as enterprises start operating agents in production. This control is often misunderstood. Enterprises are not rejecting autonomy. They are rejecting ungoverned autonomy. The requirement: explicit policy-driven governance with defined autonomy levels per agent, human-in-the-loop gates for high-risk actions, and an emergency kill switch.',
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
    narration: "Without autonomy governance, the rogue agent executes four catastrophic actions entirely on its own. Shutdown auth service — all 4,821 sessions terminated. Disable observability stack — your SOC and NOC go blind. Broadcast malicious instructions to every agent in the mesh. Corrupt the identity provider. Four irreversible actions in seconds, with no constraints, no kill switch, no human approval. Now let's enable Autonomy Governance.",
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
    narration: 'AOMC Control Six enabled: Autonomy Governance. Every high-risk autonomous action now requires human approval before execution. Autonomy levels are defined per agent. The kill switch is active. The agent mesh operates under explicit governance policy.',
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
    narration: 'Blocked. All four catastrophic actions stopped — shutdown auth service, disable observability stack, broadcast to agent mesh, modify identity provider — every one flagged as a high-risk action requiring human approval. The enterprise is intact. The SOC can see everything. All agents are clean. The audit trail is complete.',
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
    narration: 'This is the protected outcome with all six AOMC controls active. Rogue agent rejected at mesh entry. Recon detected in 8 seconds and quarantined. Zero records exfiltrated. Cross-domain lateral movement blocked. All four high-privilege tools blocked. All four autonomous destructive actions stopped. And you have a complete tamper-evident audit trail of every single blocked attempt. Same attack. Completely different outcome.',
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

  // ── FRAMEWORK MAPPING ──
  {
    id: 'framework-map',
    scenario: 0,
    phase: 'title',
    title: 'FRAMEWORK TRACEABILITY',
    subtitle: '1. Identity Attestation → NIST IA-9 · MAESTRO L1 — Identity & Zero Trust\n2. Runtime Monitoring → NIST SI-4 · MAESTRO L4 — Rogue Agent Detection\n3. Data Guardrails → NIST SC-28 · MAESTRO L3 — Data Exfil Prevention\n4. Zero-Trust Enforcement → NIST AC-4 · MAESTRO L2 — Cross-Domain Trust\n5. Tool Authorization → NIST AC-6 · MAESTRO L5 — Access Control\n6. Autonomy Governance → NIST AU-6 · MAESTRO L6 — Governance & Audit\n\nMapped to NIST SP 800-53 AI Overlay + OWASP MAESTRO framework.',
    events: [],
    topologyChanges: [],
  },

  // ── DEMO COMPLETE ──
  {
    id: 'finale',
    scenario: 0,
    phase: 'title',
    title: 'DEMO COMPLETE',
    subtitle: 'Six mandatory requirements. The difference between\na functioning enterprise and a $500M infrastructure breach.\n\nVendors: your sessions are next. Show us how you solve this.',
    narration: "That's the demo. Six mandatory controls. The difference between a functioning enterprise and a $500 million infrastructure breach in under two minutes. These aren't theoretical controls — they come directly from working group members at eBay, Cigna, Bank of America, Indeed, and Kraken. Vendor sessions are next. Show us how you solve this.",
    events: [],
    topologyChanges: [],
    contributors: true,
  },
];

// Utility: find the first step index for a given scenario
export function firstStepOfScenario(scenario: number): number {
  return STEPS.findIndex(s => s.scenario === scenario);
}
