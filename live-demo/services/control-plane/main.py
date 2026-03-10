"""AOMC Control Plane — FastAPI app with WebSocket event streaming."""

import asyncio
import os

import asyncpg
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

import registry
import audit
import events
import controls
import vendor_proxy

app = FastAPI(title="AOMC Control Plane")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://aomc:aomc@postgres:5432/aomc")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")


@app.on_event("startup")
async def startup():
    pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
    await registry.init(pool)
    await audit.init(pool)
    await controls.init(pool)
    await events.init(REDIS_URL)
    await vendor_proxy.init()


@app.on_event("shutdown")
async def shutdown():
    await vendor_proxy.close()


# --- Controls ---
@app.get("/api/controls")
async def get_controls():
    return await controls.get_all_controls()


@app.get("/api/controls/full")
async def get_controls_full():
    return await controls.get_controls_full()


@app.post("/api/controls/toggle/{key}")
async def toggle_control(key: str):
    current = await controls.get_control(key)
    new_val = not current
    await controls.set_control(key, new_val)
    await events.publish({
        "type": "enable" if new_val else "disable",
        "agent": "AOMC",
        "message": f"{'Enabled' if new_val else 'Disabled'}: {key.replace('_', ' ').title()}",
    })
    return {"key": key, "enabled": new_val}


@app.post("/api/controls/set/{key}")
async def set_control(key: str, enabled: bool):
    await controls.set_control(key, enabled)
    await events.publish({
        "type": "enable" if enabled else "disable",
        "agent": "AOMC",
        "message": f"{'Enabled' if enabled else 'Disabled'}: {key.replace('_', ' ').title()}",
    })
    return {"key": key, "enabled": enabled}


@app.post("/api/controls/all")
async def set_all_controls(enabled: bool):
    all_ctrl = await controls.get_all_controls()
    for key in all_ctrl:
        await controls.set_control(key, enabled)
    await events.publish({
        "type": "enable" if enabled else "disable",
        "agent": "AOMC",
        "message": f"All controls {'ENABLED' if enabled else 'DISABLED'}",
    })
    return await controls.get_all_controls()


# --- Vendors ---
@app.get("/api/vendors")
async def get_vendors():
    return vendor_proxy.get_all_vendors()


# --- Check endpoints (called by gateway) ---
@app.post("/api/check/identity")
async def check_identity(agent_id: str, cert_cn: str, cert_issuer: str = ""):
    return await controls.check_identity(agent_id, cert_cn, cert_issuer)


@app.post("/api/check/runtime")
async def check_runtime(agent_id: str):
    return await controls.check_runtime(agent_id)


@app.post("/api/check/data")
async def check_data(agent_id: str, classification: str):
    return await controls.check_data(agent_id, classification)


@app.post("/api/check/zero-trust")
async def check_zero_trust(agent_id: str, target_agent: str):
    return await controls.check_zero_trust(agent_id, target_agent)


@app.post("/api/check/tool")
async def check_tool(agent_id: str, tool_name: str):
    return await controls.check_tool(agent_id, tool_name)


@app.post("/api/check/autonomy")
async def check_autonomy(agent_id: str, tool_name: str):
    return await controls.check_autonomy(agent_id, tool_name)


# --- Activity logging ---
@app.post("/api/activity/log")
async def log_activity(agent_id: str, endpoint: str, method: str = "GET", data_bytes: int = 0):
    await controls.log_activity(agent_id, endpoint, method, data_bytes)
    return {"ok": True}


# --- Registry ---
@app.get("/api/agents")
async def list_agents():
    return await registry.list_agents()


@app.get("/api/agents/{agent_id}")
async def get_agent(agent_id: str):
    agent = await registry.get_agent(agent_id)
    if not agent:
        return {"error": "not found"}, 404
    return agent


# --- Audit trail ---
@app.get("/api/audit")
async def get_audit():
    entries = await audit.get_all()
    # Convert timestamps to strings for JSON
    for e in entries:
        if hasattr(e.get("ts"), "isoformat"):
            e["ts"] = e["ts"].strftime("%H:%M:%S.%f")[:-3]
        if hasattr(e.get("created_at"), "isoformat"):
            e["created_at"] = e["created_at"].isoformat()
    return entries


# --- Approval requests ---
@app.get("/api/approvals/pending")
async def get_pending_approvals():
    pool = controls._pool
    rows = await pool.fetch(
        "SELECT * FROM approval_requests WHERE status = 'pending' ORDER BY created_at"
    )
    result = []
    for r in rows:
        d = dict(r)
        if hasattr(d.get("created_at"), "isoformat"):
            d["created_at"] = d["created_at"].isoformat()
        result.append(d)
    return result


@app.post("/api/approvals/{approval_id}/resolve")
async def resolve_approval(approval_id: str, action: str):
    pool = controls._pool
    await pool.execute(
        "UPDATE approval_requests SET status = $1, resolved_at = now() WHERE id = $2",
        action, approval_id,
    )
    await events.publish({
        "type": "blocked" if action == "denied" else "info",
        "agent": "AOMC",
        "message": f"Approval {approval_id}: {action.upper()} by human operator",
    })
    return {"approval_id": approval_id, "status": action}


# --- Reset ---
@app.post("/api/reset")
async def reset_state():
    pool = controls._pool
    await pool.execute("UPDATE agents SET quarantined = FALSE")
    await pool.execute("TRUNCATE audit_trail RESTART IDENTITY")
    await pool.execute("TRUNCATE agent_activity RESTART IDENTITY")
    await pool.execute("DELETE FROM approval_requests")
    await pool.execute("UPDATE controls SET enabled = FALSE")
    await events.publish({
        "type": "info",
        "agent": "AOMC",
        "message": "System state RESET — all controls OFF, quarantine cleared, audit cleared",
    })
    return {"ok": True}


# --- Event announce (used by rogue agent to emit narrative events) ---
@app.post("/api/events/announce")
async def announce_event(request: Request):
    payload = await request.json()
    await events.publish(payload)
    return {"ok": True}


# --- WebSocket ---
@app.websocket("/api/events/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    events.register_ws(ws)
    try:
        while True:
            # Keep connection alive, receive pings
            await ws.receive_text()
    except WebSocketDisconnect:
        events.unregister_ws(ws)


# --- Health ---
@app.get("/healthz")
async def health():
    return {"status": "ok", "service": "control-plane"}
