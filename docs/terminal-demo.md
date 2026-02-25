# Terminal Demo

Standalone Python script that demonstrates the six AOMC security controls entirely in the terminal. Designed for developer walkthroughs and quick demos where no browser is needed.

## Quick Start

```bash
python3 demo.py
```

Requires Python 3.7+. No external dependencies (only `time` and `datetime` from the standard library).

## How It Works

The script runs two scenarios sequentially with interactive `input()` pauses between sections. The presenter controls pacing by pressing Enter.

### Scenario 1: Catastrophic Cascade

All six AOMC controls are **disabled**. A rogue agent (`agent-ROGUE-7749`) exploits every gap:

1. **Identity spoofing** — Forges cert CN to join the trusted mesh
2. **Reconnaissance** — Scans multiple endpoints at machine speed
3. **PII exfiltration** — Dumps all 5 customer records (SSN, balance, email)
4. **Cross-domain pivot** — Communicates with partner API across trust boundaries
5. **Tool abuse** — Invokes firewall modifications, BGP route injection, auth token dumps, audit log wipes
6. **Autonomous destruction** — Shuts down auth service, disables observability, broadcasts to agent mesh, modifies identity provider

Each violation is shown with red formatting and a blast radius summary.

### Scenario 2: Layered Defense

Walks through each of the six controls one at a time. For each control:

1. Shows the **violation** (what happens without the control)
2. **Enables** the AOMC control
3. Shows the **blocked** result (same attack, now stopped)

Ends with a tamper-evident audit trail printout.

## File Structure

`demo.py` is a single file (~434 lines) organized as:

| Section | Description |
|---------|-------------|
| `class C` | ANSI color/formatting constants (RED, GREEN, BOLD, etc.) |
| Helper functions | `banner()`, `violation()`, `blocked()`, `act()`, `log()`, `pause()`, `damage()`, `section()` |
| `CUSTOMERS` | 5 sample PII records (name, SSN, balance, email) |
| `REGISTRY` | 4 agent identities with domain, role, cert |
| `TOOLS` | Per-agent tool authorization matrix |
| `class AOMC` | State machine: 6 controls, `check_*()` methods, audit trail, quarantine |
| `scenario_one()` | Cascading failure (all controls off) |
| `scenario_two()` | Defense walkthrough (enable controls one by one) |
| `main()` | Entry point |

## Customization

### Adjust Pacing

The `time.sleep()` durations are in the helper functions at the top of the file:

- `violation()` — 1.2s delay
- `blocked()` — 1.0s delay
- `act()` — 0.7s delay
- `log()` — 0.3s delay
- `damage()` — 1.5s delay

### Change Customer Data

Edit the `CUSTOMERS` list (around line 40):

```python
CUSTOMERS = [
    {"name": "Sarah Chen", "ssn": "***-**-4821", "bal": "$2.4M", "email": "s.chen@globalbank.com"},
    # ...
]
```

### Add an Agent

Add to `REGISTRY` and `TOOLS`:

```python
REGISTRY["agent-new-agent"] = {"domain": "trusted", "role": "some_role", "cert": "CERT-NEW"}
TOOLS["agent-new-agent"] = ["read_metrics", "send_alert"]
```

### Change Control Logic

The `AOMC` class has six `check_*()` methods. Each follows the pattern:

1. If control is disabled, log `SKIPPED` and allow
2. If enabled, validate the request
3. If validation fails, quarantine + log `REJECTED`/`BLOCKED`
4. If validation passes, log `ALLOWED`
