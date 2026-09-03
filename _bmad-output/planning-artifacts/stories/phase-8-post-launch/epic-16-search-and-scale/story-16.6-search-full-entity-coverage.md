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
**Then** it gains entries for the newly-covered modules with a natural create/record action (Record Movement, Record Consumption, Record Wastage, Add Machinery, Add Vehicle, Record Maintenance, Create Site Contract, Record Work Progress, Record Subcontractor Payment, View Attendance) — same `id`/`title`/`href`/`ownerOnly` shape already used, consumed by both the Search palette and the Owner Quick Bar without a second list

**Given** Recently Viewed's per-type routing (4 entity types) and Global Search's own per-groupKey `handleSelect` routing
**When** this story ships
**Then** both are refactored onto one shared `entityHref(type, id)` helper instead of two independently maintained routing tables — no behavior change, removes the risk of a route rename updating one and not the other

**Given** the new entity groups added by this story
**When** tests are written
**Then** they follow the exact structure of the existing coverage in `search.service.spec.ts` (ranking, per-group error isolation) and `global-search.test.tsx` (navigation-on-select, "See all" routing)

## References

- `apps/api/src/search/search.service.ts` — composition point; each newly-covered module gets its own `searchCandidates()` following the 9 existing examples (e.g. `apps/api/src/sites/sites.service.ts:134-150`)
- Module list endpoints to extend: `movements.controller.ts`, `consumption.controller.ts`, `waste-disposal.controller.ts`, `advances.controller.ts`, `advance-adjustments`, `machinery.controller.ts`, `vehicle.controller.ts`, `site-contracts.controller.ts`, `subcontractor-work-entries`, `subcontractor-payments.controller.ts`, `work-records.controller.ts`, `dsr.controller.ts`, `audit.controller.ts`
- `packages/shared/src/content/help-content.ts` — `SEARCH_ACTIONS` array to extend
- `apps/web/lib/recently-viewed.ts`, `apps/web/app/(app)/_components/global-search.tsx` (`handleSelect`) — routing unification
- Depends on Story 16.5 for the role-gating mechanism Audit Log and any owner-only new groups need
- Audit findings, this conversation (2026-09-03)
- Explicitly out of scope (per audit): site-level result scoping (no such concept exists anywhere in the app today — a separate feature, not a search fix), fuzzy/typo-tolerant matching beyond existing case-insensitive substring matching, trigram/full-text indexes (standard `@@index` from Story 16.5 is the minimal fix; escalate only if post-launch volume shows it's needed), and config-tier master data (Material Categories, Units, Employment Types, Machinery Types, Vehicle Types, Expense Categories) — these are reachable via their parent entity's existing "manage" screens today; add them only if real usage shows users trying to search for them directly
