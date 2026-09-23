---
title: 'DSR editing: view/add/remove photos'
type: 'feature'
created: '2026-09-23'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '171caa291213904b4770bfb7c4a8a67cbdcfbfe7'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The DSR Edit form never shows a report's already-uploaded photos — `photos` state always starts empty regardless of mode — so an edit can only add new photos, never view or remove existing ones, even though the detail (view) page already renders them.

**Approach:** The edit form already has access to the loaded report's `photos` array (same shape the detail page already renders via `PhotoThumbnail`) — render them alongside the new-upload dropzone, each with a "Remove" action calling a new soft-delete endpoint immediately (not deferred to form submission, matching the quick-create-modal's immediate-write pattern). `Photo.deletedAt` already exists (same soft-delete convention as `Site.deletedAt`/`Vendor.deletedAt`) — removal is a one-line `UPDATE`, not new schema.

## Boundaries & Constraints

**Always:**
- Reuse `Photo.deletedAt` for removal — soft delete only, matching the established convention; the Cloudinary asset itself is left in place (same as every other soft-delete in this codebase).
- The new delete endpoint checks the photo belongs to the report being edited (via `dailySiteReportId`) before deleting — never a bare `DELETE /photos/:id` with no ownership check.
- Removing a photo takes effect immediately (its own request), not bundled into the edit form's submit payload — mirrors how quick-create modals write immediately rather than staging local-only state.
- Every existing photo-read path (`dsr.photos`, site gallery) already filters `deletedAt: null` implicitly or must be checked and updated to do so — a removed photo must disappear everywhere, not just the edit form.

**Ask First:** None identified.

**Never:**
- No hard delete — `deletedAt` only.
- Don't touch the Cloudinary asset itself (no storage-side delete call).
- Don't change the new-photo-upload flow (`POST /photos`, presign) — additive only.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Open edit form on a report with photos | Report has 3 existing photos | All 3 render as thumbnails, each with Remove | N/A |
| Remove one | Click Remove on one thumbnail | That photo soft-deleted immediately, disappears from the form and every other read path | N/A |
| Remove a photo belonging to a different report | Crafted request with another report's photo id | Rejected | 403/404, ownership check fails |
| Add new photos alongside existing | Upload 2 new while 3 existing remain | 5 total shown; existing 3 unaffected | N/A |

</frozen-after-approval>

## Code Map

- `infra/prisma/schema.prisma:943-963` -- `Photo.deletedAt` already exists, no schema change.
- `apps/api/src/storage/storage.controller.ts` -- new `@Delete(':id')` (or `@Patch(':id')` setting `deletedAt`), ownership-checked against `dailySiteReportId`.
- `apps/api/src/storage/storage.service.ts` (or wherever photo reads live, e.g. `sites/site-photo-gallery.ts`) -- confirm/add `deletedAt: null` filter on every photo read path (DSR detail's `photos`, site gallery).
- `apps/web/app/(app)/daily-activity/[id]/page.tsx:611-618` -- reference for how photos are already rendered (`PhotoThumbnail`), to mirror in the edit form.
- `apps/web/app/(app)/daily-activity/_components/dsr-desktop-form.tsx` (Site Photos card, `mode === "correct"`) -- render `initial.photos` (existing) alongside the new-upload dropzone, each with a Remove button calling the new delete endpoint immediately; remove from local state on success.
- `apps/web/app/(app)/dsr/new/page.tsx` (mobile equivalent) -- same treatment.
- Tests: new endpoint's service/controller specs (ownership check, soft-delete), DSR form tests (existing photos render + Remove flow).

## Tasks & Acceptance

**Execution:**
- [x] New delete endpoint (`storage.controller.ts`/`.service.ts`) -- `DELETE /photos/:id?dailySiteReportId=...`, ownership-checked soft delete via `deletedAt`
- [x] Every photo-read path filters `deletedAt: null` -- `site-photo-gallery.ts`, `report-compiler.service.ts`, `site-activity-feed.ts`, and (review patch) `dsr.service.ts`'s `findOne`/`getDraft` `photos` includes, which the implementing agent correctly deferred to avoid a file conflict with the concurrently-implemented Reassign spec
- [x] `dsr-desktop-form.tsx` + `dsr/new/page.tsx` -- render existing photos in edit mode with immediate Remove; also fixed a pre-existing mobile-only bug where a resumed draft's "Remove" on an existing photo only hid it client-side without actually deleting the server row
- [x] Extend tests per Code Map

**Acceptance Criteria:**
- Given an edit form for a report with existing photos, when it loads, then all non-deleted photos render.
- Given a Remove click, when it succeeds, then that photo disappears from the form immediately and from every other read path (detail page, site gallery) without a page reload.
- Given a photo belonging to a different report, when a delete is attempted against it, then it's rejected.

## Spec Change Log

**Patch (2026-09-24, post-implementation):** the implementing agent correctly deferred the `deletedAt` filter on `dsr.service.ts`'s `findOne`/`getDraft` `photos` includes to avoid touching a file the concurrently-running Reassign Site/Date spec owned. Applied directly once that spec landed — a 2-line addition (`photos: { where: { deletedAt: null } } }`), re-verified with the full suite.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/api test`, `pnpm --filter @azentisfieldos/web test`, `pnpm typecheck` -- expected: all pass

**Run (2026-09-24):**
- Scoped: `apps/api` storage/sites/reports tests -- 41 passed. `apps/web` both DSR form tests -- 46 passed.
- Full, after the `dsr.service.ts` deletedAt-filter patch: `pnpm typecheck` -- 4/4 packages clean. `pnpm --filter @azentisfieldos/api test` against `azentisfieldos_test` -- 132 files / 1469 tests passed. `pnpm --filter @azentisfieldos/web test` -- 216 files / 1269 tests passed.

**Manual checks (if no CLI):**
- Edit a submitted report with photos: confirm existing photos show, remove one, confirm it's gone from the form and the report's detail page; add a new photo alongside, confirm both coexist correctly.
