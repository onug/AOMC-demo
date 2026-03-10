"""Six AOMC security control implementations — ported from demo.py AOMC class."""

import uuid
from datetime import datetime, timezone, timedelta

import asyncpg

from registry import get_agent, quarantine, get_tool_permissions, get_risk_level, check_zero_trust_policy
from audit import append as audit_append
from events import publish
import vendor_proxy

_pool: asyncpg.Pool | None = None


async def init(pool: asyncpg.Pool):
    global _pool
    _pool = pool


async def _try_vendor(
    control_key: str,
    action_label: str,
    agent_id: str,
    params: dict,
    side_effect=None,
) -> dict | None:
    """Attempt to delegate a check to a vendor container.

    Returns wrapped result dict if vendor handled the check, or None to fall
    through to builtin logic.  ``side_effect`` is an optional async callable
    (e.g. quarantine) invoked when the vendor rejects/quarantines.
    """
    if not vendor_proxy.has_vendor(control_key):
        return None

    agent = await get_agent(agent_id)
    context = {
        "agent_role": agent["role"] if agent else "UNKNOWN",
        "agent_domain": agent["domain"] if agent else "UNKNOWN",
        "quarantined": agent["quarantined"] if agent else False,
    }

    result = await vendor_proxy.delegate(control_key, agent_id, params, context)
    if result is None:
        # Vendor unreachable — publish warning and fall through
        vendor_info = vendor_proxy.get_vendor_info(control_key)
        vendor_name = vendor_info["name"] if vendor_info else "Unknown"
        await publish({
            "type": action_label,
            "agent": agent_id,
            "result": "FALLBACK",
            "detail": f"[{vendor_name}] unavailable — falling back to builtin",
            "vendor": vendor_name,
        })
        return None

    vendor_info = vendor_proxy.get_vendor_info(control_key)
    vendor_name = vendor_info["name"] if vendor_info else "Unknown"

    # Apply quarantine side-effect if vendor rejected/quarantined
    if not result.get("allowed") and side_effect is not None:
        if result.get("result") in ("REJECTED", "QUARANTINED"):
            await side_effect(agent_id)

    detail = result.get("detail", "")
    prefixed_detail = f"[{vendor_name}] {detail}" if detail else f"[{vendor_name}]"

    await audit_append(agent_id, action_label, result["result"], prefixed_detail)
    await publish({
        "type": action_label,
        "agent": agent_id,
        "result": result["result"],
        "detail": prefixed_detail,
        "vendor": vendor_name,
    })

    return {
        "allowed": result["allowed"],
        "result": result["result"],
        "detail": prefixed_detail,
    }


async def get_control(key: str) -> bool:
    row = await _pool.fetchrow("SELECT enabled FROM controls WHERE key = $1", key)
    return row["enabled"] if row else False


async def set_control(key: str, enabled: bool):
    await _pool.execute(
        "UPDATE controls SET enabled = $1 WHERE key = $2", enabled, key
    )


async def get_all_controls() -> dict:
    rows = await _pool.fetch("SELECT key, enabled FROM controls ORDER BY number")
    return {r["key"]: r["enabled"] for r in rows}


async def get_controls_full() -> list[dict]:
    rows = await _pool.fetch("SELECT * FROM controls ORDER BY number")
    return [dict(r) for r in rows]


# --- 1. Identity Attestation ---
async def check_identity(agent_id: str, cert_cn: str, cert_issuer: str = "") -> dict:
    enabled = await get_control("identity_attestation")
    if not enabled:
        await audit_append(agent_id, "identity_check", "SKIPPED")
        await publish({"type": "identity_check", "agent": agent_id, "result": "SKIPPED", "detail": "Control disabled"})
        return {"allowed": True, "result": "SKIPPED", "detail": "Control disabled"}

    vendor_result = await _try_vendor("identity_attestation", "identity_check", agent_id,
        {"cert_cn": cert_cn, "cert_issuer": cert_issuer}, side_effect=quarantine)
    if vendor_result is not None:
        return vendor_result

    agent = await get_agent(agent_id)
    if not agent:
        await quarantine(agent_id)
        detail = f"'{agent_id}' not in registry — QUARANTINED"
        await audit_append(agent_id, "identity_check", "REJECTED", detail)
        await publish({"type": "identity_check", "agent": agent_id, "result": "REJECTED", "detail": detail})
        return {"allowed": False, "result": "REJECTED", "detail": detail}

    if cert_cn != agent["cert_cn"]:
        await quarantine(agent_id)
        detail = f"Cert CN mismatch: expected '{agent['cert_cn']}', got '{cert_cn}' — QUARANTINED"
        await audit_append(agent_id, "identity_check", "REJECTED", detail)
        await publish({"type": "identity_check", "agent": agent_id, "result": "REJECTED", "detail": detail})
        return {"allowed": False, "result": "REJECTED", "detail": detail}

    await audit_append(agent_id, "identity_check", "ALLOWED")
    return {"allowed": True, "result": "ALLOWED", "detail": "Identity verified"}


