# Deferred Work

## Deferred from: code review of story-5.1 (2026-08-14)

- `countThisMonth` uses server-local timezone instead of explicit IST — edge-case precision on the "Purchases This Month" stat tile at month boundaries, not central to any AC.
- No cross-field validation that `totalAmount ≈ quantity × rate` on Purchase — would catch typos, but not specified by any AC.
- No `createdByUserId` attribution on Purchase — matches the already-tracked epic-wide "no per-request auth yet" TODO in AGENTS.md; will resolve once `apps/api` validates a Clerk session per-request (AD-10).
- `PurchasesService.list()` has no pagination — systemic pattern across the whole codebase (Sites, Team, Materials lists are all unbounded too), not specific to this story.
- Archived Material/Site referenced by a correction renders the locked dropdown as visually unselected in the correction form — cosmetic only, the hidden input still carries the correct id through to submission.

## Deferred from: code review of story-5.2 (2026-08-14)

- No `sourceSiteId !== destinationSiteId` check for SITE_TO_SITE Movements — a self-transfer would pass validation. Real gap, but SITE_TO_SITE is Story 5.4's own scope; re-flag explicitly under Story 5.4's review.
- `confirmReceipt` semantics for a correction Movement (negative `sentQuantity`) are unaddressed — genuine product-design ambiguity, not specified anywhere in Dev Notes; narrow edge case since Movement corrections are rare.
- No RBAC/role guard on any Movements endpoint — matches the already-tracked epic-wide "no per-request auth yet" TODO in AGENTS.md.
- Movements pages throw a plain `Error()` on fetch failure instead of the shared error state, and have no `loading.tsx` — established pattern across the whole codebase, not specific to this story.
- A Site-to-Site Movement's `correctHref` points at the `/movements/godown-to-site/:id/correct` URL — functionally correct (the page branches on `movement.kind`), but the URL segment is misleading; a proper fix needs a dedicated `/movements/site-to-site/:id/correct` route.
- `getSites`/`getMaterials` fetch helpers duplicated verbatim across several pages — systemic pattern across the whole codebase.
- No upper-bound sanity check on `receivedQuantity` relative to `sentQuantity` in `confirmMovementReceiptSchema` — enhancement, not specified by any AC.
- Quantity `TextField`s have no `min="0"` HTML attribute — cosmetic only, server already validates.
- `movedAt` uses `z.iso.date()` instead of Task 1's literal `z.coerce.date()` — matches Story 5.1's deliberate date-only convention, just undocumented in this story's own Completion Notes.

## Deferred from: code review of story-5.3 (2026-08-14)

- `/movements/vendor-to-site/new/page.test.tsx` doesn't verify `siteId` is posted alongside `destination=SITE` end-to-end — coverage nice-to-have, not a proven defect.
- No empty-state handling on `/movements/vendor-to-site/new` if zero Sites exist yet — narrow UX edge case.
- Quantity `TextField` has no client-side `min="0"` in "new" mode — cosmetic, systemic across Purchase/Movement forms.
- `purchases.service.integration.spec.ts` hardcodes a literal `purchasedAt` date across test cases — minor test-quality nit.

## Deferred from: code review of story-5.4 (2026-08-14)

- No client-side prevention of picking the same Site for both Source and Destination on the transfer form — the server-side guard is now fixed; this is a UX nicety on top.
- Correction routing lives under `/movements/godown-to-site/[id]/correct` for both Movement kinds, and the shared form lives in a kind-named folder — real naming nit, low priority, a proper fix is a larger restructure.
- `getSites`/`getMaterials` fetch helpers duplicated across pages — systemic, already logged under Story 5.2.
- Movements pages throw a raw `Error()` on fetch failure / no shared error state — systemic, already logged under Story 5.2.
- `confirmReceipt` semantics for a correction Movement are unclear — already logged under Story 5.2.
- No client-side guard against a zero-delta correction on the Quantity adjustment field — cosmetic, server already validates.
- `MovementFormInitialValues` has no type-level tie between `kind` and `sourceSiteId` — same class of prop-typing tightening already applied to `PurchaseForm` under Story 5.1, not yet applied here.

## Deferred from: code review of story-5.5 (2026-08-15)

- No pagination on `ConsumptionService.list()` / the combined Movements page — systemic, already logged under Story 5.1.
- No visual lineage for corrections in the combined Movements table (`correctsId`/`reason` not surfaced) — applies uniformly across all four row types, a table-wide enhancement.
- Every row's "Correct" link shares the identical accessible name across the table — real a11y concern (WCAG 2.4.4), pre-existing since Story 5.1's shared `CorrectAction` component.
- `quantity: z.number()` on Consumption has no finiteness/bounds check — enhancement, not specified by any AC.
- No indication when correcting a Consumption that is itself already a correction (correction chains) — enhancement.

## Deferred from: code review of story-5.6 (2026-08-15)

