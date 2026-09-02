---
title: 'Mobile Card Lists for Sites, Vendors, Team & Labour, Inventory (Story 19.8)'
type: 'feature'
created: '2026-09-02'
status: 'in-review'
baseline_commit: '8d103cd5f1f8dc58d9d5c174acc1c17fea18c5e8'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-19-context.md', '{project-root}/_bmad-output/planning-artifacts/stories/phase-8-post-launch/epic-19-owner-quick-access-and-mobile-alignment/story-19.8-mobile-card-lists-for-remaining-tables.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Sites, Vendors, Team & Labour, and both Inventory stock tables still render as horizontal-scroll-only tables on phones (Location/Phone/Employment Type/Qty columns clip at 390px).

**Approach:** Wire the existing `DataTable` `mobileCard` prop onto these four call sites, following the exact `primary`/`omitHeaders`/`action` pattern already proven on Payments/RMC/Expenses/Movements/Waste — no new table component.

## Boundaries & Constraints

**Always:** Reuse `DataTableMobileCard<T>` (`primary`, `omitHeaders?`, `action?`, `footer?`) unchanged — no new prop, no `fields` array invented. Sites/Vendors/Team already pass `rowHref` and have no desktop action column, so their `mobileCard` config needs only `primary` + `omitHeaders`; the existing `rowHref` alone makes the whole card a stretched link, identical to today's whole-row-clickable desktop behavior — do not add an `action` affordance that duplicates it. Inventory's two tables have neither `rowHref` nor an action column today — their `mobileCard` config is `primary`/`omitHeaders` only; do not introduce new navigation as part of this story. `omitHeaders` always excludes exactly the column(s) folded into `primary`, never the clipping column itself (Location/Phone/Employment Type/Qty must remain visible as a normal label/value row on the card — they were never meant to disappear, only to stop being squeezed into a fixed-width table cell).

**Ask First:** None.

**Never:** No new `DataTable` component or prop. No change to desktop (`md`+) rendering — `mobileCard` only affects the success-state row rendering below `md`. No change to loading/empty/error states (AD-6) — they render from the shared `state` object already, untouched by `mobileCard`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Sites/Vendors/Team list below `md` | Rows present | Each row renders as a card: name as primary line (whole card links via existing `rowHref`), remaining columns (incl. the previously-clipping one) as label/value rows | N/A |
| Inventory Godown/Site Stock below `md` | Rows present | Each row renders as a card: Material (Site Stock: Material · Site) as primary line, Qty and remaining columns as label/value rows; no click target added | N/A |
| Any of the four at/above `md` | — | Full table renders exactly as today | N/A |
| List empty/loading/error | — | Existing shared state components render, unaffected by `mobileCard` | N/A |

</frozen-after-approval>

## Code Map

- `packages/ui/src/components/data-table.tsx:32-48,69` -- `DataTableMobileCard<T>` interface (`primary`, `omitHeaders?`, `action?`, `footer?`); reused unchanged.
- `apps/web/app/(app)/payments/payments-list-client.tsx:100-116,148` -- reference `mobileCard` const + `mobileCard={mobileCard}` wiring pattern to mirror (this one also shows the `action` shape, not needed here since these four have no action column).
- `apps/web/app/(app)/sites/sites-list-client.tsx:57-85,106-138` -- columns (`Site`, `Location` [clips], `Status`, `Report today`, `Contract ref`); `rowHref={(site) => \`/sites/${site.id}\`}` at line 109. Add `mobileCard = { primary: (s) => s.name, omitHeaders: ["Site"] }`.
- `apps/web/app/(app)/vendors/vendors-list-client.tsx:24-78,108-140` -- columns (`Vendor`, `Contact person`, `Phone` [clips], `Materials / services supplied`, `Total purchase (this year)`, `Payment status`); `rowHref` at line 111. Add `mobileCard = { primary: (v) => v.name, omitHeaders: ["Vendor"] }`.
- `apps/web/app/(app)/team/team-members-list-client.tsx:9-42,72-104` -- columns (`Name`, `Role / Designation`, `Employment Type` [clips], `Today's Attendance`, `Current / Last Site`); `rowHref` at line 75. Add `mobileCard = { primary: (t) => t.name, omitHeaders: ["Name"] }`.
- `apps/web/app/(app)/inventory/page.tsx:97-105,186-194` -- Godown Stock columns (`Material`, `Size / Spec`, `Unit`, `Qty on Hand` [clips]), no `rowHref`. Add `mobileCard = { primary: (r) => r.material, omitHeaders: ["Material"] }`.
- `apps/web/app/(app)/inventory/page.tsx:107-111,195-203` -- Site Stock columns (`Site`, `Material`, `Qty` [clips]), no `rowHref`. Add `mobileCard = { primary: (r) => <>{r.material} <span className="text-ink-500">· {r.site}</span></>, omitHeaders: ["Site", "Material"] }`.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/app/(app)/sites/sites-list-client.tsx` -- add `mobileCard` config, wire `mobileCard={mobileCard}` onto `<DataTable>`
- [ ] `apps/web/app/(app)/vendors/vendors-list-client.tsx` -- add `mobileCard` config, wire onto `<DataTable>`
- [ ] `apps/web/app/(app)/team/team-members-list-client.tsx` -- add `mobileCard` config, wire onto `<DataTable>`
- [ ] `apps/web/app/(app)/inventory/page.tsx` -- add two `mobileCard` configs (Godown Stock, Site Stock), wire each onto its own `<DataTable>`
- [ ] Unit tests: for each of the four files, assert the previously-clipping column's value still renders (as a card label/value row) below `md`, and that desktop `md`+ table rendering is unchanged

**Acceptance Criteria:**
- Given the Sites list, Vendors list, Team & Labour roster, or either Inventory stock table on a screen below `md`, when the list renders, then each row appears as a card — key facts first, the previously-clipping column visible as a normal row
- Given the same four lists at or above `md`, when the list renders, then the full table renders as today
- Given any of these four lists at 390px width, when viewed, then no column is clipped and no horizontal scrolling is required
- Given this reuses `mobileCard`, when implemented, then no new table component exists — only config at these four call sites
- Given a list is empty or in an error/loading state, when `mobileCard` is active, then the existing AD-6 state components still render correctly

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/web typecheck` -- expected: clean
- `pnpm --filter @azentisfieldos/web test` -- expected: updated tests for all four files pass, no regressions

**Manual checks (if no CLI):**
- At 390px width, view Sites, Vendors, Team & Labour, and both Inventory tables: confirm cards render with no clipped/hidden data and no horizontal scroll; confirm Site/Vendor/Team cards still navigate to detail pages via the card tap target. Widen to desktop and confirm tables are visually unchanged.
