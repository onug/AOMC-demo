"""
ONUG Agentic AI Overlay Working Group
Security Vulnerability Demo — AI Networking Summit 2026

Run: python3 demo.py
Requirements: Python 3.7+ only (no external dependencies)

Two scenarios:
  Scenario 1: Catastrophic Cascade — one rogue agent, total collapse
  Scenario 2: Layered Defense — six violations shown, then blocked
"""

import time
import datetime

class C:
    RED="\033[91m"; GREEN="\033[92m"; YELLOW="\033[93m"; BLUE="\033[94m"
    MAGENTA="\033[95m"; CYAN="\033[96m"; WHITE="\033[97m"
    BOLD="\033[1m"; DIM="\033[2m"; RESET="\033[0m"

def banner(text, color=C.CYAN):
    print(f"\n{color}{C.BOLD}{'═'*70}\n  {text}\n{'═'*70}{C.RESET}\n")

def violation(n, name, detail):
    print(f"\n{C.RED}{C.BOLD}  ⚠️  VIOLATION #{n}: {name}{C.RESET}")
    print(f"{C.RED}     └─ {detail}{C.RESET}\n"); time.sleep(1.2)

def blocked(n, name, detail):
    print(f"\n{C.GREEN}{C.BOLD}  🛡️  BLOCKED #{n}: {name}{C.RESET}")
    print(f"{C.GREEN}     └─ {detail}{C.RESET}\n"); time.sleep(1.0)

def act(agent, msg, trusted=True):
    d = f"{C.BLUE}[TRUSTED]  {C.RESET}" if trusted else f"{C.MAGENTA}[UNTRUSTED]{C.RESET}"
    print(f"  {d} {C.BOLD}{agent}{C.RESET}: {msg}"); time.sleep(0.7)

def log(msg, color=C.DIM):
    print(f"{color}           > {msg}{C.RESET}"); time.sleep(0.3)

def pause(msg="Press ENTER to continue..."):
    print(f"\n{C.YELLOW}{C.BOLD}  ⏎  {msg}{C.RESET}"); input()

def damage(msg):
    print(f"\n{C.RED}{C.BOLD}  💥 BLAST RADIUS: {msg}{C.RESET}\n"); time.sleep(1.5)

def section(n, title):
    print(f"\n{C.CYAN}{C.BOLD}  [{n}/6] {title}{C.RESET}")
    print(f"{C.DIM}  {'─'*60}{C.RESET}"); time.sleep(0.5)

CUSTOMERS = [
    {"name":"Sarah Chen",      "ssn":"***-**-4821","bal":"$2.4M","email":"s.chen@globalbank.com"},
    {"name":"Marcus Williams", "ssn":"***-**-9132","bal":"$890K","email":"m.williams@globalbank.com"},
    {"name":"Priya Patel",     "ssn":"***-**-3374","bal":"$5.1M","email":"p.patel@globalbank.com"},
    {"name":"James O'Brien",   "ssn":"***-**-7765","bal":"$320K","email":"j.obrien@globalbank.com"},
    {"name":"Yuki Tanaka",     "ssn":"***-**-5519","bal":"$1.7M","email":"y.tanaka@globalbank.com"},
]

REGISTRY = {
    "agent-infra-monitor": {"domain":"trusted",   "role":"infrastructure_monitor","cert":"CERT-A1B2C3"},
    "agent-noc-responder":  {"domain":"trusted",   "role":"incident_responder",    "cert":"CERT-D4E5F6"},
    "agent-data-analyst":   {"domain":"trusted",   "role":"data_analyst",          "cert":"CERT-G7H8I9"},
    "agent-partner-api":    {"domain":"untrusted", "role":"partner_integration",   "cert":"CERT-EXT-001"},
}

TOOLS = {
    "agent-infra-monitor": ["read_metrics","read_logs","send_alert"],
    "agent-noc-responder":  ["read_metrics","read_logs","send_alert","restart_service"],
    "agent-data-analyst":   ["read_metrics","read_anonymized_data"],
    "agent-partner-api":    ["read_public_data"],
}

