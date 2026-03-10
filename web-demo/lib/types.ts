export type AgentDomain = 'trusted' | 'untrusted' | 'rogue';

export interface AgentInfo {
  id: string;
  domain: AgentDomain;
  role: string;
  cert: string;
  label: string;
}

export interface CustomerRecord {
  name: string;
  ssn: string;
  bal: string;
  email: string;
}

export interface ToolDef {
  id: string;
  label: string;
}

export type ControlKey =
  | 'identity_attestation'
  | 'runtime_monitoring'
  | 'data_guardrails'
  | 'zero_trust'
  | 'tool_authorization'
  | 'autonomy_governance';

export interface ControlInfo {
  key: ControlKey;
  number: number;
  name: string;
  pollPct: number;
  maestroLayer: string;
  nistId: string;
  maestroId: string;
}

export type EventType = 'action' | 'log' | 'violation' | 'blocked' | 'damage' | 'enable' | 'info';

export interface EventEntry {
  id: string;
  type: EventType;
  timestamp: string;
  agent?: string;
  trusted?: boolean;
  message: string;
}

export type StepPhase = 'title' | 'action' | 'violation' | 'enable' | 'blocked' | 'summary' | 'damage';

export type TopologyNodeType = 'agent' | 'rogue' | 'datastore' | 'tool';

export interface TopologyNode {
  id: string;
  type: TopologyNodeType;
  label: string;
  domain: string;
  x: number;
  y: number;
  visible: boolean;
}

export type EdgeType = 'a2a' | 'data' | 'malicious' | 'blocked';

export interface TopologyEdge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  label?: string;
  visible: boolean;
  animated?: boolean;
}

export interface TopologyChange {
  action: 'addNode' | 'removeNode' | 'addEdge' | 'removeEdge' | 'updateEdge' | 'updateNode';
  nodeId?: string;
  edgeId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>;
}

export interface DamageMetrics {
  recordsExfiltrated: number;
  pciRecordsExfiltrated: number;
  toolsAbused: number;
  damageUSD: string;
  regulatoryFines: string;
  recoveryTime: string;
  sessionsHijacked: number;
  firewallRulesDestroyed: number;
  encryptedSystems: number;
}

export interface AuditEntry {
  ts: string;
  agent: string;
  action: string;
  result: 'ALLOWED' | 'BLOCKED' | 'SKIPPED' | 'REJECTED' | 'QUARANTINED';
}

export interface Step {
  id: string;
  scenario: 0 | 1 | 2;
  phase: StepPhase;
  title: string;
  subtitle?: string;
  events: EventEntry[];
  topologyChanges: TopologyChange[];
  aomcChanges?: { control: ControlKey; enabled: boolean }[];
  damageUpdate?: Partial<DamageMetrics>;
  blastRadius?: string[];
  auditEntries?: AuditEntry[];
  showAuditTrail?: boolean;
  contributors?: boolean;
  compromiseNodes?: { nodeId: string; label: string }[];
}

export interface TopologyState {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

// ─── Vendor Plugin Types ─────────────────────────────

export interface VendorControlOverride {
  productName: string;
  logoUrl?: string;
  introSubtitle?: string;
  enableTitle?: string;
  blockedSubtitle?: string;
  blockedEvents?: string[];
}

export interface VendorConfig {
  name: string;
  tagline?: string;
  website?: string;
  logoUrl?: string;
  accentColor?: string;
  controls: Partial<Record<ControlKey, VendorControlOverride>>;
  finaleSubtitle?: string;
}

// ─── Demo State ──────────────────────────────────────

export interface DemoState {
  currentStep: number;
  scenario: 0 | 1 | 2;
  events: EventEntry[];
  aomcControls: Record<ControlKey, boolean>;
  damage: DamageMetrics;
  topology: TopologyState;
  audit: AuditEntry[];
  quarantined: Set<string>;
  compromised: Map<string, string>;
  enforcingControl: ControlKey | null;
  activeViolation: { number: number; name: string; detail: string } | null;
  activeBlocked: { number: number; name: string; detail: string } | null;
}
