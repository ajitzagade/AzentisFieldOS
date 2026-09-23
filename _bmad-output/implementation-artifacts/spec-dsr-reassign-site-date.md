---
title: 'DSR: Owner-only Reassign Site/Date action'
type: 'feature'
created: '2026-09-23'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '171caa291213904b4770bfb7c4a8a67cbdcfbfe7'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A Site Engineer sometimes submits a Daily Report against the wrong Site or Date, with no way to fix it — Site/Date are deliberately locked in the normal Edit flow because `findCurrentForSiteAndDate()`/`listByDate()` resolve "current version" by grouping rows under `(siteId, reportDate)` staying fixed across a correction chain (`dsr.service.ts:1131-1143`), and there is no other "Void and refile" feature built yet.

**Approach:** A narrow, Owner/Admin-only "Reassign Site/Date" action, separate from the normal Edit/correction flow — directly updates the report's `siteId`/`reportDate` in place. Scoped to reports with no correction history at all (never corrected, not itself a correction) — the common "just submitted, wrong date" case — so the update never has to touch or reconcile a multi-row correction chain. This is a second sanctioned, narrow exception to AD-9's append-only rule (same class as D7's Purchase-pricing completion), not a general pattern — documented as such.

## Boundaries & Constraints

**Always:**
- Owner/Admin role only (`@Roles('OWNER_ADMIN')`), same as other Owner-gated report actions.
- Only allowed when the report has NEVER been corrected (no other row has `correctsId` pointing at it) and is not itself a correction (`correctsId` is null) — i.e., a correction chain of exactly one row. A report with any correction history is out of scope for this action.
- Blocked if a report already exists for the target `(siteId, reportDate)` — never silently merge/overwrite another report.
- This is a genuine in-place `UPDATE` on a transaction-history row — the one sanctioned exception, matching D7's Purchase-pricing precedent in shape (narrow, role-gated, explicitly documented, never widened).

**Ask First:** None — scope already confirmed with the user (Owner-only, separate from Edit, collision-blocked, narrow).

**Never:**
- Never reassign a report that has correction history — that's a materially harder problem (the whole chain would need to move together) and out of scope here.
- Never allow reassigning to a Site+Date that already has a report.
- Don't fold this into the normal `correct()`/Edit flow — it's a deliberately separate action with its own narrower guardrails.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Simple reassign | Report with no corrections, target Site+Date has no report | `siteId`/`reportDate` updated in place | N/A |
| Target collision | Target Site+Date already has a report | Rejected | 400, "A report already exists for that Site and Date" |
| Report has correction history | Report has been corrected, or is itself a correction | Rejected | 400, "This report has correction history and can't be reassigned" |
| Non-Owner attempts | SITE_SUPERVISOR role | Rejected | 403 |

</frozen-after-approval>

## Code Map

- `apps/api/src/dsr/dsr.service.ts:1104-1143` -- `correct()`'s Site/Date lock is the reference for why this needs its own path; new `reassignSiteDate(id, {siteId, reportDate}, userId)` method: checks no correction history (query for any row with `correctsId = id`, and that `id`'s own `correctsId` is null), checks no existing report at target Site+Date (`findCurrentForSiteAndDate`), then a plain `update()`.
- `apps/api/src/dsr/dsr.controller.ts` -- new `@Patch(':id/reassign')` `@Roles('OWNER_ADMIN')` route.
- `packages/shared/src/schemas/daily-site-report.ts` -- new small schema for the reassign payload (`siteId`, `reportDate`).
- `apps/web/app/(app)/daily-activity/[id]/page.tsx` -- Owner-only "Reassign Site/Date" action (small modal: Site picker + Date field), visible only when the report has no correction history (reuse existing chain-length/version-history data already on this page).
- Tests: `dsr.service.spec.ts` (collision rejection, correction-history rejection, happy path), controller role-guard test, web action/modal test.

## Tasks & Acceptance

**Execution:**
- [x] `dsr.service.ts` -- `reassignSiteDate()` with the two guard checks + self-collision exclusion (reassigning to the report's own current Site+Date is a no-op, not an error)
- [x] `dsr.controller.ts` -- `PATCH :id/reassign`, Owner-only
- [x] `daily-site-report.ts` -- reassign payload schema
- [x] `daily-activity/[id]/page.tsx` -- Owner-only action + modal, conditional on no correction history
- [x] Extend tests per Code Map

**Acceptance Criteria:**
- Given a report with no correction history, when an Owner reassigns it to a free Site+Date, then it updates in place and appears correctly at the new Site+Date.
- Given a target Site+Date that already has a report, when reassignment is attempted, then it's rejected with a clear message.
- Given a report with correction history, when reassignment is attempted, then it's rejected.
- Given a non-Owner role, when reassignment is attempted, then it's rejected with 403.

## Spec Change Log

## Design Notes

This is a deliberate, narrow AD-9 exception — same class as D7 (Purchase pricing completion), not a precedent for general mutability. Scoping to "no correction history" avoids the much harder problem of moving an entire multi-row correction chain's `(siteId, reportDate)` identity atomically; that's real follow-up work if a reassign-with-history need ever surfaces, not silently expanded into here.

Verified directly (manual review, not the automated 3-layer pass, given the contained scope): the correction-history guard checks both directions (the report isn't itself a correction, and nothing corrects it), and the collision check excludes the report's own current Site+Date so a no-op "reassign to where it already is" doesn't spuriously reject.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/api test`, `pnpm --filter @azentisfieldos/web test`, `pnpm typecheck` -- expected: all pass

**Run (2026-09-24):**
- `pnpm typecheck` -- 4/4 packages clean.
- `pnpm --filter @azentisfieldos/api test` against `azentisfieldos_test` -- 132 files / 1469 tests passed.
- `pnpm --filter @azentisfieldos/web test` -- 216 files / 1269 tests passed.
- Live DB round-trip (collision detection under real query, update actually persisting) not separately exercised beyond the integration-style unit coverage -- noted as the one residual verification gap.

**Manual checks (if no CLI):**
- As Owner, reassign a freshly-submitted (uncorrected) report to a different Date; confirm it now appears under the new Date and no longer the old one. Attempt reassigning to a Site+Date that already has a report and confirm rejection.
