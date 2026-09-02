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

## Deferred from: code review of story-8.1 (2026-08-16)

- No RBAC/role guard on any `apps/assets` endpoint (Machinery/Vehicle/MachineryType/VehicleType) — matches the already-tracked epic-wide "no per-request auth yet" TODO in AGENTS.md.
- `createMachineryTypeSchema`/`createVehicleTypeSchema`/`createMachinerySchema`/`createVehicleSchema` don't `.trim()` string inputs — systemic, matches every existing schema in `packages/shared`, already logged for `EmploymentType.name` under Story 6.1.
- `MachineryType.name`/`VehicleType.name` uniqueness is case-sensitive in Postgres ("Excavator" vs "excavator") — matches the same pre-existing pattern on `MaterialCategory`/`Unit`/`EmploymentType`.
- No index on the new FK columns (`Machinery.typeId`, `Machinery.currentSiteId`, `Vehicle.typeId`, `Vehicle.currentSiteId`) — systemic, the schema has no `@@index` on almost any relation scalar field project-wide, not specific to this story.
- The `20260816070000_add_machinery_vehicle_type_and_current_site_relation` migration adds `typeId TEXT NOT NULL` with no default/backfill, same as the already-shipped `20260813140000_add_employment_type_model` migration for `EmploymentType` — would fail if applied against a table with existing rows. Worth a platform-wide decision on a safe backfill pattern for future free-text-to-lookup-table conversions, not a fix specific to this story.
- Machinery/Vehicle-Vehicles pages throw a plain `Error()` on fetch failure with no shared error state and no `error.tsx`/`loading.tsx` — established pattern across the whole codebase (Team, Materials, Movements), already logged repeatedly.
- Blanking a required Edit field (Name/Type/Asset Number/Number) is silently treated as "leave unchanged" rather than surfacing a validation error, due to the `formData.get(x) || undefined` pattern — same pattern already shipped in `team/[id]/edit/actions.ts`.
- `fetch()` calls in "new"/create Server Actions have no `try/catch` (unlike edit actions, which do) — systemic inconsistency across the whole app between create- and edit-action files, not unique to this story.

## Deferred from: code review of story-9.1 (2026-08-17)

- No pagination or search/filter on `GET /vendors` — systemic, already logged repeatedly (Sites/Materials/Team lists are all unbounded too).
- No authorization guard on `VendorsController`'s mutating endpoints — matches the already-tracked epic-wide "no per-request auth yet" TODO in AGENTS.md.
- Vendor pages `throw new Error(...)` on fetch failure instead of AD-6's shared error-state component — established pattern across the whole codebase, already logged repeatedly.

## Deferred from: code review of story-9.2 (2026-08-17)

- No pagination on `GET /vendors/:id/purchases` — systemic, already logged repeatedly under Story 5.1 and elsewhere.

## Deferred from: code review of story-10.1 (2026-08-26)

