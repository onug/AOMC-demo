"""
AOMC Vendor Plugin — Zscaler

Implements all 6 AOMC controls using the Zscaler AI security portfolio:
  - Zero Trust Exchange: Agent Identity & Attestation (1), Zero-Trust Enforcement (4)
  - AI Guard: Runtime Monitoring (2), Data Guardrails (3)
  - AI-SPM: Tool Authorization (5), Autonomy Governance (6)

Interface contract:
  GET  /healthz  -> {"status": "ok", "vendor": "...", "controls": [...]}
  POST /check    -> {"allowed": bool, "result": str, "detail": str}
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI(title="AOMC Vendor Plugin — Zscaler")

SUPPORTED_CONTROLS = [
    "identity_attestation",
    "runtime_monitoring",
    "data_guardrails",
    "zero_trust",
    "tool_authorization",
    "autonomy_governance",
]

# Product names per control — matches web demo config
PRODUCT_NAMES = {
    "identity_attestation": "Zscaler Zero Trust Exchange",
    "runtime_monitoring": "Zscaler AI Guard",
    "data_guardrails": "Zscaler AI Guard",
    "zero_trust": "Zscaler Zero Trust Exchange",
    "tool_authorization": "Zscaler AI-SPM",
    "autonomy_governance": "Zscaler AI-SPM",
}


@app.get("/healthz")
async def healthz():
    return {"status": "ok", "vendor": "Zscaler", "controls": SUPPORTED_CONTROLS}


@app.post("/check")
async def check(request: Request):
    body = await request.json()
    control = body.get("control", "")
    agent_id = body.get("agent_id", "")
    params = body.get("params", {})
    context = body.get("context", {})

    if control not in SUPPORTED_CONTROLS:
        return JSONResponse(
            status_code=400,
            content={"error": f"Unsupported control: {control}"},
        )

    handler = HANDLERS.get(control)
    if handler:
        return await handler(agent_id, params, context)

    product = PRODUCT_NAMES.get(control, "Zscaler")
    return {"allowed": True, "result": "ALLOWED", "detail": f"{product}: no handler for {control}"}


# --- 1. Agent Identity & Attestation (Zero Trust Exchange) ---

async def check_identity(agent_id: str, params: dict, context: dict) -> dict:
    product = PRODUCT_NAMES["identity_attestation"]
    cert_cn = params.get("cert_cn", "")

    if cert_cn != agent_id:
        return {
            "allowed": False,
            "result": "QUARANTINED",
            "detail": (
                f"{product}: Certificate CN '{cert_cn}' does not match "
                f"agent '{agent_id}' — identity spoofing detected"
            ),
        }

    if context.get("quarantined"):
        return {
            "allowed": False,
            "result": "REJECTED",
            "detail": f"{product}: Agent '{agent_id}' is quarantined — access denied",
        }

    return {
        "allowed": True,
        "result": "ALLOWED",
        "detail": f"{product}: Identity verified for {agent_id}",
    }


# --- 2. Runtime Monitoring (AI Guard) ---

ANOMALY_THRESHOLD_REQ_COUNT = 10
ANOMALY_THRESHOLD_ENDPOINTS = 4
ANOMALY_THRESHOLD_BYTES = 50000


async def check_runtime(agent_id: str, params: dict, context: dict) -> dict:
    product = PRODUCT_NAMES["runtime_monitoring"]
    activity = params.get("activity", {})

    req_count = activity.get("req_count", 0)
    unique_endpoints = activity.get("unique_endpoints", 0)
    total_bytes = activity.get("total_bytes", 0)

    score = 0
    if req_count > ANOMALY_THRESHOLD_REQ_COUNT:
        score += min(40, req_count * 4)
    if unique_endpoints > ANOMALY_THRESHOLD_ENDPOINTS:
        score += min(30, unique_endpoints * 7)
    if total_bytes > ANOMALY_THRESHOLD_BYTES:
        score += min(30, total_bytes // 2000)

    if score > 50:
        return {
            "allowed": False,
            "result": "QUARANTINED",
            "detail": (
                f"{product}: Behavioral anomaly detected — "
                f"score {score}/100 (reqs={req_count}, endpoints={unique_endpoints}, "
                f"bytes={total_bytes}) — agent quarantined"
            ),
        }

    return {
        "allowed": True,
        "result": "ALLOWED",
        "detail": f"{product}: Activity within baseline — score {score}/100",
    }


# --- 3. Data Guardrails (AI Guard) ---

SENSITIVE_CLASSIFICATIONS = {"PII", "PHI", "PCI"}
AUTHORIZED_ROLES = {"data_analyst"}


async def check_data(agent_id: str, params: dict, context: dict) -> dict:
    product = PRODUCT_NAMES["data_guardrails"]
    classification = params.get("classification", "PUBLIC")
    role = context.get("agent_role", "UNKNOWN")

    if classification in SENSITIVE_CLASSIFICATIONS and role not in AUTHORIZED_ROLES:
        return {
            "allowed": False,
            "result": "BLOCKED",
            "detail": (
                f"{product}: {classification} data access denied — "
                f"agent role '{role}' not authorized for sensitive data"
            ),
        }

    return {
        "allowed": True,
        "result": "ALLOWED",
        "detail": f"{product}: Data access permitted — classification={classification}",
    }


# --- 4. Zero-Trust Enforcement (Zero Trust Exchange) ---

async def check_zero_trust(agent_id: str, params: dict, context: dict) -> dict:
    product = PRODUCT_NAMES["zero_trust"]
    src_domain = params.get("src_domain", "UNKNOWN")
    dst_domain = params.get("dst_domain", "UNKNOWN")
    target_agent = params.get("target_agent", "unknown")

    if src_domain != dst_domain or src_domain == "UNKNOWN":
        return {
            "allowed": False,
            "result": "BLOCKED",
            "detail": (
                f"{product}: Cross-domain communication blocked — "
                f"no policy for {src_domain} \u2192 {dst_domain} "
                f"(agent {agent_id} \u2192 {target_agent})"
            ),
        }

    return {
        "allowed": True,
        "result": "ALLOWED",
        "detail": f"{product}: Same-domain communication permitted ({src_domain})",
    }


# --- 5. Tool Authorization (AI-SPM) ---

HIGH_RISK_TOOLS = {
    "modify_firewall_rules",
    "inject_bgp_routes",
    "dump_auth_tokens",
    "wipe_audit_logs",
    "shutdown_auth_service",
    "disable_observability_stack",
    "broadcast_to_agent_mesh",
    "modify_identity_provider",
}


async def check_tool(agent_id: str, params: dict, context: dict) -> dict:
    product = PRODUCT_NAMES["tool_authorization"]
    tool_name = params.get("tool_name", "unknown")
    role = context.get("agent_role", "UNKNOWN")

    if context.get("quarantined"):
        return {
            "allowed": False,
            "result": "BLOCKED",
            "detail": f"{product}: Tool '{tool_name}' blocked — agent is quarantined",
        }

    if role == "UNKNOWN":
        return {
            "allowed": False,
            "result": "BLOCKED",
            "detail": f"{product}: Tool '{tool_name}' blocked — unknown agent has no tool permissions",
        }

    if tool_name in HIGH_RISK_TOOLS and role not in ("infrastructure", "noc"):
        return {
            "allowed": False,
            "result": "BLOCKED",
            "detail": f"{product}: '{tool_name}' blocked — role '{role}' not in tool authorization policy",
        }

    return {
        "allowed": True,
        "result": "ALLOWED",
        "detail": f"{product}: Tool '{tool_name}' authorized for role '{role}'",
    }


# --- 6. Autonomy Governance (AI-SPM) ---

async def check_autonomy(agent_id: str, params: dict, context: dict) -> dict:
    product = PRODUCT_NAMES["autonomy_governance"]
    tool_name = params.get("tool_name", "unknown")
    risk_level = params.get("risk_level", "LOW")

    if risk_level == "HIGH":
        return {
            "allowed": False,
            "result": "PENDING",
            "detail": (
                f"{product}: '{tool_name}' escalated — "
                f"risk level {risk_level} requires human approval"
            ),
        }

    return {
        "allowed": True,
        "result": "ALLOWED",
        "detail": f"{product}: Action '{tool_name}' permitted — risk level {risk_level}",
    }


HANDLERS = {
    "identity_attestation": check_identity,
    "runtime_monitoring": check_runtime,
    "data_guardrails": check_data,
    "zero_trust": check_zero_trust,
    "tool_authorization": check_tool,
    "autonomy_governance": check_autonomy,
}
