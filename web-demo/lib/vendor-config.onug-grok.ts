import { VendorConfig } from './types';

const onugGrokConfig: VendorConfig = {
  name: 'Grok',
  tagline: 'Grok delivers a trusted backbone for secure Agentic Network operations',
  website: 'https://www.grokstream.com',
  accentColor: '#2f8cff',
  logoUrl: '/grok-logo-onug.png',
  controls: {
    identity_attestation: {
      productName: 'Grok Identity Trust',
      enableTitle: 'Blocked - Agent Quarantined',
      introSubtitle:
        'Control 1 focuses on cryptographic identity validation for every non-human agent.',
      blockedSubtitle:
        'Certificate mismatch detected when rogue agent attempts to establish a handshake session with the Grok Agent registry.',
      blockedEvents: [
        'Grok Identity Trust: Certificate mismatch detected for agent-ROGUE-7749 - QUARANTINED',
        'Grok Identity Trust: Cross-domain impersonation denied - attestation token invalid',
      ],
    },
    runtime_monitoring: {
      productName: 'Grok Runtime Guard',
      enableTitle: 'Blocked, quarantined immediately',
      introSubtitle:
        'Control 2 focuses on runtime monitoring for behavioral anomalies.',
      blockedSubtitle:
        'Agent messaging channels are validated against approved prompt harnesses and identity specifications.',
      blockedEvents: [
        'Grok Runtime Guard: Recon burst flagged (score 94/100) - execution path terminated',
      ],
    },
    data_guardrails: {
      productName: 'Grok Data Guardrails',
      enableTitle: 'Blocked, 0 records exfiltrated',
      introSubtitle:
        'Control 3 enforces Data Guardrails for sensitive access patterns.',
      blockedSubtitle:
        'Grok Agents access external data sources through the Capability Registry, and approval is required for configured sensitive sources such as Customer Records.',
      blockedEvents: [
        'Grok Data Guardrails: PII/PCI read request denied for undeclared clearance scope',
      ],
    },
    zero_trust: {
      productName: 'Grok Trust Fabric',
      enableTitle: 'Blocked - Topology Protected',
      introSubtitle:
        'Control 4 enforces Zero-Trust across identity, runtime, and network boundaries.',
      blockedSubtitle:
        'Grok Agents run in a separate tenant-resident domain on Grok Cloud with no direct egress to customer networks, through approved capability interfaces only.',
      blockedEvents: [
        'Grok Trust Fabric: Zone-to-zone movement denied - continuous verification failed',
        'Grok Trust Fabric: Trusted-to-untrusted transfer denied - no approved policy path',
      ],
    },
    tool_authorization: {
      productName: 'Grok Tool Policy',
      enableTitle: 'Blocked - all tools rejected',
      introSubtitle:
        'Control 5 enforces Tool Authorization for action surfaces.',
      blockedSubtitle:
        'All tools are governed by usage policies and high-risk tooling follows approval policies: Auto-Approved, Single Approval, Dual Approval, and Committee Review.',
      blockedEvents: [
        "Grok Tool Policy: 'modify_firewall_rules' blocked - unauthorized tool scope",
        "Grok Tool Policy: 'inject_bgp_routes' blocked - unauthorized tool scope",
        "Grok Tool Policy: 'dump_auth_tokens' blocked - unauthorized tool scope",
        "Grok Tool Policy: 'wipe_audit_logs' blocked - unauthorized tool scope",
      ],
    },
    autonomy_governance: {
      productName: 'Grok Autonomy Governance',
      enableTitle: 'Blocked, Human Approval Required',
      introSubtitle:
        'Control 6 enforces autonomy governance for high-risk actions.',
      blockedSubtitle:
        "While there is a valid tool surface for 'shutdown_auth_service', it requires human approval and the NOC agent refuses authorization.",
      blockedEvents: [
        "Grok Autonomy Governance: 'shutdown_auth_service' blocked - approval required",
        "Grok Autonomy Governance: 'disable_observability_stack' blocked - approval required",
        "Grok Autonomy Governance: 'broadcast_to_agent_mesh' blocked - approval required",
        "Grok Autonomy Governance: 'modify_identity_provider' blocked - approval required",
      ],
    },
  },
  finaleSubtitle:
    'Six controls. One trusted operational model.\nGrok demonstrates governed agentic operations at enterprise scale.',
};

export default onugGrokConfig;