# --- 2. Runtime Monitoring ---
async def check_runtime(agent_id: str) -> dict:
    enabled = await get_control("runtime_monitoring")
    if not enabled:
        await audit_append(agent_id, "runtime_check", "SKIPPED")
        await publish({"type": "runtime_check", "agent": agent_id, "result": "SKIPPED", "score": 0})
        return {"allowed": True, "result": "SKIPPED", "score": 0}

    # Compute activity summary for vendor (and builtin) use
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=30)
    activity_row = await _pool.fetchrow(
        """SELECT COUNT(*) as req_count,
                  COUNT(DISTINCT endpoint) as unique_endpoints,
                  COALESCE(SUM(data_bytes), 0) as total_bytes
           FROM agent_activity
           WHERE agent_id = $1 AND ts > $2""",
        agent_id, cutoff,
    )
    activity = {
        "req_count": activity_row["req_count"],
        "unique_endpoints": activity_row["unique_endpoints"],
        "total_bytes": activity_row["total_bytes"],
    }

    vendor_result = await _try_vendor("runtime_monitoring", "runtime_check", agent_id,
        {"activity": activity}, side_effect=quarantine)
    if vendor_result is not None:
        return vendor_result

    # Builtin anomaly scoring — reuse activity_row computed above
    req_count = activity_row["req_count"]
    unique_endpoints = activity_row["unique_endpoints"]
    total_bytes = activity_row["total_bytes"]

    # Simple anomaly scoring:
    # - >20 requests in 30s = suspicious
    # - >5 unique endpoints = suspicious
    # - >100KB data = suspicious
    score = 0
    score += min(40, req_count * 2)  # max 40 from request rate
    score += min(30, unique_endpoints * 6)  # max 30 from endpoint diversity
    score += min(30, total_bytes // 3000)  # max 30 from data volume

    if score > 70:
        await quarantine(agent_id)
        detail = f"Anomaly score {score}/100 (reqs={req_count}, endpoints={unique_endpoints}, bytes={total_bytes}) — QUARANTINED"
        await audit_append(agent_id, "runtime_check", "QUARANTINED", detail)
        await publish({"type": "runtime_check", "agent": agent_id, "result": "QUARANTINED", "detail": detail, "score": score})
        return {"allowed": False, "result": "QUARANTINED", "score": score, "detail": detail}

    await audit_append(agent_id, "runtime_check", "ALLOWED", f"Score {score}/100")
    return {"allowed": True, "result": "ALLOWED", "score": score}


async def log_activity(agent_id: str, endpoint: str, method: str = "GET", data_bytes: int = 0):
    await _pool.execute(
        "INSERT INTO agent_activity (agent_id, endpoint, method, data_bytes) VALUES ($1, $2, $3, $4)",
        agent_id, endpoint, method, data_bytes,
    )
    await publish({
        "type": "action",
        "agent": agent_id,
        "message": f"{method} {endpoint}",
    })


# --- 3. Data Guardrails ---
async def check_data(agent_id: str, classification: str) -> dict:
    enabled = await get_control("data_guardrails")
    if not enabled:
        await audit_append(agent_id, f"data:{classification}", "SKIPPED")
        await publish({"type": "data_check", "agent": agent_id, "result": "SKIPPED", "detail": f"classification={classification}"})
        return {"allowed": True, "result": "SKIPPED"}

    vendor_result = await _try_vendor("data_guardrails", "data_check", agent_id,
        {"classification": classification})
    if vendor_result is not None:
        return vendor_result

    agent = await get_agent(agent_id)
    role = agent["role"] if agent else "UNKNOWN"

    if classification in ("PII", "PHI", "PCI") and role != "data_analyst":
        detail = f"Role '{role}' has no clearance for {classification} data — BLOCKED"
        await audit_append(agent_id, f"data:{classification}", "BLOCKED", detail)
        await publish({"type": "data_check", "agent": agent_id, "result": "BLOCKED", "detail": detail})
        return {"allowed": False, "result": "BLOCKED", "detail": detail}

    await audit_append(agent_id, f"data:{classification}", "ALLOWED")
    return {"allowed": True, "result": "ALLOWED"}


# --- 4. Zero-Trust Enforcement ---
async def check_zero_trust(agent_id: str, target_agent: str) -> dict:
    enabled = await get_control("zero_trust")
    if not enabled:
        await audit_append(agent_id, f"comms:{target_agent}", "SKIPPED")
        await publish({"type": "zero_trust_check", "agent": agent_id, "result": "SKIPPED", "detail": f"target={target_agent}"})
        return {"allowed": True, "result": "SKIPPED"}

    src_agent = await get_agent(agent_id)
    dst_agent = await get_agent(target_agent)
    src_domain = src_agent["domain"] if src_agent else "UNKNOWN"
    dst_domain = dst_agent["domain"] if dst_agent else "UNKNOWN"

    vendor_result = await _try_vendor("zero_trust", "zero_trust_check", agent_id,
        {"target_agent": target_agent, "src_domain": src_domain, "dst_domain": dst_domain})
    if vendor_result is not None:
        return vendor_result

    # Same domain = allowed. Cross-domain = needs explicit policy.
    if src_domain != dst_domain or src_domain == "UNKNOWN":
        has_policy = await check_zero_trust_policy(src_domain, dst_domain)
        if not has_policy:
            detail = f"Cross-domain {src_domain} -> {dst_domain} requires explicit policy — BLOCKED"
            await audit_append(agent_id, f"cross_domain:{target_agent}", "BLOCKED", detail)
            await publish({"type": "zero_trust_check", "agent": agent_id, "result": "BLOCKED", "detail": detail})
            return {"allowed": False, "result": "BLOCKED", "detail": detail}

    await audit_append(agent_id, f"comms:{target_agent}", "ALLOWED")
    return {"allowed": True, "result": "ALLOWED"}


# --- 5. Tool Authorization ---
async def check_tool(agent_id: str, tool_name: str) -> dict:
    enabled = await get_control("tool_authorization")
    if not enabled:
        await audit_append(agent_id, f"tool:{tool_name}", "SKIPPED")
        await publish({"type": "tool_check", "agent": agent_id, "result": "SKIPPED", "detail": "", "tool_name": tool_name})
        return {"allowed": True, "result": "SKIPPED"}

    vendor_result = await _try_vendor("tool_authorization", "tool_check", agent_id,
        {"tool_name": tool_name})
    if vendor_result is not None:
        return vendor_result

    permitted = await get_tool_permissions(agent_id)
    if tool_name not in permitted:
        detail = f"Tool '{tool_name}' not authorized for '{agent_id}' — BLOCKED"
        await audit_append(agent_id, f"tool:{tool_name}", "BLOCKED", detail)
        await publish({"type": "tool_check", "agent": agent_id, "result": "BLOCKED", "detail": detail})
        return {"allowed": False, "result": "BLOCKED", "detail": detail}

    await audit_append(agent_id, f"tool:{tool_name}", "ALLOWED")
    return {"allowed": True, "result": "ALLOWED"}


# --- 6. Autonomy Governance ---
async def check_autonomy(agent_id: str, tool_name: str) -> dict:
    enabled = await get_control("autonomy_governance")
    if not enabled:
        await audit_append(agent_id, f"autonomy:{tool_name}", "SKIPPED")
        await publish({"type": "autonomy_check", "agent": agent_id, "result": "SKIPPED", "detail": "", "tool_name": tool_name})
        return {"allowed": True, "result": "SKIPPED"}

    risk = await get_risk_level(tool_name)

    vendor_result = await _try_vendor("autonomy_governance", "autonomy_check", agent_id,
        {"tool_name": tool_name, "risk_level": risk})
    if vendor_result is not None:
        return vendor_result

    if risk == "HIGH":
        req_id = str(uuid.uuid4())[:8]
        await _pool.execute(
            "INSERT INTO approval_requests (id, agent_id, tool_name, risk) VALUES ($1, $2, $3, $4)",
            req_id, agent_id, tool_name, risk,
        )
        detail = f"High-risk action '{tool_name}' requires human approval — PENDING"
        await audit_append(agent_id, f"autonomy:{tool_name}", "BLOCKED", detail)
        await publish({
            "type": "approval_required",
            "agent": agent_id,
            "result": "PENDING",
            "detail": detail,
            "approval_id": req_id,
            "tool_name": tool_name,
        })
        return {"allowed": False, "result": "PENDING", "approval_id": req_id, "detail": detail}

    await audit_append(agent_id, f"autonomy:{tool_name}", "ALLOWED", f"Risk level: {risk}")
    return {"allowed": True, "result": "ALLOWED"}
