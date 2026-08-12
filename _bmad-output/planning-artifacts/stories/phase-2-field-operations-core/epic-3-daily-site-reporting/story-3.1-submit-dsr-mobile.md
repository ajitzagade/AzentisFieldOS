---
epic: 3
story: "3.1"
phase: "2 — Field Operations Core"
title: Submit a Daily Site Report (Mobile)
---

# Story 3.1: Submit a Daily Site Report (Mobile)

As a Site Supervisor,
I want to fill in work completed, crew present (defaulted from yesterday), materials consumed, RMC used, and photos on my phone and submit,
So that I can log a full day's activity in under 5 minutes without re-typing what didn't change (SM-2).

## Acceptance Criteria

**Given** I open the DSR entry flow for my Site today
**When** the form loads
**Then** the crew checklist is pre-populated from yesterday's attendance at this Site, and material/machinery pickers are search/dropdown/chip-add, never free-text (SM-C1: accuracy is never traded for speed)

**When** I submit with work completed, crew, at least one material or RMC entry, and photos
**Then** the DSR is created as one record, and submitting a second DSR for the same Site/date before the first syncs is treated as an edit to the queued entry, not a duplicate (FR-28)
**And** a Team Member cannot appear present at two different Sites on the same date — this is enforced, not just assumed

## References

- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/04-dsr-entry.html`
- FR-28, SM-2, SM-C1
