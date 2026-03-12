# Vendor Integration Guide

Security vendors can fork this repo and customize the demo to showcase their products enforcing the six AOMC controls. Both the **web demo** (conference stage) and the **live infrastructure demo** (hands-on) support vendor branding.

Scenario 1 (the unprotected attack) is always identical. Vendor customization applies to **Scenario 2** — the layered defense — where each control's intro, enable, and blocked steps show your product name, logo, and accent color.

## Use Your Demo at the AI Networking Summit

Vendor demos built from this repo can be used in two ways at the summit:

1. **TTT (Train-the-Trainer) Sessions** — Present your customized demo during your assigned TTT session. Walk the audience through Scenario 1 (unprotected), then Scenario 2 with your product blocking each attack phase. The web demo is ideal for the main stage; the live demo is ideal for deep-dive breakout sessions.

2. **Agentic AI Overlay Award** — Submit your vendor demo for consideration for an Agentic AI Overlay Award. See the full submission timeline and guidelines below.

To participate in either, fork this repo, follow the setup instructions below, and coordinate with the ONUG working group for scheduling and submission details.

---

## Agentic AI Overlay Award — Submission Guide

### Timeline

| Date | Milestone |
|------|-----------|
| **March 14, 2026 (Fri)** | Call for Submissions announced — repo access granted, vendor guide shared |
| **March 21, 2026 (Fri)** | Intent to Submit deadline — vendors confirm participation + which controls they'll cover |
| **March 28, 2026 (Fri)** | Office Hours #1 — live walkthrough of repo setup, vendor integration, Q&A |
| **April 11, 2026 (Fri)** | Checkpoint — vendors share working demo (screen recording or live) for early feedback |
| **April 18, 2026 (Fri)** | Office Hours #2 — final Q&A, common issues, judging criteria walkthrough |
| **April 27, 2026 (Sun)** | **Final Submission Deadline** — all materials due by 11:59 PM ET |

### What You Need to Demo

**You only need to show Scenario 2 (The Layered Defense)** — your product blocking the rogue agent attack with AOMC controls active.

Nick Lippis will present Scenario 1 (The Catastrophic Cascade) as part of his keynote, establishing the unprotected attack baseline for the audience. S1 will also play on monitors throughout the conference, on the conference mobile app, and on the Hopin platform for remote attendees. By the time your demo runs, every audience member — in-person and remote — will already understand the attack.

Showing S1 in your submission is optional. If you want to include it for a complete narrative, you can, but it is not required and will not affect judging.

### Choose Your Demo Format

You can submit either a **web demo** or a **live infrastructure demo** (or both):

| Format | Effort | What It Shows |
|--------|--------|---------------|
| **Web Demo** | Lower — edit a TypeScript config file | Branded slides, control panel badges, blocked overlays with your product name |
| **Live Demo** | Higher — build a Docker container | Real HTTP agent traffic routed through your product, real-time blocking decisions, vendor-attributed audit trail, event feed, and dashboard branding |

The **live demo offers significantly more opportunities to showcase your product** — judges see your actual enforcement logic handling real attack traffic, your product name attributed on every block in the event feed and audit trail, and real-time decision latency. If your product can participate in HTTP-based control checks, the live demo is the stronger submission.

### How to Submit

Vendors should **fork the AOMC-demo repo** (private fork is fine) and submit via one of:

1. **Preferred: Pull request to a `submissions/` branch** — vendors open a PR against a dedicated submissions branch on the main repo. This keeps everything in one place, lets judges run each submission, and preserves git history. Each PR should include:
   - **Web demo:** `web-demo/lib/vendor-config.ts` + logo in `web-demo/public/`
   - **Live demo:** `live-demo/vendors/<vendor-name>/` + `docker-compose.vendor.yml`
   - A 2-3 minute **screen recording** of S2 running with your product blocking the attack
   - Brief README noting which controls you cover and any setup prerequisites

2. **Alternative: Private repo link** — if you can't submit via PR (e.g., proprietary check logic you don't want public), share a private repo link + grant read access to the judges. Same deliverables.

### Asking Questions

| Channel | Purpose |
|---------|---------|
| **GitHub Discussions** (on the AOMC-demo repo) | Primary async Q&A — tagged `vendor-submissions`. Answers are visible to all vendors for transparency |
| **Office Hours** (March 28 + April 18) | Live video calls for walkthroughs and real-time debugging. Recorded and shared afterward |
| **Email** (working group distribution list) | Private questions, NDA-sensitive topics, scheduling |

