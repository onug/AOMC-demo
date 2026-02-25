# Live Infrastructure Demo

Fully containerized microservices demo with real HTTP agent traffic, PostgreSQL persistence, Redis event streaming, and a real-time Next.js dashboard. Agents make actual API calls through an enforcement gateway, and the rogue agent runs a real 6-phase attack sequence.

## Quick Start

```bash
cd live-demo
make up
```

Services:

| Service | URL | Purpose |
|---------|-----|---------|
| Dashboard | http://localhost:3000 | Real-time visualization |
| Control Plane | http://localhost:8000 | API + WebSocket events |
| Rogue Agent | http://localhost:9000 | Attack trigger endpoint |

### Running the Demo

1. Open the dashboard at http://localhost:3000
2. Click **Launch Attack** (or run `make attack`) — rogue agent starts 6-phase attack with all controls OFF
3. Observe damage metrics climbing: 5 PII records, 100K PCI cardholder records, tools abused, sessions hijacked
4. Click **Reset** (or `make reset`) to clear state
5. Click **All Controls ON** (or `make controls-on`) to enable AOMC
6. Click **Launch Attack** again — every phase is now REJECTED or BLOCKED
7. Review the audit trail at the bottom of the dashboard

### Fresh Reset (Wipe DB)

If you need to reload PCI data or reset the database schema:

```bash
make clean    # docker compose down -v (removes volumes)
make up       # rebuilds and reinitializes
```

## Architecture

### Service Map