- No filtering/tabs UI on the combined Movements page (`07-movements.html`'s chip row: All/Purchases/Movements/Consumption/Wastage & Returns) — page-wide feature spanning all four transaction types.
- `CorrectAction` renders a plain `<a href>` instead of `next/link`'s `<Link>`, causing full page reloads on every Correct click — pre-existing since Story 5.1's shared component.
- No pagination/date-range scoping on the four merged `findMany()` calls backing the Movements page — systemic, already logged under Story 5.1.
- Corrections aren't visually distinguishable in the combined table (no badge/reference back to the original row) — table-wide gap across all four row types.

## Deferred from: code review of story-5.7 (2026-08-15)

- No pagination on `GET /purchases`/the merged Movements page — systemic, already logged under Story 5.1.
- Fetch failures on the Inventory page bypass AD-6's shared error-state policy — systemic, already logged under Story 5.2.
- `EditMaterialForm`'s `lowStockThreshold` `TextField` has `min={0}` while the server requires strictly positive — minor client/server boundary mismatch, harmless.
- `materials/page.tsx` includes `lowStockThreshold` in its list type but doesn't render it anywhere on the list — enhancement.
- Godown vs Site Stock tables present Material/Size inconsistently (split columns vs one concatenated column) — cosmetic layout inconsistency.
- The GapFlag's "Transfer Stock" action always links to the generic entry route with no pre-selected Material/quantity — real UX gap, but matches Task 3's literal spec.
- `getLowStockMaterials()`'s Decimal→`Number` conversion when summing across Sizes risks float precision loss at extreme magnitudes — theoretical.
- No `aria-label` on stat-tile em-dash placeholders — matches the established pattern on Team/Sites pages.

## Deferred from: code review of story-6.1 (2026-08-15)

- `list()`'s `isToday` check and `getTeamSummary()`'s date boundaries use UTC, not IST — systemic, same pattern already deferred for `PurchasesService.countThisMonth`.
- No server-side check that an assigned `EmploymentType` is `isActive` — currently unreachable since nothing can disable an Employment Type yet (Epic 14 scope).
- `EmploymentType.name` isn't trimmed/case-normalized — matches the same pattern used by `MaterialCategory`/`Unit`/`Site` elsewhere.
- `EditTeamMemberPage` fetches Employment Types even on a 404 Team Member — minor wasted read.
- **Flagged for Epic 7 (not this codebase's own action item, noted for awareness):** `TeamMember.outstandingAdvanceBalance` and `Advance`/`AdvanceAdjustment`/`Payment`'s `correctsId`/`correctionReason`/`reason` columns exist in `schema.prisma` with no corresponding migration — `pnpm db:generate` will produce a client whose fields don't exist in an actually-migrated database. Not exercised by anything in Epic 6; will need its own migration before Epic 7 code goes live.

## Deferred from: code review of story-6.2 (2026-08-15)

- `todayDate()` and the Work Record lock-key timestamps use UTC, not IST — systemic, same pattern already deferred repeatedly.
- `createWorkRecordBatchSchema` doesn't reject a duplicate `teamMemberId` within a batch at the schema layer — functionally caught later by the advisory-lock check, just a less immediate error.
- `GET /work-records`/`default-crew` query params have no format validation — low exploitability, only called by the app's own date picker today.
- The `workrecord:${teamMemberId}:${workDate}` lock-key string is duplicated (with matching comments) across `dsr.service.ts` and `work-records.service.ts` rather than a shared constant.
- No real-Postgres integration test for `WorkRecordsService`'s advisory-lock concurrency — the underlying `lockOnKey` mechanism is already proven via `DsrService`'s own integration test (same shared helper).
- `hours`/`overtimeHours` have no upper bound — enhancement, not specified by any AC.

## Deferred from: code review of story-6.3 (2026-08-15)

**Reviewed while a concurrent session was actively building Story 7.4 on the same files** (`team-members.service.ts`, `team/page.tsx`, `team/[id]/page.tsx`) — findings touching those three files were deferred rather than patched, to avoid colliding with in-flight work. Two agent-raised concerns turned out to already be resolved by that concurrent work (`getTeamSummary()`'s Advance/Payment totals replaced by a materialized-balance-backed `getOutstandingAdvances()`), noted in the story file rather than repeated here.

- Full Advance Ledger UI on the Team Member detail page — real question at review time, but superseded by Story 7.4 landing the real thing on the same page; needs a follow-up look once that work is committed.
- Team summary UI doesn't display weekly/monthly payment totals (AC #3's literal text) — real gap as last observed, but the page is under active edit; re-check once Epic 7's Payments work settles.
- `list()`'s `isToday` check and `getTeamSummary()`'s date boundaries use UTC, not IST — systemic, already logged repeatedly.
- `totalTeamMembers` (active-only) vs. the roster table (`list()`, no active filter) can show different counts with no explanation — cosmetic.
- Neither `WorkRecordsService.create`/`.createBatch` nor `TeamMembersController` checks `TeamMember.isActive` — same class of gap already deferred under Story 6.1.
- `TeamMembersService.list()`/`WorkRecordsService.list()` have no pagination — systemic, already logged repeatedly.