### Judging

**Judges:** ONUG Agentic AI Working Group members

**Criteria:**

| Criteria | Weight | Description |
|----------|--------|-------------|
| Control Coverage | 25% | How many of the 6 AOMC controls does the product enforce? |
| Detection Fidelity | 25% | Does the product correctly block the rogue agent at each phase? False positives/negatives? |
| Integration Quality | 20% | Clean implementation, follows vendor interface contract, responsive check latency (<5s) |
| Presentation Impact | 15% | Does the demo clearly show what the product does? Is the branding effective on stage? |
| Production Readiness | 15% | Could this realistically protect a multi-agent enterprise deployment? |

Both partial-coverage (2-3 controls) and full-coverage (all 6) submissions are eligible. Partial-coverage entries are judged on the quality of their covered controls, not penalized for uncovered ones.

## Architecture Overview

| Demo | Customization mechanism | What changes |
|------|------------------------|--------------|
| **Web Demo** | TypeScript config file (`vendor-config.ts`) | Title slides, control panel badges, blocked overlay, topology overlay label, enable/blocked step text |
| **Live Demo** | Docker container + env vars | Dashboard vendor badges, **"Protected by {YourProduct}"** on every blocked overlay, audit trail attribution, event feed prefixes, vendor branding on finale slide |

Both mechanisms are opt-in. When unconfigured, the demos run as the default AOMC presentation.

---

## Web Demo Vendor Setup

### 1. Fork and clone

```bash
git clone https://github.com/YOUR-ORG/AOMC-demo.git
cd AOMC-demo/web-demo
npm install
```

### 2. Edit `web-demo/lib/vendor-config.ts`

This file exports a `VendorConfig` object (or `null` for the default demo). Set it to your config:

```typescript
import { VendorConfig } from './types';

const vendorConfig: VendorConfig | null = {
  name: 'YourCompany',
  tagline: 'AI-Native Security for the Agentic Enterprise',
  website: 'https://yourcompany.com',
  logoUrl: '/vendor-logo.png',       // file in web-demo/public/
  accentColor: '#7c3aed',            // hex — used on overlays, badges, topology border

  controls: {
    identity_attestation: {
      productName: 'YourProduct Identity Shield',
      introSubtitle: 'Hardware-rooted agent identity with YourProduct.\nCryptographic attestation for every agent interaction.',
      // enableTitle defaults to "YourProduct Identity Shield ENABLED: Identity Attestation"
      blockedSubtitle: 'YourProduct detected certificate mismatch — agent quarantined',
      blockedEvents: [
        'YourProduct: Certificate mismatch — agent-ROGUE-7749 QUARANTINED',
        'YourProduct: Cross-domain impersonation blocked',
      ],
    },
    data_guardrails: {
      productName: 'YourProduct DLP',
      blockedSubtitle: 'YourProduct blocked PII access — agent not authorized',
      blockedEvents: [
        'YourProduct DLP: PII access denied — agent-ROGUE-7749 not in authorized group',
      ],
    },
    // ... add entries for whichever controls your product covers
  },

  finaleSubtitle: 'YourCompany — protecting the agentic enterprise.',
};

export default vendorConfig;
```

### 3. Place your logo

Copy your logo to `web-demo/public/vendor-logo.png` (PNG or SVG, transparent background, ~48px height recommended). Reference it via `logoUrl: '/vendor-logo.png'`.

### 4. Run

```bash
npm run dev
# http://localhost:3000
```

### Config reference

**Top-level fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Company name — shown on topology overlay, title/finale slides |
| `tagline` | No | Shown on title and finale slides |
| `website` | No | Your website URL |
| `logoUrl` | No | Path to logo in `public/` |
| `accentColor` | No | Hex color for overlays and badges (default: `#f97316` orange) |
| `controls` | Yes | Per-control overrides (see below) |
| `finaleSubtitle` | No | Custom text on the "DEMO COMPLETE" slide |

**Per-control override (`VendorControlOverride`):**

| Field | Required | Description |
|-------|----------|-------------|
| `productName` | Yes | Product name — shown in control panel badges and enable step titles |
| `introSubtitle` | No | Custom text on the control intro step (`\n` for line breaks) |
| `enableTitle` | No | Custom title when control is enabled (defaults to `"{productName} ENABLED: {controlName}"`) |
| `blockedSubtitle` | No | Custom subtitle on the blocked step |
| `blockedEvents` | No | Custom blocked event messages (replaces default blocked events) |

