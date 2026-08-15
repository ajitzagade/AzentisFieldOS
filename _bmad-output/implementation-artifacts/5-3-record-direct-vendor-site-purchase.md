---
baseline_commit: cf5dd4dc709029a08e7c4febf34f2421f394871f
---

# Story 5.3: Record Direct Vendor→Site Purchase

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to record a Purchase that goes directly from a Vendor to a Site, bypassing the Godown,
so that Site-delivered material is tracked without a false Godown Stock detour.

## Acceptance Criteria

1. **Given** I record a direct Vendor→Site Purchase with the same field set as a standard Purchase plus a receiver, **when** I submit, **then** the destination Site's Stock increases directly, and Godown Stock is never touched by this transaction. (FR-10)
2. This is not a new transaction type — it is `Purchase.destination = SITE`, which Story 5.1 already fully implemented and covers with AC #2 and #5 of that story.

## Tasks / Subtasks

- [x] Task 1 — Verify, don't rebuild (AC: #1, #2)
  - [x] Confirm `createPurchaseSchema` (Story 5.1) already requires `siteId` when `destination = SITE` and forbids it when `GODOWN` — this is the entirety of FR-10's data-shape requirement. No schema change.
  - [x] Confirm `PurchasesService.create`'s SITE-destination branch (Story 5.1, Task 2) calls `tx.siteStock.upsert(...)` and never references `godownStock` — this is the entirety of FR-10's "never touches Godown Stock" requirement. No service change.
  - [x] `receiverName` (`schema.prisma:166`, already in Story 5.1's Zod schema as an optional string) is FR-10's "plus a receiver" field. If Story 5.1 shipped it as always-optional, confirm that's acceptable — the AC doesn't say receiver is required, only that the field exists; don't tighten it to required without a product decision to do so.
- [x] Task 2 — `apps/web` UI (AC: #1)
  - [x] `apps/web/app/(app)/movements/vendor-to-site/new/page.tsx` — reuse Story 5.1's Purchase form component/logic with `destination` pre-set to `SITE` and the Site picker shown up front (rather than the destination-toggle UX of the general Purchase form) — this is a UX entry-point convenience, not a new data path. If Story 5.1's form already handles `destination = SITE` cleanly via its toggle, a thin wrapper page that pre-selects `SITE` and skips the toggle step is sufficient; do not duplicate the form's field list or validation logic.
  - [x] Ensure the `/movements` list (Story 5.1) doesn't need a distinct badge for this — it's still a `Purchase` row (`badge-success`, "Purchase"), the mockup doesn't differentiate Godown-destined from Site-destined Purchases visually, only by which "Site / Godown" column value it shows.
- [x] Task 3 — Tests (AC: #1)
  - [x] One integration-style test confirming a `destination: "SITE"` Purchase with `receiverName` set persists correctly and only mutates `SiteStock` — this may already exist from Story 5.1's test suite; extend it to include `receiverName`, don't write a parallel Purchase-creation test suite.

## Dev Notes

**This story is intentionally thin.** Re-read Story 5.1 before starting — FR-10 turned out to already be fully covered by FR-8's implementation once `destination = SITE` exists as a valid, tested branch. The only genuinely new surface is the dedicated `/movements/vendor-to-site/new` entry point (a UX convenience for a common flow) and confirming `receiverName` is wired through end to end. Do not create a second Prisma model, a second Zod schema, or a second service method — that would silently fork FR-8/FR-10 into two "almost identical" code paths, the exact anti-pattern AD-7 exists to prevent.

**If Story 5.1 didn't ship `receiverName`** in its create form (it's in the Zod schema per Story 5.1 Task 1, but the form UI task list didn't explicitly enumerate every field), add the `TextField` for it here rather than going back to edit Story 5.1's file.

**Depends on Story 5.1 entirely** — this story cannot start until 5.1 is done.

### Project Structure Notes

- Adds exactly one new route (`/movements/vendor-to-site/new`) on top of Story 5.1's existing structure. No other new files expected.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-3] (FR-10)
- [Source: _bmad-output/planning-artifacts/stories/phase-3-materials-inventory/epic-5-inventory-transactions-stock-visibility/story-5.3-direct-vendor-site-purchase.md]
- [Source: _bmad-output/implementation-artifacts/5-1-record-a-purchase.md — the Purchase schema/service/form this story reuses in full]
- [Source: infra/prisma/schema.prisma#Purchase.receiverName]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

### Completion Notes List

- Verified Task 1 needed no code changes: `createPurchaseSchema`'s siteId cross-field rule, `PurchasesService.create`'s SITE branch (only calls `tx.siteStock.upsert`, never `godownStock`), and the `receiverName` `TextField` were all already correct/present from Story 5.1.
- Added `PurchaseForm`'s `fixedDestination?: "SITE"` prop (`purchase-form.tsx`) rather than a second form component — when set, it seeds `destination` state to `"SITE"`, replaces the Destination `SelectField` with a hidden input, and reuses the existing `destination === "SITE"` condition to show the Site picker immediately. This is Task 2's "thin wrapper," not a duplicated field list/validation path (AD-7).
- `/movements/vendor-to-site/new/page.tsx` is a data-fetching wrapper only — same `getSites`/`getMaterials` pattern as the general Purchase and Movement entry pages, passing `fixedDestination="SITE"` through to the shared form.
- Added a third header action ("Direct Vendor → Site") on `/movements` alongside "Record Movement"/"Record Purchase" so the new route is actually discoverable, not just reachable by URL.
- Extended Story 5.1's existing SITE-destined integration test (`purchases.service.integration.spec.ts`) with `receiverName`, per Task 3's explicit instruction not to write a parallel Purchase-creation suite.
- Final state: `apps/api` 159 tests / 19 files passing, `apps/web` 161 tests / 44 files passing. Both packages typecheck, lint, and build clean.

### Review Findings

- [x] [Review][Defer] The vendor-to-site page's own test doesn't verify `siteId` is posted alongside `destination=SITE` end-to-end — coverage nice-to-have, not a proven defect (the hidden-input mechanism and the shared Server Action are each independently tested by other suites)
- [x] [Review][Defer] No empty-state handling on `/movements/vendor-to-site/new` if zero Sites exist yet — narrow UX edge case, not blocking, matches the pre-onboarding gap other entry-point forms share
- [x] [Review][Defer] Quantity `TextField` has no client-side `min="0"` in "new" mode — cosmetic, systemic gap already logged under Stories 5.1/5.2
- [x] [Review][Defer] Integration spec hardcodes a literal `purchasedAt` date across test cases — minor test-quality nit
- [x] [Review][Dismiss] "No test verifies a SITE-destined Purchase without/invalid `siteId` is rejected" — already covered by Story 5.1's own Zod cross-field tests; explicitly out of this "thin" story's scope per Dev Notes ("Verify, don't rebuild")
- [x] [Review][Dismiss] Movement shortfall Decimal-string comparison concern — belongs to Story 5.2's code, not owned by this story
- [x] [Review][Dismiss] Movements pages throw a raw `Error()` on fetch failure / no `loading.tsx` — systemic, already logged under Story 5.2, not new here
- [x] [Review][Dismiss] "`createPurchaseAction` not shown in this diff, doesn't prove `siteId` enforcement end-to-end" — already proven by Story 5.1's own test suite; Task 1 explicitly required no schema/service changes for this story
- [x] [Review][Dismiss] `receiverName` stays optional even under `fixedDestination="SITE"` — deliberate, explicitly documented in Dev Notes ("don't tighten it to required without a product decision")
- [x] [Review][Dismiss] `purchase-form.test.tsx` doesn't test the `formError` rendering path — shared component primarily owned/tested by Story 5.1, not a gap specific to this story
- [x] [Review][Dismiss] Correction-mode disabled+hidden field duplication "undocumented/untested" — false; already documented and tested under Story 5.1's own Completion Notes and test suite
- [x] [Review][Dismiss] Empty-state message omitting Wastage/Return — already fixed under Story 5.2's review
- [x] [Review][Dismiss] "File List says 'modified' but the diff shows 'new file'" / "test suite exceeds the 'extend, don't rebuild' instruction" — diff-scoping artifact of Epic 5 being one squashed commit relative to the pre-epic baseline; every Epic 5 file appears "new" against that baseline regardless of which story first created it. This story's own Completion Notes and File List correctly describe these as extensions of Story 5.1's files (verified directly against the story spec).

### File List

- `apps/web/app/(app)/movements/purchases/purchase-form.tsx` (modified — added `fixedDestination` prop)
- `apps/web/app/(app)/movements/purchases/purchase-form.test.tsx` (modified)
- `apps/web/app/(app)/movements/vendor-to-site/new/page.tsx` (new)
- `apps/web/app/(app)/movements/vendor-to-site/new/page.test.tsx` (new)
- `apps/web/app/(app)/movements/page.tsx` (modified — added Direct Vendor → Site header action)
- `apps/web/app/(app)/movements/page.test.tsx` (modified)
- `apps/api/src/inventory/purchases.service.integration.spec.ts` (modified — extended SITE-destined test with `receiverName`)
