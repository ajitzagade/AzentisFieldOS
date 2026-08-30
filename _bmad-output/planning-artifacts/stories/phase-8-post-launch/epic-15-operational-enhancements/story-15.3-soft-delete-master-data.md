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

## Review Findings (code review 2026-08-30, commits b853c73+80be98e)

- [x] [Review][Decision] No restore/undelete path — RESOLVED 2026-08-30: accepted as-is (deletion is Owner-only + double-confirmed; SQL recovery acceptable). Logged in deferred-work.md.
- [ ] [Review][Decision] Deleting a Vendor with UNPAID/PARTIAL purchases (or a Site with stock) silently removes those figures from Vendor Outstanding / Cash Tied Up / stock views. Block, warn with figures in the dialog, or accept?
- [x] [Review][Patch] Soft-deleted Site/Vendor still writable & partially readable — PATCH /sites/:id and /vendors/:id lack deletedAt guards; GET /vendors/:id/purchases + /purchase-summary serve deleted vendors; GET /reports/sites?siteId= serves a deleted Site [apps/api/src/sites/sites.service.ts:update, vendors.service.ts, reports/site-inventory-reports.service.ts:52]
- [x] [Review][Patch] Delete buttons render for Supervisors who will only get a 403 after confirming — gate on /users/me like Settings does [apps/web/app/(app)/sites/[id]/page.tsx, vendors/[id]/page.tsx]
- [x] [Review][Patch] Concurrent-delete race: a 404 from DELETE redirects back to a now-404 detail page with "try again" — map 404 to "already deleted" + list redirect [apps/web/app/(app)/sites/[id]/actions.ts, vendors/[id]/actions.ts]
- [x] [Review][Patch] Missing tests: SitesService.list deletedAt filter / softDelete / findOne-deleted (vendors has only the list case), DELETE-route 403 integration (users-controller pattern), delete server-action tests (repo convention: every actions.ts has actions.test.ts)
- [x] [Review][Defer] Transaction writes (DSR/consumption/expense/etc.) accept a soft-deleted siteId/vendorId — UI-unreachable (pickers filter), ledger-harmless; revisit with the role-lockdown work — deferred