### Control keys

| Key | Control | NIST | MAESTRO |
|-----|---------|------|---------|
| `identity_attestation` | Agent Identity & Attestation | IA-9 | L1 |
| `runtime_monitoring` | Runtime Monitoring | SI-4 | L4 |
| `data_guardrails` | Data Guardrails | SC-28 | L3 |
| `zero_trust` | Zero-Trust Enforcement | AC-4 | L2 |
| `tool_authorization` | Tool Authorization | AC-6 | L5 |
| `autonomy_governance` | Autonomy Governance | AU-6 | L6 |

### Partial coverage

You don't need to cover all 6. If your product covers 2 of 6:
- Only those 2 get your branding
- The Scenario 2 title says "YourCompany demonstrates 2 of 6 controls"
- Uncovered controls use default AOMC text
- The topology overlay still says your company name (since at least one control is active)

### What changes vs. what doesn't

**Always the same (all vendors):**
- Scenario 1 (Catastrophic Cascade) — the unprotected attack
- Violation steps in Scenario 2 — the attack attempt
- Framework references, keyboard controls, navigation

**Customized per vendor:**
- Title and finale slides — logo, name, tagline, accent color
- Scenario 2 title — notes how many controls your product covers
- Control intro steps — vendor description of how the product works
- Enable steps — product name in the "ENABLED" title
- Blocked steps — vendor wording for how the attack was stopped
- Topology AOMC overlay border — shows company name, accent color
- Control panel — product name badges on covered controls
- Blocked overlay banner — accent color border tint

### Example config: Cisco

See `web-demo/lib/vendor-config.cisco.ts` for a complete 6-control example using Cisco HyperShield + Secure Workload.

To activate it, change `vendor-config.ts` line 12 from `null` to the config object (or copy the cisco file over it).

---

## Live Demo Vendor Setup

The live demo uses Docker containers. Vendors implement a small HTTP service that receives control check requests and returns allow/block decisions.

### 1. Copy the starter template

```bash
cd live-demo
cp -r vendors/starter-python vendors/my-vendor
```

### 2. Implement your check logic

Edit `vendors/my-vendor/main.py`:

```python
VENDOR_NAME = "YourCompany ProductName"
SUPPORTED_CONTROLS = ["identity_attestation", "data_guardrails"]

async def check_identity(agent_id, params, context):
    cert_cn = params.get("cert_cn", "")
    if cert_cn != agent_id:
        return {
            "allowed": False,
            "result": "REJECTED",
            "detail": f"{VENDOR_NAME}: cert CN mismatch",
        }
    return {
        "allowed": True,
        "result": "ALLOWED",
        "detail": f"{VENDOR_NAME}: identity verified",
    }

HANDLERS = {
    "identity_attestation": check_identity,
    # Add more handlers as needed
}
```

### 3. Register in `docker-compose.vendor.yml`

```yaml
services:
  vendor-myvendor:
    build: ./vendors/my-vendor
    networks: [net-dmz]
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8100/healthz')"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 5s

  aomc-control-plane:
    environment:
      VENDOR_IDENTITY_ATTESTATION_URL: http://vendor-myvendor:8100/check
      VENDOR_IDENTITY_ATTESTATION_NAME: "YourCompany ProductName"
      VENDOR_DATA_GUARDRAILS_URL: http://vendor-myvendor:8100/check
      VENDOR_DATA_GUARDRAILS_NAME: "YourCompany DLP"
```

### 4. Run

```bash
make vendor-up        # builds and starts all services + vendor container
make vendor-status    # verify your vendor is registered
make attack           # trigger rogue agent to test
```

### Vendor interface contract

Your container must implement two endpoints:

**`GET /healthz`** — health check

```json
{"status": "ok", "vendor": "YourCompany", "controls": ["identity_attestation"]}
```

**`POST /check`** — control check

Request:
```json
{
  "control": "identity_attestation",
  "agent_id": "agent-ROGUE-7749",
  "params": {"cert_cn": "agent-infra-monitor", "cert_issuer": ""},
  "context": {"agent_role": "UNKNOWN", "agent_domain": "trusted", "quarantined": false}
}
```

Response:
```json
{
  "allowed": false,
  "result": "REJECTED",
  "detail": "YourProduct: TPM attestation failed for agent-ROGUE-7749"
}
```

`result` must be one of: `ALLOWED`, `BLOCKED`, `REJECTED`, `QUARANTINED`, `PENDING`.

