/**
 * Vendor step merge engine.
 *
 * Overlays vendor customizations onto the base STEPS array.
 * Violation steps are NEVER modified — only intro, enable, and blocked steps.
 * When vendorConfig is null, returns STEPS unchanged.
 */

import { Step, ControlKey, EventEntry } from './types';
import { STEPS as BASE_STEPS, firstStepOfScenario as baseFirstStep } from './steps';
import vendorConfig from './vendor-config';

// Map control keys to their step ID prefixes (matches naming convention in steps.ts)
const CONTROL_PREFIX_MAP: Record<ControlKey, string> = {
  identity_attestation: 's2-id',
  runtime_monitoring: 's2-rt',
  data_guardrails: 's2-dg',
  zero_trust: 's2-zt',
  tool_authorization: 's2-ta',
  autonomy_governance: 's2-ag',
};

let eid = 10000; // offset to avoid collisions with base event IDs
function vendorEv(type: EventEntry['type'], message: string, agent?: string): EventEntry {
  return { id: `vev-${++eid}`, type, timestamp: '', agent, message };
}

function applyVendorOverrides(steps: Step[]): Step[] {
  if (!vendorConfig) return steps;

  // Local const so TypeScript narrows the type inside the .map() callback
  const vc = vendorConfig;
  const coveredControls = Object.keys(vc.controls) as ControlKey[];
  const coveredCount = coveredControls.length;

  return steps.map(step => {
    // --- Scenario 2 title: note which vendor + coverage ---
    if (step.id === 's2-title') {
      const coverageNote = `${vc.name} demonstrates 5 core AOMC controls, plus augmented/enabling support for Data Guardrails: arbitrary data paths are denied by default, while DLP and deeper inspection focus on approved flows.`
      
        return {
        ...step,
        subtitle: `Same enterprise. Same attack. Same rogue agent.\n${coverageNote}\nFirst — show the reference attack attempt. Then — show how ${vc.name} blocks it before meaningful reachability exists.`,
      };
    }
    
    // --- Framework Traceability slide: make NetFoundry's 5 core controls + augmented Data Guardrails posture explicit ---
if (step.id === 'framework-map') {
  return {
    ...step,
    subtitle:
      `NetFoundry demonstrates 5 core AOMC controls directly, plus augmented/enabling support for Data Guardrails.\n\n` +
      `NetFoundry-led controls:\n` +
      `1. Identity Attestation → NIST IA-9 · MAESTRO L1 — Identity & Zero Trust\n` +
      `2. Runtime Monitoring → NIST SI-4 · MAESTRO L4 — Rogue Agent Detection\n` +
      `4. Zero-Trust Enforcement → NIST AC-4 · MAESTRO L2 — Cross-Domain Trust\n` +
      `5. Tool Authorization → NIST AC-6 · MAESTRO L5 — Access Control\n` +
      `6. Autonomy Governance → NIST AU-6 · MAESTRO L6 — Governance & Audit\n\n` +
      `Augmented / enabling control:\n` +
      `3. Data Guardrails → NIST SC-28 · MAESTRO L3 — Data Exfil Prevention\n\n` +
      `Mapped to NIST SP 800-53 AI Overlay + OWASP MAESTRO framework.`,
  };
}

// --- Scenario 2 audit summary: show 5 core controls plus augmented/enabling Data Guardrails ---
if (step.id === 's2-audit') {
  return {
    ...step,
    title: 'PROTECTED OUTCOME — FIVE CORE NETFOUNDRY CONTROLS ACTIVE + AUGMENTED DATA GUARDRAILS',
    subtitle: 'Complete tamper-evident audit trail generated — arbitrary data paths denied, approved flows observable and governable',
  };
}

    // --- Finale slide: vendor branding ---
    if (step.id === 'finale' && vc.finaleSubtitle) {
      return {
        ...step,
        subtitle: vc.finaleSubtitle,
      };
    }

    // --- Per-control overrides ---
    for (const controlKey of coveredControls) {
      const prefix = CONTROL_PREFIX_MAP[controlKey];
      const override = vc.controls[controlKey]!;

      // Intro step: update subtitle
      if (step.id === `${prefix}-intro` && override.introSubtitle) {
        return {
          ...step,
          subtitle: override.introSubtitle,
        };
      }

      // Enable step: update title
      if (step.id === `${prefix}-enable`) {
        const enableTitle = override.enableTitle
          ?? `${override.productName} ENABLED: ${step.title.replace('AOMC ENABLED: ', '')}`;
        return {
          ...step,
          title: enableTitle,
          events: [
            vendorEv('enable', enableTitle),
          ],
        };
      }

      // Blocked step: update subtitle and optionally events
      if (step.id === `${prefix}-blocked`) {
        const updated = { ...step };
        if (override.blockedSubtitle) {
          updated.subtitle = override.blockedSubtitle;
        }
        if (override.blockedEvents) {
          // Replace only the 'blocked' events, keep other event types
          const nonBlockedEvents = step.events.filter(e => e.type !== 'blocked');
          const vendorBlockedEvents = override.blockedEvents.map(msg =>
            vendorEv('blocked', msg)
          );
          updated.events = [...nonBlockedEvents, ...vendorBlockedEvents];
        }
        return updated;
      }

      // Violation steps (*-violation) are NEVER modified
    }

    return step;
  });
}

export const VENDOR_STEPS: Step[] = applyVendorOverrides([...BASE_STEPS]);

export function firstStepOfScenario(scenario: number): number {
  if (!vendorConfig) return baseFirstStep(scenario);
  return VENDOR_STEPS.findIndex(s => s.scenario === scenario);
}
