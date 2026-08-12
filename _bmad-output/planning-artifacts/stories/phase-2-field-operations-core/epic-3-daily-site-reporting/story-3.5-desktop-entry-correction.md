---
epic: 3
story: "3.5"
phase: "2 — Field Operations Core"
title: Desktop Daily Activity Entry & Correction
---

# Story 3.5: Desktop Daily Activity Entry & Correction

As Owner/Admin,
I want to create a new Daily Activity entry or file a correction on an already-synced one from my desktop,
So that I'm not limited to the mobile flow, and mistakes get fixed the right way — a new linked entry, not a silent edit.

## Acceptance Criteria

**Given** I open "New Daily Activity" from the desktop log
**When** I fill in and submit the same fields as the mobile flow (Site, date, work, crew, materials, RMC, machinery, expenses/issues, photos)
**Then** a new DSR is created exactly as if submitted from the field

**Given** I click "Correct" on an already-synced report
**When** the entry form opens
**Then** a correction banner explains this creates a new linked entry, a reason field is required, and the original report is never edited or deleted (AD-9, FR-54)
**And** the desktop photo field is a drag-drop dropzone (vs. mobile's camera tap) — same underlying field, platform-appropriate input

## References

- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/19-daily-activity-entry.html`
- Shares the underlying DSR record/API with Story 3.1 — build the entry logic once, both surfaces call it
