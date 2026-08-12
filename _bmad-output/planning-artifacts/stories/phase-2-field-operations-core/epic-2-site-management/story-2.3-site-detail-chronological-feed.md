---
epic: 2
story: "2.3"
phase: "2 — Field Operations Core"
title: View Site Detail — Chronological Activity Feed
---

# Story 2.3: View Site Detail — Chronological Activity Feed

As Owner/Admin,
I want to open a Site and see every DSR, stock movement, Work Record, expense, RMC entry, and photo tagged to it, in chronological order,
So that I understand what's actually happened at that Site without hunting across screens.

## Acceptance Criteria

**Given** a Site with zero linked records
**When** I open its detail view
**Then** I see a clear empty state explaining no activity has been logged yet — not a blank feed

**Given** a Site with linked records from any combination of DSR, Movement, Work Record, Expense, RMC, or photo sources
**When** I open its detail view
**Then** every record appears in a single chronological feed, newest first, each tagged with its record type
**And** this view degrades gracefully as later epics (DSR, Inventory, Team, Expenses, RMC) ship — it reads from whatever record types exist without requiring all of them to be built first

## References

- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/03-site-detail.html` — includes the "Activity Pulse" 14-day DSR-volume visual (not a % complete bar — this product has no BOQ)
