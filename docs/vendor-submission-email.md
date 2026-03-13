# Vendor Submission Email

**Subject:** Call for Submissions: Agentic AI Overlay Award — AI Networking Summit 2026

---

We're excited to invite your team to submit a demo for the **Agentic AI Overlay Award** at the AI Networking Summit 2026.

The award recognizes security vendors who demonstrate enforcement of the six AOMC (Agentic Overlay Mandatory Controls) against a live rogue agent attack sequence. Submissions are evaluated by the **ONUG Agentic AI Working Group** members.

The AI Networking Summit takes place **May 13-14, 2026 in Frisco/Dallas**. Please note your company's sponsorship status when filing your Intent to Submit.

## What You Need to Demo

**You only need to show Scenario 2 (The Layered Defense)** — your product blocking the rogue agent attack with all AOMC controls active.

Nick Lippis will present Scenario 1 (The Catastrophic Cascade) as part of his keynote, establishing the unprotected attack baseline for the audience. S1 will also play on monitors throughout the conference, on the conference mobile app, and on the Hopin platform for remote attendees. By the time your demo runs, every audience member — in-person and remote — will already understand the attack.

Showing S1 is optional. If you want to include it for a complete narrative, you can, but it is not required and will not affect judging.

## Choose Your Demo Format

You can submit either format (or both):

- **Web Demo** (lower effort) — Edit a TypeScript config file. Shows branded slides, control panel badges, and blocked overlays with your product name.
- **Live Infrastructure Demo** (higher effort) — Build a Docker container that receives real HTTP agent traffic and makes real-time blocking decisions. Your product name is attributed on every block in the event feed, audit trail, and dashboard.

The **live demo offers significantly more opportunities to showcase your product**. Judges see your actual enforcement logic handling real attack traffic and real-time decision latency. If your product can participate in HTTP-based control checks, the live demo is the stronger submission.

Both partial-coverage (2-3 controls) and full-coverage (all 6) submissions are welcome. You are not penalized for covering fewer controls — you're judged on the quality of what you cover.

## Timeline

| Date | Milestone |
|------|-----------|
| **March 14 (Fri)** | Call for Submissions announced — repo access granted |
| **March 21 (Fri)** | Intent to Submit — confirm participation + which controls you'll cover |
| **March 28 (Fri)** | Office Hours #1 — live walkthrough of repo setup, vendor integration, Q&A |
| **April 11 (Fri)** | Checkpoint — share a working demo for early feedback |
| **April 18 (Fri)** | Office Hours #2 — final Q&A, common issues, judging criteria walkthrough |
| **April 27 (Sun)** | **Final Submission Deadline — 11:59 PM ET** |

## How to Submit

1. Fork the AOMC-demo repo (private fork is fine)
2. Follow the Vendor Integration Guide to configure your demo
3. Open a PR to the `submissions/` branch, including:
   - Your vendor config (web demo) and/or Docker container + compose file (live demo)
   - A 2-3 minute screen recording of S2 with your product blocking the attack
   - Brief README noting which controls you cover and any setup prerequisites

If you can't submit via PR (e.g., proprietary logic), share a private repo link with read access granted to the judges.

## Judging Criteria

| Criteria | Weight |
|----------|--------|
| Control Coverage | 25% |
| Detection Fidelity | 25% |
| Integration Quality | 20% |
| Presentation Impact | 15% |
| Production Readiness | 15% |

Judges are the **ONUG Agentic AI Working Group** members.

## Questions?

- **GitHub Discussions** on the AOMC-demo repo (tagged `vendor-submissions`) — primary async Q&A, visible to all vendors
- **Office Hours** on March 28 and April 18 — live video walkthroughs, recorded and shared afterward
- **Email this distribution list** — for private or NDA-sensitive questions

## Get Started

The full Vendor Integration Guide, starter templates, and example configs are in the repo:

- `docs/vendor-guide.md` — complete setup instructions for both demo formats
- `live-demo/vendors/starter-python/` — starter template for live demo submissions
- `web-demo/lib/vendor-config.cisco.ts` — example web demo config (Cisco, all 6 controls)

We look forward to seeing your submissions.

— ONUG Agentic AI Overlay Working Group
