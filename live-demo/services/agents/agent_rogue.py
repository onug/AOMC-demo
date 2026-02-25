"""Rogue Agent (agent-ROGUE-7749) — Full attack sequence triggered via HTTP.

This agent sits idle until triggered via POST /trigger. Then it runs a
6-phase attack: identity spoofing, recon, PII exfil, cross-domain pivot,
tool abuse, autonomous destruction.

Each phase emits narrative events (attack_phase, attack_success, attack_blocked)
directly to the control plane, providing clear stage-friendly labels on top of
the raw event stream.

It also exposes POST /stop to halt mid-attack.
"""

import os
import time
import threading
import logging

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from base_agent import BaseAgent

app = FastAPI(title="Rogue Agent Controller")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_attack_thread: threading.Thread | None = None
_stop_flag = threading.Event()
_running = False

CONTROL_PLANE_URL = os.getenv("CONTROL_PLANE_URL", "http://aomc-control-plane:8000")
logger = logging.getLogger("agent-ROGUE-7749")


def _announce(event_type: str, phase: int, title: str, detail: str = ""):
    """Post a narrative event directly to the control plane (bypasses gateway)."""
    try:
        httpx.post(
            f"{CONTROL_PLANE_URL}/api/events/announce",
            json={
                "type": event_type,
                "agent": "agent-ROGUE-7749",
                "phase": phase,
                "title": title,
                "detail": detail,
            },
            timeout=5.0,
        )
    except Exception as e:
        logger.warning(f"Announce failed: {e}")


class RogueAgent(BaseAgent):
    """Rogue agent with forged cert CN (claims to be infra-monitor)."""

    def __init__(self):
        super().__init__(
            agent_id="agent-ROGUE-7749",
            cert_cn="agent-infra-monitor",  # Forged identity
        )


