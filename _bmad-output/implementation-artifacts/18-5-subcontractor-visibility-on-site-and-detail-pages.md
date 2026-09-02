# Story 18.5: Subcontractor Visibility on Site & Subcontractor Detail Pages

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin (and, for the Site-level view, Site Supervisor),
I want to open a Site and see every Subcontractor engaged there with their work and status, and open a Subcontractor and see their full history across every Site,
so that I always know who's working where, on what terms, how much work is done vs. pending, and how much is payable/paid/outstanding — without cross-referencing multiple screens.

## Acceptance Criteria

1. **Given** a Site with one or more Site Contracts, **when** I open its detail page, **then** a "Subcontractors" section lists every Site Contract for that Site — Subcontractor name, work category, status, and completed-vs-pending/payable/paid/outstanding — each row linking to the Site Contract detail page. (FR-61)
2. **Given** a Site with zero Site Contracts, **when** I open its detail page, **then** the Subcontractors section shows a clear empty state with an "Add Contractor" action, not a blank section. (AD-6)
3. **Given** a Site Contract, **when** I open its detail page (Story 18.2's shell), **then** I see its full Work Entry ledger (Story 18.3) and Payment ledger (Story 18.4), each row carrying its "Correct" action, plus computed quantity-completed-vs-pending (for rate-based contracts), amount payable, amount paid, and outstanding amount as `StatTile`s — every figure derived from ledger history, never a manually-editable field. (FR-60)
4. **Given** a Subcontractor, **when** I open its detail page (Story 18.1's shell), **then** a "Site Contracts" section lists every Site Contract that Subcontractor holds across every Site, with cumulative payable/paid/outstanding per contract — mirroring Vendor's Purchase History section. (FR-62)
5. **Given** a Subcontractor with zero Site Contracts, **when** I open its detail page, **then** the section shows a clear empty state, not a blank table. (AD-6)
6. Site Contract, Work Entry, and Subcontractor Payment events appear in the Site's existing chronological activity feed (`FeedItemType` union), tagged with their record type — extending, not duplicating, the feed introduced in Epic 2 Story 2.3. (FR-61)
7. An outstanding amount that is negative (overpaid — Story 18.4 AC #2) renders as an explicit "Advance — recovers against future work" state, never a raw negative currency figure with no explanation.

## Tasks / Subtasks

- [ ] Task 1 — Amount-payable/outstanding computation (AC: #1, #3, #4)
  - [ ] Add a pure function (co-located with `SiteContractsService`, e.g. `site-contracts.computed.ts`) computing, from a `SiteContract` row's stored fields alone (no additional queries — everything it needs is already materialized or static config):
    - `amountPayable`: `fixedAmount` when `rateType === "FIXED_COST"`; `quantityCompleted * rate` for every other rate type; `null` when the rate-type-appropriate field itself is still `null` (a Draft contract with terms not yet filled) — render as "Pending", never `₹0` (same convention as Purchase's D7 fields).
    - `outstandingAmount`: `amountPayable === null ? null : amountPayable - amountPaid` — may be negative (AC #7).
  - [ ] Have `SiteContractsService.findOne`/`.list` attach these two computed fields to every returned `SiteContract` (a response-shaping step, not a stored column — FR-60 explicitly requires these stay derived, never manually editable).
- [ ] Task 2 — `apps/api`: Site-scoped and Subcontractor-scoped contract listings (AC: #1, #4)
  - [ ] `GET /site-contracts?siteId=X` (already exists from Story 18.2 — this story is its first real consumer) — confirm the response includes the Task 1 computed fields and enough Subcontractor detail (name, id) to render without a second round-trip.
  - [ ] Add `GET /subcontractors/:id/contracts` to `SubcontractorsController`/`Service` (Story 18.1) — mirrors `GET /vendors/:id/purchases` exactly: `findOne(id)` first (404s on missing/soft-deleted), then delegates to `SiteContractsService.list({ subcontractorId: id })` rather than a second hand-written query (same "don't duplicate the read path" rule `VendorsService.purchases` follows for `PurchasesService.listByVendor`).
- [ ] Task 3 — Activity feed extension (AC: #6)
  - [ ] Extend `FeedItemType` (`packages/shared/src/types/activity-feed.ts`) with `SITE_CONTRACT`, `WORK_ENTRY`, `SUBCONTRACTOR_PAYMENT` members — same mechanical extension already done for `MACHINERY_MOVEMENT`/`VEHICLE_MOVEMENT`/`WASTE_DISPOSAL` when those epics shipped; find the feed-aggregation query behind `GET /sites/:id`'s composed feed response and add these three record types to whatever `UNION`/merge it currently performs across Purchase/Movement/Consumption/etc.
  - [ ] Add the three new entries to `apps/web/app/(app)/sites/[id]/feed-type-config.ts`'s `FEED_TYPE_CONFIG` map: `SITE_CONTRACT` (label "Contract", a neutral icon — this is a status/agreement event, not money moving, so `badgeVariant: "neutral"`), `WORK_ENTRY` (label "Work Entry", neutral — quantity, not currency), `SUBCONTRACTOR_PAYMENT` (label "Subcontractor Payment", `badgeVariant: "gold"` — money-moving, same rule Purchase/RMC/Expense/WasteDisposal already follow).
- [ ] Task 4 — `apps/web`: Site detail "Subcontractors" section (AC: #1, #2)
  - [ ] Add an independently-fetched, independently-fault-isolated section to `apps/web/app/(app)/sites/[id]/page.tsx` — follow the page's existing composition pattern exactly (a `getSiteContracts(siteId)` function alongside `getSiteStock`/`getRecentDsrs`, called inside the same `Promise.all`, catching and returning `null` on failure so this section alone degrades rather than blanking the whole page). Render as a `DataTable` (Subcontractor / Work category / Status Badge / Completed-vs-pending or Payable / Outstanding), each row linking to `/sites/[id]/contracts/[contractId]`, with an "Add Contractor" button linking to `/sites/[id]/contracts/new` (Story 18.2). Empty state (AC #2) uses the shared `EmptyState` component.
- [ ] Task 5 — `apps/web`: Site Contract detail page — ledger sections (AC: #3, #7)
  - [ ] Extend `apps/web/app/(app)/sites/[id]/contracts/[contractId]/page.tsx` (Story 18.2's terms-only shell) with:
    - Three `StatTile`s: Quantity Completed (only for non-Fixed-Cost contracts — omit entirely for Fixed Cost, don't show a meaningless "0"), Amount Payable, Outstanding Amount (rendering AC #7's overpaid state when negative).
    - A Work Entry ledger table (from `GET /subcontractor-work-entries?siteContractId=X`), each row with `CorrectAction` linking to Story 18.3's correct route, plus a "Log Work" button (hidden if contract isn't Active/non-Fixed-Cost, matching Story 18.3's own client-side rule).
    - A Payment ledger table (from `GET /subcontractor-payments?siteContractId=X`), each row with `CorrectAction`, plus a "Record Payment" button (Owner/Admin-only, matching Story 18.4's rule).
  - [ ] These two ledgers can be merged into one chronological table (sorted by `workDate`/`paidAt`) or kept as two separate sections — follow whichever composition `EXPERIENCE.md`/the mockup set (if one exists for this epic by implementation time) shows; absent a mockup, two separate labeled sections is the safer default (Work Entries and Payments are different units — trips/pipes vs. rupees — merging them into one table risks a confusing mixed-unit column).
- [ ] Task 6 — `apps/web`: Subcontractor detail page — "Site Contracts" section (AC: #4, #5)
  - [ ] Extend `apps/web/app/(app)/subcontractors/[id]/page.tsx` (Story 18.1's shell) with a "Site Contracts" `DataTable` (Site name / Work category / Status / Payable / Paid / Outstanding), each row linking to `/sites/[siteId]/contracts/[contractId]` — mirrors `vendors/[id]/page.tsx`'s Purchase History section exactly, sourced from Task 2's `GET /subcontractors/:id/contracts`. Empty state (AC #5) uses the shared `EmptyState` component, same copy pattern as Vendor's "no Purchases yet."

## Dev Notes

**This story is the payoff, not new mechanics** — every number and row it displays already exists from Stories 18.1–18.4; this story only computes two derived fields (Task 1) and composes existing reads into two detail pages plus one list section. Resist inventing any new write path here — if something looks like it needs a new mutation to make this story's UI work, that's a sign a field was missed in an earlier story, not a reason to add one here.

**Independent-section, fault-isolated composition is not optional polish — it's the established pattern for this exact page.** `apps/web/app/(app)/sites/[id]/page.tsx` already fetches "Current Stock," "Recent Daily Reports," "Recent Photos," and the Activity Feed as separate `Promise.all`-parallel, independently-null-safe sections; a broken Subcontractors section must not blank the rest of the page. Read the current file before touching it — do not restructure its existing `Promise.all` shape, add to it.

**The "no percent-complete" rule from Story 18.3 applies here too:** don't render a completion percentage or progress bar for Fixed Cost contracts — status (Draft/Active/Completed/Cancelled) is the only completion signal that type has, by design.

**Feed extension is mechanical, low-risk — but don't skip verifying the underlying feed query.** The `FeedItemType` union and `feed-type-config.ts` are the two client-visible pieces every prior epic touched when adding a feed type, but the actual data source is a server-side aggregation query behind `GET /sites/:id` that this story hasn't traced in detail — find it (likely in `apps/api/src/sites/` or a dedicated feed-aggregation service) before assuming the two client-side additions are sufficient; if that query is a hand-written `UNION ALL`-style composition per record type (matching the pattern `MACHINERY_MOVEMENT`/`WASTE_DISPOSAL` needed), this story must add three more arms to it.

**Architecture constraints in force:** AD-6 (full state set on every new section — loading/empty/error, not just success), FR-60's "never a manually-editable field" (Task 1's computed fields must never become stored, editable columns).

**Depends on Stories 18.1–18.4** (every read this story composes). **Not a prerequisite for anything else in this epic** — Story 18.6 (dashboard rollup) reads from a new dedicated summary endpoint, not from this story's detail-page work, so 18.5 and 18.6 can proceed independently once 18.1–18.4 are done.

### Project Structure Notes

- `apps/web/app/(app)/sites/[id]/page.tsx` (modified, not replaced) — Site detail page composition.
- `apps/web/app/(app)/subcontractors/[id]/page.tsx` (modified) — Subcontractor detail page from Story 18.1.
- `apps/web/app/(app)/sites/[id]/contracts/[contractId]/page.tsx` (modified) — Site Contract detail shell from Story 18.2, now filled in with ledger sections.
- `apps/web/app/(app)/sites/[id]/feed-type-config.ts` (modified) — three new `FeedItemType` config entries.
- `packages/shared/src/types/activity-feed.ts` (modified) — `FeedItemType` union extended.
- No new top-level routes — every file this story touches already exists as a shell from an earlier story in this epic, or is the pre-existing Site detail page.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-17 — Subcontractor Management] (FR-60, FR-61, FR-62)
- [Source: _bmad-output/planning-artifacts/epics/phase-9-subcontractor-management/epic-18-subcontractor-management.md]
- [Source: _bmad-output/implementation-artifacts/18-1-manage-subcontractor-records.md, 18-2-create-and-manage-site-contracts.md, 18-3-record-subcontractor-work-progress.md, 18-4-record-subcontractor-payments.md — every shell/endpoint this story composes]
- [Source: apps/web/app/(app)/sites/[id]/page.tsx — the independently-fetched, fault-isolated composition pattern this story's new section must follow]
- [Source: apps/web/app/(app)/sites/[id]/feed-type-config.ts — exact shape to extend]
- [Source: apps/web/app/(app)/vendors/[id]/page.tsx — the Purchase History section this story's Subcontractor "Site Contracts" section mirrors, including the never-render-pending-as-₹0 convention]
- [Source: apps/api/src/vendors/vendors.service.ts (`purchases`/`purchaseSummary`) — the delegate-to-existing-service, don't-duplicate-the-read-path pattern this story's `GET /subcontractors/:id/contracts` follows]
- [Source: _bmad-output/planning-artifacts/epics/phase-2-field-operations-core/epic-2-site-management.md — Story 2.3's original chronological-feed requirement this story extends]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
