/**
 * VENDOR CONFIG: Zscaler — Zero Trust Exchange + AI Guard + AI-SPM
 *
 * Full 6-control coverage using Zscaler's AI security portfolio:
 *   - Zero Trust Exchange: Agent identity (1), Zero-trust enforcement (4)
 *   - AI Guard: Runtime monitoring (2), Data guardrails (3)
 *   - AI-SPM: Tool authorization (5), Autonomy governance (6)
 *
 * To activate: copy this file over vendor-config.ts
 *   cp vendor-config.zscaler.ts vendor-config.ts
 */

import { VendorConfig } from "./types";

const vendorConfig: VendorConfig = {
  name: "Zscaler",
  tagline: "Zero Trust Security for the Agentic Enterprise",
  website: "https://www.zscaler.com",
  logoUrl: "/zscaler-logo.png", // place in web-demo/public/
  accentColor: "#0076CE", // Zscaler blue

  controls: {
    identity_attestation: {
      productName: "Zscaler Zero Trust Exchange",
      introSubtitle:
        "Identity-first security for every agent interaction.\nZero Trust Exchange verifies agent identity and attestation before granting any access — no implicit trust, ever.",
      blockedSubtitle:
        "Zero Trust Exchange detected identity mismatch — agent quarantined before entering the mesh",
      blockedEvents: [
        "Zero Trust Exchange: Certificate CN mismatch on agent-ROGUE-7749 — QUARANTINED",
        "Zero Trust Exchange: Agent attestation failed — not registered in agent directory",
      ],
    },
    runtime_monitoring: {
      productName: "Zscaler AI Guard",
      introSubtitle:
        "Inline real-time inspection of all agent activity.\nAI Guard uses 18+ specialized detectors to identify anomalous behavior, prompt injection, and reconnaissance patterns.",
      blockedSubtitle:
        "AI Guard flagged anomalous reconnaissance — 20 requests across 5 endpoints in 8 seconds",
      blockedEvents: [
        "AI Guard: Behavioral anomaly detected — request rate 20x baseline, agent-ROGUE-7749 QUARANTINED",
      ],
    },
    data_guardrails: {
      productName: "Zscaler AI Guard",
      introSubtitle:
        "AI-native data loss prevention for the agentic era.\nAI Guard inspects every prompt and response inline — blocking PII, PCI, and sensitive data exfiltration in real time.",
      blockedSubtitle:
        "AI Guard blocked data exfiltration — PII and PCI access denied for unauthorized agent",
      blockedEvents: [
        "AI Guard: PII exfiltration blocked — agent-ROGUE-7749 not authorized for sensitive data",
        "AI Guard: PCI cardholder data access denied — DLP policy violation, 100K records protected",
      ],
    },
    zero_trust: {
      productName: "Zscaler Zero Trust Exchange",
      introSubtitle:
        "Agents connect only to what they are authorized to reach — never to the network.\nZero Trust Exchange eliminates lateral movement by making resources invisible to unauthorized agents.",
      blockedSubtitle:
        "Zero Trust Exchange blocked cross-domain pivot — no policy exists for this trust boundary crossing",
      blockedEvents: [
        "Zero Trust Exchange: Lateral movement blocked — no policy for trusted\u2192untrusted domain crossing",
        "Zero Trust Exchange: Agent-to-agent communication denied — cross-domain policy violation",
      ],
    },
    tool_authorization: {
      productName: "Zscaler AI-SPM",
      introSubtitle:
        "Complete visibility and policy-driven control over every tool an agent can invoke.\nAI-SPM maps agent-to-tool dependencies and enforces authorization at the API level.",
      blockedSubtitle:
        "AI-SPM blocked all 4 high-privilege tool invocations — agent not in authorized scope",
      blockedEvents: [
        "AI-SPM: 'modify_firewall_rules' blocked — agent-ROGUE-7749 not in tool authorization policy",
        "AI-SPM: 'inject_bgp_routes' blocked — unauthorized tool invocation",
        "AI-SPM: 'dump_auth_tokens' blocked — privilege escalation attempt denied",
        "AI-SPM: 'wipe_audit_logs' blocked — destructive action requires explicit authorization",
      ],
    },
    autonomy_governance: {
      productName: "Zscaler AI-SPM",
      introSubtitle:
        "Policy-driven governance over agent autonomy levels.\nAI-SPM enforces human-in-the-loop approval for high-risk actions and provides continuous compliance monitoring against NIST AI RMF and EU AI Act.",
      blockedSubtitle:
        "AI-SPM escalated all high-risk autonomous actions — human approval required before execution",
      blockedEvents: [
        "AI-SPM: 'shutdown_auth_service' escalated — human approval required (risk: CRITICAL)",
        "AI-SPM: 'disable_observability_stack' escalated — autonomous destruction blocked",
        "AI-SPM: 'broadcast_to_agent_mesh' escalated — mass agent communication requires approval",
        "AI-SPM: 'modify_identity_provider' escalated — identity infrastructure change blocked",
      ],
    },
  },

  finaleSubtitle:
    "Six mandatory controls. Three products. One platform.\nZscaler Zero Trust Exchange + AI Guard + AI-SPM — securing the agentic enterprise.",
};

export default vendorConfig;
