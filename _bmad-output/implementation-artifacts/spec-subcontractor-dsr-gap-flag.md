---
title: 'Subcontractor DSR sync: gap-flag nudge for missing Site Contracts'
type: 'feature'
created: '2026-09-23'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '2e8a0405aab2bb20d47366158ae9195e3ad66fe0'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A Subcontractor logged via a DSR entry with no linked `SiteContract` at that Site is invisible on Site Details → Subcontractors (visibility is strictly keyed on `SiteContract` existence) — the Owner has no signal that a subcontractor is being worked with informally, with nothing to formalize.

**Approach:** A D7-shaped gap-flag on the Site Detail page (mirroring `SiteContractsController`'s existing `count/draft-pending-terms` precedent exactly): for that Site, count distinct Subcontractors named in submitted DSR `subcontractorEntries` (current/non-superseded reports) who have zero `SiteContract` rows at this Site, and surface "N Subcontractor(s) logged with no Site Contract" linking into the already-shipped `/subcontractors/[id]/contracts/new` flow. No new write logic — Subcontractor/SiteContract records are never auto-created (SiteContract's required-for-ACTIVE fields can't be safely fabricated).

## Boundaries & Constraints

**Always:**
- Scoped per-Site (computed from that Site's own current DSRs) — not a global scan, mirrors how the Site Detail page already reads Site-scoped data.
- Reads only `subcontractorEntries` from current (non-superseded) submitted DSRs for the Site — mirrors `listByDate`'s existing "current version" filtering.
- Links into the existing `/subcontractors/[id]/contracts/new` flow (Subcontractor pre-fixed, Site picked) — zero new write logic.

**Ask First:** None — confirmed with the user: gap-flag nudge only, no new DRAFT-visibility tier.

**Never:**
- Never auto-create a `Subcontractor` or `SiteContract` from this gap-flag — informational only.
- Don't add a new "DRAFT-level visibility" tier to Site Details → Subcontractors — explicitly ruled out.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| No gap | Every DSR-logged Subcontractor at this Site has a SiteContract | Gap-flag doesn't render | N/A |
| One gap | One Subcontractor logged via DSR, no SiteContract at this Site | "1 Subcontractor logged with no Site Contract", links to contract-creation | N/A |
| Multiple gaps | 3 such Subcontractors | "3 Subcontractors logged with no Site Contract" | N/A |
| Subcontractor already has a contract elsewhere but not this Site | Contract exists at a different Site | Still counted as a gap (Site-scoped) | N/A |

</frozen-after-approval>

## Completion Notes (2026-09-24)

- Gap computation lives in a new standalone function `getSiteSubcontractorGap(prisma, siteId)` (`apps/api/src/sites/site-subcontractor-gap.ts`), a sibling to `site-material-activity.ts`/`site-activity-feed.ts` rather than inline in `sites.service.ts` — same standalone-function-plus-thin-service-wrapper pattern those two already use. It reuses `SUBMITTED_DSR_WHERE`/`supersededDsrIds()` from `apps/api/src/common/superseded-dsrs.ts` (the same "current version only" helper `dsr.service.ts`'s `listAllSubmitted` uses) rather than re-deriving the fetch-then-filter logic by hand.
- Route is `GET /sites/:id/subcontractors/gap-count` (nested under `:id`, same shape as the existing `:id/photos`), open to both roles (no `@Roles()` override needed — `RolesGuard` is already a no-op without one, matching `findOne`/`getPhotos` on this controller). Returns `{ count, subcontractorIds }` — ids are needed so the web page's single gap-flag action can deep-link into `/subcontractors/[id]/contracts/new` for a specific Subcontractor (first id in the returned, first-encountered order) rather than a generic list page.
- The web nudge on `apps/web/app/(app)/sites/[id]/page.tsx` is gated to `viewerRole === "OWNER_ADMIN"`, mirroring the existing "Add Subcontractor" gating in the same section — only that role can act on the deep link (`POST /site-contracts` is Owner/Admin-only), so a Supervisor never sees a nudge that would 403 on click. This gating isn't explicitly called out in the frozen Intent/spec matrix, but follows this page's own established precedent directly above it.
- No changes needed to `/subcontractors/[id]/contracts/new` itself — it already pre-fixes the Subcontractor and lets the Owner pick the Site, exactly as the Intent describes.

## Code Map

- `apps/api/src/subcontractors/site-contracts.controller.ts:66-71` -- reference precedent (`count/draft-pending-terms`) to mirror exactly.
- `apps/api/src/sites/` (site-scoped service, likely `sites.service.ts` or a new `site-subcontractor-gap.ts` sibling to `site-material-activity.ts`) -- new method: fetch current submitted DSRs for the Site, extract distinct `subcontractorId`s from `subcontractorEntries`, subtract those with an existing `SiteContract` at this Site, return count (+ ids for the link target).
- `apps/api/src/sites/sites.controller.ts` -- new `@Get(':id/subcontractors/gap-count')`-style route (or nested under the existing Site detail response).
- `apps/web/app/(app)/sites/[id]/page.tsx:443-478` -- add the gap-flag nudge near the existing Subcontractors `DataTable`, mirroring the Owner Dashboard's `draftPendingTermsCount` nudge rendering pattern.
- Tests: new service method's unit test (gap computation correctness), controller test, web rendering test.

## Tasks & Acceptance

**Execution:**
- [x] New service method -- computes the per-Site gap count (+ subcontractor ids for the deep link)
- [x] New controller route
- [x] `sites/[id]/page.tsx` -- render the nudge, linking to `/subcontractors/[id]/contracts/new`
- [x] Extend tests per Code Map

**Acceptance Criteria:**
- Given a Site with a DSR-logged Subcontractor that has no SiteContract there, when the Site Detail page loads, then the gap-flag renders with the correct count and links to contract creation.
- Given every DSR-logged Subcontractor at a Site already has a SiteContract there, when the page loads, then no gap-flag renders.

## Spec Change Log

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/api test`, `pnpm --filter @azentisfieldos/web test`, `pnpm typecheck` -- expected: all pass
- Run 2026-09-24: `apps/api` full suite (1332 passed), scoped `apps/web` `sites/[id]/page.test.tsx` (14 passed), `pnpm --filter @azentisfieldos/api typecheck` and `pnpm --filter @azentisfieldos/web typecheck` both clean, `eslint` on every touched file clean (after `--fix` for two prettier-only formatting nits in the new `site-subcontractor-gap.ts`/`.spec.ts` files). Did not run the full monorepo `pnpm test`/`pnpm lint` since two sibling agents have concurrent uncommitted work in unrelated files (`apps/api/src/inventory/*`, DSR/labour-payments form files) — scoped runs avoid picking up their in-flight state.

**Manual checks (if no CLI):**
- Log a Subcontractor via a DSR at a Site with no existing SiteContract there; confirm the Site Detail page shows the gap-flag and the link leads to a pre-filled contract-creation form for that Subcontractor.
