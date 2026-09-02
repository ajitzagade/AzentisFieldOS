---
epic: 19
story: "19.1"
phase: "8 — Post-launch Enhancements"
title: Advance Quick-Entry Modal
---

# Story 19.1: Advance Quick-Entry Modal

As Owner/Admin,
I want to record an Advance without navigating to a specific Team Member's profile first,
So that recording a requested advance takes one step instead of three clicks through Team & Labour.

This is the first story in the epic: it ships the modal itself plus one standalone trigger point (a "Record Advance" button on the Dashboard's Outstanding Advances card), so it delivers real value on its own. Stories 19.3 and 19.4 later add more entry points into this same modal.

## Acceptance Criteria

**Given** I am on the Dashboard and click the new "Record Advance" button on the Outstanding Advances card
**When** the modal opens
**Then** I see a searchable Team Member combobox, an amount field, and a reason field — the same searchable-combobox pattern as `SiteField`, scoped to Team Members

**Given** I search and select a Team Member, enter an amount and reason, and submit
**When** the save succeeds
**Then** the same `Advance` record is created that the Team Member profile's full form creates today — no parallel backend flow, no new endpoint

**Given** the save succeeds
**When** the modal closes
**Then** I return to wherever I opened it from (Dashboard, palette, etc.) with an inline success confirmation — never a full-page redirect

**Given** validation fails (e.g. missing amount, amount exceeds Outstanding Balance)
**When** I submit
**Then** inline per-field errors appear, mirroring the shared Zod schema (AD-7) — client and server never disagree about validity

**Given** I open the modal and then cancel
**When** I click Cancel
**Then** the modal closes with no record created and no navigation

## References

- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/24-owner-quick-access-and-mobile-alignment.html` — D4
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` — Component Patterns row "Advance quick-entry modal"
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/DESIGN.md` — Components: "Quick-entry modal"
- `apps/web/app/(app)/team/[id]/advances/new/` (existing full Advance form — this story's modal reuses its schema/action)
- `apps/web/app/(app)/_components/site-field.tsx` (searchable-combobox pattern to mirror, scoped to Team Members instead of Sites)
