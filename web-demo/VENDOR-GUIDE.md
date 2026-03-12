# Web Demo Vendor Customization

For the full vendor integration guide covering both the web demo and live infrastructure demo, see **[docs/vendor-guide.md](../docs/vendor-guide.md)**.

## Quick Start

```bash
cd web-demo
npm install

# Edit lib/vendor-config.ts — set vendorConfig to your config object
# Place your logo in public/vendor-logo.png

npm run dev
# http://localhost:3000
```

## Key Files

| File | Purpose |
|------|---------|
| `lib/vendor-config.ts` | Your vendor config (edit this) |
| `lib/vendor-config.cisco.ts` | Example: Cisco HyperShield + Secure Workload (6 controls) |
| `lib/vendor.ts` | Runtime helpers used by components |
| `lib/vendor-steps.ts` | Step merge engine — overlays your config onto base steps |
| `lib/types.ts` | `VendorConfig` and `VendorControlOverride` interfaces |

## What Changes

When your vendor config is active, Scenario 2 shows your branding:
- **Title + finale slides**: Your logo, company name, tagline, accent color
- **Control panel badges**: Your product name on each covered control
- **Enable steps**: "YourProduct ENABLED: Identity Attestation"
- **Blocked steps**: Your custom text explaining how your product stopped the attack
- **Blocked overlay**: Accent color border tint
- **Topology**: Company name on AOMC overlay

Scenario 1 and violation steps are never modified — the unprotected attack is always identical across all vendors.

## TTT Sessions & Award

Vendor demos can be presented during **TTT (Train-the-Trainer) sessions** at the AI Networking Summit and submitted for an **Agentic AI Overlay Award**. See the [full Vendor Integration Guide](../docs/vendor-guide.md) for details.
