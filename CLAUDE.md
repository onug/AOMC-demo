# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains two versions of a live demo for the **ONUG Agentic AI Overlay Working Group**, presented at the AI Networking Summit 2026. Both demonstrate six mandatory security controls for agentic AI systems in enterprise environments.

1. **`demo.py`** — Terminal-based interactive presentation (standalone Python)
2. **`web-demo/`** — Conference-stage graphical web application (Next.js)

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

To build for production (static export):

```bash
cd web-demo
npm run build
```

Output goes to `web-demo/out/`.

## Architecture

### Terminal Demo (`demo.py`)

Single file (~434 lines):

- **Class `C`**: ANSI color/formatting constants for terminal output
- **Presentation helpers**: `banner()`, `violation()`, `blocked()`, `act()`, `log()`, `pause()`, `damage()`, `section()` — all handle styled terminal output with `time.sleep()` pacing
- **Static data**: `CUSTOMERS` (sample PII records), `REGISTRY` (agent identity registry with domains/roles/certs), `TOOLS` (per-agent tool authorization matrix)
- **Class `AOMC`** (Agentic Overlay Management & Control): State machine managing six security controls. Each control can be enabled/disabled independently. Methods `check_identity()`, `check_runtime()`, `check_data()`, `check_zero_trust()`, `check_tool()`, `check_autonomy()` enforce the corresponding control and log to a tamper-evident audit trail.
- **`scenario_one()`**: All controls disabled — demonstrates cascading enterprise collapse from a single rogue agent
- **`scenario_two()`**: Walks through each of the six controls — first shows the violation, then enables the AOMC control to block it
- **`main()`**: Entry point — runs Scenario 1 then Scenario 2 sequentially with interactive `input()` pauses

### Web Demo (`web-demo/`)

Next.js 16 App Router, TypeScript, Tailwind CSS v4, Framer Motion. No other runtime dependencies.

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

**State management**: Single `useReducer` in `DemoStage.tsx`. State is rebuilt from scratch for any step by replaying all steps from 0 to N, which makes forward/backward navigation trivial.

**Step system**: `lib/steps.ts` defines an array of `Step` objects. Each step specifies events to add, topology changes, AOMC control toggles, damage updates, and audit entries. The reducer applies these declaratively.

**Topology**: SVG-based with three trust domain rectangles (Private DC, Cloud VPC, External/Partner), agent circles, datastore cylinders, tool hexagons, and animated connection lines (blue=A2A, yellow=data, red=malicious, green=blocked).

## Key Design Decisions

- **Interactive pacing**: The terminal demo uses `time.sleep()` delays and `input()` pauses for live presentation delivery. These are intentional, not bugs.
- **Presenter-controlled**: The web demo never auto-advances. Each step's animations play out, then the presenter advances with Space/→.
- **Presentation-first**: Code is optimized for readability during a live demo, not for production patterns.
- **State replay**: The web demo rebuilds state from step 0 on every navigation, ensuring backward navigation is always correct.
- **No API calls**: Everything is bundled statically. No loading states, no data fetching, no network dependencies during the live presentation.
- **The six AOMC controls** map to industry frameworks (MAESTRO/CSA, NIST SP 800-53 AI Overlays): Identity Attestation, Runtime Monitoring, Data Guardrails, Zero-Trust Enforcement, Tool Authorization, Autonomy Governance.

## Common Tasks

- **Add a new step**: Add a `Step` object to the `STEPS` array in `web-demo/lib/steps.ts`. Include events, topology changes, and any AOMC/damage updates.
- **Add a new agent**: Add to `REGISTRY` in `web-demo/lib/data.ts` and `BASE_NODES` with position coordinates.
- **Change control metadata**: Edit `CONTROLS` array in `web-demo/lib/data.ts` (poll percentages, MAESTRO layers).
- **Adjust animations**: CSS keyframes are in `web-demo/app/globals.css`. Framer Motion transitions are inline in each component.
