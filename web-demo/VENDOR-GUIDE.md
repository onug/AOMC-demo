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
