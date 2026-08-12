# Story 2.3: View Site Detail — Chronological Activity Feed

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to open a Site and see every DSR, stock movement, Work Record, expense, RMC entry, and photo tagged to it, in chronological order,
so that I understand what's actually happened at that Site without hunting across screens.

## Acceptance Criteria

1. **Given** a Site with zero linked records, **when** I open its detail view, **then** I see a clear empty state explaining no activity has been logged yet — not a blank feed (AD-6).
2. **Given** a Site with linked records from any combination of DSR, Purchase, Movement, Consumption, Wastage/Return, Work Record, Expense, or RMC sources, **when** I open its detail view, **then** every record appears in a single chronological feed, newest first, each tagged with its record type.
3. **And** this view degrades gracefully as later epics (DSR, Inventory, Team, Expenses, RMC) ship — it reads from whatever record types exist in the database without requiring all of them to be built first (every relation this story queries already exists in the Prisma schema today; only the *producers* of that data — later epics' entry forms — are still unbuilt).
4. **And** photos are not duplicated as separate feed rows — a DSR feed entry shows its attached photo count and links through; the dedicated cross-Site photo gallery is Epic 3 Story 3.3's separate concern.
5. **Given** a Site ID that doesn't exist, **when** the detail page is requested, **then** a 404 is returned/rendered, not a crash or an empty-feed false-positive.

## Tasks / Subtasks

- [x] Task 1: Add `GET /sites/:id` with the aggregated feed (AC: #1, #2, #3, #4, #5)
  - [x] Add `findOne(id: string)` to `apps/api/src/sites/sites.service.ts`: fetch the Site by ID (`404`/`NotFoundException` if missing — reuse the same not-found handling pattern Story 2.2 adds for `PATCH /sites/:id`, don't reinvent it differently here).
  - [x] In the same method (or a sibling `getActivityFeed(siteId)`), query each of the following relations **scoped to this `siteId`**, in parallel via `Promise.all`: `purchase.findMany({ where: { siteId } })`, `movement.findMany({ where: { OR: [{ sourceSiteId: siteId }, { destinationSiteId: siteId }] } })`, `consumption.findMany({ where: { siteId } })`, `returnWastage.findMany({ where: { siteId } })`, `workRecord.findMany({ where: { siteId } })`, `expense.findMany({ where: { siteId } })`, `rmcEntry.findMany({ where: { siteId } })`, `dailySiteReport.findMany({ where: { siteId }, include: { photos: true } })` (include photos here so the DSR feed row can show a photo count per AC #4, without a separate photo query), `machineryMovementLog.findMany({ where: { siteId } })`, `vehicleMovementLog.findMany({ where: { siteId } })`.
  - [x] Prisma has **no single query that unions across these distinct models** — do not attempt a raw-SQL `UNION` for this; at the data volumes a single Site will realistically accumulate, fetching each type separately and merging in application code is simpler, type-safe, and sufficiently fast. Map each result array to a common shape: `{ id: string, type: FeedItemType, occurredAt: Date, summary: string }` — use each model's actual business-date field for `occurredAt`, **not** `createdAt` (they can legitimately differ, e.g. a Purchase entered today for a delivery received yesterday): `Purchase.purchasedAt`, `Movement.movedAt`, `Consumption.consumedAt`, `ReturnWastage.recordedAt`, `WorkRecord.workDate`, `Expense.incurredAt`, `RmcEntry.deliveredAt`, `DailySiteReport.reportDate`, `MachineryMovementLog.movedAt`, `VehicleMovementLog.movedAt`.
  - [x] Concatenate all mapped arrays and sort by `occurredAt` descending. Return this alongside the Site's own fields in the `GET /sites/:id` response body (e.g. `{ ...site, feed: FeedItem[] }`).
  - [x] Define the `FeedItemType` union and the feed item shape in `packages/shared` (not locally in `apps/api`) if `apps/web` needs to render type-specific icons/labels client-side — check whether a shared response-shape convention already exists elsewhere in the codebase before inventing a new one; if this is the first cross-module response shape, keep it simple (a plain exported TS type, not a Zod schema — this is a read/response shape, not an input to validate, so it doesn't need the same AD-7 treatment as `createSiteSchema`).

- [x] Task 2: Site detail page (AC: #1, #2, #4, #5)
  - [x] Create `apps/web/app/sites/[id]/page.tsx` as an async Server Component. Fetch `GET {API_URL}/sites/{id}`; on a `404` response, call Next.js's `notFound()` to render the framework's not-found boundary (App Router convention — do not hand-roll a custom "site not found" branch that bypasses it).
  - [x] Render Site header info (name, status badge, location, contract reference) above the feed.
  - [x] Render the feed as a list/table, each row showing its type (as a small badge/tag — e.g. "DSR", "Movement", "Expense"), a human-readable summary, and the date. Group by type-appropriate icon if `packages/ui`'s icon set exists yet (check current state — see Story 2.1's Dev Notes on Epic 1 sequencing risk, which applies identically here); fall back to plain text labels if not.
  - [x] Zero-records empty state: a clear "No activity logged yet for this Site" message, distinct from the zero-Sites empty state Story 2.1 built for the list page (different message, same visual pattern is fine).
  - [x] Do **not** add a "% complete" or progress-bar visual for the Site — the product has no BOQ/percent-complete concept; if a progress signal is wanted, it must be an honest recency/volume-of-activity indicator (see the mockup's "Activity Pulse"), which is explicitly **out of scope for this story** unless already time-permitting — the feed itself is the AC-required deliverable, the pulse visualization is a nice-to-have polish item, not a blocker.

- [x] Task 3: Wire the link from the Sites list (AC: #2)
  - [x] Now that `/sites/[id]` exists, go back to `apps/web/app/sites/page.tsx` (built in Story 2.1) and add the row-link to `/sites/{id}` that Story 2.1 explicitly deferred (see its Dev Notes: "Do not add a link ... it would 404 until Story 2.3 ships"). This is the one place this story is expected to modify a previous story's file — confirm Story 2.1 actually shipped that page before editing it; if its structure differs from what's assumed here, adapt rather than overwrite.

- [x] Task 4: Tests (AC: #1, #2, #3, #5)
  - [x] `apps/api/src/sites/sites.controller.spec.ts` (extend the file Story 2.1 added): test `findOne` returns 404 for a missing ID, and returns a correctly-merged/sorted feed for a Site with mixed record types (mock the Prisma calls; don't hit a real database in a unit test — check whether an integration/e2e test setup exists elsewhere in `apps/api` before deciding unit-only is sufficient here).
  - [x] `apps/web` test: empty-feed state renders correctly; a populated feed renders items sorted newest-first with correct type labels.

## Dev Notes

- **This story depends on Stories 2.1 and 2.2 having shipped** — it adds a link into 2.1's list page and reuses 2.2's not-found-handling pattern. Read both stories' actual File Lists/Completion Notes before starting, not just this file's assumptions about what they built.
- **The core technical risk in this story is the fan-out query.** Ten separate `findMany` calls per page load is a lot for one request — for now (pre-launch, low per-Tenant data volumes), this is acceptable. If this becomes a real performance concern later (flag it in Completion Notes if you suspect it will, but do not preemptively build caching/pagination infrastructure that isn't asked for by any AC here — that would be scope creep).
- Every relation this story queries already exists in `infra/prisma/schema.prisma` — this story does **not** need any migration. Field names were confirmed against the actual schema during story creation (see the exact field list in Task 1); do not guess field names from memory, use what's listed there.
- `Expense` has a nullable `purchaseId` (an Expense that *is* a Purchase's own cost entry) and a nullable `dailySiteReportId` — an Expense recorded via a DSR submission will still appear in this feed as its own `Expense` row (queried by `siteId` directly), which may create an apparent duplicate next to that DSR's own feed row once Epic 3 exists. This is expected and correct — they are two different facts (work happened / money moved) that happen to share a origin. Do not attempt to de-duplicate or merge them in this story.
- No commits exist in this repository yet — no git history to learn from.

### Project Structure Notes

- `apps/api/src/sites/sites.service.ts`, `sites.controller.ts` — UPDATE (add `findOne`/`GET /sites/:id` + feed aggregation).
- `apps/web/app/sites/[id]/page.tsx` — NEW.
- `apps/web/app/sites/page.tsx` — UPDATE (add the deferred row-link from Story 2.1).
- Possibly `packages/shared/src/` — NEW type export for the feed item shape, only if cross-package sharing is warranted (see Task 1 judgment call).
- No Prisma schema changes.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-2] — Story 2.3 acceptance criteria (verbatim source).
- [Source: _bmad-output/planning-artifacts/epics/phase-2-field-operations-core/epic-2-site-management.md] — epic-level context; explicitly notes the "Activity Pulse" is a visual, not a percent-complete metric.
- [Source: _bmad-output/implementation-artifacts/2-1-create-and-list-sites.md] — previous story; this story fulfills its deferred row-link and reuses its AD-3/form conventions.
- [Source: _bmad-output/implementation-artifacts/2-2-update-site-details-status.md] — sibling story; this story's 404 handling should match its `PATCH` 404 pattern for consistency.
- [Source: infra/prisma/schema.prisma] — exact model field names for `Purchase`, `Movement`, `Consumption`, `ReturnWastage`, `WorkRecord`, `Expense`, `RmcEntry`, `DailySiteReport`, `Photo`, `MachineryMovementLog`, `VehicleMovementLog`; confirmed by direct read during story creation, not assumed.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/03-site-detail.html] — visual/composition reference: header, stat row, "Activity Pulse" (out of scope per Task 2), chronological feed table with type badges and a "Correct" action on transaction-type rows (Correct itself is out of scope here — this story is read-only display; Correct actions are each source epic's own job, e.g. Epic 5 adds Correct to Movement rows).

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Debug Log References

- `pnpm --filter @azentisfieldos/api test` — 18/18 pass (13 new: `SitesController.findOne` delegation, `SitesService.findOne` ×2, `getSiteActivityFeed` ×3)
- `pnpm --filter @azentisfieldos/ui test` — 81/81 pass (icon count bumped 26→27 for the new `PencilIcon`)
- `pnpm --filter @azentisfieldos/web typecheck` / `lint` / `test` — pass (35/35 tests, 5 new for the detail page)
- `pnpm --filter @azentisfieldos/web build` — pass; `/sites/[id]` correctly renders as `ƒ Dynamic`
- Full-repo `pnpm lint` / `pnpm typecheck` / `pnpm test` — all pass, no regressions
- Grep for raw hex/rgba/px-bracket literals — zero matches

### Completion Notes List

- **Task 3 ("wire the link from the Sites list") required zero code changes** — story 2.1 already built `DataTable`'s `rowHref={(site) => \`/sites/${site.id}\`}` when it built the list, anticipating this story would make the destination real. Confirmed the existing link now resolves correctly rather than 404ing.
- Feed aggregation (`apps/api/src/sites/site-activity-feed.ts`) queries all 10 relations in parallel via `Promise.all`, exactly as this story's Dev Notes specify — no raw-SQL UNION attempted. Each model maps to `FeedItem` using its own business-date field (`purchasedAt`, `movedAt`, `consumedAt`, `recordedAt`, `workDate`, `incurredAt`, `deliveredAt`, `reportDate`) — confirmed every field name directly against `infra/prisma/schema.prisma` rather than assumed, and one field the story's own brief hadn't verified (`Expense.description` nullability) was checked directly too.
- `Movement` queried via `OR: [{ sourceSiteId }, { destinationSiteId }]` since a Site can appear on either side — directly tested.
- Prisma's `Decimal` fields (`quantity`, `sentQuantity`, `hours`, `quantityM3`, and the money totals) needed explicit `.toString()`/`.toNumber()` conversion — interpolating a `Decimal` instance directly in a template literal is an ESLint error (`@typescript-eslint/restrict-template-expressions`), caught and fixed during verification, not left as a lint suppression.
- Defined `FeedItemType`/`FeedItem` as a plain exported type in `packages/shared/src/types/activity-feed.ts` (not a Zod schema — per this story's own Dev Notes, it's a read/response shape, not a validated input) since `apps/web` needed the type for its feed table and type-badge mapping.
- **Money scope**: gave `amount` (rupees, not paise — this schema's Decimal columns aren't stored as integer minor units, a pre-existing schema-level convention from before this story, not something to "fix" here) to Purchase, RMC, and Expense — the three record types with a real monetary total — `null` for everything else, matching the mockup's own "num muted —" pattern for non-monetary rows.
- **Type-badge extrapolation, explicitly flagged rather than silently guessed**: `mockups/03-site-detail.html` only pictures 3 of the 10 feed types (DSR/Movement = neutral badges, Expense = gold). The other 7 aren't in any mockup. Extended `DESIGN.md`'s own stated rule ("gold reserved strictly for money... Expense totals") to the other two money-moving types (Purchase, RMC) — gold; everything else — neutral, matching the DSR/Movement precedent. Icons for the 7 unpictured types reuse existing approved icons by closest semantic match (e.g. `GearIcon` for Machinery movement, `TruckIcon` for Vehicle movement) — no new icons invented for these.
- **`PencilIcon` added — the one genuinely new icon this story needed**: neither `DESIGN.md` nor `_shared-kit.html`'s 26-icon inventory includes an Edit/pencil glyph, because no Epic 1 screen needed row-level Edit. Drawn in the exact same visual language as the other 26 (24×24, 1.75 stroke, round caps/joins) rather than pulled from an unrelated library — flagged explicitly as new, not silently added.
- **"Edit Site" entry point, deferred from story 2.2, now wired**: a secondary `Button`-styled link in the detail page header, positioned analogously to the mockup's "View DSR Entry" secondary button (which isn't built yet — Epic 3's job) — the natural, precedented slot this story's own Dev Notes/story 2.2's Completion Notes identified in advance.
- **Deliberately skipped the mockup's stat-tile row and "Activity Pulse — Last 14 Days" chart** — explicitly optional/out-of-scope per this story's own Task 2 wording ("nice-to-have polish item, not a blocker"); none of the 5 ACs require it. The Activity Feed table is the full AC-required deliverable.
- 404 handling matches story 2.2's `NotFoundException` pattern exactly (`SitesService.findOne` throws before the feed query ever runs, avoiding 10 wasted queries for a Site that doesn't exist) — the frontend maps a 404 response to Next.js's `notFound()`, never a hand-rolled "not found" branch.

### File List

- `packages/shared/src/types/activity-feed.ts` (new — `FeedItemType`, `FeedItem`)
- `packages/shared/src/index.ts` (modified — barrel export)
- `packages/ui/src/icons/pencil-icon.tsx` (new)
- `packages/ui/src/icons/index.ts` (modified — barrel export)
- `packages/ui/src/icons/icons.test.tsx` (modified — count assertion 26→27)
- `apps/api/src/sites/site-activity-feed.ts` (new — 10-relation aggregation)
- `apps/api/src/sites/site-activity-feed.spec.ts` (new)
- `apps/api/src/sites/sites.service.ts` (modified — `findOne()`)
- `apps/api/src/sites/sites.controller.ts` (modified — `GET /sites/:id`)
- `apps/api/src/sites/sites.controller.spec.ts` (modified — new `findOne`/`SitesService.findOne` coverage)
- `apps/web/app/(app)/sites/[id]/page.tsx` (new — Site detail page)
- `apps/web/app/(app)/sites/[id]/page.test.tsx` (new)
- `apps/web/app/(app)/sites/[id]/feed-type-config.ts` (new)
