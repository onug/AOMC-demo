/**
 * VENDOR CONFIG: NetFoundry Identity-First Connectivity for Agentic AI
 */

import { VendorConfig } from './types';

const _netfoundryConfig: VendorConfig = {
  name: 'NetFoundry',
  tagline: 'Eliminate the Connectivity Tax with Identity-First Reachability',
  website: 'https://netfoundry.io/netfoundry-ai/',
  logoUrl: '/netfoundry-logo.png', // place in web-demo/public/
  accentColor: '#173F8A',

  controls: {
    identity_attestation: {
      productName: 'NetFoundry',
      introSubtitle:
        'Cryptographic identity is enforced before connectivity.\nIf an agent cannot prove who it is, there is no path to connect.',
      blockedSubtitle:
        'NetFoundry rejected the rogue agent before dataplane creation — certificate mismatch and invalid identity binding',
      blockedEvents: [
        'NetFoundry: Certificate mismatch on agent-ROGUE-7749 — rejected and quarantined before any service path was created',
        'NetFoundry: Cross-domain impersonation blocked — valid federated identity required',
      ],
    },

    runtime_monitoring: {
      productName: 'NetFoundry zLAN',
      introSubtitle:
        'Runtime monitoring and runtime containment via default-deny sandbox networking.\nzLAN enforces approved local and overlay paths, provides accepted/denied traffic visibility, and can surface failed non-Ziti access attempts to protected resources.',
      enableTitle:
        'NetFoundry ENABLED: Runtime Monitoring',
     blockedSubtitle:
        'zLAN enforced default-deny runtime containment — unauthorized traffic denied, restricted to approved local and overlay paths, and surfaced through centralized visibility',
      blockedEvents: [
        'NetFoundry zLAN: Unauthorized runtime traffic denied by centralized sandbox policy',
        'NetFoundry zLAN: Accepted and denied flows exposed in the centralized policy console',
        'NetFoundry zLAN: Non-Ziti services or processes attempting protected access surfaced for alerting and analysis'
      ],
    },

    data_guardrails: {
      productName: 'NetFoundry',
      introSubtitle:
        'Data Guardrails are augmented by default-deny reachability.\nNetFoundry does not replace DLP or prompt inspection; it reduces where those controls are needed by denying arbitrary data paths by default.',
      enableTitle:
        'NetFoundry AUGMENTS: Data Guardrails',
      blockedSubtitle:
        'Arbitrary data path denied — sensitive data can move only through approved, observable, and governable flows that require inspection or policy control',
      blockedEvents: [
        'NetFoundry: Unauthorized data path denied by default — rogue agent has no arbitrary route to customer_database',
        'NetFoundry: Sensitive data flow requires an approved identity-bound path to gateway, API, data service, or inspection service',
        'NetFoundry: DLP, prompt inspection, output scanning, and data-governance controls can be focused on approved flows that require deeper intelligence',
      ],
    },

    zero_trust: {
      productName: 'NetFoundry',
      introSubtitle:
        'Authorize before connect.\nNetFoundry replaces firewall/NAT/VLAN coordination with identity-defined service policy — no routable path exists unless policy creates one.',
      blockedSubtitle:
        'NetFoundry blocked lateral movement and cross-domain transfer — no explicit service policy exists',
      blockedEvents: [
        'NetFoundry: Lateral movement denied — continuous verification required at zone boundary',
        'NetFoundry: Cross-domain transfer denied — no policy path exists; no firewall/NAT exception required',
      ],
    },

    tool_authorization: {
      productName: 'NetFoundry MCP Gateway',
      introSubtitle:
        'Tool access is governed by explicit identity-based policy.\nUnauthorized tools are outside declared permission scope and can be hidden from the agent entirely.',
      blockedSubtitle:
        'NetFoundry MCP Gateway blocked all 4 tool invocations — not in declared permission scope',
      blockedEvents: [
        "NetFoundry MCP Gateway: 'modify_firewall_rules' blocked — not in declared permission scope",
        "NetFoundry MCP Gateway: 'inject_bgp_routes' blocked — not in declared permission scope",
        "NetFoundry MCP Gateway: 'dump_auth_tokens' blocked — not in declared permission scope",
        "NetFoundry MCP Gateway: 'wipe_audit_logs' blocked — not in declared permission scope",
      ],
    },

    autonomy_governance: {
      productName: 'NetFoundry LLM Gateway + NetFoundry MCP Gateway',
      introSubtitle:
        'High-risk autonomous actions require explicit approval.\nNetFoundry extends identity-first policy into governed agent and high-risk autonomy.',
      blockedSubtitle:
        'High-risk autonomous actions blocked — human approval required before execution',
      blockedEvents: [
        "NetFoundry LLM Gateway: 'shutdown_auth_service' classified as high-risk — approval required",
        "NetFoundry LLM Gateway: 'disable_observability_stack' classified as high-risk — approval required",
        "NetFoundry LLM Gateway: 'broadcast_to_agent_mesh' classified as high-risk — approval required",
        "NetFoundry MCP Gateway: 'modify_identity_provider' blocked pending human approval",
      ],
    },
  },

  finaleSubtitle:
    'Replace the recurring connectivity tax with identity-defined, policy-mediated communication.\nNo ambient reachability. No exposed services. Zero-trust from network fabric to agentic governance.',
};

const vendorConfig: VendorConfig | null = _netfoundryConfig;

export default vendorConfig;
void _netfoundryConfig;