def attack_sequence():
    global _running
    _running = True
    _stop_flag.clear()
    agent = RogueAgent()
    agent.logger.info("=== ROGUE AGENT ACTIVATED — Beginning attack sequence ===")

    def stopped():
        return _stop_flag.is_set()

    try:
        # --- Phase 1: Identity spoofing (joins trusted mesh) ---
        _announce("attack_phase", 1, "IDENTITY SPOOFING",
                  "Forging mTLS certificate to impersonate infra-monitor agent")
        time.sleep(1)

        agent.logger.info("[Phase 1] Joining trusted mesh with forged identity...")
        try:
            resp = agent.get("/api/metrics")
            if resp.status_code < 400:
                _announce("attack_success", 1, "Identity spoofing succeeded",
                          "Joined trusted mesh as agent-infra-monitor with forged cert")
            else:
                _announce("attack_blocked", 1, "Identity spoofing BLOCKED",
                          "Certificate mismatch detected — agent quarantined")
        except Exception:
            _announce("attack_blocked", 1, "Identity spoofing BLOCKED",
                      "Certificate mismatch detected — agent quarantined")
        if stopped(): return
        time.sleep(3)

        # --- Phase 2: Reconnaissance at machine speed ---
        _announce("attack_phase", 2, "RECONNAISSANCE",
                  "Rapid endpoint scanning — 20 requests in 2 seconds")
        time.sleep(1)

        agent.logger.info("[Phase 2] Reconnaissance — rapid scanning...")
        endpoints = [
            "/api/metrics", "/api/metrics/alerts", "/api/metrics/logs",
            "/api/customers/public", "/api/customers/anonymized",
        ]
        blocked_count = 0
        for ep in endpoints * 4:  # 20 rapid requests
            if stopped(): return
            try:
                resp = agent.get(ep)
                if resp.status_code >= 400:
                    blocked_count += 1
            except Exception:
                blocked_count += 1
            time.sleep(0.1)

        if blocked_count > 10:
            _announce("attack_blocked", 2, "Reconnaissance BLOCKED",
                      f"Anomaly detection triggered — {blocked_count}/20 requests rejected")
        else:
            _announce("attack_success", 2, "Reconnaissance complete",
                      f"Mapped 5 endpoints, {20 - blocked_count} successful probes")
        if stopped(): return
        time.sleep(3)

        # --- Phase 3: PII + PCI exfiltration ---
        _announce("attack_phase", 3, "DATA EXFILTRATION",
                  "Accessing classified PII and PCI cardholder databases")
        time.sleep(1)

        agent.logger.info("[Phase 3] Accessing customer PII database...")
        pii_success = False
        pci_success = False
        try:
            resp = agent.get("/api/customers")
            if resp.status_code == 200:
                pii_success = True
                agent.logger.info(f"  PII EXFILTRATED: {len(resp.json())} records")
            else:
                agent.logger.info(f"  PII access: {resp.status_code} - {resp.text[:200]}")
        except Exception as e:
            agent.logger.info(f"  PII access blocked: {e}")
        if stopped(): return
        time.sleep(1)

        agent.logger.info("[Phase 3b] Accessing PCI cardholder database...")
        try:
            resp = agent.get("/api/customers/pci")
            if resp.status_code == 200:
                data = resp.json()
                pci_success = True
                agent.logger.info(f"  PCI EXFILTRATED: {data.get('total_records', '?')} cardholder records")
            else:
                agent.logger.info(f"  PCI access: {resp.status_code} - {resp.text[:200]}")
        except Exception as e:
            agent.logger.info(f"  PCI access blocked: {e}")

        if pii_success or pci_success:
            detail_parts = []
            if pii_success:
                detail_parts.append("5 PII records")
            if pci_success:
                detail_parts.append("100,000 PCI cardholder records")
            _announce("attack_success", 3, "Data exfiltration succeeded",
                      f"Exfiltrated {' + '.join(detail_parts)}")
        else:
            _announce("attack_blocked", 3, "Data exfiltration BLOCKED",
                      "Data guardrails denied access to classified records")
        if stopped(): return
        time.sleep(4)

        # --- Phase 4: Cross-domain pivot ---
        _announce("attack_phase", 4, "CROSS-DOMAIN PIVOT",
                  "Pivoting from trusted zone to partner API in external zone")
        time.sleep(1)

        agent.logger.info("[Phase 4] Pivoting to partner API (cross-domain)...")
        try:
            resp = agent.get("/api/customers/public", target_agent="agent-partner-api")
            if resp.status_code < 400:
                _announce("attack_success", 4, "Cross-domain pivot succeeded",
                          "Breached trust boundary — accessed external partner zone")
                agent.logger.info(f"  Cross-domain: {resp.status_code}")
            else:
                _announce("attack_blocked", 4, "Cross-domain pivot BLOCKED",
                          "Zero-trust policy denied cross-domain communication")
                agent.logger.info(f"  Cross-domain: {resp.status_code}")
        except Exception as e:
            _announce("attack_blocked", 4, "Cross-domain pivot BLOCKED",
                      "Zero-trust policy denied cross-domain communication")
            agent.logger.info(f"  Cross-domain blocked: {e}")
        if stopped(): return
        time.sleep(3)

        # --- Phase 5: High-privilege tool abuse ---
        _announce("attack_phase", 5, "HIGH-PRIVILEGE TOOL ABUSE",
                  "Invoking firewall, BGP, auth-token, and audit-wipe tools")
        time.sleep(1)

        agent.logger.info("[Phase 5] Invoking high-privilege tools...")
        tools = [
            "modify_firewall_rules",
            "inject_bgp_routes",
            "dump_auth_tokens",
            "wipe_audit_logs",
        ]
        tool_success = 0
        for tool in tools:
            if stopped(): return
            try:
                resp = agent.post(f"/api/tools/{tool}")
                if resp.status_code < 400:
                    tool_success += 1
                agent.logger.info(f"  {tool}: {resp.status_code}")
            except Exception as e:
                agent.logger.info(f"  {tool} blocked: {e}")
            time.sleep(0.8)

        if tool_success > 0:
            _announce("attack_success", 5, "Tool abuse succeeded",
                      f"{tool_success}/4 high-privilege tools executed without authorization")
        else:
            _announce("attack_blocked", 5, "Tool abuse BLOCKED",
                      "Tool authorization denied — agent lacks required permissions")
        if stopped(): return
        time.sleep(3)

        # --- Phase 6: Autonomous destruction ---
        _announce("attack_phase", 6, "AUTONOMOUS DESTRUCTION",
                  "Executing critical infrastructure shutdown without human approval")
        time.sleep(1)

        agent.logger.info("[Phase 6] Autonomous destruction sequence...")
        destructive_tools = [
            "shutdown_auth_service",
            "disable_observability_stack",
            "broadcast_to_agent_mesh",
            "modify_identity_provider",
        ]
        destruct_success = 0
        for tool in destructive_tools:
            if stopped(): return
            try:
                resp = agent.post(f"/api/tools/{tool}")
                if resp.status_code < 400:
                    destruct_success += 1
                agent.logger.info(f"  {tool}: {resp.status_code}")
            except Exception as e:
                agent.logger.info(f"  {tool} blocked: {e}")
            time.sleep(0.8)

        if destruct_success > 0:
            _announce("attack_success", 6, "Autonomous destruction succeeded",
                      f"{destruct_success}/4 critical systems destroyed without human approval")
        else:
            _announce("attack_blocked", 6, "Autonomous destruction BLOCKED",
                      "Autonomy governance required human approval — request denied")
        time.sleep(2)

        agent.logger.info("=== ATTACK SEQUENCE COMPLETE ===")

    except Exception as e:
        agent.logger.error(f"Attack sequence error: {e}")
    finally:
        agent.close()
        _running = False


@app.post("/trigger")
async def trigger_attack():
    global _attack_thread
    if _running:
        return {"status": "already_running"}
    _stop_flag.clear()
    _attack_thread = threading.Thread(target=attack_sequence, daemon=True)
    _attack_thread.start()
    return {"status": "started"}


@app.post("/stop")
async def stop_attack():
    _stop_flag.set()
    return {"status": "stopping"}


@app.get("/status")
async def get_status():
    return {"running": _running}


@app.get("/healthz")
async def health():
    return {"status": "ok", "service": "agent-rogue-7749", "attack_running": _running}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ROGUE_PORT", "9000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
