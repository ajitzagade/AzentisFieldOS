---
epic: 19
story: "19.3"
phase: "8 — Post-launch Enhancements"
title: Dashboard Quick-Actions Bar
---

# Story 19.3: Dashboard Quick-Actions Bar

As Owner/Admin,
I want a row of quick-action buttons (Record Payment, Record Advance, Add Purchase, Search) next to the New Daily Report button on my Dashboard,
So that I can start my most frequent tasks without navigating through the sidebar first.

## Acceptance Criteria

**Given** I am OWNER_ADMIN and open the Dashboard
**When** the header renders
**Then** I see "New Daily Report" in hero-primary styling, plus "Record Payment," "Record Advance," "Add Purchase," and "Search" as secondary-styled buttons in the same header row

**Given** I click "Record Payment"
**When** the button activates
**Then** I am taken to the existing `/payments/new` flow — no new backend behavior

**Given** I click "Record Advance"
**When** the button activates
**Then** Story 19.1's Advance quick-entry modal opens in place, without leaving the Dashboard

**Given** I click "Add Purchase"
**When** the button activates
**Then** I am taken to the existing `/movements/purchases/new` flow

**Given** I click "Search"
**When** the button activates
**Then** Story 19.2's Search/Action palette opens

**Given** I am SITE_SUPERVISOR
**When** I view my landing surface
**Then** this bar does not appear — it is Owner-only, and the Supervisor Home hero/task-grid is unaffected

## References

- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/24-owner-quick-access-and-mobile-alignment.html` — D1
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` — "2026-09-02 Owner quick-access & mobile-alignment revision" IA note; Component Patterns row "Dashboard quick-actions bar"
- `apps/web/app/(app)/_components/owner-dashboard.tsx` (header row, currently one button)

**Note:** this button row is one of the call sites Story 19.7 sweeps up for mobile full-width stacking — that story is independent and can land before or after this one without either blocking the other; until 19.7 lands, this row wraps inline like any other `flex flex-wrap` group in the product today.
