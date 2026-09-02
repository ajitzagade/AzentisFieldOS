---
title: 'Global Search & Action Palette (Story 19.2)'
type: 'feature'
created: '2026-09-02'
status: 'done'
baseline_commit: '8d103cd5f1f8dc58d9d5c174acc1c17fea18c5e8'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-19-context.md', '{project-root}/_bmad-output/planning-artifacts/stories/phase-8-post-launch/epic-19-owner-quick-access-and-mobile-alignment/story-19.2-global-search-and-action-palette.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The `⌘K` palette only covers Sites and Materials, so Owners can't jump to a Vendor, Team Member, Payment, Purchase, Subcontractor, RMC entry, or Expense, and have no fast path to common actions.

**Approach:** Extend the palette to all seven remaining entity types via the same grouped/"See all" mechanism, and add a curated, plain-text-matched "Actions" group above entity results that opens a quick-entry flow or navigates to a target page.

## Boundaries & Constraints

**Always:** One `searchCandidates()` per new entity service (mirror `sites.service.ts:134-150`), fanned into `search.service.ts`'s `Promise.allSettled`/`rankByQuery`/`INLINE_LIMIT`. Actions matching is plain `.includes()` on title/keywords, mirroring `help/page.tsx:20-29`. Routing: "New Daily Report"→`/dsr/new`; "Add X"→X's `.../new`; "Open Reports"/"Settings"→`/reports`/`/settings`; "Review & Price"→`/movements?type=PURCHASE` (19.5 later replaces this; don't build that tab here). Entity select: Vendor `/vendors/[id]`, Team Member `/team/[id]`, Subcontractor `/subcontractors/[id]`; Payment/RMC/Expense→`.../[id]/correct` (no detail page exists); Purchase→`.../pricing` if `totalAmount` is `null`, else `.../correct`.

**Ask First:** None.

**Never:** No new backend writes or detail pages — navigation only. No fuzzy/AI matching. No change to Sites/Materials. No 19.5 pricing tab, 19.3 dashboard bar, or 19.4 mobile entry point.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Entity query match | Query matches one of the 7 new types | Own grouped result set + "See all", same as Sites/Materials | N/A |
| Action + entity both match | Query matches both | Actions group renders above entity groups | N/A |
| Select "Record Advance" / "Record Payment" | Action item chosen | Advance opens 19.1's modal in place; Payment navigates to `/payments/new` | N/A |
| Purchase pricing branch | Selected Purchase, `totalAmount` null | Routes to `pricing`, not `correct` | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/_components/global-search.tsx:70-91,93-110` -- `groups` array + `handleSelect`/`handleSeeAll` chains; add a group+branch per new entity plus an `"actions"` branch. `use-global-search.ts` needs the matching type extension.
- `packages/shared/src/types/search-result.ts` -- add 7 result interfaces + `SearchResponse` keys.
- `apps/api/src/search/search.service.ts` -- inject 7 new services into the existing fan-out; extend response.
- `apps/api/src/sites/sites.service.ts:134-150` -- `searchCandidates()` pattern to replicate per new entity service (Vendors, TeamMembers, Payments, Purchases, Subcontractors, Rmc, Expenses); `rank-by-query.ts` reused unchanged.
- `packages/ui/src/components/search-palette.tsx:17-43,146-191` -- add an explicit `icon`/`tone: "tinted" | "solid"` field (per `DESIGN.md`'s `accent-teal-100`/`accent-teal-700`; don't infer tone from `groupKey`) and an action-item variant with no "See all".
- `packages/ui/src/components/advance-quick-entry-modal.tsx` (reused unchanged: `open`/`onOpenChange`/`teamMembers`/`action`/`onSuccess`) + `apps/web/app/(app)/_components/advance-quick-entry-trigger.tsx` (reference wiring: on-open fetch, action bind, toast+refresh) for opening the same modal from the palette.
- `apps/web/app/(app)/help/page.tsx:20-29` -- `.includes()` pattern to replicate; add the static curated-actions array to `packages/shared/src/content/help-content.ts` alongside `HELP_CONTENT`.

## Tasks & Acceptance

**Execution:**
- [x] `packages/shared/src/types/search-result.ts` -- add 7 result types + extend `SearchResponse`
- [x] `apps/api/src/{vendors,team,payments,purchases,subcontractors,rmc,expenses}/*.service.ts` -- add `searchCandidates(query)` mirroring `sites.service.ts:134-150`
- [x] `apps/api/src/search/search.service.ts` -- fan out to the 7 new services, extend response
- [x] `packages/ui/src/components/search-palette.tsx` -- icon-tile rendering (tinted/solid) + no-"See all" action variant
- [x] `apps/web/app/(app)/_components/global-search.tsx` + `apps/web/lib/use-global-search.ts` -- 7 entity groups, curated Actions group/matching, routing/modal logic per Boundaries
- [x] Unit tests: new `searchCandidates()` methods, `SearchService` fan-out incl. a failure case, `global-search.tsx` routing (incl. Purchase pricing branch) and Actions matching

**Acceptance Criteria:**
- Given a query matches a Vendor/Team Member/Payment/Purchase/Subcontractor/RMC entry/Expense, then each appears in its own grouped set with "See all", same mechanism as Sites/Materials, and existing Sites/Materials groups/ranking/routing are unchanged
- Given a query matches both an action and an entity, then Actions renders above entity groups
- Given "Record Advance" is selected, then 19.1's modal opens with no navigation; given "Record Payment", then the browser navigates to `/payments/new`
- Given an entity result is selected, then the browser navigates to its resolved detail route, including the Purchase pricing/correct branch

## Verification

**Commands:**
- `pnpm typecheck` (root, Turborepo-scoped) -- expected: all clean
- `pnpm --filter @azentisfieldos/api test && pnpm --filter @azentisfieldos/ui test && pnpm --filter @azentisfieldos/web test` -- expected: new tests pass, no regressions

**Manual checks (if no CLI):**
- As Owner, `⌘K` a known Vendor, Team Member, and a pending-pricing Purchase — each renders in its own group, Purchase lands on `pricing`. Type "advance", select "Record Advance" — modal opens without navigating away.
