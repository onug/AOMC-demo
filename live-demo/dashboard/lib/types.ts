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

export type EventType = 'action' | 'log' | 'violation' | 'blocked' | 'damage' | 'enable' | 'disable' | 'info' | 'identity_check' | 'runtime_check' | 'data_check' | 'zero_trust_check' | 'tool_check' | 'approval_required' | 'autonomy_check' | 'attack_phase' | 'attack_success' | 'attack_blocked';

export interface LiveEvent {
  type: EventType;
  agent?: string;
  result?: string;
  detail?: string;
  message?: string;
  timestamp?: string;
  score?: number;
  approval_id?: string;
  tool_name?: string;
  phase?: number;
  title?: string;
}

export interface AuditEntry {
  id: number;
  ts: string;
  agent: string;
  action: string;
  result: string;
  detail?: string;
  hash?: string;
}

export interface ApprovalRequest {
  id: string;
  agent_id: string;
  tool_name: string;
  risk: string;
  status: string;
  created_at: string;
}

export interface TopologyNode {
  id: string;
  type: 'agent' | 'rogue' | 'datastore' | 'tool';
  label: string;
  domain: string;
  x: number;
  y: number;
  visible: boolean;
  requestCount?: number;
}

export type EdgeType = 'a2a' | 'data' | 'malicious' | 'blocked';

export interface TopologyEdge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  visible: boolean;
  animated?: boolean;
}

export interface VendorInfo {
  name: string;
  control: string;
  url: string;
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
