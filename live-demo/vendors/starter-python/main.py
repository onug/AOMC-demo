"""
AOMC Vendor Plugin — Starter Template

This is a minimal vendor container that implements the AOMC vendor interface.
Customize the check logic for whichever controls your product provides.

Interface contract:
  GET  /healthz  → {"status": "ok", "vendor": "...", "controls": [...]}
  POST /check    → {"allowed": bool, "result": str, "detail": str}

See vendors/README.md for the full specification.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI(title="AOMC Vendor Plugin — Example")

# Your vendor/product name — shown in the dashboard
VENDOR_NAME = "Example Vendor"

# Which controls this container handles
SUPPORTED_CONTROLS = ["identity_attestation"]


@app.get("/healthz")
async def healthz():
    return {"status": "ok", "vendor": VENDOR_NAME, "controls": SUPPORTED_CONTROLS}


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

    # Dispatch to the appropriate handler
    handler = HANDLERS.get(control)
    if handler:
        return await handler(agent_id, params, context)

    return {"allowed": True, "result": "ALLOWED", "detail": f"{VENDOR_NAME}: no handler for {control}"}


# --- Control Handlers ---
# Implement one function per control your product provides.
# Each receives (agent_id, params, context) and returns a dict with:
#   allowed: bool
#   result: "ALLOWED" | "BLOCKED" | "REJECTED" | "QUARANTINED" | "PENDING"
#   detail: str (include your product name for dashboard attribution)


async def check_identity(agent_id: str, params: dict, context: dict) -> dict:
    """
    Identity Attestation check.

    params: {"cert_cn": str, "cert_issuer": str}
    context: {"agent_role": str, "agent_domain": str, "quarantined": bool}
    """
    cert_cn = params.get("cert_cn", "")
    # cert_issuer = params.get("cert_issuer", "")

    # Example: reject agents whose cert CN doesn't match their agent ID
    # Replace this with your product's attestation logic
    expected_cn = agent_id
    if cert_cn != expected_cn:
        return {
            "allowed": False,
            "result": "REJECTED",
            "detail": f"{VENDOR_NAME}: cert CN '{cert_cn}' does not match agent '{agent_id}'",
        }

    return {
        "allowed": True,
        "result": "ALLOWED",
        "detail": f"{VENDOR_NAME}: identity verified for {agent_id}",
    }


# Register handlers — add entries here as you implement more controls
HANDLERS = {
    "identity_attestation": check_identity,
    # "runtime_monitoring": check_runtime,
    # "data_guardrails": check_data,
    # "zero_trust": check_zero_trust,
    # "tool_authorization": check_tool,
    # "autonomy_governance": check_autonomy,
}