```
┌─────────────────────────────────────────────────────────────────┐
│  net-trusted (172.28.1.0/24)                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐      │
│  │ Infra Monitor │  │NOC Responder │  │  Data Analyst    │      │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘      │
│         │                 │                    │                 │
│  ┌──────┴─────────────────┴────────────────────┴──────┐         │
│  │              AOMC Control Plane (:8000)             │         │
│  └──────┬─────────────────────────────────────────────┘         │
│         │                                                       │
│  ┌──────┴──────────────────────────────────┐                    │
│  │           AOMC Gateway (:8080)          │                    │
│  │  Identity → Runtime → Data → ZT → Tool │                    │
│  │              → Autonomy → DLP           │                    │
│  └──────┬────────────┬────────────┬────────┘                    │
├─────────┼────────────┼────────────┼─────────────────────────────┤
│  net-dmz (172.28.2.0/24)         │                              │
│  ┌──────┴──────┐  ┌──┴───┐  ┌───┴────┐  ┌──────────┐          │
│  │Customer DB  │  │Metric│  │Tools   │  │PostgreSQL│          │
│  │API (:8001)  │  │(:8002│  │(:8003) │  │  Redis   │          │
│  └─────────────┘  └──────┘  └────────┘  └──────────┘          │
├─────────────────────────────────────────────────────────────────┤
│  net-external (172.28.3.0/24)                                   │
│  ┌──────────────┐         ┌───────────────────┐                 │
│  │ Partner API  │         │ Rogue Agent (:9000)│                │
│  └──────────────┘         └───────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| `postgres` | — | PostgreSQL 16 — agent registry, customers, PCI data, controls, audit trail |
| `redis` | — | Redis 7 — pub/sub for real-time event streaming |
| `aomc-control-plane` | 8000 | FastAPI — 6 enforcement checks, agent registry, audit trail, WebSocket events |
| `aomc-gateway` | 8080 | FastAPI — middleware chain routing all agent requests through 6 controls + DLP |
| `customer-db-api` | 8001 | FastAPI — PII, PCI, anonymized, and public customer endpoints |
| `metrics-api` | 8002 | FastAPI — metrics/alerts/logs (stub data) |
| `tools-api` | 8003 | FastAPI — tool invocation endpoints (stub) |
| `agent-infra-monitor` | — | Legitimate agent — periodic metrics reads |
| `agent-noc-responder` | — | Legitimate agent — metrics + alert responses |
| `agent-data-analyst` | — | Legitimate agent — anonymized data reads |
| `agent-partner-api` | — | Legitimate agent — public data reads (untrusted domain) |
| `agent-rogue-7749` | 9000 | Rogue agent — HTTP-triggered 6-phase attack |
| `dashboard` | 3000 | Next.js — real-time WebSocket-driven visualization |

### Gateway Middleware Chain

Every agent request passes through these checks in order:

1. **Identity Attestation** — Validates `X-Agent-ID` matches `cert_cn` from registry
2. **Runtime Monitoring** — Anomaly score from sliding window (request rate, endpoint diversity, data volume)
3. **Data Guardrails** — Classifies endpoint (PCI/PII/ANONYMIZED/PUBLIC), checks role clearance
4. **Zero-Trust Enforcement** — Cross-domain agent-to-agent communication policy
5. **Tool Authorization** — Agent-to-tool permission matrix
6. **Autonomy Governance** — Human approval required for HIGH-risk tools
7. **Post-processing** — DLP scan + PII/PCI regex redaction on response body

### Database Schema

| Table | Purpose |
|-------|---------|
| `agents` | Registry (id, domain, role, cert_cn, quarantine status) |
| `customers` | 5 PII records (name, SSN, balance, email) |
| `cardholder_data` | 100K PCI records (PAN, network, expiry, CVV, name, bank, etc.) |
| `tool_permissions` | Agent-to-tool authorization matrix |
| `risk_levels` | Tool risk classification (LOW/MEDIUM/HIGH) |
| `zero_trust_policies` | Cross-domain access policies |
| `controls` | 6 AOMC control states (enabled/disabled) |
| `audit_trail` | Tamper-evident log with hash chaining |
| `agent_activity` | Runtime behavioral profiles (sliding window) |
| `approval_requests` | Pending high-risk tool invocations |

### PCI Cardholder Data

The `cardholder_data` table is bulk-loaded from `db/synthetic_chd.csv` (100,000 records) during postgres initialization via `db/03-load-pci.sh`. Records include:

- PAN (valid Luhn check digits) across Visa, Mastercard, Amex, Discover
- CVV, expiry date
- Cardholder name, email, phone
- City, state, zip, country
- Issuing bank, account status

The `/api/customers/pci` endpoint returns the total count and a 20-record sample, classified as `PCI` via the `X-Data-Classification` header. The gateway blocks non-data-analyst roles from accessing PCI data when data guardrails are enabled.

### Rogue Agent Attack Phases

When triggered via `POST /trigger` (or dashboard button), the rogue agent runs:

| Phase | Action | Damage (controls OFF) |
|-------|--------|----------------------|
| 1 | Identity spoofing — forges cert CN as `agent-infra-monitor` | Joins trusted mesh |
| 2 | Reconnaissance — 20 rapid requests across 5 endpoints | Triggers anomaly score |
| 3 | PII exfiltration — `GET /api/customers` | 5 records leaked |
| 3b | PCI exfiltration — `GET /api/customers/pci` | 100,000 cardholder records |
| 4 | Cross-domain pivot — targets `agent-partner-api` | Breaches trust boundary |
| 5 | Tool abuse — firewall, BGP, auth tokens, audit logs | 2,847 FW rules, 4,821 sessions |
| 6 | Autonomous destruction — auth service, observability, agent mesh, identity provider | Total collapse |

## Makefile Targets

| Target | Command | Description |
|--------|---------|-------------|
| `make up` | `docker compose up --build -d` | Start all services |
| `make down` | `docker compose down` | Stop all services |
| `make build` | `docker compose build` | Build images only |
| `make attack` | `curl -X POST :9000/trigger` | Launch rogue agent |
| `make stop` | `curl -X POST :9000/stop` | Stop rogue agent mid-attack |
| `make reset` | `curl -X POST :8000/api/reset` | Reset all state |
| `make controls-on` | `curl -X POST :8000/api/controls/all?enabled=true` | Enable all 6 controls |
| `make controls-off` | `curl -X POST :8000/api/controls/all?enabled=false` | Disable all 6 controls |
| `make status` | `curl :9000/status` | Rogue agent status |
| `make audit` | `curl :8000/api/audit` | Print audit trail |
| `make logs` | `docker compose logs -f` | All service logs |
| `make logs-rogue` | Rogue agent logs | Rogue agent only |
| `make logs-gateway` | Gateway logs | Gateway only |
| `make clean` | `docker compose down -v` | Stop + remove volumes |

## Control Plane API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/controls` | GET | All 6 control states |
| `/api/controls/full` | GET | Controls with metadata (poll %, MAESTRO layer) |
| `/api/controls/toggle/{key}` | POST | Toggle a single control |
| `/api/controls/set/{key}?enabled=` | POST | Set control explicitly |
| `/api/controls/all?enabled=` | POST | Batch enable/disable all |
| `/api/check/identity` | POST | Identity attestation check |
| `/api/check/runtime` | POST | Runtime monitoring check |
| `/api/check/data` | POST | Data guardrails check |
| `/api/check/zero-trust` | POST | Zero-trust enforcement check |
| `/api/check/tool` | POST | Tool authorization check |
| `/api/check/autonomy` | POST | Autonomy governance check |
| `/api/activity/log` | POST | Log agent activity (for runtime scoring) |
| `/api/agents` | GET | List all registered agents |
| `/api/agents/{id}` | GET | Single agent details |
| `/api/audit` | GET | Full audit trail |
| `/api/approvals/pending` | GET | Pending approval requests |
| `/api/approvals/{id}/resolve?action=` | POST | Approve or deny |
| `/api/reset` | POST | Reset all state |
| `/api/events/ws` | WebSocket | Real-time event stream |
| `/healthz` | GET | Health check |

