---
epic: 2
story: "2.2"
phase: "2 — Field Operations Core"
title: Update Site Details & Status Transitions
---

# Story 2.2: Update Site Details & Status Transitions

As Owner/Admin,
I want to edit a Site's details and change its status between Active, On Hold, and Completed,
So that the Sites list always reflects reality.

## Acceptance Criteria

**Given** an existing Site
**When** I update its name, location, contract reference, or status
**Then** the change saves and is reflected immediately in the Sites list
**And** each status change is timestamped
**And** this uses a normal Edit affordance — Site master data is not transaction history, so AD-9's Correct pattern does not apply here

## References

- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/02-sites.html`, `mockups/03-site-detail.html`
