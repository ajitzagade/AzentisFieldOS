---
epic: 3
phase: "2 — Field Operations Core"
status: not-started
---

# Epic 3: Daily Site Reporting (DSR)

## Goal

Site Supervisor completes and submits a Daily Site Report from a phone in under 5 minutes, fully offline, with automatic background sync; Owner/Admin reviews every report from a desktop log, creates or corrects an entry from the web, and never loses data to a dropped connection.

## FRs Covered

- FR-28: One DSR per Site per date (work, labour, materials, RMC, machinery/vehicles, expenses, issues, photos); submitting a DSR creates/updates linked underlying records rather than duplicating entry.
- FR-29: Offline DSR entry and sync; queues on-device, syncs automatically on reconnect; per-sub-record idempotency key prevents duplicates on retry; two-device conflicts resolve last-synced-write-wins per sub-record.
- FR-30: Multiple photos per DSR, each auto-associated with Site/date/DSR/activity/uploader.
- FR-31: Chronological Site photo/progress gallery across all DSRs.
- FR-54 (as it applies to synced DSR corrections): once synced, a DSR is permanent history — a correction is a new, reason-carrying entry, never an edit.

## Related NFRs

- NFR-5: DSR entry must function fully offline on a low-end phone over a 2G/3G-equivalent connection; the network is an optimization, not a dependency.
- SM-2 (success metric): median time to complete/submit a DSR from mobile — target under 5 minutes.
- SM-C1 (counter-metric): never trade submission speed for accuracy — no gamified pressure to submit fast.

## Related Architecture Requirements

- AD-8: Offline-first DSR — local-first Dexie/IndexedDB queue, per-sub-record idempotency key, background sync. This is architecturally load-bearing, not an enhancement.
- AD-9: Append-only correction pattern with a DB-level enforcement backstop (no `UPDATE`/`DELETE` grant on transaction-history tables for the API's DB role).
- AD-13: No manual "Send Report" action — delivery is fully automatic (relevant to how a submitted DSR later feeds Epic 13's report generation).

## Related UX Design Requirements

UX-DR11 (two unambiguous sync states: "saved on device" vs. "synced"), UX-DR12 (photo capture: camera on mobile, drag-drop on desktop), UX-DR15 (Correction Banner on the desktop entry form), UX-DR17 (reason field, not a confirmation dialog, for corrections), UX-DR18 (smart defaults — crew checklist defaulted from yesterday, search/dropdown material pickers, never free-text).

## Implementation Notes

Two entry surfaces exist in the design, both submitting the same underlying record: the mobile Site Supervisor flow (primary, offline-first) and a desktop entry/correction form (secondary, for the Owner/Admin — added specifically because desktop had no way to create or correct a DSR before this was flagged in UX review). Build the offline queue and sync engine once; both surfaces call the same API.

## Composition Reference

`ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/04-dsr-entry.html` (mobile flow, offline/synced states), `mockups/18-daily-activities.html` (desktop log + full report detail read view), `mockups/19-daily-activity-entry.html` (desktop create/correct form).