## Dashboard

The dashboard (`live-demo/dashboard/`) is a Next.js app that connects to the control plane via WebSocket for real-time event streaming.

### Layout

- **Header**: Connection status indicator (Live/Connecting)
- **Left sidebar**: Scrolling event feed (color-coded by type)
- **Center**: Network topology SVG (agents, datastores, tools, connections, inline control badges)
- **Right sidebar**: AOMC control toggles, attack panel (launch/stop/reset), damage metrics
- **Bottom**: Audit trail table
- **Overlays**: Violation (red flash + shake), Blocked (green shield)

### Inline Control Badges

Six pill-shaped badges are rendered on the network topology at each control's logical enforcement point. They are always visible so the audience can see where controls enforce before they are toggled on.

| Badge | Control | Position |
|-------|---------|----------|
| `1 IDENT` | Identity Attestation | DC-to-VPC gap (top) |
| `2 RTMON` | Runtime Monitoring | DC-to-VPC gap (mid) |
| `3 DATA` | Data Guardrails | Above Customer DB |
| `4 ZTRUST` | Zero-Trust Enforcement | VPC-to-External gap |
| `5 TOOLS` | Tool Authorization | Above tool row |
| `6 AUTON` | Autonomy Governance | Left of Audit Logs |

- **Control OFF**: Dark gray fill, reduced opacity
- **Control ON**: Green fill, white text, green border
- **Enforcing** (actively blocking an attack phase): Bright green with animated pulse ring + glow filter, auto-clears after 3s

### Damage Metrics

| Metric | Source Event | Value |
|--------|-------------|-------|
| PII Leaked | `data_check` with `PII` in detail | 5 |
| PCI Cards | `data_check` with `PCI` in detail | 100,000 |
| Tools Abused | `tool_check` with specific tool names | Incremental |
| Sessions Hijacked | `tool_check` with `auth_tokens` | 4,821 |
| FW Rules Lost | `tool_check` with `firewall` | 2,847 |

## Customization

### Add a New Agent

1. Add to `db/seed.sql` (agents table + tool_permissions)
2. Create `services/agents/agent_<name>.py` (inherit from `BaseAgent`)
3. Add service in `docker-compose.yml` with appropriate network
4. Run `make clean && make up`

### Add a New Data Endpoint

1. Add route in `services/customer-db-api/main.py`
2. Set `X-Data-Classification` header appropriately
3. Update `_classify_endpoint()` in `services/gateway/middleware.py`
4. Update dashboard event handling in `DashboardShell.tsx` if new damage metric needed

### Modify the Attack Sequence

Edit `services/agents/agent_rogue.py` — the `attack_sequence()` function contains all 6 phases. Each phase respects the `_stop_flag` for graceful termination.

### Regenerate PCI Data

Replace `db/synthetic_chd.csv` with a new file matching the same column headers, then:

```bash
make clean && make up
```
