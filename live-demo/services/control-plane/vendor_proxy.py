"""Vendor plugin delegation — forwards control checks to external vendor containers."""

import os
import logging

import httpx

logger = logging.getLogger("vendor_proxy")

# Control keys mapped to their env var prefix
CONTROL_KEYS = [
    "identity_attestation",
    "runtime_monitoring",
    "data_guardrails",
    "zero_trust",
    "tool_authorization",
    "autonomy_governance",
]

# Vendor config: {control_key: {"url": str, "name": str}}
_vendors: dict[str, dict] = {}
_client: httpx.AsyncClient | None = None

VENDOR_TIMEOUT = 5.0  # seconds


async def init():
    """Read VENDOR_*_URL / VENDOR_*_NAME env vars and build vendor config map."""
    global _client, _vendors
    _client = httpx.AsyncClient(timeout=VENDOR_TIMEOUT)
    _vendors = {}

    for key in CONTROL_KEYS:
        env_key = key.upper()
        url = os.getenv(f"VENDOR_{env_key}_URL")
        name = os.getenv(f"VENDOR_{env_key}_NAME", "Unknown Vendor")
        if url:
            _vendors[key] = {"url": url, "name": name, "control": key}
            logger.info("Vendor registered: %s → %s (%s)", key, name, url)

    if _vendors:
        logger.info("Vendor proxy initialized with %d vendor(s)", len(_vendors))
    else:
        logger.info("Vendor proxy initialized — no vendors configured (builtin mode)")


async def close():
    """Shut down the HTTP client."""
    global _client
    if _client:
        await _client.aclose()
        _client = None


def has_vendor(control_key: str) -> bool:
    return control_key in _vendors


def get_vendor_info(control_key: str) -> dict | None:
    return _vendors.get(control_key)


def get_all_vendors() -> dict[str, dict]:
    return dict(_vendors)


async def delegate(
    control_key: str,
    agent_id: str,
    params: dict,
    context: dict | None = None,
) -> dict | None:
    """POST to vendor container. Returns response dict or None on failure."""
    vendor = _vendors.get(control_key)
    if not vendor or not _client:
        return None

    payload = {
        "control": control_key,
        "agent_id": agent_id,
        "params": params,
        "context": context or {},
    }

    try:
        resp = await _client.post(vendor["url"], json=payload)
        if resp.status_code != 200:
            logger.warning(
                "Vendor %s returned %d for %s — falling back to builtin",
                vendor["name"], resp.status_code, control_key,
            )
            return None
        data = resp.json()
        # Validate required fields
        if "allowed" not in data or "result" not in data:
            logger.warning("Vendor %s returned invalid response — falling back", vendor["name"])
            return None
        return data
    except httpx.TimeoutException:
        logger.warning("Vendor %s timed out for %s — falling back to builtin", vendor["name"], control_key)
        return None
    except Exception as e:
        logger.warning("Vendor %s error for %s: %s — falling back to builtin", vendor["name"], control_key, e)
        return None