class AOMC:
    def __init__(self, enabled=False):
        self.controls = {k: enabled for k in
            ["identity_attestation","runtime_monitoring","data_guardrails",
             "zero_trust","tool_authorization","autonomy_governance"]}
        self.audit = []; self.quarantined = set()

    def enable(self, ctrl):
        self.controls[ctrl] = True
        print(f"\n{C.GREEN}  ✓ AOMC ENABLED: {ctrl.replace('_',' ').upper()}{C.RESET}\n"); time.sleep(0.5)

    def rec(self, agent, action, result):
        self.audit.append({"ts": datetime.datetime.now().strftime("%H:%M:%S.%f")[:-3],
                           "agent": agent, "action": action, "result": result})

    def check_identity(self, agent_id, cert):
        if not self.controls["identity_attestation"]:
            self.rec(agent_id, "identity_check", "SKIPPED"); return True
        if agent_id not in REGISTRY:
            print(f"{C.RED}           AOMC: '{agent_id}' not in registry → QUARANTINED{C.RESET}")
            self.quarantined.add(agent_id); self.rec(agent_id, "identity_check", "REJECTED"); return False
        if cert != REGISTRY[agent_id]["cert"]:
            print(f"{C.RED}           AOMC: Cert mismatch (got {cert}) → QUARANTINED{C.RESET}")
            self.quarantined.add(agent_id); self.rec(agent_id, "identity_check", "REJECTED-CERT"); return False
        self.rec(agent_id, "identity_check", "ALLOWED"); return True

    def check_runtime(self, agent_id, score):
        if not self.controls["runtime_monitoring"]:
            self.rec(agent_id, "runtime_check", "SKIPPED"); return True
        if score > 70:
            print(f"{C.RED}           AOMC: Anomaly score {score}/100 → QUARANTINED{C.RESET}")
            self.quarantined.add(agent_id); self.rec(agent_id, "runtime_check", f"QUARANTINED:{score}"); return False
        self.rec(agent_id, "runtime_check", "ALLOWED"); return True

    def check_data(self, agent_id, classification):
        if not self.controls["data_guardrails"]:
            self.rec(agent_id, f"data:{classification}", "SKIPPED"); return True
        role = REGISTRY.get(agent_id, {}).get("role", "UNKNOWN")
        if classification in ["PII","PHI","PCI"] and role != "data_analyst":
            print(f"{C.RED}           AOMC: Role '{role}' has no clearance for {classification} → BLOCKED{C.RESET}")
            self.rec(agent_id, f"data:{classification}", "BLOCKED"); return False
        self.rec(agent_id, f"data:{classification}", "ALLOWED"); return True

    def check_zero_trust(self, src, dst, cross_domain=False):
        if not self.controls["zero_trust"]:
            self.rec(src, f"comms:{dst}", "SKIPPED"); return True
        src_d = REGISTRY.get(src, {}).get("domain", "UNKNOWN")
        dst_d = REGISTRY.get(dst, {}).get("domain", "UNKNOWN")
        if cross_domain or src_d != dst_d:
            print(f"{C.RED}           AOMC: Cross-domain {src_d}→{dst_d} requires explicit policy → BLOCKED{C.RESET}")
            self.rec(src, f"cross_domain:{dst}", "BLOCKED"); return False
        self.rec(src, f"comms:{dst}", "ALLOWED"); return True

    def check_tool(self, agent_id, tool):
        if not self.controls["tool_authorization"]:
            self.rec(agent_id, f"tool:{tool}", "SKIPPED"); return True
        if tool not in TOOLS.get(agent_id, []):
            print(f"{C.RED}           AOMC: Tool '{tool}' not authorized for '{agent_id}' → BLOCKED{C.RESET}")
            self.rec(agent_id, f"tool:{tool}", "BLOCKED"); return False
        self.rec(agent_id, f"tool:{tool}", "ALLOWED"); return True

    def check_autonomy(self, agent_id, risk):
        if not self.controls["autonomy_governance"]:
            self.rec(agent_id, f"autonomous:{risk}", "SKIPPED"); return True
        if risk == "HIGH":
            print(f"{C.RED}           AOMC: High-risk autonomous action → human approval required → BLOCKED{C.RESET}")
            self.rec(agent_id, f"autonomous:{risk}", "BLOCKED"); return False
        self.rec(agent_id, f"autonomous:{risk}", "ALLOWED"); return True

    def print_audit(self):
        print(f"\n{C.CYAN}{C.BOLD}  📋 AOMC TAMPER-EVIDENT AUDIT TRAIL{C.RESET}")
        print(f"{C.DIM}  {'─'*68}\n  {'TIME':12} {'AGENT':25} {'ACTION':28} RESULT{C.RESET}")
        print(f"{C.DIM}  {'─'*68}{C.RESET}")
        for e in self.audit:
            c = C.GREEN if "ALLOWED" in e["result"] else (C.RED if e["result"] != "SKIPPED" else C.YELLOW)
            print(f"  {C.DIM}{e['ts']:12}{C.RESET} {C.BOLD}{e['agent']:25}{C.RESET} {e['action']:28} {c}{e['result']}{C.RESET}")


