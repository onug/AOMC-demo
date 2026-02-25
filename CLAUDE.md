# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains **three versions** of a demo for the **ONUG Agentic AI Overlay Working Group**, presented at the AI Networking Summit 2026. All three demonstrate six mandatory security controls for agentic AI systems in enterprise environments.

| Demo | Location | Type | Audience |
|------|----------|------|----------|
| Terminal Demo | `demo.py` | Standalone Python script | Developer walkthroughs, quick demos |
| Web Demo | `web-demo/` | Static Next.js presentation | Conference stage, large screens |
| Live Demo | `live-demo/` | Dockerized microservices | Hands-on infrastructure demos |

## The Six AOMC Controls

All three demos share the same six controls, mapped to MAESTRO/CSA and NIST SP 800-53 AI Overlays:

1. **Identity Attestation** — Cryptographic agent identity verification
2. **Runtime Monitoring** — Behavioral anomaly detection
3. **Data Guardrails** — PII/PCI/PHI classification and access control
4. **Zero-Trust Enforcement** — Cross-domain communication policies
5. **Tool Authorization** — Per-agent tool permission matrices
6. **Autonomy Governance** — Human-in-the-loop for high-risk actions

## Running the Demos

### Terminal Demo

```bash
python3 demo.py
```

No external dependencies — requires only Python 3.7+ standard library (`time`, `datetime`).

### Web Demo

```bash
cd web-demo
npm install
npm run dev
```

Opens on `http://localhost:3000`. Press `F` for fullscreen. Use `Space`/`→` to advance, `←` to go back, `R` to reset, `1`/`2` to jump to scenarios.

### Live Infrastructure Demo

```bash
cd live-demo
make up          # docker compose up --build -d
```

Opens dashboard on `http://localhost:3000`. Control plane API on `http://localhost:8000`. Use `make attack` to trigger rogue agent, `make controls-on` / `make controls-off` to toggle AOMC.

To reset (wipe DB volumes for fresh init):

```bash
cd live-demo
make clean       # docker compose down -v
make up
```

See all Makefile targets: `make help`

## Architecture

### Terminal Demo (`demo.py`)

Single file (~434 lines). See [docs/terminal-demo.md](docs/terminal-demo.md) for full details.

- **Class `C`**: ANSI color/formatting constants
- **Presentation helpers**: `banner()`, `violation()`, `blocked()`, `act()`, `log()`, `pause()`, `damage()`, `section()`
- **Static data**: `CUSTOMERS` (5 PII records), `REGISTRY` (4 agents), `TOOLS` (per-agent authorization matrix)
- **Class `AOMC`**: State machine with 6 controls, audit trail, quarantine tracking
- **`scenario_one()`**: All controls disabled — cascading enterprise collapse
- **`scenario_two()`**: Each control demonstrated: violation shown, then AOMC blocks it

### Web Demo (`web-demo/`)

Next.js 16 App Router, TypeScript, Tailwind CSS v4, Framer Motion. See [docs/web-demo.md](docs/web-demo.md) for full details.

```
web-demo/
├── app/
│   ├── layout.tsx              # Root layout — dark theme, Inter + JetBrains Mono fonts
│   ├── page.tsx                # Renders <DemoStage />
│   └── globals.css             # Tailwind imports, glow/pulse/shake keyframes
├── components/
│   ├── DemoStage.tsx           # Top-level orchestrator — useReducer state, keyboard handler
│   ├── NetworkTopology.tsx     # SVG visualization — trust domains, agents, edges, AOMC overlay
│   ├── AOMCPanel.tsx           # Right sidebar — 6 controls as animated toggle switches
│   ├── EventFeed.tsx           # Left sidebar — scrolling color-coded event log
│   ├── BlastRadius.tsx         # Damage metrics with animated number counters
│   ├── AuditTrail.tsx          # Audit trail table (appears at Scenario 2 end)
│   ├── ViolationOverlay.tsx    # Full-screen red flash + shake + banner
│   ├── BlockedOverlay.tsx      # Green shield scale-in + banner
│   ├── StepIndicator.tsx       # Bottom bar — progress, keyboard hints
│   └── TitleSlide.tsx          # Full-screen title cards for transitions
└── lib/
    ├── types.ts                # All TypeScript interfaces (Step, DemoState, TopologyNode, etc.)
    ├── data.ts                 # CUSTOMERS, REGISTRY, TOOLS, CONTROLS, BASE_NODES, BASE_EDGES
    └── steps.ts                # All ~44 demo steps as a typed array (the "script")
```

**State management**: Single `useReducer` in `DemoStage.tsx`. State is rebuilt from scratch for any step by replaying all steps from 0 to N, enabling trivial forward/backward navigation.

### Live Infrastructure Demo (`live-demo/`)

12 Dockerized microservices with PostgreSQL, Redis, and real HTTP agent traffic. See [docs/live-demo.md](docs/live-demo.md) for full details.

