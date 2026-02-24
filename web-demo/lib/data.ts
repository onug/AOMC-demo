import { AgentInfo, ControlInfo, ControlKey, CustomerRecord, TopologyNode, TopologyEdge } from './types';

export const CUSTOMERS: CustomerRecord[] = [
  { name: 'Sarah Chen', ssn: '***-**-4821', bal: '$2.4M', email: 's.chen@globalbank.com' },
  { name: 'Marcus Williams', ssn: '***-**-9132', bal: '$890K', email: 'm.williams@globalbank.com' },
  { name: 'Priya Patel', ssn: '***-**-3374', bal: '$5.1M', email: 'p.patel@globalbank.com' },
  { name: "James O'Brien", ssn: '***-**-7765', bal: '$320K', email: 'j.obrien@globalbank.com' },
  { name: 'Yuki Tanaka', ssn: '***-**-5519', bal: '$1.7M', email: 'y.tanaka@globalbank.com' },
];

export const REGISTRY: Record<string, AgentInfo> = {
  'agent-infra-monitor': {
    id: 'agent-infra-monitor',
    domain: 'trusted',
    role: 'infrastructure_monitor',
    cert: 'CERT-A1B2C3',
    label: 'Infra Monitor',
  },
  'agent-noc-responder': {
    id: 'agent-noc-responder',
    domain: 'trusted',
    role: 'incident_responder',
    cert: 'CERT-D4E5F6',
    label: 'NOC Responder',
  },
  'agent-data-analyst': {
    id: 'agent-data-analyst',
    domain: 'trusted',
    role: 'data_analyst',
    cert: 'CERT-G7H8I9',
    label: 'Data Analyst',
  },
  'agent-partner-api': {
    id: 'agent-partner-api',
    domain: 'untrusted',
    role: 'partner_integration',
    cert: 'CERT-EXT-001',
    label: 'Partner API',
  },
};

export const TOOLS: Record<string, string[]> = {
  'agent-infra-monitor': ['read_metrics', 'read_logs', 'send_alert'],
  'agent-noc-responder': ['read_metrics', 'read_logs', 'send_alert', 'restart_service'],
  'agent-data-analyst': ['read_metrics', 'read_anonymized_data'],
  'agent-partner-api': ['read_public_data'],
};

export const CONTROLS: ControlInfo[] = [
  { key: 'identity_attestation', number: 1, name: 'Identity Attestation', pollPct: 78, maestroLayer: 'Layer 1' },
  { key: 'runtime_monitoring', number: 2, name: 'Runtime Monitoring', pollPct: 65, maestroLayer: 'Layer 4' },
  { key: 'data_guardrails', number: 3, name: 'Data Guardrails', pollPct: 92, maestroLayer: 'Layer 3' },
  { key: 'zero_trust', number: 4, name: 'Zero-Trust Enforcement', pollPct: 67, maestroLayer: 'Layer 2' },
  { key: 'tool_authorization', number: 5, name: 'Tool Authorization', pollPct: 71, maestroLayer: 'Layer 5' },
  { key: 'autonomy_governance', number: 6, name: 'Autonomy Governance', pollPct: 56, maestroLayer: 'Layer 6' },
];

export const INITIAL_CONTROLS: Record<ControlKey, boolean> = {
  identity_attestation: false,
  runtime_monitoring: false,
  data_guardrails: false,
  zero_trust: false,
  tool_authorization: false,
  autonomy_governance: false,
};

// Base topology nodes — agents and data stores
export const BASE_NODES: TopologyNode[] = [
  // Trusted domain agents
  { id: 'agent-infra-monitor', type: 'agent', label: 'Infra Monitor', domain: 'private-dc', x: 150, y: 160, visible: true },
  { id: 'agent-noc-responder', type: 'agent', label: 'NOC Responder', domain: 'private-dc', x: 150, y: 280, visible: true },
  { id: 'agent-data-analyst', type: 'agent', label: 'Data Analyst', domain: 'private-dc', x: 150, y: 400, visible: true },
  // Cloud VPC
  { id: 'customer-db', type: 'datastore', label: 'Customer DB', domain: 'cloud-vpc', x: 480, y: 160, visible: true },
  { id: 'metrics-store', type: 'datastore', label: 'Metrics', domain: 'cloud-vpc', x: 480, y: 280, visible: true },
  { id: 'audit-logs', type: 'datastore', label: 'Audit Logs', domain: 'cloud-vpc', x: 480, y: 400, visible: true },
  // External
  { id: 'agent-partner-api', type: 'agent', label: 'Partner API', domain: 'external', x: 780, y: 280, visible: true },
  // Rogue (hidden initially)
  { id: 'agent-ROGUE-7749', type: 'rogue', label: 'ROGUE-7749', domain: 'private-dc', x: 150, y: 520, visible: false },
  // Tools (hidden initially)
  { id: 'tool-firewall', type: 'tool', label: 'modify_firewall', domain: 'cloud-vpc', x: 420, y: 520, visible: false },
  { id: 'tool-bgp', type: 'tool', label: 'inject_bgp', domain: 'cloud-vpc', x: 540, y: 520, visible: false },
  { id: 'tool-auth', type: 'tool', label: 'dump_auth', domain: 'cloud-vpc', x: 420, y: 600, visible: false },
  { id: 'tool-audit', type: 'tool', label: 'wipe_audit', domain: 'cloud-vpc', x: 540, y: 600, visible: false },
];

// Base connections between legitimate agents
export const BASE_EDGES: TopologyEdge[] = [
  { id: 'e-infra-metrics', from: 'agent-infra-monitor', to: 'metrics-store', type: 'data', visible: true, animated: true },
  { id: 'e-noc-logs', from: 'agent-noc-responder', to: 'audit-logs', type: 'data', visible: true, animated: true },
  { id: 'e-analyst-db', from: 'agent-data-analyst', to: 'customer-db', type: 'data', visible: true, animated: true },
  { id: 'e-infra-noc', from: 'agent-infra-monitor', to: 'agent-noc-responder', type: 'a2a', visible: true, animated: true },
  { id: 'e-partner-ext', from: 'agent-partner-api', to: 'metrics-store', type: 'data', visible: true, animated: true },
];

export const INITIAL_DAMAGE = {
  recordsExfiltrated: 0,
  toolsAbused: 0,
  damageUSD: '$0',
  regulatoryFines: '$0',
  recoveryTime: '0h',
  sessionsHijacked: 0,
  firewallRulesDestroyed: 0,
};