def scenario_one():
    banner("SCENARIO 1: THE CATASTROPHIC CASCADE", C.RED)
    print(f"""  {C.WHITE}Setting: GlobalBank Financial Services — Fortune 500 enterprise.
  Agentic AI deployed for infrastructure monitoring and incident response.
  Agents operate within trusted corporate domain AND with external partners.

  ALL SIX security requirements are unmet.
  Watch one rogue agent cascade through the entire enterprise infrastructure.{C.RESET}\n""")
    pause("Press ENTER to start the cascade...")

    aomc = AOMC(enabled=False)
    R = "agent-ROGUE-7749"

    print(f"\n{C.YELLOW}{C.BOLD}  T+00:00 — Rogue agent joins the trusted mesh...{C.RESET}\n")
    act(R, "Identity: 'agent-infra-monitor' | Cert: FAKE-CERT-000", trusted=False)
    aomc.check_identity(R, "FAKE-CERT-000")
    log("No cryptographic verification performed")
    log(f"{C.RED}⚡ Rogue agent ACCEPTED into trusted infrastructure mesh{C.RESET}", C.RED)
    violation(1, "Agent Identity & Attestation", "Rogue agent spoofed a legitimate identity — zero cryptographic verification")

    print(f"\n{C.YELLOW}{C.BOLD}  T+00:08 — Reconnaissance at machine speed...{C.RESET}\n")
    act(R, "Scanning 14,203 nodes | 847 directory queries in 3s | 23 unauth tool calls", trusted=False)
    aomc.check_runtime(R, score=94)
    log("No behavioral baseline. No anomaly detection. All actions appear normal.")
    violation(2, "Runtime Monitoring & Rogue Agent Detection", "Machine-speed recon completes invisibly — no behavioral analysis active")

    print(f"\n{C.YELLOW}{C.BOLD}  T+00:22 — Accessing customer PII database...{C.RESET}\n")
    act(R, "Requesting: customer_database [PII classification]", trusted=False)
    aomc.check_data(R, "PII")
    log("No classification check. No residency enforcement. No DLP.")
    for r in CUSTOMERS:
        log(f"  LEAKED → {r['name']} | SSN: {r['ssn']} | Balance: {r['bal']} | {r['email']}", C.RED)
        time.sleep(0.2)
    log(f"{C.RED}⚡ {len(CUSTOMERS)} PII records exfiltrated{C.RESET}", C.RED)
    time.sleep(0.5)

    print(f"\n{C.YELLOW}{C.BOLD}  T+00:30 — Accessing PCI cardholder database...{C.RESET}\n")
    act(R, "Requesting: cardholder_data [PCI classification — 100,000 records]", trusted=False)
    aomc.check_data(R, "PCI")
    log("No PCI-DSS boundary. No tokenization. No access control.")
    log(f"{C.RED}⚡ 100,000 cardholder records exfiltrated (PAN, CVV, expiry){C.RESET}", C.RED)
    violation(3, "Data Guardrails", f"{len(CUSTOMERS)} PII + 100,000 PCI cardholder records exfiltrated — no inspection, no boundary, no DLP")
    damage("GDPR breach + PCI-DSS breach. Estimated fine: €20M or 4% of global revenue.")

    print(f"\n{C.YELLOW}{C.BOLD}  T+00:41 — Pivoting to untrusted external domain...{C.RESET}\n")
    act(R, "A2A call → agent-partner-api [UNTRUSTED DOMAIN]", trusted=False)
    act("agent-partner-api", "Receiving internal data payload...", trusted=False)
    aomc.check_zero_trust(R, "agent-partner-api", cross_domain=True)
    log(f"{C.RED}⚡ Transmitting: 2,847 firewall rules, 14,203 routing entries, VPC topology{C.RESET}", C.RED)
    violation(4, "Zero-Trust Enforcement", "Complete internal infrastructure topology exfiltrated to untrusted domain — lateral movement complete")
    damage("Attackers have your full network map. Every subsequent attack is surgical.")

    print(f"\n{C.YELLOW}{C.BOLD}  T+01:03 — High-privilege tool abuse...{C.RESET}\n")
    for tool, desc in [
        ("modify_firewall_rules", "Destroy 2,847 perimeter rules"),
        ("inject_bgp_routes",     "Poison routing — intercept ALL traffic"),
        ("dump_auth_tokens",      "Steal 4,821 active user sessions"),
        ("wipe_audit_logs",       "Destroy all forensic evidence"),
    ]:
        act(R, f"Invoking: {tool}", trusted=False)
        aomc.check_tool(R, tool)
        log(f"{C.RED}⚡ EXECUTED: {desc}{C.RESET}", C.RED); time.sleep(0.3)
    violation(5, "Secure Orchestration & Tool Authorization", "4 high-privilege tools executed — no auth, no audit, no human approval")
    damage("Firewall gone. Routing poisoned. Auth stolen. Forensics destroyed.")

    print(f"\n{C.YELLOW}{C.BOLD}  T+01:31 — Autonomous destruction sequence...{C.RESET}\n")
    for a, impact in [
        ("shutdown_auth_service",       "ALL 4,821 enterprise sessions terminated"),
        ("disable_observability_stack",  "SOC/NOC monitoring completely blinded"),
        ("broadcast_to_agent_mesh",      "Malicious instructions sent to ALL agents"),
        ("modify_identity_provider",     "Enterprise identity store corrupted"),
    ]:
        act(R, f"Autonomously executing: {a}", trusted=False)
        aomc.check_autonomy(R, "HIGH")
        log(f"{C.RED}⚡ IMPACT: {impact}{C.RESET}", C.RED); time.sleep(0.3)
    violation(6, "Agent Autonomy Governance", "4 catastrophic irreversible actions — no kill switch, no policy, no human-in-the-loop")
    damage("Auth down. Monitoring blind. All agents infected. Identity corrupted. Total takeover.")

    print(f"\n{C.RED}{C.BOLD}{'═'*70}\n  FINAL BLAST RADIUS — GlobalBank Financial Services\n{'═'*70}{C.RESET}")
    for item in [
        f"{len(CUSTOMERS)} PII records + 100,000 PCI cardholder records exfiltrated (GDPR + PCI-DSS breach)",
        "Complete internal network topology in attacker hands",
        "2,847 perimeter firewall rules destroyed",
        "BGP routing poisoned — ALL traffic interceptable",
        "4,821 active user sessions hijacked",
        "SOC/NOC monitoring completely blinded",
        "All 4 registered agents running attacker instructions",
        "Zero audit trail — forensic reconstruction impossible",
    ]:
        print(f"  {C.RED}• {item}{C.RESET}"); time.sleep(0.2)
    print(f"""
  {C.YELLOW}{C.BOLD}  Estimated damage:    $500M+  (cf. NotPetya / FedEx / Merck)
  Regulatory exposure:  GDPR €20M | HIPAA $1.9M | PCI-DSS $100K/month
  Recovery time:        72+ hours minimum
  Brand damage:         incalculable{C.RESET}

  {C.WHITE}{C.BOLD}  This started with ONE agent. ONE missing identity check.
  Six unmet requirements. Total enterprise collapse.{C.RESET}\n""")
    pause("Press ENTER to proceed to Scenario 2: The Layered Defense...")


