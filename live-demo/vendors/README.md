# Live Demo Vendor Plugins

For the full vendor integration guide covering both the web demo and live infrastructure demo, see **[docs/vendor-guide.md](../../docs/vendor-guide.md)**.

## Quick Start

```bash
cd live-demo
cp -r vendors/starter-python vendors/my-vendor

# Edit vendors/my-vendor/main.py — implement your check logic
# Add your service to docker-compose.vendor.yml

make vendor-up       # build and start with vendor container
make vendor-status   # verify registration
make attack          # test with rogue agent
```

## Key Files

| File | Purpose |
|------|---------|
| `vendors/starter-python/` | Starter template — copy and customize |
| `docker-compose.vendor.yml` | Compose overlay — add your service + env vars |
| `services/control-plane/vendor_proxy.py` | Proxy that delegates checks to vendor containers |
| `services/control-plane/controls.py` | Control logic — calls vendor first, falls back to builtin |

## Interface

Your container implements two endpoints:

- `GET /healthz` — returns `{"status": "ok", "vendor": "...", "controls": [...]}`
- `POST /check` — receives `{control, agent_id, params, context}`, returns `{allowed, result, detail}`

See the full guide for params per control, env var patterns, and fallback behavior.
