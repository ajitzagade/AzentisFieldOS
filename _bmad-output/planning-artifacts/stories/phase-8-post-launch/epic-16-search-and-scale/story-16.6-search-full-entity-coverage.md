---
epic: 16
story: "16.6"
phase: "8 — Post-launch Enhancements"
title: Global Search — Full Entity Coverage
---

# Story 16.6: Global Search — Full Entity Coverage

As any signed-in user,
I want global search to cover every core record type in the app, not just the 9 wired up in Stories 16.2/19.2,
So that a term I know exists — a Movement, an Advance, a piece of Machinery, an Attendance record, a Daily Report — is actually findable instead of search silently returning nothing.

## Background

Audit (2026-09-03) found search covers Site, Material, Vendor, TeamMember, Payment, Purchase, Subcontractor, RmcEntry, and Expense — 9 of roughly 20 core entity types in the app. Missing: Movement, Consumption, WasteDisposal, Advance, AdvanceAdjustment (5 of AD-9's 7 transaction-history tables have no search coverage at all — only Purchase and Payment do), Machinery, Vehicles, Site Contract, Subcontractor Work Entry, Subcontractor Payment (Epic 18, shipped but not searchable beyond the Subcontractor master record), Work Record (attendance), DSR (Daily Report), and Audit Log. This is the actual cause of "I typed something that exists but got nothing" — not a matching-logic bug (ranking, case-insensitivity, and error-isolation in the existing implementation are all already correct).

**Status: done (2026-09-03).** All 14 groups shipped, plus one entity found during implementation that wasn't in the original audit list: `ReturnWastage` (Epic 5's Site-Stock-decreasing Wastage/Return transaction, distinct from `WasteDisposal`'s Epic 15 per-trip disposal-cost ledger — same class of gap, just missed in the first pass). Total: 23 searchable entity groups (9 original + 14 new). Role-gating mechanism (deferred by Story 16.5) is now live, applied to Subcontractor Payment and Audit Log. See Completion Notes below for what deviated from this doc's original AC wording and why.

## Acceptance Criteria

**Given** I search a term matching a Movement, Consumption, WasteDisposal, Advance, or AdvanceAdjustment record
**When** results render
**Then** each appears as its own grouped result set with a "See all" option, following the exact mechanism Sites/Materials/Purchases already use — no new UI pattern

**Given** I search a term matching a Machinery or Vehicle record (by name, registration, or type)
**When** results render
**Then** it appears grouped, and selecting it lands on that asset's detail page

**Given** I search a term matching a Site Contract or Subcontractor Work Entry
**When** results render
**Then** each appears as its own group — extending today's Subcontractor-master-record-only coverage to these Epic 18 child records

**Given** I am `OWNER_ADMIN` and search a term matching a Subcontractor Payment
**When** results render
**Then** it appears grouped; given I am `SITE_SUPERVISOR`, that group never appears — enforced via Story 16.5's role-gating mechanism, matching `SubcontractorPaymentsController`'s existing class-level `@Roles('OWNER_ADMIN')` restriction (this is the one Epic 18 child record that genuinely needs gating; Site Contract and Subcontractor Work Entry do not — their own list endpoints are open to any authenticated user)

**Given** I search a term matching a Work Record (attendance) or a Daily Report
**When** results render
**Then** each appears grouped, subject to whatever visibility rules the underlying `/work-records` and `/dsr` endpoints already enforce

**Given** I am `OWNER_ADMIN` and search a term matching an Audit Log entry
**When** results render
**Then** it appears grouped; given I am `SITE_SUPERVISOR`, that group never appears — enforced via Story 16.5's role-gating, not a separate mechanism

**Given** the curated `SEARCH_ACTIONS` list
**When** this story ships
**Then** it gains one entry per newly-covered module that has a genuine flat (site/asset-agnostic) route to link to: Record Movement, Record Consumption, Record Wastage/Return, Record Waste Disposal, Add Machinery, Add Vehicle, View Attendance — same `id`/`title`/`href`/`ownerOnly` shape already used, consumed by both the Search palette and the Owner Quick Bar without a second list. **Deviation from the original AC wording, found during implementation:** Create Site Contract, Record Work Progress, and Record Subcontractor Payment/Maintenance/Fuel are deliberately NOT added — every one of those routes is nested under a specific Site or asset (`/sites/[id]/contracts/new`, `/machinery-vehicles/machinery/[id]/service-log`, etc.), so there is no flat destination for a palette action to link to without already knowing which Site/asset. They stay reachable via each entity's own detail-page actions and via search's entity results, not the Actions list.

**Given** Recently Viewed's per-type routing (4 entity types) and Global Search's own per-groupKey `handleSelect` routing
**When** this story ships
**Then** both are refactored onto one shared `entityHref(type, id)` helper instead of two independently maintained routing tables — no behavior change, removes the risk of a route rename updating one and not the other

**Given** the new entity groups added by this story
**When** tests are written
**Then** they follow the exact structure of the existing coverage in `search.service.spec.ts` (ranking, per-group error isolation) and `global-search.test.tsx` (navigation-on-select, "See all" routing)

## Completion Notes (2026-09-03)

- **14 new entities wired in**, each via its owning service's `searchCandidates()` (identical shape to the 9 existing examples): Movement, Consumption, WasteDisposal, ReturnWastage (found during implementation, not in the original audit list — see Background), Advance, AdvanceAdjustment, Machinery, Vehicle, SiteContract, SubcontractorWorkEntry, SubcontractorPayment, WorkRecord, DailySiteReport, AuditLog. A new `AuditService` (`apps/api/src/audit/audit.service.ts`) was added purely to give `search.service.ts` a `searchCandidates()` to call — `AuditController` had no service layer before (direct-Prisma controller), and duplicating that read logic wasn't worth it for one endpoint.
- **Role-gating mechanism** (deferred by Story 16.5) implemented here: `CurrentUser` threaded from `SearchController` into `SearchService.search(q, role)`, a `canSeeGatedGroup(role)` check skips the DB call entirely (not just the response) for Subcontractor Payment and Audit Log when the caller is `SITE_SUPERVISOR`.
- **Routing correctness found and fixed during implementation**: the original result-shape design for Site Contract/Work Entry/Subcontractor Payment/Advance/AdvanceAdjustment/Work Record omitted the parent IDs (`siteId`, `siteContractId`, `teamMemberId`, `advanceId`) needed to actually route to their nested detail/correct pages. Added to each `SearchResult` type and populated from data already fetched via existing Prisma `include`s — no extra queries.
- **`entityHref(type, id)`** (`apps/web/lib/entity-href.ts`) — the shared helper the AC asked for, covering the 4 entity types Recently Viewed and Search genuinely share (site, vendor, team-member, subcontractor). The other 19 groups keep their routing inline in `handleSelect`/`handleSeeAll` since their destinations are correction/pricing/nested-path logic, not a flat `base/id` shape a shared helper could express.
- **"See all" dead-button fix**: `SearchPalette` renders "See all N results" whenever `total > items.length`, regardless of whether `handleSeeAll` has a case for that group — 8 of the 14 new groups (Advances, AdvanceAdjustments, WorkRecords, SiteContracts, WorkEntries, SubcontractorPayments, DailyReports, AuditLogs) have no flat, text-searchable list page to route to. Rather than leave those as dead clicks, `handleSeeAll` routes them to the closest real, searchable destination (`/team?q=`, `/subcontractors?q=`, or an unfiltered log page) instead of silently doing nothing.
- **Indexing**: the 14 new entities' searched text columns have no `pg_trgm` index yet (only the original 9 do, per the separate perf effort noted in Story 16.5). Flagged as a known follow-up, not blocking — same reasoning as Story 16.5's indexing note: escalate only if real query volume shows it's needed.
- Verified: `pnpm typecheck` (all 5 packages), `pnpm --filter @azentisfieldos/api test` (1105/1105), `pnpm --filter @azentisfieldos/web test` (920/920), `pnpm lint` (both apps — zero new errors/warnings, pre-existing baseline unchanged), plus a dedicated `search.module.spec.ts` compiling the real Nest DI graph to catch any provider-wiring mistake unit tests with mocked constructors can't.

## References

- `apps/api/src/search/search.service.ts` — composition point; each newly-covered module's own `searchCandidates()` follows the 9 existing examples (e.g. `apps/api/src/sites/sites.service.ts:134-150`)
- `apps/api/src/search/search.module.ts` — imports for `WasteDisposalModule`, `AssetsModule`, `DsrModule`, `AuditModule`; `TeamModule`/`InventoryModule`/`SubcontractorsModule` exports extended for the newly-needed services
- `packages/shared/src/types/search-result.ts` — one result-shape interface per new entity, `SearchResponse` extended to 23 keys
- `packages/shared/src/content/help-content.ts` — `SEARCH_ACTIONS` array extended (7 new entries, see AC deviation note above)
- `apps/web/lib/entity-href.ts` (new), `apps/web/app/(app)/_components/recently-viewed-chips.tsx`, `apps/web/app/(app)/_components/global-search.tsx` (`handleSelect`/`handleSeeAll`) — routing unification + all new-group navigation
- `apps/api/src/search/search.module.spec.ts` (new) — real Nest DI graph compile, no DB required
- `apps/api/src/search/search-candidates.integration.spec.ts` (Story 16.5) — the real-DB pattern any future entity's `searchCandidates()` test should follow
- Explicitly out of scope (per audit, unchanged): site-level result scoping, fuzzy/typo-tolerant matching, trigram/full-text indexes as a blocking requirement, config-tier master data (Material Categories, Units, Employment Types, Machinery Types, Vehicle Types, Expense Categories)

### Review Findings (2026-09-03 — bmad-code-review, covering 16.5+16.6 jointly)

- [ ] [Review][Patch] (resolved decision — option 2: add `userId` filtering) Selecting an Audit Log result routes to `/settings/audit-log` unfiltered — functionally identical to "See all." Fix: add `userId` to `AuditLogSearchResult`, populate it from `AuditService.searchCandidates()`, route `handleSelect` to `/settings/audit-log?userId=<id>`. Narrows to the acting user rather than pinpointing the exact row (no row-level deep-link exists on that page) — accepted as the pragmatic fix, not full precision [`apps/web/app/(app)/_components/global-search.tsx` (`auditLogs` branch), `apps/api/src/audit/audit.service.ts`, `packages/shared/src/types/search-result.ts`]
- [ ] [Review][Patch] Machinery/Vehicle search doesn't match on asset **type**, despite this story's own AC explicitly requiring it ("by name, registration, or type"). `MachineryService.searchCandidates()` only filters `name`/`assetNumber`/`operator`; `VehicleService.searchCandidates()` only filters `number`/`driver`. Both already `include: { type: true }` but never query or rank on `type.name` — searching "Excavator" or "Tipper" returns nothing [`apps/api/src/assets/machinery.service.ts:162-183`, `apps/api/src/assets/vehicle.service.ts:157-177`]
- [ ] [Review][Patch] `handleSelect` silently does nothing (palette already closed, no navigation, no toast) if a clicked item isn't found in `data` at click time, for 6 of the new groups (`advances`, `advanceAdjustments`, `siteContracts`, `workEntries`, `subcontractorPayments`, `workRecords`). Every other branch (including the pre-existing `purchases` one) always navigates somewhere via an `if/else`; these 6 use a bare `if` with no fallback [`apps/web/app/(app)/_components/global-search.tsx:491-532`]
- [ ] [Review][Patch] `Consumption`/`WorkRecord`'s defensive `AND`-not-spread where-composition (added specifically to avoid an `OR`-key collision between the text-match filter and the DSR-supersession filter) has zero test coverage — no test would catch a regression back to the broken spread pattern the code's own comment warns against [`apps/api/src/inventory/consumption.service.ts`, `apps/api/src/team/work-records.service.ts`]
- [ ] [Review][Patch] None of the 14 new `searchCandidates()` methods has its own dedicated unit test asserting the actual Prisma `where`/`include` shape passed to `findMany`/`count` — only indirect, fully-mocked coverage via `search.service.spec.ts`, plus one integration test covering Vendor only. Breaks from the established per-module convention every one of the original 9 entities follows (e.g. `apps/api/src/vendors/vendors.service.spec.ts:269-289`) [all 14 new `*.service.ts` files under `apps/api/src/{assets,audit,dsr,inventory,subcontractors,team,waste-disposal}`]
- [ ] [Review][Patch] `DsrService.searchCandidates()` matches every Daily Report narrative field except `safetyObservations` — a safety note recorded in a Daily Report is unfindable via search, despite the method's own comment claiming "every free-text narrative field" [`apps/api/src/dsr/dsr.service.ts:593-620`]
- [ ] [Review][Patch] `supersededDsrIds()` — an unbounded scan of every corrected DSR in the tenant — is now independently recomputed 3x concurrently on every search keystroke (once each inside `DsrService`/`ConsumptionService`/`WorkRecordsService`'s new `searchCandidates()`), instead of once in `SearchService` and threaded down to the three methods that need it [`apps/api/src/search/search.service.ts` composition + the 3 services' `searchCandidates()`]
- [ ] [Review][Patch] `SearchPalette`'s default placeholder ("Search sites, materials, vendors, team, payments…") was corrected earlier the same day specifically to stop being stale relative to 9-entity coverage (`c2626d8`); this story immediately makes it stale again at 23 entities [`packages/ui/src/components/search-palette.tsx:75`]
- [ ] [Review][Patch] `ACTION_ICONS` maps both `"add-machinery"` and `"add-vehicle"` to the identical `<TruckIcon />` — visually indistinguishable solid-tile icons in the palette, unlike every other newly-added action [`apps/web/app/(app)/_components/global-search.tsx:62-63`]
- [ ] [Review][Patch] `ReturnWastageSearchResult.kind` (`RETURN` vs `WASTAGE` — semantically opposite operations) is fetched and mapped through `search.service.ts` but never rendered in the palette row (`label`/`description` use `materialName`/`siteName` only), despite the group label "Wastage / Return" implying both are possible outcomes [`apps/web/app/(app)/_components/global-search.tsx` (`returnWastages` group)]
- [ ] [Review][Patch] `packages/shared/src/types/search-result.ts`'s comment on `AuditLogSearchResult` says "22-way" fan-out; the actual composition is 23-way, matching this story's own "23 searchable entity groups" claim. Cosmetic only [`packages/shared/src/types/search-result.ts`]
- [x] [Review][Defer] 14 new entities' searched columns have no `pg_trgm` index yet, in some tension with the epic's own stated constraint ("do not add or change indexes... unless a genuinely new, currently-uncovered column is introduced"). Already disclosed as a known follow-up in this story's own Completion Notes — deferred, pre-existing tradeoff, not silently hidden. Note for whoever revisits this: the stated justification ("same reasoning as 16.5's indexing note") is imprecise — 16.5's case already had an index via a different mechanism (`pg_trgm`, commit `14bc517`); here there is genuinely no index at all yet [`apps/api/src/audit/audit.service.ts` + 13 other new `searchCandidates()` methods]
- [x] [Review][Defer] The new `search-candidates.integration.spec.ts` is gated by `describeIfDb`/`DATABASE_URL` and never runs in the actual CI pipeline (no Postgres service, no `DATABASE_URL` in `.github/workflows/ci.yml`) — the same pre-existing limitation every other `*.integration.spec.ts` in this repo already has, not introduced or worsened by this diff — deferred, pre-existing
