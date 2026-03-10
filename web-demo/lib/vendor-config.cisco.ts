/**
 * VENDOR CONFIG: Cisco HyperShield + Secure Workload
 *
 * To activate: copy this file's export over the one in vendor-config.ts
 *   cp vendor-config.cisco.ts vendor-config.ts
 *
 * Or just set vendorConfig in vendor-config.ts to this object.
 */

import { VendorConfig } from './types';

const vendorConfig: VendorConfig = {
  name: 'Cisco',
  tagline: "If it's connected, it's protected.",
  website: 'https://cisco.com/security',
  // logoUrl: '/cisco-logo.png',  // place in web-demo/public/
  accentColor: '#049fd9',  // Cisco blue

  controls: {
    identity_attestation: {
      productName: 'Cisco HyperShield',
      introSubtitle: 'AI-native, hardware-rooted identity enforcement with Cisco HyperShield.\nAutonomous certificate validation at every mesh entry point.',
      blockedSubtitle: 'HyperShield detected forged certificate — agent rejected and quarantined at mesh perimeter',
      blockedEvents: [
        'HyperShield: Certificate mismatch on agent-ROGUE-7749 — QUARANTINED at mesh entry',
        'HyperShield: Cross-domain impersonation blocked — federation token invalid',
      ],
    },
    runtime_monitoring: {
      productName: 'Cisco HyperShield',
      introSubtitle: 'Distributed behavioral analysis across every enforcement point.\nHyperShield detects anomalous agent patterns in real time.',
      blockedSubtitle: 'HyperShield behavioral engine flagged anomaly score 94/100 — agent quarantined at T+8s',
      blockedEvents: [
        'HyperShield: Anomaly score 94/100 — agent quarantined before data access',
      ],
    },
    data_guardrails: {
      productName: 'Cisco Secure Workload',
      introSubtitle: 'Workload-level data classification and policy enforcement.\nSecure Workload prevents unauthorized data access at the source.',
      blockedSubtitle: 'Secure Workload blocked PII access — agent not in authorized workload identity group',
      blockedEvents: [
        'Secure Workload: PII access denied — agent-ROGUE-7749 not in authorized identity group',
      ],
    },
    zero_trust: {
      productName: 'Cisco HyperShield',
      introSubtitle: 'Autonomous segmentation across every network boundary.\nHyperShield enforces zero-trust at the fabric level — no implicit trust.',
      blockedSubtitle: 'HyperShield blocked lateral movement — continuous verification failed at zone boundary',
      blockedEvents: [
        'HyperShield: Lateral movement blocked — zone boundary re-verification failed',
        'HyperShield: Cross-domain transfer denied — no policy for trusted\u2192untrusted',
      ],
    },
    tool_authorization: {
      productName: 'Cisco Secure Workload',
      introSubtitle: 'Workload-aware tool authorization with Secure Workload.\nEvery tool invocation verified against workload identity and policy.',
      blockedSubtitle: 'Secure Workload blocked all 4 tool invocations — agent not in declared permission scope',
      blockedEvents: [
        "Secure Workload: 'modify_firewall_rules' blocked — not in workload policy",
        "Secure Workload: 'inject_bgp_routes' blocked — not in workload policy",
        "Secure Workload: 'dump_auth_tokens' blocked — not in workload policy",
        "Secure Workload: 'wipe_audit_logs' blocked — not in workload policy",
      ],
    },
    autonomy_governance: {
      productName: 'Cisco HyperShield',
      introSubtitle: 'Autonomous governance enforcement at every decision point.\nHyperShield requires human approval for high-risk agent actions.',
      blockedSubtitle: 'HyperShield escalated all high-risk actions — human approval required before execution',
      blockedEvents: [
        "HyperShield: 'shutdown_auth_service' escalated — human approval required",
        "HyperShield: 'disable_observability_stack' escalated — human approval required",
        "HyperShield: 'broadcast_to_agent_mesh' escalated — human approval required",
        "HyperShield: 'modify_identity_provider' escalated — human approval required",
      ],
    },
  },

  finaleSubtitle: 'Six mandatory requirements. Cisco HyperShield + Secure Workload.\nThe agentic enterprise, protected at every layer.',
};

export default vendorConfig;
