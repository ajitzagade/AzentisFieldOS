---
epic: 15
story: "15.3"
phase: "8 — Post-launch Enhancements"
title: Soft delete for Sites and Vendors
status: Implemented 2026-08-30 (commit b853c73) — written retroactively alongside the build
---

# Story 15.3: Soft Delete for Sites and Vendors

As the Owner/Admin,
I want to delete a Site or Vendor so it disappears from the app,
So that stale master data stops cluttering lists and pickers — while every record it touched stays in the database.

## Acceptance Criteria

**Given** a Site or Vendor detail page as Owner/Admin
**When** I press Delete
**Then** a confirmation dialog states exactly what will happen (hidden everywhere; records preserved) before anything is deleted
**And** on confirm, the row is stamped deletedAt (soft delete) — it vanishes from every list, picker and dashboard figure, direct reads 404, and its transaction history remains untouched in the database

**Given** a Site Supervisor
**When** they attempt the delete
**Then** the API rejects with 403 — deletion is Owner/Admin-only

**And** transaction-history records (Purchases, Movements, Consumption, Payments, DSRs, …) deliberately have NO delete of any kind — a wrong entry is fixed with the existing Correct action (AD-9); this boundary is the audit trail's guarantee
**And** Materials/Units/Categories/Team Members keep their existing `isActive` disable lifecycle, which is the same soft-delete behavior under another name

## References

- AD-9 (append-only ledger — the reason transaction rows are excluded)
- Existing precedent: `isActive` lifecycle on lookup tables (FR-4, FR-49)