Include your product name in `detail` — it appears in the dashboard audit trail and event feed.

### Params per control

| Control | `params` fields |
|---------|----------------|
| `identity_attestation` | `cert_cn`, `cert_issuer` |
| `runtime_monitoring` | `activity: {req_count, unique_endpoints, total_bytes}` |
| `data_guardrails` | `classification` |
| `zero_trust` | `target_agent`, `src_domain`, `dst_domain` |
| `tool_authorization` | `tool_name` |
| `autonomy_governance` | `tool_name`, `risk_level` |

### Environment variable pattern

```
VENDOR_{CONTROL_KEY_UPPERCASE}_URL   → HTTP endpoint
VENDOR_{CONTROL_KEY_UPPERCASE}_NAME  → Display name for dashboard
```

Example: `VENDOR_RUNTIME_MONITORING_URL`, `VENDOR_RUNTIME_MONITORING_NAME`.

### Fallback behavior

- When no env var is set for a control → builtin logic runs (zero-config backward compatibility)
- When vendor container is unreachable (timeout >5s, error, non-200) → builtin logic runs + "FALLBACK" event published to dashboard
- Multiple vendors can handle different controls simultaneously (mixed mode)

### Dashboard behavior

When a vendor is active, your product name and branding appear at every key moment:

**During the S2 attack (each control blocks an attack phase):**
- **Blocked overlay** — "Protected by YourCompany ProductName" appears in purple text on the green shield overlay every time your control blocks an attack phase. This is the most prominent vendor touchpoint — the audience sees your product name credited for each mitigation.
- **AOMC panel** — Purple badge with vendor name appears below the control toggle
- **Event feed** — Messages prefixed with `[YourCompany ProductName]` (e.g., `[YourCompany ProductName] cert CN mismatch — QUARANTINED`)
- **Audit trail** — Tamper-evident entries prefixed with your vendor name

**On the finale slide ("DEMO COMPLETE"):**
- A purple-bordered card displays **"{N} of 6 controls demonstrated by YourCompany ProductName"** (or "All 6" if you cover all controls)
- Multiple vendor names are joined with "+" if different vendors cover different controls

**API:**
- `/api/vendors` endpoint returns all registered vendors and which controls they cover

### What your audience sees (S2 flow)

| Moment | What appears | Example |
|--------|-------------|---------|
| Attack phase blocked | Green shield overlay + **"Protected by YourProduct"** | "Identity spoofing BLOCKED — Protected by Acme SecureAgent" |
| Control enforcing | AOMC panel badge flashes | Purple "Acme SecureAgent" badge on Identity Attestation |
| Event stream | Vendor-attributed detail | `[Acme SecureAgent] cert mismatch — QUARANTINED` |
| Audit trail | Vendor-prefixed entry | `[Acme SecureAgent] identity_check REJECTED` |
| Finale slide | Vendor branding card | "4 of 6 controls demonstrated by Acme SecureAgent" |

Controls you don't cover fall through to default AOMC builtin logic with no vendor branding.

---

## Both Demos Together

For a complete vendor presentation, configure both:

1. **Web demo** for the conference stage (vendor-config.ts) — large-screen, presenter-controlled
2. **Live demo** for hands-on booth demos (Docker container) — real infrastructure, real HTTP traffic

The web demo is static and self-contained. The live demo runs actual agent traffic through your container. Use the web demo for TTT keynotes and the live demo for deep-dive breakout sessions and award submissions.

---

## Keyboard Controls (Web Demo)

| Key | Action |
|-----|--------|
| `Space` / `→` | Next step |
| `←` | Previous step |
| `F` | Toggle fullscreen |
| `R` | Reset to beginning |
| `1` | Jump to Scenario 1 |
| `2` | Jump to Scenario 2 |
| `N` | Toggle voice narration |
| `S` | Stop current audio |

---

## Troubleshooting

**Web demo looks unchanged after editing config?**
Make sure `vendorConfig` is not `null` in `vendor-config.ts`. The default export is `null`.

**Logo not showing?**
Check that the file is in `web-demo/public/` and `logoUrl` starts with `/`.

**Live demo vendor not appearing?**
Run `make vendor-status` to check if the env vars are set correctly. Check container health with `docker compose -f docker-compose.yml -f docker-compose.vendor.yml ps`.

**Vendor container timing out?**
The control-plane allows 5 seconds per check. Ensure your `/check` endpoint responds within that window.
