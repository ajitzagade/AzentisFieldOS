---
epic: 3
story: "3.2"
phase: "2 — Field Operations Core"
title: Offline Queueing & Background Sync
---

# Story 3.2: Offline Queueing & Background Sync

As a Site Supervisor working with patchy or no signal,
I want my submitted DSR to save on my device immediately and sync automatically once I'm back online,
So that I never lose a report to a dropped connection.

## Acceptance Criteria

**Given** I submit a DSR while offline
**When** the submission completes
**Then** I see "Saved on device — will sync when back online" (warning tokens + wifi-off icon), unambiguously distinct from a synced state

**Given** connectivity returns
**When** the app detects it
**Then** the queued DSR syncs automatically and silently, with no re-entry required, using a per-sub-record idempotency key so a retried sync never creates duplicates
**And** if two devices submitted conflicting sub-records for the same DSR, the last-synced write wins per sub-record (FR-29) — not per whole-DSR

## References

- Architecture AD-8 (local-first Dexie/IndexedDB queue) — this is architecturally load-bearing, not an enhancement
- NFR-5 (must function fully offline on a low-end phone over 2G/3G)
- FR-29
