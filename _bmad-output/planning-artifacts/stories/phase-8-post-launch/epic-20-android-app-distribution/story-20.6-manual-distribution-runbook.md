---
epic: 20
story: "20.6"
phase: "8 — Post-launch Enhancements"
title: Manual Distribution Runbook
---

# Story 20.6: Manual Distribution Runbook

As the team onboarding a new Tenant,
I want a short runbook for handing a Tenant's APK to their field team,
So that install friction (Android's "unknown sources" warning) doesn't look like a broken or untrustworthy app to a client who has never sideloaded software before.

## Acceptance Criteria

**Given** a Tenant's APK artifact exists (Story 20.4's output)
**When** it needs to reach a Supervisor's or Owner's phone
**Then** the runbook documents a concrete distribution path — e.g. a link delivered via the existing WhatsApp BSP channel already used for report delivery (FR-33/FR-50) — rather than leaving the method ad hoc per Tenant

**Given** a first-time install on a device
**When** Android shows the "Install unknown apps" permission prompt
**Then** the runbook includes the exact client-facing explanation to give beforehand, so the prompt is expected and not mistaken for a security problem

**Given** a shell-level change is ever needed (new icon, renamed app, changed domain)
**When** that happens
**Then** the runbook states plainly that it requires rebuilding (Story 20.1's template) and manually redistributing the APK for reinstall — there is no silent auto-update path without a Play Store listing

## References

- Documents the end-to-end flow produced by Stories 20.1–20.5; ships no code.
