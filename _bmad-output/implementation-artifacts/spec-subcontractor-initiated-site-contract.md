---
title: 'Add Site Contract entry point from the Subcontractor detail page'
type: 'feature'
created: '2026-09-03'
status: 'in-review'
review_loop_iteration: 0
context: []
baseline_commit: '67696afeed90926d706bd957988b4f61e2ca9f72'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A Site Contract (engaging a Subcontractor at a Site) can only be started from the Site's own detail page — the Subcontractor detail page shows a read-only "Site Contracts" table with no way to start a new one, forcing the user to know and navigate to the right Site first.

**Approach:** Add a second entry point, `/subcontractors/[id]/contracts/new`, reached via a new "+ Add Site Contract" button on the Subcontractor detail page. It reuses the exact same `SiteContractForm` component and `createSiteContractAction` the Site-initiated flow already uses — only the orientation of which side is fixed vs. picked flips (Subcontractor fixed, Site picked via a searchable combobox, instead of Site fixed, Subcontractor picked).

## Boundaries & Constraints

**Always:** Reuse `createSiteContractAction`/`parseCreateSiteContractForm`/`createSiteContractSchema` unchanged — no second action, no second schema. The existing Site-initiated flow (`/sites/[id]/contracts/new`) and Edit flow keep working exactly as before, pixel-for-pixel. The server-side `OWNER_ADMIN`-only creation gate is already enforced by the shared action (403 → `formError`) — no new gating logic needed. On success, land wherever `createSiteContractAction` already redirects (`/sites/${siteId}`) — the newly-engaged Site's page, unchanged action behavior.

**Ask First:** None — mechanical: generalize `SiteContractForm`'s existing "fixed Subcontractor, disabled + hidden input" pattern (already used in `mode="edit"`) to also apply when a Subcontractor-initiated caller passes a fixed `subcontractorId`, and add a parallel "fixed Site vs. pickable Site" branch using the existing `SiteField`-equivalent combobox pattern.

