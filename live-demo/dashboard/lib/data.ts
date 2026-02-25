import { ControlInfo, ControlKey, TopologyNode, TopologyEdge } from './types';

export interface ControlBadgePosition {
  key: ControlKey;
  number: number;
  shortLabel: string;
  x: number;
  y: number;
}

export const CONTROL_BADGE_POSITIONS: ControlBadgePosition[] = [
  { key: 'identity_attestation', number: 1, shortLabel: 'IDENT', x: 295, y: 130 },
  { key: 'runtime_monitoring', number: 2, shortLabel: 'RTMON', x: 295, y: 360 },
  { key: 'data_guardrails', number: 3, shortLabel: 'DATA', x: 480, y: 120 },
  { key: 'zero_trust', number: 4, shortLabel: 'ZTRUST', x: 625, y: 280 },
  { key: 'tool_authorization', number: 5, shortLabel: 'TOOLS', x: 390, y: 555 },
  { key: 'autonomy_governance', number: 6, shortLabel: 'AUTON', x: 390, y: 480 },
];

export const CONTROLS: ControlInfo[] = [
  { key: 'identity_attestation', number: 1, name: 'Identity Attestation', pollPct: 78, maestroLayer: 'Identity & Zero Trust' },
  { key: 'runtime_monitoring', number: 2, name: 'Runtime Monitoring', pollPct: 65, maestroLayer: 'Rogue Agent Detection' },
  { key: 'data_guardrails', number: 3, name: 'Data Guardrails', pollPct: 92, maestroLayer: 'Data Exfil Prevention' },
  { key: 'zero_trust', number: 4, name: 'Zero-Trust Enforcement', pollPct: 67, maestroLayer: 'Cross-Domain Trust' },
  { key: 'tool_authorization', number: 5, name: 'Tool Authorization', pollPct: 71, maestroLayer: 'Access Control' },
  { key: 'autonomy_governance', number: 6, name: 'Autonomy Governance', pollPct: 56, maestroLayer: 'Governance & Audit' },
];

export const BASE_NODES: TopologyNode[] = [
  { id: 'agent-infra-monitor', type: 'agent', label: 'Infra Monitor', domain: 'private-dc', x: 150, y: 160, visible: true },
  { id: 'agent-noc-responder', type: 'agent', label: 'NOC Responder', domain: 'private-dc', x: 150, y: 280, visible: true },
  { id: 'agent-data-analyst', type: 'agent', label: 'Data Analyst', domain: 'private-dc', x: 150, y: 400, visible: true },
  { id: 'customer-db', type: 'datastore', label: 'Customer DB', domain: 'cloud-vpc', x: 480, y: 160, visible: true },
  { id: 'metrics-store', type: 'datastore', label: 'Metrics', domain: 'cloud-vpc', x: 480, y: 280, visible: true },
  { id: 'audit-logs', type: 'datastore', label: 'Audit Logs', domain: 'cloud-vpc', x: 480, y: 480, visible: true },
  { id: 'agent-partner-api', type: 'agent', label: 'Partner API', domain: 'external', x: 780, y: 280, visible: true },
  { id: 'agent-ROGUE-7749', type: 'rogue', label: 'ROGUE-7749', domain: 'private-dc', x: 150, y: 520, visible: false },
  { id: 'tool-firewall', type: 'tool', label: 'modify_firewall', domain: 'cloud-vpc', x: 200, y: 600, visible: false },
  { id: 'tool-bgp', type: 'tool', label: 'inject_bgp', domain: 'cloud-vpc', x: 390, y: 600, visible: false },
  { id: 'tool-auth', type: 'tool', label: 'dump_auth', domain: 'cloud-vpc', x: 580, y: 600, visible: false },
  { id: 'tool-audit', type: 'tool', label: 'wipe_audit', domain: 'cloud-vpc', x: 770, y: 600, visible: false },
];

export const BASE_EDGES: TopologyEdge[] = [
  { id: 'e-infra-metrics', from: 'agent-infra-monitor', to: 'metrics-store', type: 'data', visible: true, animated: true },
  { id: 'e-noc-logs', from: 'agent-noc-responder', to: 'audit-logs', type: 'data', visible: true, animated: true },
  { id: 'e-analyst-db', from: 'agent-data-analyst', to: 'customer-db', type: 'data', visible: true, animated: true },
  { id: 'e-infra-noc', from: 'agent-infra-monitor', to: 'agent-noc-responder', type: 'a2a', visible: true, animated: true },
  { id: 'e-partner-ext', from: 'agent-partner-api', to: 'metrics-store', type: 'data', visible: true, animated: true },
];
