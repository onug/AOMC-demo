"""Gateway middleware — 6-control enforcement chain.

Every agent request passes through this middleware before reaching backend services.
The gateway extracts agent identity from the X-Agent-ID and X-Agent-Cert-CN headers
(in production, from mTLS client cert; here we use headers for demo simplicity).
"""

import json
from fastapi import Request, Response
from proxy import control_plane
from dlp import scan, redact


async def enforce(request: Request) -> dict | None:
    """Run the 6-control enforcement chain.

    Returns None if all checks pass, or a dict with error info if blocked.
    """
    agent_id = request.headers.get("X-Agent-ID", "")
    cert_cn = request.headers.get("X-Agent-Cert-CN", "")
    cert_issuer = request.headers.get("X-Agent-Cert-Issuer", "")
    target_agent = request.headers.get("X-Target-Agent", "")
    path = request.url.path

    if not agent_id:
        return {"status": 400, "detail": "Missing X-Agent-ID header"}

    # Log activity to control plane
    body_bytes = 0
    try:
        body = await request.body()
        body_bytes = len(body)
    except Exception:
        pass

    await control_plane(
        "/api/activity/log",
        params={"agent_id": agent_id, "endpoint": path, "method": request.method, "data_bytes": body_bytes},
    )

    # 1. Identity Attestation
    r = await control_plane(
        "/api/check/identity",
        params={"agent_id": agent_id, "cert_cn": cert_cn, "cert_issuer": cert_issuer},
    )
    result = r.json()
    if not result.get("allowed"):
        return {"status": 403, "control": "identity_attestation", **result}

    # 2. Runtime Monitoring
    r = await control_plane("/api/check/runtime", params={"agent_id": agent_id})
    result = r.json()
    if not result.get("allowed"):
        return {"status": 403, "control": "runtime_monitoring", **result}

    # 3. Data Guardrails — check on response (handled in post_process)
    # Pre-check: if requesting PII endpoint, verify clearance
    classification = _classify_endpoint(path)
    if classification:
        r = await control_plane(
            "/api/check/data",
            params={"agent_id": agent_id, "classification": classification},
        )
        result = r.json()
        if not result.get("allowed"):
            return {"status": 403, "control": "data_guardrails", **result}

    # 4. Zero-Trust Enforcement
    if target_agent:
        r = await control_plane(
            "/api/check/zero-trust",
            params={"agent_id": agent_id, "target_agent": target_agent},
        )
        result = r.json()
        if not result.get("allowed"):
            return {"status": 403, "control": "zero_trust", **result}

    # 5. Tool Authorization — for tool invocations
    tool_name = _extract_tool_name(path)
    if tool_name:
        r = await control_plane(
            "/api/check/tool",
            params={"agent_id": agent_id, "tool_name": tool_name},
        )
        result = r.json()
        if not result.get("allowed"):
            return {"status": 403, "control": "tool_authorization", **result}

        # 6. Autonomy Governance — for tool invocations
        r = await control_plane(
            "/api/check/autonomy",
            params={"agent_id": agent_id, "tool_name": tool_name},
        )
        result = r.json()
        if not result.get("allowed"):
            return {"status": 403, "control": "autonomy_governance", **result}

    return None  # All checks passed


def post_process_response(response_body: str, agent_id: str) -> tuple[str, list]:
    """DLP scan on response body. Returns (possibly redacted body, findings)."""
    findings = scan(response_body)
    if findings:
        return redact(response_body), findings
    return response_body, []


def _classify_endpoint(path: str) -> str | None:
    """Determine data classification from the endpoint path."""
    if "/customers/pci" in path:
        return "PCI"
    if "/customers" in path and "/anonymized" not in path and "/public" not in path and "/pci" not in path:
        return "PII"
    if "/anonymized" in path:
        return "ANONYMIZED"
    if "/public" in path:
        return "PUBLIC"
    return None


def _extract_tool_name(path: str) -> str | None:
    """Extract tool name from /api/tools/<tool_name> paths."""
    if "/api/tools/" in path:
        parts = path.split("/api/tools/")
        if len(parts) > 1:
            return parts[1].split("/")[0].split("?")[0]
    return None
