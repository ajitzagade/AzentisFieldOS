---
epic: 3
story: "3.4"
phase: "2 — Field Operations Core"
title: Desktop Daily Activity Log & Report Detail
---

# Story 3.4: Desktop Daily Activity Log & Report Detail

As Owner/Admin,
I want a desktop log of every Site's Daily Site Reports, showing who has and hasn't reported today, with a full read view of any report's detail,
So that I can review field activity across all Sites without opening each Site individually.

## Acceptance Criteria

**Given** DSRs have been submitted for some Sites today and not others
**When** I open the Daily Activity log
**Then** each Site shows its sync status (Synced / Pending sync / Not submitted) as a distinct, unambiguous state, and a Site with no report today is never a silent blank row

**When** I open a specific report
**Then** I see its full detail — work completed, crew, materials, RMC, machinery, expenses, a flagged issue if any, and the photo grid
**And** every table row that has a report links to it as a real destination; a row with nothing to open carries no link and no false pointer-cursor affordance (the bug caught during UX review)

## References

- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/18-daily-activities.html`
- This screen didn't exist in the original design pass — added specifically because desktop had no way to review Daily Activity before this was flagged
