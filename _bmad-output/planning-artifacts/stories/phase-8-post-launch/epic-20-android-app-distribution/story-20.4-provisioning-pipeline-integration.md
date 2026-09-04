---
epic: 20
story: "20.4"
phase: "8 — Post-launch Enhancements"
title: Provisioning Pipeline Integration
---

# Story 20.4: Provisioning Pipeline Integration

As the team onboarding a new Tenant,
I want APK generation to be a step in the same scripted provisioning procedure that already creates a Tenant's Vercel project, database, and domain,
So that a new Tenant's Android app is a byproduct of onboarding, not a separate manual task someone has to remember (FR-52).

## Acceptance Criteria

**Given** `infra/provisioning/provision.ts` runs for a new Tenant slug
**When** it reaches the Android build step
**Then** it invokes Story 20.1's wrapper template with that Tenant's domain, package name, and branding, producing a signed APK artifact alongside the existing Vercel/Neon/domain provisioning outputs

**Given** the shared signing key from Story 20.1
**When** provisioning runs for any Tenant
**Then** it reuses that same key rather than generating a new one per Tenant

**Given** provisioning fails at the Android build step
**When** the failure occurs
**Then** it surfaces loudly and stops the provisioning run rather than silently skipping the APK and completing as if it succeeded — mirroring the existing "a migration failure fails the build, never deploys broken state silently" principle already applied elsewhere in this project

## References

- Consumes Stories 20.1–20.3.
- `infra/provisioning/provision.ts` is currently a skeleton (provider API calls not yet implemented, per AGENTS.md) — this story's build step should be wired in regardless of that other work's completion state, so it isn't blocked waiting on it.
