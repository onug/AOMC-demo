# Agentic AI Overlay Reference Architecture

*Source: ONUG Agentic AI Overlay Working Group — Part A: Agentic AI Overlay Architecture*

## Overview

The Agentic AI Overlay defines the architectural framework required to securely deploy and operate autonomous AI agents within enterprise environments. It is vendor-independent, multi-agent, and multi-domain — representing the deployment structure of nearly all large enterprise corporations.

The architecture focuses on the structural components that enable agentic systems: agent identity and attestation, agent-to-agent communication, capability directories, policy enforcement, secure connectivity, and runtime observability. Central to the design is the Agentic AI Overlay Control and Monitoring plane (AOMC), which governs identity lifecycle, authorization, behavioral monitoring, rogue agent detection, and cross-domain trust enforcement.

The architecture provides:

- A defined set of core architectural components for agentic AI systems
- Standardized communication flows between agents, tools, models, and data sources
- A federated control and monitoring plane for identity, authorization, and runtime governance
- Cross-domain trust enforcement across hybrid and multi-cloud environments
- Continuous observability and behavioral monitoring of agent activity
- Rogue agent detection, isolation, and remediation mechanisms
- A vendor-neutral framework to guide supplier implementations and prevent ecosystem fragmentation

## The Problem

Current enterprise infrastructure is built on rigid, siloed systems and legacy protocols that cannot adapt to the traffic patterns, scale, and security demands of the AI era. AI workloads generate non-deterministic flows, unpredictable processing spikes, and multi-domain dependencies that strain traditional routing and management approaches.

Key challenges include:

- **No secure agent mesh** — Agents operating in different domains often lack a trusted, policy-enforced method for communication and coordination
- **Data governance gaps** — Sensitive or regulated data may cross boundaries without proper classification, residency checks, or minimization
- **Inefficient operational intelligence** — Centralized data lakes delay incident detection and response
- **Fragmented vendor ecosystems** — Enterprises struggle to integrate multiple proprietary agent frameworks without common protocols, directories, and policy enforcement

Without a unifying overlay, enterprises risk deploying siloed AI solutions that cannot scale, interoperate, or meet compliance obligations.

## Reading the Reference Architecture Diagram

### Trust Domains

The diagram shows multiple operational trust domains (Private DC, Cloud, Edge/OT/Branch). Agents live in each domain.

### Control vs. Data

Policies, identity, and directories form the control plane; telemetry and workload/inference flows comprise the data plane.

### Agentic Overlay Monitoring and Control (AOMC) Service

The orange "Agentic Overlay Monitoring & Control" indicates a service that enforces policy, provides a kill switch, and simplifies governance. AOMCs may be centralized, distributed, federated, or some combination of each.

### Vendor Enclaves

"Agent-of-Agents" groupings illustrate vendor ecosystems (e.g., Cisco, Microsoft, OpenAI Frontier, Anthropic Claude Cowork, Gemini Agent, etc.) that must interoperate at some level through the common overlay. Blue lines show protocol messaging flows between agents.

## Agentic Flow Types

### Yellow Lines — Agent-to-Model/Tools/DB Communication

- Represent *direct* calls from an agent to an external service: an inference service (LLM endpoint), a specialized tool (analytics, policy engine), or a database/knowledge store
- These flows are typically **point-to-point** over authenticated, encrypted channels and may cross security or compliance boundaries
- **Governance/Policy** applies at the initiation of the request — before the agent transmits data, it must be checked against identity, authorization, and compliance rules

### Blue Lines — Agent-to-Agent (A2A) Communication

- Represent *peer-to-peer* messaging between agents
- Carried via protocols such as **A2A or yet to be developed protocols**, these flows allow agents to exchange context, pass subtasks, or share intermediate results
- Blue line flows are **context-rich** — they carry not just raw data but also policy constraints, obligations, and metadata about the interaction
- Every blue-line message should be monitored by Observability and Telemetry and evaluated by the Policy and Compliance layer

## Key Components

### Tools

