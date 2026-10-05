---
title: 'Inventory list: click the row/card to open Material details, not just the name'
type: 'feature'
created: '2026-10-05'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '070784c81b0736daea5b1d0c88d02f209e141f9f'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** On `/inventory`, only the Material name text is a link to `/materials/[id]/availability`. Desktop users must click that exact word; on mobile (card view) the material name isn't a link at all, so there is currently no way to open details from the card.

**Approach:** Use `DataTable`'s existing `rowHref` prop (already the established pattern on Sites/Vendors/Team/etc.) on the Inventory table so every column cell on desktop, and the whole card on mobile, opens `/materials/[id]/availability`. Drop the Material column's hand-rolled `<Link>` in favor of plain text, matching how every other `rowHref`-driven list renders its primary-identifier column (e.g. `sites-list-client.tsx`, `vendors-list-client.tsx`).

## Boundaries & Constraints

**Always:**
- Change only `apps/web/app/(app)/inventory/inventory-list-client.tsx`. Do not touch `packages/ui`'s `DataTable` — `rowHref`/mobile-card-click already exists and is used unmodified.
- Keep the destination exactly `/materials/${row.materialId}/availability` (same as today).
- Material column's cell becomes plain markup (no `next/link` import), styled `font-semibold` with the existing `(sizeLabel)` suffix — same convention as `sites-list-client.tsx`'s `Site` column and `vendors-list-client.tsx`'s `Vendor` column.
- Remove the now-unused `import Link from "next/link";` from this file only if nothing else in the file still uses `Link`.

**Never:**
- Do not add `onRowClick`, custom `onClick`, or `cursor-pointer` styling — `rowHref` alone is the sanctioned mechanism (see the design comment at the top of `data-table.tsx`).
- Do not modify any other list page (Reports' inventory tab, `/materials` catalog, etc.) — out of scope.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Desktop row click | User clicks any cell in a Material row (not just the name) | Navigates to `/materials/[materialId]/availability` | N/A |
| Mobile card tap | User taps anywhere on the stacked card below `md` breakpoint | Navigates to `/materials/[materialId]/availability` | N/A |
| Sortable header click | User clicks the "Material" or "Available Qty" column header | Still triggers `onSortChange`, does not navigate | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/inventory/inventory-list-client.tsx` -- the only file to change. Add `rowHref={(row) => \`/materials/${row.materialId}/availability\`}` to the `<DataTable>` call (~line 218); change the `Material` column's `cell` (~lines 71-80) from a manual `<Link>` to a plain `<span className="font-semibold">`; remove the now-unused `import Link from "next/link"` (line 3) once that's the only remaining use.
- `packages/ui/src/components/data-table.tsx` -- read-only reference. `rowHref` already wraps every non-empty-header, non-`disableRowLink` column's `<td>` content in its own `<Link>` on desktop (lines ~341-377), and already stretches a single `<Link>` across the whole mobile card when `rowHref` is set (lines ~211-236). No edits needed here.
- `apps/web/app/(app)/sites/sites-list-client.tsx` (line 59) and `apps/web/app/(app)/vendors/vendors-list-client.tsx` (line 26) -- precedent for rendering a `rowHref`-driven primary column as plain `<span className="font-semibold">`, no manual `Link`.
- `apps/web/app/(app)/inventory/inventory-list-client.test.tsx` -- existing test `"links a Material's name to its /materials/[id]/availability page"` (line 94) asserts a link with accessible name starting `Cement (OPC 53 Grade)` and `href="/materials/mat-1/availability"` exists; this keeps passing unchanged since the cell's rendered text is unchanged and `rowHref` now supplies the anchor. No test changes required for this spec's scope.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/app/(app)/inventory/inventory-list-client.tsx` -- add `rowHref` to `<DataTable>`, replace Material column's `<Link>` cell with plain `<span className="font-semibold">`, drop the unused `Link` import -- makes the whole desktop row and whole mobile card clickable via the existing, already-shared `DataTable` mechanism, with zero changes to the shared component.

**Acceptance Criteria:**
- Given the Inventory table on desktop, when a user clicks any cell in a Material row (Location, Qty, Unit, Last Updated — not just the name), then the browser navigates to `/materials/[materialId]/availability`.
- Given the Inventory list on a mobile (`<md`) viewport, when a user taps anywhere on a Material's card, then the browser navigates to `/materials/[materialId]/availability`.
- Given the "Material" or "Available Qty" column header, when a user clicks it, then it still sorts (calls `onSortChange`) and does not navigate.
- Given `pnpm --filter @azentisfieldos/web test` scoped to the inventory tests, all existing `inventory-list-client.test.tsx` and `page.test.tsx` assertions still pass unmodified.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/web test -- inventory` -- expected: all existing Inventory tests pass with no edits to the test files.
- `pnpm --filter @azentisfieldos/web typecheck` -- expected: no errors (confirms the removed `Link` import doesn't leave an unused-import or type error).
- `pnpm --filter @azentisfieldos/web lint` -- expected: no new errors (confirms no unused-import lint failure from removing `next/link`).

**Manual checks (if no CLI):**
- Load `/inventory` in a browser at desktop width: hover shows pointer cursor across the full row, clicking a non-name cell (e.g. "Available Qty") navigates to the material's availability page.
- Resize to a mobile width (`<768px`): the Material list renders as cards; tapping anywhere on a card (not just the title text) navigates to the same page.

## Suggested Review Order

- Wires the whole row/card to the existing `DataTable` row-link mechanism instead of a single cell-level link.
  [`inventory-list-client.tsx:217`](../../apps/web/app/(app)/inventory/inventory-list-client.tsx#L217)

- Material cell drops its own `<Link>` now that `rowHref` supplies navigation for every cell, matching Sites/Vendors' plain-span convention.
  [`inventory-list-client.tsx:71`](../../apps/web/app/(app)/inventory/inventory-list-client.tsx#L71)

- Now-unused `next/link` import removed.
  [`inventory-list-client.tsx:1`](../../apps/web/app/(app)/inventory/inventory-list-client.tsx#L1)
