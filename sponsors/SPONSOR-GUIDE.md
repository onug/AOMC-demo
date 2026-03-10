# Sponsor Integration Guide

## Welcome, AI Networking Summit 2026 Sponsors!

This guide explains how to add your product branding to the ONUG Agentic AI Overlay demo. Your product will appear alongside the AOMC control(s) it addresses, demonstrating to attendees how your solution mitigates enterprise AI security risks.

## What You'll Get

- Your **company logo** displayed next to the control(s) your product addresses
- Your **product name** shown as the solution for that control
- Visibility across **all three demo formats** (terminal, web, and live infrastructure)

## Quick Start (5 minutes)

### Step 1: Fork the Repository

```bash
git clone https://github.com/ONUG/AOMC-demo.git
cd AOMC-demo
```

### Step 2: Add Your Logo

Place your logo file in the `sponsors/logos/` directory:

```
sponsors/
└── logos/
    └── your-company.png    # Your logo here
```

**Logo Requirements:**
- Format: PNG (transparent background) or SVG
- Dimensions: 200×80 pixels recommended
- File size: Under 100KB

### Step 3: Edit sponsor-config.json

Open `sponsors/sponsor-config.json` and add your entry to the `sponsors` array:

```json
{
  "id": "your-company",
  "name": "Your Company Name",
  "logo": "logos/your-company.png",
  "website": "https://yourcompany.com",
  "controls": [
    {
      "control_id": "identity_attestation",
      "product_name": "Your Product Name",
      "tagline": "Brief description (optional)"
    }
  ]
}
```

### Step 4: Submit a Pull Request

```bash
git checkout -b sponsor/your-company
git add sponsors/
git commit -m "Add Your Company as sponsor for identity_attestation"
git push origin sponsor/your-company
```

Then open a Pull Request on GitHub.

---

## The Six AOMC Controls

Choose which control(s) your product addresses:

| Control ID | Control Name | Description | Poll % |
|------------|--------------|-------------|--------|
| `identity_attestation` | Agent Identity & Attestation | Cryptographic agent identity verification | 78% |
| `runtime_monitoring` | Runtime Monitoring & Rogue Detection | Behavioral anomaly detection | 65% |
| `data_guardrails` | Data Guardrails | PII/PCI/PHI classification and access control | 92% |
| `zero_trust` | Zero-Trust Enforcement | Cross-domain communication policies | 67% |
| `tool_authorization` | Secure Orchestration & Tool Authorization | Per-agent tool permission matrices | 71% |
| `autonomy_governance` | Agent Autonomy Governance | Human-in-the-loop for high-risk actions | 56% |

### Multiple Controls

If your product addresses multiple controls, add multiple entries:

```json
{
  "id": "cisco",
  "name": "Cisco",
  "logo": "logos/cisco.png",
  "website": "https://cisco.com",
  "controls": [
    {
      "control_id": "identity_attestation",
      "product_name": "Cisco Identity Services Engine",
      "tagline": "Zero-trust identity for AI agents"
    },
    {
      "control_id": "zero_trust",
      "product_name": "Cisco Secure Access",
      "tagline": "Continuous verification for agent communications"
    }
  ]
}
```

---

## Example Configurations

### Example: Cisco

```json
{
  "id": "cisco",
  "name": "Cisco",
  "logo": "logos/cisco.png",
  "website": "https://cisco.com",
  "controls": [
    {
      "control_id": "zero_trust",
      "product_name": "Cisco Secure Access",
      "tagline": "Zero-trust network access for AI agents"
    }
  ]
}
```

### Example: CrowdStrike

```json
{
  "id": "crowdstrike",
  "name": "CrowdStrike",
  "logo": "logos/crowdstrike.png",
  "website": "https://crowdstrike.com",
  "controls": [
    {
      "control_id": "runtime_monitoring",
      "product_name": "Falcon AI",
      "tagline": "AI-powered threat detection for agent workloads"
    }
  ]
}
```

### Example: Palo Alto Networks

```json
{
  "id": "palo-alto",
  "name": "Palo Alto Networks",
  "logo": "logos/palo-alto.png",
  "website": "https://paloaltonetworks.com",
  "controls": [
    {
      "control_id": "data_guardrails",
      "product_name": "Prisma Cloud DLP",
      "tagline": "Data loss prevention for AI pipelines"
    }
  ]
}
```

---

## How Your Branding Appears

### Terminal Demo (`demo.py`)
```
  🛡️  BLOCKED #1: Identity Attestation
     └─ Agent rejected — identity spoofing blocked
     └─ Protected by: Cisco Identity Services Engine (Cisco)
```

### Web Demo
Your logo appears in the control panel next to the control toggle, with your product name displayed when the control is active.

### Live Demo
Your logo and product name appear in the dashboard when the corresponding control blocks an attack.

---

## Testing Your Changes

### Terminal Demo
```bash
python3 demo.py
```

### Web Demo
```bash
cd web-demo
npm install
npm run dev
# Open http://localhost:3000
```

### Live Demo
```bash
cd live-demo
make up
# Open http://localhost:3000
```

---

## Questions?

Contact the ONUG Agentic AI Overlay Working Group:
- GitHub Issues: https://github.com/ONUG/AOMC-demo/issues
- Email: aomc-sponsors@onug.net

---

## License

Your logo and product name remain your intellectual property. By submitting a PR, you grant ONUG permission to display your branding in this demo for the AI Networking Summit 2026 and related events.