- Discrete capabilities exposed to agents, such as APIs, automation scripts, RPA tasks, or AI utilities
- Tools are often tied to a specific domain (finance, observability, HR, manufacturing) and may require fine-grained authorization
- Policy and Compliance layer ensures tools are invoked only under allowed contexts and data scopes

### Data

- Structured or unstructured information that agents retrieve, process, or share
- Can be public, private, or regulated (PII, PHI, PCI)
- Data Protection & Compliance applies classification, residency, encryption, and minimization rules before data moves over any flow

### Inference

- Execution of AI/ML reasoning or computation, such as running prompts through an LLM or submitting a query to an AI model
- Can be internal (private inference cluster) or external (public AI API)

## AOMC Ten-Point Reference

The following numbered call-outs are mapped directly on the Agentic AI Overlay Reference Architecture diagram:

| # | Component | Description |
|---|-----------|-------------|
| 1 | **AOMC Control Plane** | Logical control fabric spanning all trust domains; enforces policy, security, and governance independently of agents |
| 2 | **Dynamic Security Control** | Real-time allow/deny/rate-limit/rewrite decisions on all agent interactions (A2A, agent-to-tool, agent-to-data), integrated with Identity, Zero Trust, and Policy Engine |
| 3 | **Protocol Mediation Layer** | Inspection and enforcement across A2A, MCP, ACP, ANP, and future agent protocols without replacing them |
| 4 | **Agent Directory/Registry** | System of record for agent identity, capabilities, allowed tools/data, SLOs, and endpoints; used for discovery, policy lookup, and quarantine |
| 5 | **Rogue Agent Detection and Isolation** | External behavioral monitoring; quarantine, credential revocation, or session termination on drift or compromise |
| 6 | **Semantic Governance Firewall** | Intent- and content-aware enforcement blocking disallowed prompts, unsafe outputs, and policy violations |
| 7 | **Data Exfiltration Prevention** | Classification, tagging, and boundary enforcement across zones, VPCs, tenants, and public services |
| 8 | **Privilege Escalation Protection** | Continuous validation of agent actions against declared scope; step-up auth or rejection for elevated requests |
| 9 | **Centralized Access Control** | ABAC/RBAC enforcement at A2A gateways and tool/data connectors, independent of network location |
| 10 | **Audit and Forensics Fabric** | Tamper-evident logging of prompts, actions, decisions, and outcomes across all environments |

## Operational Flows in the Agentic AI Overlay

### Enrollment and Attestation

The lifecycle of an agent within the overlay begins with enrollment and attestation, establishing trust before any autonomy is granted. When an agent is introduced, it is registered in the Agent Directory with its declared capabilities, intended functions, and service-level objectives (SLOs). The overlay issues short-lived, non-human identity credentials — such as certificates, keys, or service principals — scoped precisely to the agent's authorized actions.

Before activation, the platform may verify the agent's software bill of materials, supply-chain provenance, and runtime posture. Trust is not static; throughout the agent's operation, continuous verification is performed, and credentials can be revoked immediately if behavioral drift, policy violations, or compromise is detected.

### Zero-Trust, Policy-Mediated Interaction

Once active, agents communicate with other agents across trust domains using a zero-trust, policy-mediated interaction model. An initiating agent discovers a peer through the Agent Directory, evaluates applicable policies, and establishes mutual authentication before any exchange occurs. Agent-to-agent conversations follow defined protocols — such as A2A and MCP — that govern message structure, delegation, and tool invocation.

All interactions are observed by the overlay's observability fabric, which records inputs, outputs, and decision context. For higher-risk interactions, the policy engine may impose additional safeguards, including automated guardrails or human-in-the-loop approval. When data is exchanged, sovereignty, residency, and PII constraints are enforced, while stateless AI routing dynamically optimizes paths across public and private infrastructure without weakening trust boundaries.

### Rogue Behavior Detection and Containment

