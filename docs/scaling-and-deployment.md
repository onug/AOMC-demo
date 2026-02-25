# Scaling, Deployment, and Operationalization Strategies

*Source: ONUG Agentic AI Overlay Working Group — Part B*

## Overview

As enterprises move from experimentation to production deployment of agentic AI systems, scaling and operationalization become the defining challenges. Feedback from the ONUG community poll and working group discussions consistently reinforced that **the primary barrier to adoption is not model capability, but operational readiness** — specifically the ability to deploy, govern, and scale autonomous agents safely across heterogeneous environments.

## Key Observations

**Observation 1: Enterprises Are Blocked by Control Gaps, Not AI Capability**
Across the document and polling results, enterprises consistently report that agentic AI adoption is constrained by the absence of runtime controls, governance mechanisms, and operational safeguards — not by limitations in models or tooling.

**Observation 2: Trust Domain Boundaries Are the Primary Risk Inflection Point**
Capabilities that are acceptable within a single trust domain become high-risk or unacceptable once agents operate across clouds, business units, or external services. This boundary is where most deployment hesitation emerges.

**Observation 3: Tool Invocation Is Viewed as the Highest-Risk Agent Capability**
Respondents repeatedly emphasized that agent decisions become enterprise risk when they result in real-world actions via tools, APIs, or infrastructure changes, making orchestration and permissioning a focal concern.

**Observation 4: Auditability and Explainability Are Governance Requirements, Not Afterthoughts**
Enterprises expect agentic systems to be explainable and reconstructable by default. Black-box autonomy is viewed as incompatible with regulatory, fiduciary, and operational accountability.

**Observation 5: Enterprises Are Willing to Adopt Autonomy — But Only Incrementally**
The work shows strong interest in agentic AI, paired with a deliberate preference for bounded autonomy, phased deployment, and human oversight until operational confidence is established.

## Strategic Recommendations

**Recommendation 1: Treat Agentic AI as an Operational System, Not an Application**
Enterprises should design agentic AI deployments with the same rigor applied to mission-critical infrastructure, including lifecycle management, runtime monitoring, failure isolation, and recovery procedures.

**Recommendation 2: Start with Single Trust Domain Deployments to Prove Control**
Early deployments should be intentionally constrained to well-defined environments where governance, observability, and containment can be validated before expanding across trust boundaries.

**Recommendation 3: Make Tool Governance a First-Class Design Requirement**
Architectures should explicitly control how agents invoke tools, including permissioning, blast-radius limits, rate controls, and step-up authorization for high-impact actions.

**Recommendation 4: Require Continuous Monitoring and Active Intervention Capabilities**
Enterprises should not accept solutions that rely solely on logs or post-incident analysis. Real-time detection, quarantine, and kill-switch mechanisms must be treated as baseline requirements.

**Recommendation 5: Evaluate Vendors on Operational Behavior, Not Autonomy Claims**
Vendor assessments should prioritize how systems behave under stress, failure, policy violations, and cross-domain scenarios. Demonstrated control and recovery are stronger indicators of readiness than claims of advanced autonomy.

**Recommendation 6: Engage the Vendor Community through the Agentic AI Overlay Working Group**
Vendors are encouraged to participate directly in the Agentic AI Overlay Working Group to collaborate with enterprise IT leaders in shaping practical, production-grade approaches to agentic AI deployment.

## From Poll Results to Deployment Reality

Polling data revealed strong consensus that agentic AI will be embedded first in **operational and infrastructure-facing workflows** before customer-facing systems. Respondents emphasized the need for predictable behavior, auditability, and containment before granting broader autonomy.

These findings inform a phased deployment strategy: enterprises should initially deploy agents within **well-defined trust boundaries** — such as a single data center, VPC, or business unit — to validate resiliency, observability, and governance. Once operational confidence is established, cross-domain and cross-organizational flows can be introduced incrementally.

The poll results also signaled that enterprises expect vendors to demonstrate **operational scale characteristics**, not just functional correctness. This shifts evaluation criteria away from feature checklists toward measurable, system-level performance and governance outcomes.

## Quantifying Scale and Operational Targets

To guide sizing decisions and vendor evaluations, enterprises should quantify the following dimensions early in the design process:

- **Agent population and interaction patterns** — total agent count, average and peak conversation rates (messages per second), and concurrency targets across domains
- **End-to-end latency SLOs** — differentiated between time-sensitive operational decisions (e.g., incident response) and customer-facing or advisory interactions
- **Inference throughput requirements** — sustained tokens-per-second, burst behavior, and policies for pooling inference capacity across business units
- **Observability volume** — measured in events per second, with explicit targets for retention periods and query latency to support forensics and compliance
- **Policy evaluation load and complexity** — per-message authorization checks, data egress validation, and semantic policy enforcement
- **Failure domain design** — defining acceptable blast radius, mean time to recovery (MTTR), and the timing of agent quarantine or rollback
- **Compliance boundaries** — data residency matrices and defined paths for PII, PHI, and regulated data across zones and jurisdictions

These metrics form the basis for realistic capacity planning and enable objective comparison of vendor solutions under production-like conditions.

## Deployment Patterns and Architectural Discipline

Working group discussions consistently emphasized that **identity and policy must be treated as first-class controls** at every interaction point — not as perimeter-only mechanisms. Every agent-to-agent exchange, tool invocation, and data access must be authenticated, authorized, observed, and logged by design. This principle holds regardless of where agents execute or which protocols they use.

To preserve architectural flexibility and avoid premature lock-in, enterprises should favor **open protocols and clear extension points** — including A2A-, MCP-, or similar interaction models — so that vendor-provided "agent enclaves" can interoperate cleanly within the overlay. Reference architecture components should be mapped to concrete products only after functional and operational requirements are validated, not before.

## Vendor Engagement and Summit Execution

Following the presentation of poll results, the vendor community is invited to engage through **demonstration, benchmarking, and transparency**, not marketing claims. At the AI Networking Summit, vendors will be asked to align their demonstrations to the scaling and operational dimensions outlined above. Scorecards will be used to evaluate how well solutions address agent scale, policy enforcement, observability, resiliency, and compliance in realistic scenarios.

To reinforce enterprise-driven outcomes, ONUG will highlight vendors that demonstrate credible production readiness through **working demonstrations, comparative scorecards, and peer-reviewed workshops**.

## Operationalizing at Enterprise Scale

The working group consensus is clear: scaling agentic AI is not about deploying more models, but about building **repeatable, governable operating patterns**. Enterprises that succeed will be those that treat agents as long-lived operational assets, invest early in observability and policy infrastructure, and demand that vendors meet them at the level of systems engineering — not demos. The Agentic AI Overlay provides the framework to do so.
