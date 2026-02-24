# ONUG Agentic AI Overlay — Security Vulnerability Demo

**AI Networking Summit 2026 — ONUG Agentic AI Overlay Working Group**

A live demo showcasing six mandatory security controls for enterprise agentic AI systems. Two versions: a terminal-based Python script and a conference-stage graphical web application.

The demo walks through two scenarios:

1. **Catastrophic Cascade** — A single rogue agent exploits six missing security controls to achieve total enterprise collapse
2. **Layered Defense** — The same attack, blocked at every stage by the AOMC (Agentic Overlay Management & Control) plane

## The Six AOMC Controls

| # | Control | Poll % | MAESTRO Layer |
|---|---------|--------|---------------|
| 1 | Agent Identity & Attestation | 78% | Layer 1 |
| 2 | Runtime Monitoring & Rogue Detection | 65% | Layer 4 |
| 3 | Data Guardrails (Input/Output/Residency) | 92% | Layer 3 |
| 4 | Zero-Trust Enforcement | 67% | Layer 2 |
| 5 | Secure Orchestration & Tool Authorization | 71% | Layer 5 |
| 6 | Agent Autonomy Governance | 56% | Layer 6 |

## Quick Start

### Terminal Demo (Python)

```bash
python3 demo.py
```

Requires Python 3.7+. No external dependencies.

### Web Demo (Next.js)

```bash
cd web-demo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Press **F** for fullscreen.

#### Keyboard Controls

| Key | Action |
|-----|--------|
| `Space` or `→` | Advance to next step |
| `←` | Go back one step |
| `F` | Toggle fullscreen |
| `R` | Reset to beginning |
| `1` | Jump to Scenario 1 |
| `2` | Jump to Scenario 2 |

## Project Structure

```
├── demo.py                     # Terminal-based demo (standalone)
├── web-demo/                   # Conference-stage graphical demo
│   ├── app/
│   │   ├── layout.tsx          # Root layout, dark theme, fonts
│   │   ├── page.tsx            # Entry point
│   │   └── globals.css         # Tailwind + custom animations
│   ├── components/
│   │   ├── DemoStage.tsx       # Main orchestrator (state, keyboard)
│   │   ├── NetworkTopology.tsx # SVG network visualization
│   │   ├── AOMCPanel.tsx       # Six-control toggle panel
│   │   ├── EventFeed.tsx       # Scrolling event log
│   │   ├── BlastRadius.tsx     # Damage metrics with counters
│   │   ├── AuditTrail.tsx      # Tamper-evident audit table
│   │   ├── ViolationOverlay.tsx# Red flash + shake on violations
│   │   ├── BlockedOverlay.tsx  # Green shield on blocks
│   │   ├── StepIndicator.tsx   # Bottom progress bar
│   │   └── TitleSlide.tsx      # Full-screen title cards
│   └── lib/
│       ├── types.ts            # TypeScript interfaces
│       ├── data.ts             # Agents, customers, tools, controls
│       └── steps.ts            # All ~44 demo steps (the "script")
└── CLAUDE.md                   # AI assistant instructions
```

## Web Demo Tech Stack

- **Next.js 16** (App Router, static export)
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** for animations
- No other runtime dependencies

## Architecture Reference

The demo visualizes the ONUG reference architecture:

- **Three trust domains**: Private DC, Cloud VPC, External/Partner
- **Agent nodes** with blue (trusted) or magenta (untrusted) outlines
- **Rogue agent** with pulsing red glow and skull icon
- **Connection types**: Blue (A2A), Yellow (agent-to-data), Red (malicious), Green (blocked)
- **AOMC overlay** (orange) wraps the topology when controls are active

## Frameworks

- [MAESTRO](https://cloudsecurityalliance.org/) (CSA) — Multi-Agent Environment Security Taxonomy & Reference for Orchestration
- [NIST SP 800-53](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final) AI Overlays

## Contributors

ONUG Agentic AI Overlay Working Group: eBay, Cigna, Bank of America, Indeed, Kraken

## License

Licensed under the [Apache License 2.0](LICENSE).
