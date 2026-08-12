---
epic: 2
story: "2.1"
phase: "2 — Field Operations Core"
title: Create and List Sites
---

# Story 2.1: Create and List Sites

As Owner/Admin,
I want to create a Site (name, location, status, contract reference) and see it in a list with every other Site,
So that I can start tracking a new project immediately and always see my full portfolio in one place.

## Acceptance Criteria

**Given** I fill in a Site's name, location, status, and contract reference
**When** I submit the Create Site form
**Then** the Site is saved and appears immediately at the top of the Sites list, no refresh required
**And** the Sites list always reflects every Site that exists, automatically including newly created ones (FR-3)
**And** submitting with a missing required field shows inline validation matching the shared Zod schema, not a generic error
**And** the empty state (zero Sites) shows a clear "create your first Site" prompt, never a blank table

## References

- `apps/api/src/sites/` already has `create`/`list` endpoints, Zod-validated — extend, don't rebuild
- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/02-sites.html`
