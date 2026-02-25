# Web Demo

Conference-stage graphical presentation built with Next.js. Designed for large screens with animated network topology, event feed, and damage counters. Fully static — no API calls or network dependencies during presentation.

## Quick Start

```bash
cd web-demo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Press **F** for fullscreen.

### Production Build

```bash
cd web-demo
npm run build
```

Output goes to `web-demo/out/` as a static export. Serve with any static file server.

## Keyboard Controls

| Key | Action |
|-----|--------|
| `Space` or `→` | Advance to next step |
| `←` | Go back one step |
| `F` | Toggle fullscreen |
| `R` | Reset to beginning |
| `1` | Jump to Scenario 1 |
| `2` | Jump to Scenario 2 |

## Tech Stack

- **Next.js 16** (App Router, static export)
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** for animations
- No other runtime dependencies

## Architecture

### State Management

A single `useReducer` in `DemoStage.tsx` manages all state. The reducer replays all steps from 0 to N for any given step index, making backward navigation trivially correct.

### Step System

`lib/steps.ts` defines an array of ~44 `Step` objects — the complete "script" for the presentation. Each step specifies:

- `events[]` — Event entries to add to the feed (action, log, violation, blocked, damage, enable)
- `topologyChanges[]` — Graph mutations (updateNode, addEdge, updateEdge)
- `aomcChanges[]` — Control toggles (enable/disable specific controls)
- `damageUpdate{}` — Blast radius metric changes
- `auditEntries[]` — Audit trail entries
- Phase metadata: `title`, `subtitle`, `scenario`, `phase`

### Step Phases

Steps are grouped into phases:

| Phase | Visual Effect |
|-------|--------------|
| `title` | Full-screen title card |
| `action` | Agent actions in event feed, topology edge animations |
| `violation` | Red flash + shake overlay, red event entries |
| `enable` | AOMC control toggle animation, orange overlay on topology |
| `blocked` | Green shield overlay, green event entries |
| `summary` | Blast radius counters, audit trail table |

### Scenarios

- **Scenario 0**: Title slide and finale (2 steps)
- **Scenario 1**: Catastrophic Cascade — 18 steps showing 6 violations and blast radius
- **Scenario 2**: Layered Defense — 24 steps showing 6 control pairs (violation, enable, blocked) + audit trail

### Network Topology

SVG-based visualization with:

- **Three trust domains**: Private DC, Cloud VPC, External/Partner (rectangles)
- **Agent nodes**: Circles with blue (trusted) or magenta (untrusted) outlines
- **Rogue agent**: Pulsing red glow with skull icon
- **Datastores**: Cylinder shapes (customer DB, metrics store)
- **Tools**: Hexagon shapes
- **Connection types**: Blue (A2A), Yellow (data), Red (malicious), Green (blocked)
- **AOMC overlay**: Orange dashed rectangle wrapping the topology when controls are active

## File Structure

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

## Customization

### Add a New Step

Add a `Step` object to the `STEPS` array in `lib/steps.ts`:

```typescript
{
  id: 'my-new-step',
  scenario: 1,
  phase: 'action',
  title: 'T+00:30 — Something happens',
  events: [
    ev('action', 'Description of what happened', 'agent-id', true),
    ev('log', 'Supporting detail'),
  ],
  topologyChanges: [
    { action: 'addEdge', edgeId: 'e-new', props: { id: 'e-new', from: 'node-a', to: 'node-b', type: 'malicious', visible: true, animated: true } },
  ],
},
```

### Add a New Agent Node

1. Add to `REGISTRY` and `BASE_NODES` in `lib/data.ts` with `x`, `y` position coordinates
2. Reference the node ID in step topology changes

### Adjust Animations

- **CSS keyframes**: `app/globals.css` — glow, pulse, shake effects
- **Framer Motion**: Inline `motion.*` props in each component — transition durations, spring configs, variants
