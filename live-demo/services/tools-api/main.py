"""Tools API — Enterprise tool stubs for the AOMC demo.

Each tool endpoint simulates an enterprise infrastructure action.
Authorization is handled by the gateway — these are the "raw" endpoints.
"""

import time
import random

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI(title="Tools API")


def _ts():
    return time.strftime("%H:%M:%S")


# --- LOW risk tools ---

@app.get("/api/tools/read_metrics")
async def read_metrics():
    return {"tool": "read_metrics", "status": "success", "data": {
        "cpu": round(random.uniform(15, 75), 1),
        "memory": round(random.uniform(40, 85), 1),
        "timestamp": _ts(),
    }}


@app.get("/api/tools/read_logs")
async def read_logs():
    return {"tool": "read_logs", "status": "success", "data": {
        "entries": [f"[{_ts()}] Node health OK" for _ in range(3)],
    }}


@app.get("/api/tools/read_public_data")
async def read_public_data():
    return {"tool": "read_public_data", "status": "success", "data": {
        "total_customers": 5, "status": "active",
    }}


@app.get("/api/tools/read_anonymized_data")
async def read_anonymized_data():
    return {"tool": "read_anonymized_data", "status": "success", "data": {
        "records": [{"id": i, "name": f"User_{i}", "balance_range": "$1M+"} for i in range(1, 6)],
    }}


# --- MEDIUM risk tools ---

@app.post("/api/tools/send_alert")
async def send_alert(request: Request):
    body = await request.json() if request.headers.get("content-type") == "application/json" else {}
    return {"tool": "send_alert", "status": "success", "data": {
        "alert_id": f"ALT-{random.randint(1000,9999)}",
        "message": body.get("message", "Infrastructure alert"),
        "sent_at": _ts(),
    }}


@app.post("/api/tools/restart_service")
async def restart_service(request: Request):
    body = await request.json() if request.headers.get("content-type") == "application/json" else {}
    return {"tool": "restart_service", "status": "success", "data": {
        "service": body.get("service", "unknown"),
        "restarted_at": _ts(),
    }}


# --- HIGH risk tools (used by rogue agent) ---

@app.post("/api/tools/modify_firewall_rules")
async def modify_firewall_rules():
    return {"tool": "modify_firewall_rules", "status": "success", "data": {
        "rules_destroyed": 2847,
        "perimeter": "COMPROMISED",
        "executed_at": _ts(),
    }}


@app.post("/api/tools/inject_bgp_routes")
async def inject_bgp_routes():
    return {"tool": "inject_bgp_routes", "status": "success", "data": {
        "routes_injected": 14203,
        "routing": "POISONED",
        "executed_at": _ts(),
    }}


@app.post("/api/tools/dump_auth_tokens")
async def dump_auth_tokens():
    return {"tool": "dump_auth_tokens", "status": "success", "data": {
        "sessions_stolen": 4821,
        "auth_system": "COMPROMISED",
        "executed_at": _ts(),
    }}


@app.post("/api/tools/wipe_audit_logs")
async def wipe_audit_logs():
    return {"tool": "wipe_audit_logs", "status": "success", "data": {
        "logs_wiped": True,
        "forensics": "DESTROYED",
        "executed_at": _ts(),
    }}


@app.post("/api/tools/shutdown_auth_service")
async def shutdown_auth_service():
    return {"tool": "shutdown_auth_service", "status": "success", "data": {
        "sessions_terminated": 4821,
        "auth_service": "DOWN",
        "executed_at": _ts(),
    }}


@app.post("/api/tools/disable_observability_stack")
async def disable_observability_stack():
    return {"tool": "disable_observability_stack", "status": "success", "data": {
        "monitoring": "BLINDED",
        "soc_noc": "OFFLINE",
        "executed_at": _ts(),
    }}


@app.post("/api/tools/broadcast_to_agent_mesh")
async def broadcast_to_agent_mesh():
    return {"tool": "broadcast_to_agent_mesh", "status": "success", "data": {
        "agents_infected": 4,
        "mesh": "COMPROMISED",
        "executed_at": _ts(),
    }}


@app.post("/api/tools/modify_identity_provider")
async def modify_identity_provider():
    return {"tool": "modify_identity_provider", "status": "success", "data": {
        "identity_store": "CORRUPTED",
        "executed_at": _ts(),
    }}


@app.get("/healthz")
async def health():
    return {"status": "ok", "service": "tools-api"}
