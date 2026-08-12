---
epic: 1
story: "1.5"
phase: "1 — Foundation"
title: Sign In
---

# Story 1.5: Sign In

As an Owner/Admin or Site Supervisor,
I want to sign in with my Tenant-issued credentials,
So that I can access AzentisFieldOS as myself, scoped to my Tenant.

## Acceptance Criteria

**Given** a valid Clerk-issued account for this Tenant
**When** I submit my credentials on the Sign In screen
**Then** I land on the application shell, authenticated, with no tenant-selection step (single-tenant by construction, AD-1)
**And** an invalid credential attempt shows an inline, actionable error — never a raw auth-provider error
**And** no hand-rolled password/session/MFA code exists anywhere in the implementation (AD-10)

## References

- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/00-login.html`
- Architecture AD-1, AD-10
