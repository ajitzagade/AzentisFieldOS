---
epic: 20
story: "20.2"
phase: "8 — Post-launch Enhancements"
title: Per-Tenant Digital Asset Link Verification
---

# Story 20.2: Per-Tenant Digital Asset Link Verification

As the team onboarding a new Tenant,
I want each Tenant's own domain to host a valid `assetlinks.json` referencing the shared signing key's fingerprint,
So that Chrome verifies the TWA against that Tenant's domain specifically and renders it fully chrome-less — never falling back to a visible address bar, and never verifying against a domain it wasn't issued for.

## Acceptance Criteria

**Given** a Tenant's `apps/web` deployment
**When** `/.well-known/assetlinks.json` is requested on that Tenant's domain
**Then** it returns a Digital Asset Links statement listing the shared signing key's SHA-256 fingerprint (Story 20.1) and that Tenant's own Android package name, generated from `infra/tenants/<slug>.json` config rather than hand-edited per Tenant

**Given** the APK is installed and the Tenant's `assetlinks.json` is reachable
**When** the app is opened
**Then** Chrome renders it as a verified TWA with no URL bar, not a Custom Tab fallback

**Given** AD-1/AD-2 (no shared state across Tenant deployments)
**When** a Tenant's `assetlinks.json` is generated
**Then** it is served from that Tenant's own deployment only — no shared or cross-tenant asset-link registry exists anywhere in the system

## References

- Consumes the signing key from Story 20.1.
