# Agentic AI Security Standards

*Source: ONUG Agentic AI Overlay Working Group — Appendix A*

The working group endorses two complementary security frameworks: **NIST SP 800-53 Control Overlays for Securing AI Systems** and the **MAESTRO** threat modeling framework developed by the Cloud Security Alliance (CSA).

- NIST AI controls define what needs to be secured in AI systems
- ONUG defines how AI agents communicate securely across networks

Together, they form a defense-in-depth strategy: NIST overlays protect the AI system itself, while ONUG overlays ensure secure and intelligent data movement between systems.

## NIST SP 800-53 AI Control Overlays

NIST has released a concept paper and proposed action plan for developing a series of NIST SP 800-53 Control Overlays for Securing AI Systems. These overlays are modular extensions to the existing NIST SP 800-53 cybersecurity controls, tailored specifically for AI systems.

### Why NIST AI Controls Matter

- **Avoiding reinvention** — Overlays provide pre-built, validated control sets rather than creating controls from scratch for each new technology or use case
- **Common language** — They create a shared vocabulary across organizations, auditors, regulators, and vendors
- **Proportionate risk** — Overlays allow practitioners to apply controls proportionate to specific risks (e.g., HIPAA-specific overlays for healthcare AI, PCI-DSS or SOX overlays for financial AI)
- **Flexibility within structure** — Overlays provide structured flexibility while maintaining comprehensive coverage
- **Evidence of maturity** — Implementing recognized overlays demonstrates industry best practices to stakeholders and regulators

### NIST AI Control Target Categories

- Generative AI (e.g., LLMs, image generators)
- Predictive AI (e.g., forecasting, decision support)
- Single-agent AI systems
- Multi-agent AI systems
- AI development pipelines

### NIST vs. ONUG: Complementary Scope

| Aspect | NIST SP 800-53 AI Control Overlays | ONUG Agentic AI Overlay |
|--------|-------------------------------------|-------------------------|
| Purpose | Secure AI systems via tailored cybersecurity controls | Enable secure, autonomous, policy-driven AI networking |
| Scope | AI system components (models, data, pipelines, outputs) | AI-driven data movement across distributed enterprise networks |
| Architecture Focus | Security controls for AI lifecycle (development, deployment, use) | AI-driven data movement across distributed enterprise networks |
| Security Goals | Confidentiality, integrity, availability of AI systems | Secure, adaptive, intent-based networking for AI workloads |
| Governance Alignment | Maps to NIST CSF and AI RMF | Emerging enterprise architecture standards via ONUG Collaborative |

### AOMC as NIST Implementation Mechanism

The NIST AI Controls map directly to AOMC's core functions. AOMC's real-time monitoring and enforcement capabilities operationalize NIST requirements for continuous monitoring, adversarial robustness, and model behavior validation through its emitter pattern and supervision plane.

The semantic firewall and governance oversight features directly implement NIST's explainability and transparency controls, while the audit trail capability satisfies NIST's requirements for AI decision documentation and accountability. AOMC's kill switch and rogue agent detection provide the rapid response and containment mechanisms that NIST identifies as essential for AI risk management.

### Key Areas for NIST AI Control Integration

**1. Public Domain AI Services Layer (Claude, ChatGPT, etc.)**
- Supply Chain Risk Management (AI-specific): controls for vendor assessment, API security, and data handling agreements
- Model Provenance: documentation of which models are being used and their capabilities/limitations
- Access Controls: authentication and authorization for API usage
- Data Classification: controls on what data can be sent to external services

**2. Agentic Overlay Monitoring and Control**
- Dynamic Security Control: real-time monitoring of agent behavior
- Governance Oversight: agent isolation, prevention of data exfiltration, mapped to NIST AI governance controls
- Audit and Compliance: access control and audit trails for agent actions

**3. Agent Communication Flows**
- Data Flow Controls: data classification and handling requirements for agent-to-agent and agent-to-model communications
- Adversarial Robustness: controls to prevent prompt injection or manipulation between agents
- Rate Limiting and Resource Management: prevent resource exhaustion or runaway agent behaviors

**4. Private Infrastructure/VPC Layer**
- Isolation Controls: network segmentation for AI workloads
- Data Residency: ensuring sensitive data remains within controlled environments
- Compute Resource Security: GPU/TPU access controls and monitoring

**5. Public Domain Internet Services**
- External Data Validation: controls for data ingested from banking, e-commerce sources
- Privacy Controls: PII handling and compliance (GDPR, CCPA)
- Data Quality Assurance: validation of external data before use in AI systems