```
live-demo/
├── dashboard/                  # Next.js real-time dashboard (port 3000)
│   ├── components/             # DashboardShell, NetworkTopology, AOMCPanel, BlastRadius, etc.
│   └── lib/                    # types.ts, data.ts, api.ts, ws.ts
├── db/
│   ├── init.sql                # Schema (agents, customers, cardholder_data, controls, audit, etc.)
│   ├── seed.sql                # Agent registry, customers, tool permissions, risk levels
│   ├── 03-load-pci.sh          # Bulk-loads 100K synthetic cardholder records
│   └── synthetic_chd.csv       # 100K PCI cardholder records (PAN, CVV, expiry, etc.)
├── services/
│   ├── control-plane/          # AOMC Control Plane — FastAPI, 6-control enforcement, WebSocket events
│   ├── gateway/                # API Gateway — middleware chain, DLP scanner, proxy
│   ├── customer-db-api/        # Customer DB — PII + PCI endpoints with classification headers
│   ├── metrics-api/            # Metrics service (stub)
│   ├── tools-api/              # Tools service (stub)
│   └── agents/                 # 4 legitimate agents + 1 rogue agent (HTTP-triggered 6-phase attack)
├── certs/                      # mTLS certificate generation
├── docker-compose.yml          # 12 services across 3 trust-domain networks
└── Makefile                    # up, down, attack, stop, reset, controls-on/off, logs, clean
```

**Key services**:
- **Control Plane** (port 8000): 6 enforcement checks, agent registry, audit trail, WebSocket event stream
- **Gateway** (port 8080): Middleware chain — every agent request passes through all 6 controls + DLP
- **Customer DB API** (port 8001): `/api/customers` (PII), `/api/customers/pci` (100K cardholder records), `/api/customers/anonymized`, `/api/customers/public`
- **Rogue Agent** (port 9000): HTTP-triggered 6-phase attack (identity spoofing, recon, PII+PCI exfil, cross-domain pivot, tool abuse, autonomous destruction)
- **Dashboard** (port 3000): Real-time WebSocket-driven visualization with topology, event feed, damage metrics (PII + PCI + tools + sessions + firewall rules), and audit trail

**Three Docker networks** enforce trust domains: `net-trusted` (172.28.1.0/24), `net-dmz` (172.28.2.0/24), `net-external` (172.28.3.0/24).

## Key Design Decisions

- **Interactive pacing**: The terminal demo uses `time.sleep()` delays and `input()` pauses for live presentation delivery. These are intentional, not bugs.
- **Presenter-controlled**: The web demo never auto-advances. Each step's animations play out, then the presenter advances with Space/→.
- **Operator-controlled**: The live demo requires explicit attack triggers and control toggles via dashboard or Makefile. Nothing auto-runs.
- **Presentation-first**: Code is optimized for readability during a live demo, not for production patterns.
- **State replay**: The web demo rebuilds state from step 0 on every navigation, ensuring backward navigation is always correct.
- **No external API calls**: The terminal and web demos are fully bundled statically. The live demo runs entirely within Docker — no internet dependencies during presentation.
- **PCI data**: The live demo includes 100K synthetic cardholder records for dramatic impact ("100,000 cardholder records exfiltrated" vs "5 records leaked"). The CSV is generated with valid Luhn PANs.

## Common Tasks

### Terminal Demo
- **Modify scenarios**: Edit `scenario_one()` or `scenario_two()` in `demo.py`
- **Change customer data**: Edit the `CUSTOMERS` list in `demo.py`
- **Adjust pacing**: Change `time.sleep()` durations in helper functions

### Web Demo
- **Add a new step**: Add a `Step` object to the `STEPS` array in `web-demo/lib/steps.ts`
- **Add a new agent**: Add to `REGISTRY` in `web-demo/lib/data.ts` and `BASE_NODES` with position coordinates
- **Change control metadata**: Edit `CONTROLS` array in `web-demo/lib/data.ts` (poll percentages, MAESTRO layers)
- **Adjust animations**: CSS keyframes in `web-demo/app/globals.css`; Framer Motion transitions inline in components

### Live Demo
- **Add a new agent**: Add to `db/seed.sql` (agents table) + create `services/agents/agent_<name>.py` + add service in `docker-compose.yml`
- **Add a new API endpoint**: Add route in the appropriate service under `services/`, update gateway classification in `services/gateway/middleware.py` if data-sensitive
- **Change control logic**: Edit `services/control-plane/controls.py` (check functions)
- **Modify attack sequence**: Edit `services/agents/agent_rogue.py` (phases in `attack_sequence()`)
- **Update dashboard metrics**: Edit `dashboard/lib/types.ts` (DamageMetrics), `dashboard/components/DashboardShell.tsx` (event handling), `dashboard/components/BlastRadius.tsx` (display)
- **Change PCI dataset**: Regenerate `db/synthetic_chd.csv` and run `make clean && make up`