To protect the enterprise from unintended or malicious outcomes, the overlay continuously performs rogue behavior detection and containment. The observability fabric applies both semantic analysis and statistical anomaly detection to agent outputs, tool usage, and interaction patterns. If an agent violates policy or exhibits suspicious behavior, the Monitoring and Control service can immediately quarantine the agent, sever agent-to-agent communication, or trigger a kill-switch to halt execution.

Incident response workflows capture forensic evidence, assess blast radius, and determine remediation steps. Service restoration occurs only under supervised conditions, ensuring compromised agents do not reenter the system without revalidation.

### Coordinated Failover and Handover

Resilience is built into the system through coordinated failover and handover mechanisms. If an agent becomes unavailable or fails to meet its SLOs, a peer agent may assume responsibility by inheriting approved context through MCP-mediated memory handover, subject to strict policy limits. The Agent Directory continuously evaluates health and performance signals, redirecting traffic as needed to maintain service continuity. Inference orchestration reallocates model capacity and execution resources to ensure workloads continue to meet operational objectives.

## Assumed Components (Not Diagrammed)

The following architectural components are not explicitly detailed in the reference architecture diagram, but play important roles in the safe and secure operation of an enterprise-grade agentic AI system.

| Component | Description |
|-----------|-------------|
| **AOMC Service** | An optional centralized service (orange box) providing global governance: attestation, posture checks, behavioral policy enforcement, and emergency shutdown/quarantine for agents. Compatible with fully distributed architecture. |
| **Identity and Zero Trust for Agents** | A rethought identity model for non-human principals. Provides authentication and authorization for every agent-to-agent/API interaction across domains. Implements short-lived credentials, certificates/keys or service principals, scope-limited permissions, and continuous verification to enforce least privilege. |
| **Policy Engine and Governance** | Encodes business logic, risk thresholds, regulatory constraints (e.g., PCI, NYDFS, GDPR), and data sovereignty rules. Policies determine which agents may talk, what data may flow, which tools may be invoked, and acceptable actions. Policies can adapt to changing conditions (risk, load, compliance events). |
| **Agent Directory (Capabilities Registry)** | A dynamic registry advertising each agent's capabilities, trust level, health, SLOs, and location. Enables discovery, targeting, and load-aware selection of agents. Supports failover, blue/green updates, and graceful degradation. |
| **A2A Protocols** | Secure, authenticated, and auditable messaging between agents across domains. Carries intents, tool calls, telemetry summaries, and coordination signals. Supports vendor ecosystem and cross-domain conversations with consistent enforcement of identity and policy. |
| **MCP (and similar frameworks)** | A unifying context exchange and tool invocation layer used by agents, applications, and orchestration to preserve task context end-to-end. Facilitates federation across vendor ecosystems and simplifies plug-in models for tools, memory, and data sources. |
| **Observability and Telemetry Fabric** | Distributed collection and normalization of logs, metrics, traces, and events. Feeds agents and the policy engine with real-time situational awareness for anomaly detection, reasoning, validation of actions, and post-action audit. Enables semantic monitoring of agent outputs to detect brand-/safety-impacting behavior. |
| **Inference and Data Orchestration** | Matches AI inference capacity to demand across business units and domains, avoiding hot spots and stranded capacity. Enforces data residency and access constraints while optimizing placement for latency and cost. Coordinates model selection, versioning, and rollout gates. |
| **Stateless AI Router** | A routing/forwarding function that uses real-time signals (latency, congestion, cost, policy posture) to make rapid path decisions without heavy per-flow state. Targets millisecond-level reconfiguration for bursts, failures, and workload shifts. |
| **Vendor "Agent-of-Agents" Enclaves** | Logical clusters of vendor-specific agents (e.g., cloud or networking stacks) represented as circles within domains. The overlay ensures these enclaves interoperate through common identity, policy, and A2A/MCP, without lock-in. |
| **Data Protection & Compliance Boundaries** | Controls that constrain data movement and tool invocation (PII, IP, regulated records). Includes masking, redaction, tokenization, differential access per role/agent, and audit trails that support legal/compliance review. |