### Recommended Additions

- Model Registry: track versions and performance of all AI models
- Testing Environment: separate zone for adversarial testing and validation
- Incident Response: specific procedures for AI-related incidents (model drift, adversarial attacks)
- Performance Baselines: establish and monitor against performance metrics

---

## MAESTRO Threat Modeling Framework

The MAESTRO (Multi-Agent Environment, Security, Threat, Risk, and Outcome) framework, developed by the Cloud Security Alliance (CSA), provides a **seven-layer architecture** and a structured process that specifically addresses the unique, autonomous, and multi-agent challenges of systems like the Agentic AI Overlay.

### Applying MAESTRO to the ONUG Reference Architecture

The core application involves mapping the components and security concerns of the Agentic AI Overlay to MAESTRO's seven layers and then executing the MAESTRO threat modeling process (Decompose, Identify, Hunt, Assess, Plan, Implement/Monitor).

### System Decomposition and Mapping

| MAESTRO Layer | Agentic AI Overlay Components & Concerns | Key Threats & Security Outcomes |
|---------------|------------------------------------------|--------------------------------|
| **Layer 7: Agent Ecosystem** | Multi-Agent interactions (A2A protocols), Agent Directory, Secure agent mesh for real-time data exchange | Threats: Malicious agent infiltration, Agent collusion, Cascading goal misalignment. Outcome: Rigorous agent identity and trust to prevent rogue agents. |
| **Layer 6: Security & Compliance** | Security Overlay (Zero-trust by default, policy enforcement), Governance Oversight | Threats: Compliance failures, Inadequate access controls, Policy violations. Outcome: Compliance automation and policy-based controls for all agent interactions. |
| **Layer 5: Evaluation & Observability** | Observability/monitoring, AOMC, Audit trails, Rogue Agent Isolation | Threats: Monitoring blind spots, Alert suppression, Log tampering. Outcome: Real-time anomaly detection and chain tracing for agents. |
| **Layer 4: Deployment & Infrastructure** | Private Infrastructure (ZONE A, ZONE B), Cloud Hosted Services (VPC), Secure policy-driven data movement | Threats: Container compromise, Lateral movement, Denial of service, Infrastructure misconfiguration. Outcome: Zero Trust runtime enforcement and cloud infrastructure security. |
| **Layer 3: Agent Frameworks** | Agent orchestration, Tool usage (Private/Public Tools), API communication, MCP | Threats: Plugin/tool misuse, API abuse, Unauthorized tool access, Intent manipulation. Outcome: API security protection and runtime security for agent actions. |
| **Layer 2: Data Operations** | Private Data, Public Data, Individual Account Data, Databases/Data (Memory sharing rules), Prevention of data exfiltration | Threats: Data poisoning, Privacy leakage, Unauthorized data access, Memory poisoning. Outcome: Data classification, PII detection, and data leakage prevention (DLP) controls. |
| **Layer 1: Foundation Models** | The Model (LLM/Reasoning, e.g., ChatGPT, Claude) used by the agents | Threats: Prompt injection, Model theft, Adversarial examples, Backdoor insertion. Outcome: Automated red teaming, jailbreak detection, and model testing/validation. |

### Key Security Outcomes and Mitigations

**1. AI-Specific Threat Mitigation**
The MAESTRO process identifies threats unique to AI/agentic systems — Prompt Injection, Data Poisoning, Goal Misalignment Cascades — that traditional threat models may miss. These are addressed through cross-layer defense-in-depth.

**2. Zero-Trust by Default**
MAESTRO reinforces that every agent interaction, tool invocation, and data access must be verified and authorized, regardless of location or prior trust. The Agentic AI Overlay implements this through its identity, policy, and protocol mediation layers.

**3. Real-Time Anomaly Detection**
The observability and telemetry fabric, guided by MAESTRO's Layer 5 analysis, enables real-time detection of behavioral drift, policy violations, and rogue agent activity — rather than relying on post-incident forensics alone.

**4. Rogue Agent Containment**
MAESTRO's threat identification process specifically accounts for malicious agent infiltration and cascading failures. The AOMC's quarantine, credential revocation, and kill-switch capabilities directly address these scenarios.

**5. Continuous Governance**
The six-step MAESTRO process (Decompose, Identify, Hunt, Assess, Plan, Implement/Monitor) is not a one-time exercise. Applied to the Agentic AI Overlay, it provides a repeatable methodology for evolving security posture as the agent ecosystem grows.
