# Enterprise Requirements: The Six AOMC Controls

*Source: ONUG Agentic AI Overlay Working Group — Poll Results and Requirements Analysis*

## Interpreting Poll Results through Trust Domains and the MAESTRO Framework

The Agentic AI Overlay poll was designed to identify what is preventing large enterprises from deploying agentic AI systems at scale today. The poll was developed by the ONUG Agentic AI Overlay Working Group, reviewed by the ONUG Board, and includes responses from ONUG Board members plus the broader ONUG Global 2K members.

The results consistently point to the same conclusion: enterprises are not blocked by model capability or innovation velocity, but by the lack of **control, governance, and operational safety**, particularly as agent autonomy increases and systems span multiple trust domains.

Several poll questions explicitly distinguish between **single trust domain** operation (within a data center, cloud account, or business unit) and **multiple trust domain** operation (across clouds, business units, partners, or public services). This distinction revealed a clear maturity gradient: capabilities that may be acceptable inside a single domain often become **mandatory blockers** once agents cross trust boundaries.

The poll questions map cleanly into the **MAESTRO (Multi-Agent Environment, Security, Threat, Risk, and Outcome) framework**. MAESTRO provides a structured way to reason about agentic systems by separating *where agents operate*, *how they are secured*, *what threats they introduce*, *how risk is controlled*, and *what outcomes are acceptable*. Each poll question corresponds to one or more MAESTRO layers, reinforcing that the community's concerns are architectural and systemic — not tool-specific.

The poll questions represent **baseline enterprise requirements** — prerequisites to adoption rather than differentiators.

**Response scale:** Mandatory (critical requirement) / Important but not critical / Later phase deployment / Not required

---

## 1. Agent Identity, Lifecycle, and Attestation (Non-Human Identity)

**MAESTRO Mapping:** *L7: Multi-Agent Ecosystem, Security, Risk*

### Single Trust Domain (Poll Q1a)

The overlay **SHALL** provide a robust **agent lifecycle identity and attestation framework**, explicitly **independent of human identity**, covering **agent creation, delegation, mutation, and retirement**, single enterprise-controlled trust domain.

The framework **MUST** enforce strong, cryptographic identity and mutual authentication for all agent-to-agent communications, preventing agent spoofing and ensuring only verified, attested agents participate in the secure agent mesh.

| Response | % |
|----------|---|
| Mandatory (critical requirement) | **78%** |
| Important but not critical | 22% |
| Later-phase deployment | 0% |
| Not required | 0% |

**Observation:** The overwhelming mandate for robust agent identity and attestation underscores the need to prioritize non-human identity management to mitigate risks in autonomous systems; vendors should develop interoperable frameworks that integrate seamlessly with existing enterprise security stacks to accelerate adoption.

### Multiple Trust Domains (Poll Q1b)

Building upon 1a, the overlay **SHALL** enforce agent identity, attestation, and authorization consistently across **multiple enterprise-controlled trust domains** (e.g., business units, on-prem, cloud, edge).

Where interaction with **external or partner domains** occurs, the overlay **MUST** support secure federation controls including encryption in transit and at rest, role-based access control (RBAC), and auditable policy enforcement — without assuming ownership or control of partner environments.

| Response | % |
|----------|---|
| Mandatory (critical requirement) | **79%** |
| Important but not critical | 17% |
| Later-phase deployment | 4% |
| Not required | 0% |

**Observation:** IT executives view cross-domain agent identity as critical for scalable operations across hybrid environments, emphasizing federation without control assumptions. Vendors must focus on building extensible attestation tools that support multi-trust boundaries to meet enterprise demands for secure, auditable interactions.

---

## 2. Runtime Monitoring and Rogue Agent Detection

**MAESTRO Mapping:** *Layer 5: Evaluation & Observability*

### Poll Question 2

A secure Agentic AI Overlay **SHALL** implement **continuous runtime monitoring** and dynamic security controls to detect and respond to anomalous agent behavior.

This includes identifying deviations from:

- Declared objectives
- Authorized tool usage
- Expected execution patterns

to mitigate risks such as tool misuse, intent breaking, or unsafe emergent behavior.

(Examples include runtime security models analogous to container or workload runtime protection, where execution behavior, API calls, and resource access are continuously observed and enforced.)

| Response | % |
|----------|---|
| Mandatory (critical requirement) | **65%** |
| Important but not critical | 27% |
| Later-phase deployment | 8% |
| Not required | 0% |

**Observation:** Autonomous agents operating at machine speed cannot rely on post-incident analysis. Enterprises require real-time detection and intervention to manage behavioral drift, misuse, and cascading failures. Executives prioritize runtime monitoring to prevent emergent risks in agent behaviors, highlighting a core need for dynamic controls akin to container security. Product development should incorporate AI-specific behavioral analytics to provide real-time enforcement, addressing gaps in traditional monitoring solutions.

---

## 3. Data Guardrails — Input, Output & Residency Enforcement

**MAESTRO Mapping:** *Layer 6: Security & Compliance, Layer 2: Data Operations, Layer 1: Foundation Models*

### Data Guardrails (Poll Q3a)

The overlay **SHALL** enforce **strict data guardrails** to ensure that **no sensitive enterprise data leaves organizational control**.

This includes validation, inspection, and enforcement for all data and prompts entering or leaving the system to prevent:

- Prompt injection
- Leakage of regulated or sensitive data (PII, IP, financial, healthcare, etc.)
- Unauthorized external data flows

| Response | % |
|----------|---|
| Mandatory (critical requirement) | **92%** |
| Important but not critical | 8% |
| Later-phase deployment | 0% |
| Not required | 0% |