**Never:** Don't fork `SiteContractForm` into two components. Don't add a new Server Action or duplicate validation. Don't change Site Contract's underlying schema or DB shape — this is purely a second UI entry point into the same creation flow.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Subcontractor detail page, click "+ Add Site Contract" | Any Subcontractor | Navigates to `/subcontractors/:id/contracts/new`; Subcontractor shown fixed/disabled, Site is a required searchable combobox | N/A |
| Submit with a Site picked | Valid Site + terms | Same `createSiteContractAction` runs; on success redirects to that Site's page, flash shows "Site Contract added" | N/A |
| Submit with no Site picked | Site field empty | Same client + server validation as today (`siteId` required) blocks submit | Same `{errors}` shape as the Site-initiated flow |
| Non-Owner/Admin submits | Any valid input | Same 403 → `formError` ("Only an Owner/Admin can engage a Subcontractor") as today | Unchanged existing handling |
| Site-initiated flow still works | `/sites/[id]/contracts/new` unchanged | Renders exactly as before — fixed Site, pickable Subcontractor | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/sites/[id]/contracts/site-contract-form.tsx` -- generalize props: `siteId`/`subcontractors` become optional (today's site-initiated shape), add optional `subcontractorId`/`sites: SiteOption[]` (new subcontractor-initiated shape). When `siteId` is set → today's behavior unchanged (hidden Site input, pickable Subcontractor combobox). When `siteId` is unset and `subcontractorId` is set → render a `sites`-driven `ComboboxField` for Site (required, mirrors the existing Subcontractor combobox markup/hidden-input pattern at lines 90-105) and render the Subcontractor as a fixed label + hidden input (mirroring the existing `mode==="edit"` disabled-Subcontractor branch at line 94/102, generalized to also fire when `subcontractorId` prop is passed regardless of `mode`).
- `apps/web/app/(app)/sites/[id]/contracts/new/page.tsx` -- unchanged (already passes `siteId`+`subcontractors`, matches the "site-initiated" branch by construction)
- NEW `apps/web/app/(app)/subcontractors/[id]/contracts/new/page.tsx` -- Server Component: fetch the Subcontractor (404 if missing, reuse the existing `getSubcontractor` pattern from `subcontractors/[id]/page.tsx`) and all Sites (`GET /sites`, same shape `SiteField`'s callers already fetch elsewhere, e.g. any page listing all Sites for a picker), render `<SiteContractForm mode="new" subcontractorId={subcontractor.id} sites={sites} action={createSiteContractAction} />` (import `createSiteContractAction` from `../../../sites/[id]/contracts/new/actions` — same action, no new file)
- `apps/web/app/(app)/subcontractors/[id]/page.tsx:117-135` -- add a "+ Add Site Contract" `Link` (`buttonVariants({variant:"secondary", size:"sm"})`, `PlusIcon`) next to the existing "Site Contracts" section header (mirrors the exact pattern at `sites/[id]/page.tsx:466-475`'s "Add Subcontractor" button), `href={`/subcontractors/${subcontractor.id}/contracts/new`}`
- `apps/web/app/(app)/sites/[id]/contracts/new/actions.ts` -- unchanged; confirmed it redirects to `/sites/${siteId}?flash=...` reading `siteId` from the submitted FormData (works identically regardless of which side was fixed vs. picked)
- `packages/shared/src/schemas/site-contract.ts` (`createSiteContractSchema`) -- unchanged; already requires both `siteId` and `subcontractorId`

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/app/(app)/sites/[id]/contracts/site-contract-form.tsx` -- generalize props/rendering per Code Map (optional `siteId`/`subcontractors`, new optional `subcontractorId`/`sites`) -- single reused form, no fork
- [x] `apps/web/app/(app)/subcontractors/[id]/contracts/new/page.tsx` -- new page wiring the reused form + action in the flipped orientation
- [x] `apps/web/app/(app)/subcontractors/[id]/page.tsx` -- add the "+ Add Site Contract" entry-point button
- [x] Update `apps/web/app/(app)/sites/[id]/contracts/site-contract-form.test.tsx` -- add cases for the new subcontractor-fixed/site-picked orientation (Site required+enabled, Subcontractor shown fixed/disabled); keep all existing site-fixed-orientation cases passing unchanged
- [x] New `apps/web/app/(app)/subcontractors/[id]/contracts/new/page.test.tsx` (or extend an existing subcontractor-detail test) -- covers the button navigates to the new route and the new page renders with the Subcontractor pre-fixed

**Acceptance Criteria:**
- Given the Subcontractor detail page, when the user clicks "+ Add Site Contract", then they land on a form with that Subcontractor fixed and a required Site picker.
- Given a Site Contract created from the Subcontractor page, when it succeeds, then it appears in that Subcontractor's own Site Contracts table (same underlying record, no new list wiring needed since the table already reads live from the API).
- Given the existing `/sites/[id]/contracts/new` and edit flows, when used exactly as before, then their rendered output and behavior are unchanged.

## Design Notes

`SiteContractForm` already special-cases a "fixed, non-reassignable" Subcontractor for `mode==="edit"` (disabled combobox + hidden input carrying the id). This spec generalizes that same visual/markup pattern to fire whenever a fixed `subcontractorId` prop is passed — not only in edit mode — so the "new, but Subcontractor already fixed" case (this feature) reuses it rather than inventing a third rendering path.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/web test` -- all existing + new tests pass
- `pnpm --filter @azentisfieldos/web typecheck` -- no errors
- `pnpm --filter @azentisfieldos/web lint` -- no new errors

**Manual checks:**
- Dev server: from a Subcontractor's detail page, click "+ Add Site Contract", pick a Site, submit — confirm it lands on that Site's page with the new Subcontractor showing, and that Subcontractor's own detail page now lists this new Site Contract.