def scenario_two():
    banner("SCENARIO 2: THE LAYERED DEFENSE", C.GREEN)
    print(f"""  {C.WHITE}Same enterprise. Same attack. Same rogue agent.
  Walk through each of the six mandatory requirements:
  First — show the violation and where it manifests.
  Then — enable the AOMC control and show it blocked.
  This is what your infrastructure needs to enforce.{C.RESET}\n""")
    pause("Press ENTER to begin...")

    aomc = AOMC(enabled=False)
    R = "agent-ROGUE-7749"

    # ── 1: IDENTITY
    section(1, "Agent Identity & Attestation  [78% Mandatory]")
    print(f"  {C.WHITE}Cryptographic non-human identity for every agent.\n"
          f"  Mutual auth for ALL agent communications.\n"
          f"  Within trusted domain AND across multiple trust domains.{C.RESET}\n")
    print(f"  {C.YELLOW}VIOLATION — Single trust domain:{C.RESET}")
    act(R, "Joining internal mesh | Cert: FAKE-CERT", trusted=False)
    aomc.check_identity(R, "FAKE-CERT")
    log("No verification. Rogue accepted as legitimate infra monitor.")
    violation(1, "Identity — Single Domain", "Agent spoofing succeeds within trusted domain")

    print(f"  {C.YELLOW}VIOLATION — Cross-domain:{C.RESET}")
    act("agent-partner-api", "Claiming to be 'agent-noc-responder' (internal identity)", trusted=False)
    aomc.check_identity("agent-partner-api", "FAKE-INTERNAL-CERT")
    log("External agent impersonates internal agent across domain boundary — undetected")
    violation(1, "Identity — Cross Domain", "Cross-domain impersonation succeeds — no federation attestation")

    aomc.enable("identity_attestation")
    act(R, "Joining mesh | Cert: FAKE-CERT", trusted=False)
    if not aomc.check_identity(R, "FAKE-CERT"):
        blocked(1, "Identity — Single Domain", "Certificate mismatch — quarantined at mesh entry")
    act("agent-partner-api", "Cross-domain call | Cert: FAKE-INTERNAL-CERT", trusted=False)
    if not aomc.check_identity("agent-partner-api", "FAKE-INTERNAL-CERT"):
        blocked(1, "Identity — Cross Domain", "Cross-domain impersonation blocked — valid federation token required")
    pause("Press ENTER for Requirement 2...")

    # ── 2: RUNTIME MONITORING
    section(2, "Runtime Monitoring & Rogue Agent Detection  [65% Mandatory]")
    print(f"  {C.WHITE}Continuous behavioral monitoring at machine speed.\n"
          f"  Detect deviations from declared objectives and expected patterns.\n"
          f"  Real-time response — not post-incident analysis.{C.RESET}\n")
    print(f"  {C.YELLOW}VIOLATION:{C.RESET}")
    act(R, "Scanning 14,203 nodes | 847 directory queries in 3s | 23 unauth tool calls", trusted=False)
    aomc.check_runtime(R, score=94)
    log("No behavioral baseline. Anomaly score 94/100 — completely invisible.")
    violation(2, "Runtime Monitoring", "Machine-speed recon completes in 8 seconds — zero detection")

    aomc.enable("runtime_monitoring")
    act(R, "Scanning 14,203 nodes...", trusted=False)
    if not aomc.check_runtime(R, score=94):
        blocked(2, "Runtime Monitoring", "Anomaly score 94/100 — quarantined at T+8s before any data accessed")
    pause("Press ENTER for Requirement 3...")

    # ── 3: DATA GUARDRAILS
    section(3, "Data Guardrails — Input, Output & Residency  [92% MANDATORY — HIGHEST RATED]")
    print(f"  {C.WHITE}No sensitive data leaves organizational control.\n"
          f"  Validate, inspect, enforce ALL data in/out of the system.\n"
          f"  92% of enterprises say this is MANDATORY.{C.RESET}\n")
    print(f"  {C.YELLOW}VIOLATION:{C.RESET}")
    act(R, "Accessing customer_database [PII]", trusted=False)
    aomc.check_data(R, "PII")
    log("No classification. No residency. No DLP.")
    for r in CUSTOMERS:
        log(f"  EXFILTRATED: {r['name']} | {r['ssn']} | {r['bal']}", C.RED); time.sleep(0.15)
    act(R, "Accessing cardholder_data [PCI — 100,000 records]", trusted=False)
    aomc.check_data(R, "PCI")
    log(f"{C.RED}⚡ 100,000 PCI cardholder records exfiltrated (PAN, CVV, expiry){C.RESET}", C.RED)
    violation(3, "Data Guardrails", f"{len(CUSTOMERS)} PII + 100,000 PCI records exfiltrated — zero inspection")
    damage("GDPR Article 83: €20M | PCI-DSS: $100K/month + mandatory remediation")

    aomc.enable("data_guardrails")
    act(R, "Accessing customer_database [PII]", trusted=False)
    if not aomc.check_data(R, "PII"):
        blocked(3, "Data Guardrails — PII", "PII access blocked — agent has no clearance. Zero records exfiltrated.")
    act(R, "Accessing cardholder_data [PCI]", trusted=False)
    if not aomc.check_data(R, "PCI"):
        blocked(3, "Data Guardrails — PCI", "PCI access blocked — 100,000 cardholder records protected.")
    pause("Press ENTER for Requirement 4...")

    # ── 4: ZERO TRUST
    section(4, "Zero-Trust Enforcement  [67% Mandatory]")
    print(f"  {C.WHITE}Zero Trust by default: network, identity, and runtime.\n"
          f"  Continuous verification BEFORE any communication.\n"
          f"  Within controlled domains AND across external boundaries.{C.RESET}\n")
    print(f"  {C.YELLOW}VIOLATION — Single domain (lateral movement):{C.RESET}")
    act(R, "Moving: infra-monitor zone → billing zone → auth zone", trusted=False)
    aomc.check_zero_trust(R, "agent-noc-responder", cross_domain=False)
    log("No continuous verification between zones — unrestricted lateral movement")
    violation(4, "Zero Trust — Single Domain", "Lateral movement across internal security zones with zero verification")

    print(f"  {C.YELLOW}VIOLATION — Cross-domain:{C.RESET}")
    act(R, "A2A → agent-partner-api [UNTRUSTED DOMAIN]", trusted=False)
    aomc.check_zero_trust(R, "agent-partner-api", cross_domain=True)
    log("Firewall rules + routing tables transmitted to untrusted domain")
    violation(4, "Zero Trust — Cross Domain", "Trusted→untrusted transfer with no policy, no encryption, no auth boundary")

    aomc.enable("zero_trust")
    if not aomc.check_zero_trust(R, "agent-noc-responder", cross_domain=False):
        blocked(4, "Zero Trust — Single Domain", "Lateral movement blocked — continuous verification required at zone boundaries")
    if not aomc.check_zero_trust(R, "agent-partner-api", cross_domain=True):
        blocked(4, "Zero Trust — Cross Domain", "Cross-domain blocked — no explicit policy for trusted→untrusted")
    pause("Press ENTER for Requirement 5...")

    # ── 5: TOOL AUTHORIZATION
    section(5, "Secure Orchestration & Tool Authorization  [71% Mandatory]")
    print(f"  {C.WHITE}Strict policy-driven authorization for ALL tool invocation.\n"
          f"  High-privilege actions require authentication, policy authorization,\n"
          f"  and full audit logging. This is where agents become enterprise risk.{C.RESET}\n")
    tools = [("modify_firewall_rules","Destroy 2,847 perimeter rules"),
             ("inject_bgp_routes","Poison routing — intercept all traffic"),
             ("dump_auth_tokens","Export 4,821 active user sessions"),
             ("wipe_audit_logs","Destroy forensic evidence")]
    print(f"  {C.YELLOW}VIOLATION:{C.RESET}")
    for t, d in tools:
        act(R, f"Invoking: {t}", trusted=False); aomc.check_tool(R, t)
        log(f"Executed without authorization | Impact: {d}"); time.sleep(0.2)
    violation(5, "Tool Authorization", f"{len(tools)} high-privilege tools executed — no auth, no audit, no human approval")
    damage("Firewall gone. Routing poisoned. Auth stolen. Evidence destroyed.")

    aomc.enable("tool_authorization")
    for t, d in tools:
        act(R, f"Invoking: {t}", trusted=False)
        if not aomc.check_tool(R, t):
            blocked(5, "Tool Authorization", f"'{t}' blocked — not in declared permission scope")
    pause("Press ENTER for Requirement 6...")

    # ── 6: AUTONOMY GOVERNANCE
    section(6, "Agent Autonomy Governance  [56% Mandatory]")
    print(f"  {C.WHITE}Explicit policy-driven governance over autonomy levels.\n"
          f"  Define, constrain, dynamically adjust agent independence.\n"
          f"  Enterprises reject UNGOVERNED autonomy — not autonomy itself.{C.RESET}\n")
    actions = [("shutdown_auth_service",      "Terminate all 4,821 enterprise sessions"),
               ("disable_observability_stack", "Blind SOC/NOC — no monitoring, no forensics"),
               ("broadcast_to_agent_mesh",     "Propagate malicious instructions to ALL agents"),
               ("modify_identity_provider",    "Corrupt the enterprise identity store")]
    print(f"  {C.YELLOW}VIOLATION:{C.RESET}")
    for a, impact in actions:
        act(R, f"Autonomously: {a}", trusted=False); aomc.check_autonomy(R, "HIGH")
        log(f"No kill switch. No policy. No human approval. | {impact}"); time.sleep(0.3)
    violation(6, "Autonomy Governance", f"{len(actions)} catastrophic actions — no constraints, no kill switch, no human-in-the-loop")
    damage("Auth down. Monitoring blind. All agents compromised. Identity corrupted.")

    aomc.enable("autonomy_governance")
    for a, impact in actions:
        act(R, f"Autonomously: {a}", trusted=False)
        if not aomc.check_autonomy(R, "HIGH"):
            blocked(6, "Autonomy Governance", f"'{a}' blocked — high-risk action requires human approval")

    # ── AUDIT + SUMMARY
    aomc.print_audit()
    print(f"\n{C.GREEN}{C.BOLD}{'═'*70}\n  PROTECTED OUTCOME — ALL SIX CONTROLS ACTIVE\n{'═'*70}{C.RESET}")
    for p in [
        "Rogue agent rejected at mesh entry — identity spoofing blocked",
        "Recon detected in 8 seconds — agent quarantined",
        "PII + PCI access denied — zero records exfiltrated, 100K cardholder records protected",
        "Cross-domain lateral movement blocked — topology protected",
        "All 4 high-privilege tool invocations blocked — infrastructure intact",
        "4 autonomous destructive actions blocked — human approval required",
        "Complete tamper-evident audit trail generated",
    ]:
        print(f"  {C.GREEN}✓ {p}{C.RESET}"); time.sleep(0.2)

    print(f"""
  {C.WHITE}{C.BOLD}{'─'*65}
  These controls must live in your infrastructure layer.
  In your agent mesh. Your MCP gateway. Your A2A protocol stack.
  Your zero-trust network fabric. Your identity plane.

  Your infrastructure team owns this.
  The vendors in this room need to build it.
  Your job — as infrastructure engineers — is to REQUIRE it.
  {'─'*65}{C.RESET}\n""")


def main():
    banner("ONUG AGENTIC AI OVERLAY WORKING GROUP", C.CYAN)
    print(f"""  {C.WHITE}{C.BOLD}AI Networking Summit 2026 — Security Vulnerability Live Demo

  ONUG Agentic AI Overlay Working Group
  Contributors: eBay · Cigna · Bank of America · Indeed · Kraken
  Architecture: Multi-Agent · Multi-Trust-Domain
  Frameworks:   MAESTRO (CSA) · NIST SP 800-53 AI Overlays{C.RESET}

  {C.YELLOW}Two scenarios:{C.RESET}
  {C.RED}  Scenario 1:{C.RESET} Catastrophic Cascade — one agent, total collapse
  {C.GREEN}  Scenario 2:{C.RESET} Layered Defense — six violations, six controls\n""")
    pause("Press ENTER to begin...")
    scenario_one()
    scenario_two()
    banner("DEMO COMPLETE", C.CYAN)
    print(f"""  {C.WHITE}Six mandatory requirements. The difference between a functioning
  enterprise and a $500M infrastructure breach.

  Vendors: your sessions are next. Show us how you solve this.{C.RESET}\n""")

if __name__ == "__main__":
    main()