- The delta-correction schema pattern (`createRmcEntrySchema`, mirroring `createPurchaseSchema` from Epic 5) lets the quantity go negative on a correction but keeps `ratePerM3`/`totalAmount` (`rate`/`totalAmount` on Purchase) `.positive()` unconditionally — a downward correction can't express a negative cost delta, so it silently inflates `RmcService.statsThisMonth`'s (and Purchase's equivalent) monthly totals instead of reducing them. Pre-existing since Epic 5's Purchase; RMC just faithfully inherited the same gap.
- No list page anywhere in the app (Purchase, Movement, Consumption, Payment, Asset Movement, and now RMC) shows any indicator — badge, icon, or `reason` tooltip — that a row is itself a correction rather than an original entry. Systemic, cross-epic UI gap, not introduced by this story.
- `GET /rmc-entries?date=`/`?siteId=`/`?vendorId=` (and `DsrService.listByDate`'s identical pre-existing `date` param) do no format validation — an unparseable date string reaches `new Date()` unguarded, and a duplicate query key parses to an array Prisma wasn't expecting — both would surface as a raw 500 instead of a 400. Matches the codebase's existing, already-unvalidated `@Query()` string param convention.

## Deferred from: code review of story-10.2 (2026-08-26)

- `GET /rmc-entries/report`'s new `from`/`to` (and `groupBy=` empty-string) params are unvalidated — a malformed `from`/`to` reaches `new Date()` and flows into the Prisma `deliveredAt` filter as an Invalid Date. Same systemic unvalidated-`@Query` class already logged under 10.1; additionally the `from`/`to` window is spec'd at the API but not yet wired to any UI control, so it's currently unreachable from the app.
- `RmcService.report`'s daily slice buckets by UTC calendar day (`toISOString().slice(0,10)`), not IST — matches `RmcService.list`'s existing single-day boundary and the systemic UTC-not-IST issue logged repeatedly across Epics 3/6/7.
- `getRmcReport` (like the sibling `getRmcEntries`/`getRmcStats` on the same page, and every list page in the app) `throw`s on a non-OK fetch instead of rendering AD-6's shared error state — established whole-codebase pattern, already logged repeatedly. The story's specific AD-6 obligation (a genuine empty state for an empty range/tenant) IS implemented.
- `RmcService.report` loads all matching `RmcEntry` rows and aggregates in application code rather than pushing a `GROUP BY`/`SUM` to Postgres — a deliberate choice (spec: live aggregate, no materialized rollup; makes exact reconciliation unit-testable and handles day-truncation Prisma `groupBy` can't) but unbounded over a very large history. Same systemic no-pagination/scale concern already logged repeatedly.

## Deferred from: code review of story-11.1 (2026-08-26)

- **FR-41 "optional document/attachment" is not implemented** — no shared file-upload primitive exists in `packages/ui` (only the bespoke DSR photo/R2 presign flow), so the Expense form scopes it out per the story's own Task 4 allowance. Genuine AC-adjacent follow-up: add a reusable upload primitive (reusing the Epic 3 DSR photo path) and an `Expense` document field. Not silently dropped — tracked here.
- `GET /expenses`' `siteId`/`categoryId`/`from`/`to` filters are fully built at the API but the web list page fetches with no query string and renders no filter controls — same "queryability at API only, no UI" pattern already logged for RMC 10.2. Story Task 4 didn't require filter UI.
- Expense corrections (like every other correction form in the app — Purchase, RMC, Advance, Payment) never surface `reason`/`correctsId` in any list UI, and a correction's `incurredAt`/date is editable (can book a delta into a different month than the original, distorting `summary()` buckets). Systemic across all correction ledgers, not unique to Expenses.
- `ExpensesService.summary()`/`list()` month/week boundaries mix server-local and UTC (`new Date("YYYY-MM-DD")`) date math — same systemic UTC-not-IST issue logged repeatedly; on the IST deployment, edge-of-period expenses can bucket into the wrong week/month.
- `Expense` records no `createdByUserId`/`correctedByUserId` attribution — matches the epic-wide "no request-level auth in apps/api yet" TODO in AGENTS.md; weakens the AD-9 audit trail (proves what/why, not who).
- `ExpensesService.list()` is unbounded (no pagination) — systemic, already logged repeatedly.
- The seed replaces 4 old placeholder categories with the 9 named defaults but never removes the old rows (upsert-by-name), so a previously-seeded environment ends up with 13 categories. Low-impact (fresh-provision seed), no reconciliation path.
- `translateWriteError`'s P2003→400 branch (bad `siteId`/`categoryId` on a fresh create) and `summary()`'s month/week boundary `where`-clause math are both unasserted by the current mocked-Prisma specs — the RMC equivalents did cover these; test-strengthening follow-up.

## Deferred from: code review of story-12.1 (2026-08-26)

- The web dashboard heading hardcodes `timeZone: "Asia/Kolkata"` while the API derives "today" from the configurable `APP_TIMEZONE` — they agree at the default but would disagree if `APP_TIMEZONE` is changed. Matches the whole web app's pervasive hardcoded `en-IN`/`₹`/IST formatting (single-market India launch); make the web share the configured zone when the product goes multi-timezone.
- `local-day.ts`'s `zonedMidnightUtc` samples the zone offset at the UTC-midnight guess rather than at the resulting local-midnight instant — off by an hour near a DST transition. Not exercised: the default/only zone (`Asia/Kolkata`) is DST-free; revisit if a DST deployment zone is ever configured.
- No authorization guard on `GET /dashboard/today` (FR-35 scopes it to Owner/Admin) — matches the epic-wide "no request-level auth in apps/api yet" TODO; Epic 14 Story 14.2 wires the real `ClerkAuthGuard`.
- The dashboard page throws on a failed fetch (via `getJSON`) with no AD-6 error/loading state and `Promise.all` is fail-fast (one aggregate failing collapses the page) — established whole-codebase pattern, already logged repeatedly; the empty/zero states this story needs ARE handled.
- Test-strengthening: no case asserts `getToday()` with no args falls back to `resolveAppTimeZone()`/current time, no zero-active-Sites case, and only Purchase's day-range `where` is asserted (consumption/rmcEntry/expense range filters aren't) — core behavior is covered, these harden it.
- `sitesReportingToday` counts DSRs from Sites of any status while `sitesMissingDsrToday` is scoped to ACTIVE Sites — computed against different populations. Spec-conformant (Task 1 defines each that way), but a COMPLETED Site that reported would inflate the count; worth a product decision if it ever matters.

## Deferred from: code review of story-12.2 (2026-08-26)

- `outstandingAdvances.teamMemberCount = byTeamMember.length` counts every Team Member the outstanding-advances endpoint returns (including ₹0 balances), so it can exceed a "N with an open balance" reading. Left exactly as Task 1's explicit transform dictates; flip to a positive-balance filter if the other semantics are wanted.
- The zero-Sites whole-page empty state gates on total Sites (`sitesPreview.length === 0`) rather than the spec's literal `activeSites.count === 0` — a deliberate, better reading (a Tenant with only Completed/On-Hold Sites shows "0 active", not the create-first-Site screen; the two coincide for the brand-new-Tenant case). Documented in the story; noted here in case the literal reading is later preferred.

## Deferred from: code review of story-13.1 (2026-08-26)

- **Cron "today" is computed in UTC and the schedule hour (`0 18 * * *`) is a placeholder** — genuinely tangled with an unmade PO decision (PRD Open Question: delivery time + timezone). Should reuse Story 12.1's `local-day.ts` helper for the compile day boundary once resolved, so reports compile on the deployment-local calendar day like the Dashboard. Flagged in `vercel.json` `$comment` and the controller.
- **WhatsApp channel** is blocked on the deferred BSP/vendor contract (PRD Open Question 3) — implemented behind a `NotConfiguredWhatsAppSender` that fails honestly (in-app-visible reason) and is left out of the default enabled set; no vendor wired.
- Read endpoints `GET /reports/daily[/:id]` have no auth guard and the report `content` carries site financials/labour/expenses — matches the epic-wide "no request auth in apps/api yet" TODO; Epic 14 Story 14.2 wires `ClerkAuthGuard`. The report preview/log pages fetch without credentials.
- No validation on `?date=`/`?from=`/`?to=` on the reports endpoints — same systemic unvalidated-`@Query` class already logged; a malformed value reaches `new Date()`/Prisma unguarded.
- No indexes on `ReportDelivery.status`/`attempts` (retry sweep), `DailyReport.generatedAt` (log ordering), or `reportDate` (filters); `retryPending` has no `take`/ordering — systemic no-index/no-pagination pattern already logged repeatedly.
- The compiled `content` snapshots `work.inProgress`/`planned`/`issuesBlockers`/`safetyObservations`/`notes`, but neither the email nor the `[id]` preview renders beyond `work.completed` — safety observations and issues/blockers (arguably the most important DSR lines) are stored but not surfaced. Design-driven follow-up (confirm against the `16-reports.html` report-preview field set) rather than a patch here.
- The report detail page footer renders a FAILED delivery in the same muted `text-ink-500` as others (no danger color/icon) — AC #3's visible-failure requirement is met by the Recent-Reports list badge, but the detail view undersells a hard failure. Minor UI polish.
- `ReportContent` DTO is hand-redeclared in `apps/web` (and `formatDate`/`formatDateTime` duplicated across the two report pages) — established cross-boundary duplication pattern, already the norm across the app.
- `DailyReport` uses `generatedAt` while `ReportDelivery` uses `createdAt` for the same concept, and `ReportDelivery` has no `updatedAt` despite mutating on retry — minor schema-naming/consistency nit.

## Deferred from: code review of story-13.4 (2026-08-26)

- The Financial report sums `material` (SUM Purchase.totalAmount) and `expenses` (SUM Expense.amount) as independent categories per the spec. If a future integration ever populates `Expense.purchaseId` (an Expense that IS a Purchase's own cost entry — reserved but never set today, since Story 11.1 explicitly left it null with no code path to populate it), that cost would be counted in BOTH categories, double-counting it in `total`. Not a bug today (no data can have `purchaseId` set); when that integration is built, the financial report must decide whether purchase-linked Expenses are excluded from the `expenses` category to avoid the double-count. Flagged in the story's Completion Notes.
- `GET /reports/financial`'s `from`/`to` params are unvalidated (same systemic unvalidated-`@Query` class already logged) — a malformed date reaches `new Date()`/`dateRangeBounds` unguarded.

## Deferred from: code review of story-1.8 (2026-08-26) — auth security hardening

These are real security-hardening items that need config/ops decisions (env, provisioning) that don't exist yet, or are spec-permitted trade-offs; none affect correctness for the invite-only single-tenant model this story ships. Revisit when real Clerk keys + the tenant's web origin are wired.

- **`verifyToken` is called without `authorizedParties` (azp).** Clerk recommends passing the allowed frontend origin(s) so a token minted for a different origin/app can't be replayed against this API. Needs the deployment's web origin in env (e.g. `CLERK_AUTHORIZED_PARTY`), which provisioning doesn't set yet. Add `authorizedParties: [...]` to the `verifyToken` call once that env exists.
- **Session revocation isn't honored until token expiry.** Networkless `verifyToken` accepts a signed, unexpired token even after the session/user was revoked server-side. Spec-permitted (`verifyToken` OR `authenticateRequest` — implementer's choice); Clerk session tokens are short-lived so the window is small. If tighter revocation is needed, switch to `authenticateRequest`/handshake.
- **No fail-fast when `CLERK_SECRET_KEY` is unset.** A misconfigured deployment silently 401s every request. Add a startup assertion (env validation) so misconfig is loud, not a confusing all-401.
- **Web helper base-URL `?? ""` fallback.** If `API_URL`/`NEXT_PUBLIC_API_URL` is unset, the client helper would fetch a relative path against the web app's own origin (attaching the bearer token to the wrong host). Config-dependent (build passes with the env set); add a guard that the API base URL is configured.
- **First-user-→-OWNER_ADMIN provisioning is trust-on-first-use with a (very low-likelihood) concurrent race.** Two brand-new users hitting a fresh DB in the same instant could both read `count()===0` and both become `OWNER_ADMIN` (the P2002 recovery only catches same-clerkId collisions). Spec-conformant (the story prescribes first-user→OWNER_ADMIN and an invite-only Clerk instance provisioning ~2 real users). Precondition to document: the Clerk instance must be invite-only; Epic 14 Story 14.2's webhook + admin UI becomes the real role authority. Tighten with a transaction/advisory-lock if the user model ever opens up.
- `@CurrentUser()` casts `req.user as AuthUser`; on a `@Public()` route (guard skipped) it would be `undefined`. Only used on protected routes today; a defensive throw would fail louder if ever misapplied.
- source_spec: `_bmad-output/implementation-artifacts/1-9-installable-pwa.md`
  summary: Offline in-app (client-side) navigations have no offline fallback — only full-page loads fall back to /offline.
  evidence: The SW serves /offline only for `mode === "navigate"` (hard loads/reloads). App Router client navigations fetch RSC payloads (`GET /route?_rsc=…`) which are correctly NetworkOnly (Fix A) and, when offline, reject with no graceful fallback (returning /offline HTML to an RSC fetch would break Next's router). A proper fix is an app-level offline-aware error boundary, out of scope for the SW-only story. Spec-conformant: the frozen I/O matrix only promised navigate-mode fallback.
- source_spec: `_bmad-output/implementation-artifacts/1-9-installable-pwa.md`
  summary: The service-worker static-asset cache (`azentis-shell-v1`) grows unbounded across deploys — old hashed /_next/static chunks are never purged.
  evidence: `CACHE_NAME` is a fixed literal and `activate` only deletes caches with a different name, so cache-first writes from prior builds accumulate in the same store forever (no per-build version, size cap, or eviction). Low severity (browsers evict under storage pressure); a real fix needs a build-time cache-busting version injected into sw.js, which the hand-authored/no-bundler setup doesn't currently provide.

## Deferred from: code review of story-14.2 (2026-08-27)

- **Broad API-wide authorization across Epics 2–13 remains out of scope** (as the story's own Dev Notes state). Story 1.8's global ClerkAuthGuard now authenticates every route, but only the Users-admin endpoints carry an OWNER_ADMIN `@Roles()` check; the other epics' write endpoints are authenticated but not role-gated. A dedicated pass to apply `@Roles()` where FR/role rules require it is real, named follow-up — not silently folded into this story.
- **`svix` v2 is ESM-only while `apps/api` builds to CJS.** Node 22's `require(ESM)` covers it and nothing runnable regresses (the dev-server boot is separately broken per AGENTS.md), but the live Clerk→Svix webhook round-trip is unverified — no real Clerk/webhook secret exists in any environment yet. Verify the actual signed round-trip once a real Clerk instance + `CLERK_WEBHOOK_SECRET` exist.
- **`user.deleted` is a deliberate no-op** — deleting the local `User` row would break every `submittedByUserId`/`recordedByUserId` FK to the departed user's historical records. Full deprovisioning (preserve vs reassign historical authorship, disable access) is a real product decision no AC asks for; flagged as follow-up.

## Deferred from: code review of stories 14.3–14.5 (2026-08-27)

- **14.5 scheduled-report delivery is a branded notification envelope**, not a fully-rendered per-type email body — the Epic 13 report endpoint fetch runs and gates `lastRunAt` on success, but the delivered message carries the report type + date window in a header rather than a rich per-type template. Follow-up (richer per-type templates), consistent with 13.1's "senders never exercised against a real provider" posture. No real Resend/WhatsApp round-trip has run in any environment.
- `run-report-schedules` and the other reports cron routes share the same unvalidated `?date`/frequency-window date handling and UTC "today" as 13.1 — the same PO timezone decision already logged for Epic 13.

## Deferred from: code review of epic-15 stories 15.3-15.5 (2026-08-30)

- Transaction writes (DSR/consumption/expense/RMC/waste-disposal) accept a soft-deleted siteId/vendorId — UI-unreachable today (pickers filter deleted rows); revisit alongside the role-lockdown work.
- Invalid from/to query strings reach Prisma as Invalid Date and 500 instead of 400 — pre-existing dateRangeBounds pattern shared by every report endpoint; fix centrally in dateRangeBounds when touched next.
- User FK from AuditLog RESTRICTs any future hard user delete — no user-delete endpoint exists; if one is added, map P2003 to a 409 or make removal deactivate-only.
- toLocaleString without an explicit timeZone across older pages renders server-zone dates on Vercel (UTC); audit page fixed now, sweep the rest when touching those pages.
- Restore/undelete path for soft-deleted Sites/Vendors — decision 2026-08-30: accepted one-way for now (Owner-only + double-confirmed; SQL recovery). Add a 'Deleted items' restore view if mis-deletes actually occur.

## Deferred from: code review of story-16.1 (2026-08-31)

- No loading state shown during search/sort/page transitions on any of Story 16.1's converted list pages (AD-6's full loading/empty/success/error/validation-failure set) — pre-existing, app-wide: no `loading.tsx` exists anywhere in this app, so every route relies on Next's default RSC transition behavior. Not unique to this story; revisit if/when the app adds route-level loading states generally.

## Deferred from: code review of story-16.2 (2026-08-31)

- `MaterialsService.searchCandidates` filters `Material.isActive` but not the parent `MaterialCategory.isActive` — a Material whose Category has since been disabled can still surface in global search. Consistent with Story 14.3's existing precedent (disabling a Category doesn't cascade to hide its Materials elsewhere either); revisit only if that broader precedent ever changes.
- Global search's Materials matching is name-only, never Category name — a query for "Binders" returns nothing even though the result shows a Binders category. Not an AC violation (AC #1 scopes Material matching to name only) — a reasonable future enhancement.

## Deferred from: code review of story-16.3 (2026-08-31)

- `GET /stock/material/:materialId` returns `200 []` for both a nonexistent Material and a real Material with zero stock — indistinguishable at the API level. The web availability page already handles the 404 case separately, so no current consumer is affected; revisit only if a future consumer calls this endpoint directly.

## Deferred from: code review of f9c01a3..4ebea08 (2026-09-02)

- DW-CR-1: POST /purchases still accepts rate/totalAmount/paymentStatus from a SITE_SUPERVISOR — D7's pricing split is UI-enforced on the create path (PATCH is role-guarded). Server-side hardening: reject pricing fields for supervisor role in the controller.
- DW-CR-2: Money-correction sum semantics are ambiguous for Purchase: correction rows carry a positive restated totalAmount while vendor aggregates SUM totalAmount across all rows (double-count). Pre-existing; RMC was fixed to signed deltas — Purchase needs the same decision.
- DW-CR-3: Pricing an original Purchase that already has quantity-correction rows prices the gate-recorded quantity, not the net corrected quantity — the pricing page shows the original qty read-only. Semantic edge; decide whether Total should derive from net quantity.
- DW-CR-4: currentRole() folds any /users/me failure (incl. expired-session 401) into SITE_SUPERVISOR instead of redirecting to sign-in — an expired Owner silently sees the Supervisor UI. Pre-existing pattern from layout.tsx.
- DW-CR-5: OwnerDashboard's vendor-outstanding does one unbounded parallel purchase-summary fetch per Vendor — fine at current scale, needs batching/an aggregate endpoint as vendors grow. Pre-existing.
- DW-CR-6: useClientValidation only revalidates on submit — a fixed field keeps its stale inline error until resubmit; add per-field revalidation on change/blur. Also: shared schema correction messages still say "quantity delta must not be zero" — delta vocabulary the D4 UI deliberately hides.
- DW-CR-7: DsrDesktopForm's mode="new" branch is dead (its only route was deleted) — prune the mode or restore a desktop-entry caller; dead branch still carries pre-rename strings until pruned (strings fixed in review patch, pruning deferred).
- DW-CR-8: Test-quality follow-ups: assert HELP_CONTENT contextualHelp keys exist (typo = silently missing bubble); several page tests weakened to getAllByText(...).length > 0 (can't catch triplicate rendering); two advance/adjustment test names still describe the old delta UI.
- DW-CR-9: Consider explicit pricedAt/pricedByUserId columns on Purchase for first-class pricing attribution (currently derivable only from the audit log's PATCH entry).

## Deferred from: e2e test suite build-out (2026-09-02)

- DW-E2E-1: Browser console warning surfaced during real e2e runs of the Purchase-recording flow: "flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering." Fires on the Movements list after a real Purchase submission (`apps/web/app/(app)/movements/movements-list-client.tsx` or a state update it triggers, possibly via the router-refresh/flash-toast path). Did not affect functional correctness — the row still rendered correctly with the right pending badge in every observed run — but it's a real React anti-pattern warning that unit/component tests (mocked routers/fetches) would never surface, only a real browser against a real server catches it. Worth tracking down when next touching that file.

## Deferred from: code review of story-19.1 (2026-09-02)

- source_spec: `_bmad-output/implementation-artifacts/spec-19-1-advance-quick-entry-modal.md`
  summary: Dialogs across the app (the new AdvanceQuickEntryModal, plus the pre-existing ConfirmDialog used by every money form) can be dismissed via Cancel/backdrop/Escape while a submission is still pending, with no guard — a race between the in-flight request resolving and the dialog unmounting.
  evidence: Blind Hunter and Edge Case Hunter both independently flagged this on story-19.1's new modal; confirmed the identical unguarded pattern already exists in `packages/ui/src/components/confirm-dialog.tsx` and every form that uses it (AdvanceForm, PaymentForm) — not a regression unique to this story, a systemic gap worth fixing once for every dialog rather than per-story.
- source_spec: `_bmad-output/implementation-artifacts/spec-19-1-advance-quick-entry-modal.md`
  summary: `todayDate()`'s `new Date().toISOString().slice(0, 10)` reads the UTC calendar date, which shows the previous day's date for IST users in the ~5.5-hour window after UTC midnight (00:00-05:30 IST).
  evidence: Blind Hunter caught this on the new AdvanceQuickEntryModal; verified the identical implementation already exists verbatim in the pre-existing `apps/web/app/(app)/team/[id]/advances/advance-form.tsx` — a pre-existing bug this story's modal copied, not introduced. Worth a shared, IST-correct date helper.
- source_spec: `_bmad-output/implementation-artifacts/spec-19-1-advance-quick-entry-modal.md`
  summary: `ComboboxField` pickers (Team Member, Site, etc.) show the generic "No matching X" message even when the underlying list is genuinely empty (zero records exist yet), rather than a distinct "you have no X yet — add one first" empty state per AD-6.
  evidence: Blind Hunter caught this on the new modal's Team Member picker; verified the identical `emptyMessage="No matching Team Member"` already ships unchanged in the pre-existing `apps/web/app/(app)/payments/payment-form.tsx` — pre-existing across every Team Member combobox, not unique to this story.