**Observation:** The near-universal requirement for data guardrails reflects executives' focus on preventing data leakage and prompt attacks as foundational to compliance. Vendors should innovate with inspection layers that enforce residency and validation without impeding performance, positioning products as essential for regulated industries.

### Content Guardrails — Responsible AI Enforcement (Poll Q3b)

In production mode and beyond LLM content vetting tools, the overlay **SHOULD** inspect and moderate agent-generated real time outputs to enforce Responsible AI principles, including protections against harmful, abusive, biased, or non-compliant content, prior to delivery to users or downstream systems.

(This assumes enterprise-grade, vetted models and focuses on policy alignment rather than baseline model hygiene.)

| Response | % |
|----------|---|
| Mandatory (critical requirement) | **50%** |
| Important but not critical | 42% |
| Later-phase deployment | 8% |
| Not required | 0% |

**Observation:** While important, content guardrails for responsible AI show divided criticality, indicating executives seek policy-aligned outputs beyond basic model vetting. Vendors can differentiate by offering modular moderation tools that integrate with enterprise ethics frameworks, enabling phased implementation.

---

## 4. Zero-Trust Enforcement

**MAESTRO Mapping:** *Layer 4: Deployment & Infrastructure, Layer 6: Security & Compliance*

### Enterprise-Controlled Domains (Poll Q4a)

A secure Agentic AI Overlay **SHALL** enforce **Zero Trust principles by default** across network, identity, and runtime layers within enterprise-controlled domains.

This includes continuous verification of identity, context, and policy before permitting any communication or execution, to prevent lateral movement and contain compromise of agents or infrastructure components.

*Zero-Trust means that all communications within a zero trust construct are authenticated and authorized; in short, no endpoints are trusted.*

| Response | % |
|----------|---|
| Mandatory (critical requirement) | **67%** |
| Important but not critical | 23% |
| Later-phase deployment | 10% |
| Not required | 0% |

**Observation:** Zero-Trust enforcement within controlled domains is seen as mandatory by most executives to contain threats in agent meshes. Product teams should embed continuous verification in overlays, ensuring compatibility with legacy infrastructure to facilitate broad enterprise rollout.

### Across Trust Boundaries & Domains (Poll Q4b)

Building upon 4a, where agents operate across **multiple enterprise-owned environments** (e.g., on-prem, cloud, edge), Zero Trust enforcement **SHALL** apply consistently using policy-driven authorization and runtime risk signals.

For **external or partner domains**, enforcement **MUST** include encrypted communications, explicit authorization boundaries, and auditable access controls.

| Response | % |
|----------|---|
| Mandatory (critical requirement) | **62%** |
| Important but not critical | 31% |
| Later-phase deployment | 8% |
| Not required | 0% |

**Observation:** Executives demand consistent Zero Trust across boundaries for resilient multi-environment operations, with emphasis on encryption and audits. Vendors need to prioritize policy-driven solutions that handle external domains securely, reducing integration friction in hybrid setups.

---

## 5. Secure Orchestration & Tool Authorization

**MAESTRO Mapping:** *Layer 4: Deployment & Infrastructure, Layer 3: Agent Frameworks*

### Poll Question 5

A secure Agentic AI Overlay **SHALL** enforce **strict, policy-driven authorization** for all agent tool invocation and orchestration actions.

Agent tool-calling **MUST** ensure that agents cannot perform high-privilege actions across trust or administrative domains without:

- Explicit authentication
- Policy-based authorization (human approval **or** automated enforcement, as defined by policy)
- Full audit logging

This capability **MUST NOT** assume human-in-the-loop approval by default and **SHALL** support fully automated, policy-driven enforcement.

| Response | % |
|----------|---|
| Mandatory (critical requirement) | **71%** |
| Important but not critical | 21% |
| Later-phase deployment | 6% |
| Not required | 2% |

**Observation:** Secure orchestration is critical for executives to control tool invocations and prevent unauthorized actions in automated workflows. Vendors should develop policy engines supporting automated enforcement and logging, aligning with needs for auditability without default human intervention.

---

## 6. Agent Autonomy Governance

**MAESTRO Mapping:** *Layer 5: Evaluation & Observability, Layer 6: Security & Compliance*

### Poll Question 6

A secure Agentic AI Overlay **SHALL** provide explicit, policy-driven governance over **agent autonomy levels**, including the ability to define, constrain, and dynamically adjust how independently an agent may plan, decide, and act.

This includes setting boundaries for:

- Fully autonomous execution
- Supervised or policy-constrained autonomy
- Human-approved or human-in-the-loop operations

| Response | % |
|----------|---|
| Mandatory (critical requirement) | **56%** |
| Important but not critical | 29% |
| Later-phase deployment | 13% |
| Not required | 2% |

**Observation:** Enterprises are not rejecting autonomy; they are rejecting **ungoverned autonomy**. The poll and write-in responses emphasize policy-defined autonomy, human oversight, kill switches, and lifecycle governance as prerequisites to responsible outcomes.

---

## Implications for IT Executives and the Vendor Community

The poll results describe a coherent system-level problem: enterprises must manage **multi-agent environments** under real-world **threats**, constrain **risk**, and ensure acceptable **outcomes** — all while maintaining operational velocity. The Agentic AI Overlay provides the architectural mechanism to do so.

For IT executives, these requirements define a **deployment roadmap**: establish control within a single trust domain, then expand to multi-domain operation only when the above controls are proven. For vendors, the message is unequivocal: **single-domain capability is table stakes; ONUG-aligned, cross-domain governance is the differentiator**.

At the AI Networking Summits during 2026 and 2027, these poll-derived requirements will drive vendor demonstrations, scorecards, workshops, and awards.
