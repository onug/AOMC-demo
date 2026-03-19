# Zscaler — AOMC Demo Submission

## Brief Description

**Zscaler Zero Trust Exchange, AI Guard, and AI-SPM provide unified enforcement of all six AOMC controls through identity-first architecture, inline behavioral analytics, and policy-driven governance.** The platform verifies every agent's identity and attestation, detects anomalous behavior in real-time, enforces data residency and DLP policies, eliminates cross-domain lateral movement, controls tool invocation at the API level, and requires human approval for high-risk autonomous actions — all integrated in a single control plane.

## Coverage: 6 of 6 Controls

| # | Control | Zscaler Product | Enforcement |
|---|---------|----------------|-------------|
| 1 | Agent Identity & Attestation | **Zero Trust Exchange** | Certificate CN validation — spoofed identity quarantined |
| 2 | Runtime Monitoring | **AI Guard** | Behavioral anomaly scoring (request rate, endpoint diversity, data volume) |
| 3 | Data Guardrails | **AI Guard** | Inline DLP — PII/PCI/PHI access denied for unauthorized roles |
| 4 | Zero-Trust Enforcement | **Zero Trust Exchange** | Cross-domain communication blocked without explicit policy |
| 5 | Tool Authorization | **AI-SPM** | Policy-driven tool invocation — high-risk tools blocked for unauthorized agents |
| 6 | Autonomy Governance | **AI-SPM** | Human-in-the-loop — HIGH risk actions escalated for approval |

## Demo Formats

### Web Demo (conference stage)

```bash
cd web-demo
npm install
npm run dev
# http://localhost:3000
```

Config: `web-demo/lib/vendor-config.ts` (activated) and `web-demo/lib/vendor-config.zscaler.ts` (standalone).

### Live Infrastructure Demo (Docker)

```bash
cd live-demo
make vendor-up       # 14 services including Zscaler vendor container
make controls-on     # enable all 6 AOMC controls
make attack          # launch rogue agent — watch Zscaler block every phase
```

Files:
- `live-demo/vendors/zscaler/main.py` — all 6 control handlers
- `live-demo/docker-compose.vendor.yml` — wires Zscaler container to control plane

### Prerequisites

- Node.js 18+ (web demo)
- Docker and docker compose (live demo)
- Port 3000 (dashboard), 8000 (control plane), 9000 (rogue agent)

## Product Portfolio

- **Zscaler Zero Trust Exchange** — identity-first platform; verifies every agent before granting access, eliminates lateral movement by making resources invisible to unauthorized agents
- **Zscaler AI Guard** — inline real-time inspection with 18+ specialized detectors for behavioral anomalies, prompt injection, and sensitive data exfiltration
- **Zscaler AI-SPM** — AI Security Posture Management; maps agent-to-tool dependencies, enforces API-level authorization, and provides continuous compliance monitoring against NIST AI RMF and EU AI Act

## Contact

Zscaler SPLX AI Team
https://www.zscaler.com
