---
title: 'Vendor & Subcontractor detail side panel'
type: 'feature'
created: '2026-09-07'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '7cca20bd966957783eea4db5347bae4ce2fc2e24'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Clicking a Vendor or Subcontractor row navigates away to a full `/vendors/[id]`/`/subcontractors/[id]` page (the hard-reload bug that caused this is already fixed separately). The user's actual expectation is that details open in place, without leaving the list.

**Approach:** Add a new shared `DetailPanel` primitive to `packages/ui` (right-anchored sheet, same `@base-ui-components/react/dialog` primitive as `quick-add-sheet.tsx`), a new opt-in `onRowClick` prop on `DataTable` that coexists with `rowHref`, and wire the Vendor and Subcontractor list pages to open the panel — state driven by a `?vendorId=`/`?subcontractorId=` URL param, content fetched client-side via the existing `useAuthedFetch()` hook — instead of navigating. The full detail pages stay unchanged as the deep-link destination, reachable via a "View full details" link in the panel.

## Boundaries & Constraints

**Always:**
- `DetailPanel` (`packages/ui/src/components/detail-panel.tsx`) is a new, generic, presentation-only component (`children: ReactNode`, no data fetching — matches `quick-add-sheet.tsx`'s own stated precedent), built on `Dialog.Root/Portal/Backdrop/Popup`, right-anchored, backdrop + focus trap + Escape via Base UI.
- Panel open state is the URL: a new `apps/web/lib/use-detail-panel-state.ts` hook (`useDetailPanelState(paramName)`), same `router.replace` + `URLSearchParams` idiom as `use-list-query-state.ts`, returns `{ id, open(id), close() }`. Reloading or sharing `/vendors?vendorId=<id>` reopens the panel on mount.
- `DataTableProps.onRowClick?: (row: T) => void` is new and opt-in. `rowHref` is unchanged and still renders the real `Link`. When both are set, a plain primary-button click with no modifier key calls `onRowClick` and `preventDefault()`s the Link; modifier-click/middle-click still navigate via `rowHref`. Call sites that don't pass `onRowClick` are byte-for-byte unaffected.
- Panel content is fetched client-side via the existing `useAuthedFetch()` (`apps/web/lib/use-authed-fetch.ts`) calling the same `GET /vendors/:id` / `GET /subcontractors/:id` the server pages already use — no new API endpoint.
- Panel v1 shows only the header + contact/address/category fields (the same fields already in `getVendor`/`getSubcontractor`'s response) plus a "View full details →" link. It does **not** show stat tiles or the Purchase/Waste/Advance/Site-Contract history tables — those stay exclusive to the full page (too dense for a narrow panel per investigation; `DataTable`'s own history tables use `whitespace-nowrap` cells).
- Closing the panel (Escape/backdrop/close button/"View full details" click) clears the URL param.

**Ask First:** None outstanding — resolved during investigation.

**Never:**
- Never change `/vendors/[id]`/`/subcontractors/[id]`'s own content, routes, or server-side data fetching.
- Never touch the other ~9 `DataTable` call sites that use `rowHref` without `onRowClick` (deferred separately, logged in `deferred-work.md`).
- Never add a new API endpoint — reuse the existing `GET /vendors/:id`/`GET /subcontractors/:id`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Row click | Left-click a Vendor row on `/vendors` | Panel slides in from the right with that Vendor's summary; URL becomes `/vendors?vendorId=<id>`; list scroll/filters untouched | N/A |
| Modifier/middle click | Ctrl/Cmd-click or middle-click a row | Browser opens `/vendors/<id>` in a new tab via the real `href`; panel does not open | N/A |
| Direct/shared link | Load `/vendors?vendorId=<id>` directly | Panel opens on mount, same content as a click | Unknown/deleted id → panel shows a "not found" state (reuse `EmptyState`) |
| Close | Escape / backdrop / close button | Panel closes; URL reverts to `/vendors` | N/A |
| Fetch failure | Network/API error while the panel loads | Panel shows an inline error message + retry button (matches `DataTable`'s existing error-branch styling) | Retry re-fetches |
| View full details | Click the panel's "View full details" link | Navigates to `/vendors/<id>` (unchanged page); URL param cleared | N/A |

</frozen-after-approval>

## Code Map

- `packages/ui/src/components/detail-panel.tsx` -- NEW. Generic right-anchored sheet; model on `quick-add-sheet.tsx` (Dialog.Root/Portal/Backdrop/Popup, `fixed inset-x-0 bottom-0` → `fixed inset-y-0 right-0 h-full w-full max-w-md`), `{ open, onOpenChange, title, children }` props.
- `packages/ui/src/index.ts` -- add `export * from "./components/detail-panel"`.
- `packages/ui/src/components/data-table.tsx:62` (`rowHref` prop declaration) -- add sibling `onRowClick?: (row: T) => void`; desktop row `Link` (line ~306) and mobile-card `Link` (line ~183) both get a conditional `onClick` that checks `event.defaultPrevented`/modifier keys before calling it.
- `apps/web/lib/use-detail-panel-state.ts` -- NEW, model on `apps/web/lib/use-list-query-state.ts:34-107`'s `router.replace`/`URLSearchParams` idiom, single named param instead of the list q/page/sort shape.
- `apps/web/lib/use-authed-fetch.ts` -- existing, reuse as-is for the panel's client-side `GET /vendors/:id`/`GET /subcontractors/:id` call (already proven in `use-global-search.ts:28,41`).
- `apps/web/app/(app)/vendors/vendors-list-client.tsx:118` (`rowHref` on `DataTable`) -- add `onRowClick`, wire `useDetailPanelState("vendorId")`, render `DetailPanel` with fetched content.
- `apps/web/app/(app)/subcontractors/subcontractors-list-client.tsx:91` (`rowHref` on `DataTable`) -- same wiring, `useDetailPanelState("subcontractorId")`. Note: this page's own nested Site-Contracts `DataTable` (in the full detail page, `subcontractors/[id]/page.tsx:197`) is NOT part of the panel (panel v1 excludes history tables) so no nested-navigation concern here.
- `apps/web/app/(app)/vendors/[id]/page.tsx:63-70` (`getVendor`) -- reference only, for the exact field shape the panel's fetch should match; unchanged.
- `apps/web/app/(app)/subcontractors/[id]/page.tsx:86-93` (`getSubcontractor`) -- reference only, unchanged.
- `packages/ui/src/components/empty-state.tsx` -- reuse for the panel's "not found" state.

## Tasks & Acceptance

**Execution:**
- [x] `packages/ui/src/components/detail-panel.tsx` -- add `DetailPanel` component + `detail-panel.test.tsx` (open/close, Escape, backdrop click, title rendered) -- new shared primitive (AD-5)
- [x] `packages/ui/src/index.ts` -- export `DetailPanel`
- [x] `packages/ui/src/components/data-table.tsx` -- add `onRowClick` prop to both desktop and mobile-card row rendering + test cases (plain click calls it and prevents nav; modifier/middle click still navigates; call sites without `onRowClick` unaffected) -- opt-in, backward-compatible
- [x] `apps/web/lib/use-detail-panel-state.ts` -- add hook + test (open sets param, close clears it, reads initial id from URL on mount)
- [x] `apps/web/app/(app)/vendors/vendors-list-client.tsx` -- wire `onRowClick`/`useDetailPanelState("vendorId")`/`DetailPanel`, client-fetch via `useAuthedFetch()`, render loading/error/not-found/success states
- [x] `apps/web/app/(app)/subcontractors/subcontractors-list-client.tsx` -- same wiring for `subcontractorId`

**Acceptance Criteria:**
- Given the Vendors list, when a user left-clicks a row, then a right-side panel opens showing that Vendor's name/contact/address/materials with no page navigation, and the URL gains `?vendorId=<id>`.
- Given a shared `/vendors?vendorId=<id>` link, when it's opened directly, then the panel opens on load showing the same content as a click would.
- Given the panel is open, when the user presses Escape or clicks the backdrop, then the panel closes and the URL param is removed.
- Given a user ctrl/cmd-clicks a Vendor row, when the click resolves, then a new tab opens to `/vendors/<id>` and no panel opens in the current tab.
- Given the panel's fetch fails, when the error state renders, then a retry button re-fetches successfully once the network recovers.
- Given the same wiring on Subcontractors, when a row is clicked, then the equivalent panel opens for `?subcontractorId=<id>`.
- Given any of the other ~9 `DataTable` call sites that don't pass `onRowClick`, when their rows are clicked, then they navigate exactly as they did before this change.

## Design Notes

The click-interception logic on `DataTable`'s `Link` needs `event.preventDefault()` gated on: primary button (`event.button === 0`), no modifier keys (`!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey`), and `onRowClick` being defined. This is the same progressive-enhancement pattern used by GitHub/Linear-style list-to-preview UIs — the real `href` stays authoritative for accessibility, right-click, and no-JS; the panel is a client-side enhancement on top, never a replacement for the semantic link.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/ui test` -- expected: new `detail-panel.test.tsx` and updated `data-table.test.tsx` pass alongside the existing 195
- `pnpm --filter @azentisfieldos/ui typecheck` -- expected: clean
- `pnpm --filter @azentisfieldos/web test` -- expected: new `use-detail-panel-state.test.ts` passes alongside the existing 1006
- `pnpm --filter @azentisfieldos/web typecheck` -- expected: clean
- `pnpm test:e2e e2e/specs/smoke/vendors.spec.ts e2e/specs/smoke/subcontractors.spec.ts` -- expected: extend these (or add a new spec) to click a row, assert the panel opens with no navigation, then assert Escape closes it

**Manual checks:**
- Visually confirm the panel doesn't visually collide with the mobile bottom quick-bar/`QuickAddSheet` on small viewports (both are `fixed`-positioned).

## Suggested Review Order

**The panel primitive**

- New right-anchored Base UI `Dialog` sheet, the entry point for the whole feature.
  [`detail-panel.tsx:23`](../../packages/ui/src/components/detail-panel.tsx#L23)

**DataTable's click interception**

- New opt-in prop; coexists with `rowHref`, byte-for-byte unaffected when omitted.
  [`data-table.tsx:73`](../../packages/ui/src/components/data-table.tsx#L73)

- Guard logic: plain click opens the panel, modifier/middle-click still navigates via the real link.
  [`data-table.tsx:114`](../../packages/ui/src/components/data-table.tsx#L114)

- Shared modifier-key/button check, extracted so "View full details" can reuse the identical guard.
  [`is-plain-left-click.ts:7`](../../packages/ui/src/lib/is-plain-left-click.ts#L7)

**Panel state as the URL**

- `router.replace` + `URLSearchParams` idiom, matching `use-list-query-state.ts`'s own pattern.
  [`use-detail-panel-state.ts:17`](../../apps/web/lib/use-detail-panel-state.ts#L17)

- Normalizes a valueless `?vendorId=` to `null` (review fix) so the open-check and fetch-guard agree.
  [`use-detail-panel-state.ts:26`](../../apps/web/lib/use-detail-panel-state.ts#L26)

**Vendor wiring**

- Client-side fetch keyed off the panel's URL id, re-fetches on row switch.
  [`vendors-list-client.tsx:114`](../../apps/web/app/(app)/vendors/vendors-list-client.tsx#L114)

- Row click opens the panel instead of navigating.
  [`vendors-list-client.tsx:264`](../../apps/web/app/(app)/vendors/vendors-list-client.tsx#L264)

- Review fixes: encoded id in the fetch path, modifier-click-safe "View full details" close.
  [`vendors-list-client.tsx:122`](../../apps/web/app/(app)/vendors/vendors-list-client.tsx#L122)
  [`vendors-list-client.tsx:219`](../../apps/web/app/(app)/vendors/vendors-list-client.tsx#L219)

**Subcontractor wiring — identical shape to Vendor**

- Same fetch/state pattern as the Vendor side.
  [`subcontractors-list-client.tsx:88`](../../apps/web/app/(app)/subcontractors/subcontractors-list-client.tsx#L88)

- Row click and the same review fixes (encoded id, guarded close).
  [`subcontractors-list-client.tsx:246`](../../apps/web/app/(app)/subcontractors/subcontractors-list-client.tsx#L246)
  [`subcontractors-list-client.tsx:96`](../../apps/web/app/(app)/subcontractors/subcontractors-list-client.tsx#L96)
  [`subcontractors-list-client.tsx:201`](../../apps/web/app/(app)/subcontractors/subcontractors-list-client.tsx#L201)

**Unrelated e2e infrastructure fix, found investigating a flaky test**

- Four Subcontractor-family tables were missing from the e2e reset list, leaking rows across every run since Epic 18.
  [`seed.ts:80`](../../e2e/fixtures/seed.ts#L80)

**Peripherals**

- `detail-panel.test.tsx`, `data-table.test.tsx`, `is-plain-left-click.test.ts`, `use-detail-panel-state.test.ts` — unit coverage for the primitive, the click guard, and the URL-state hook.
- `vendors-list-client.test.tsx`, `subcontractors-list-client.test.tsx` — the latter newly added this review pass to close a coverage gap (Subcontractor had none).
- `e2e/specs/smoke/vendors.spec.ts`, `subcontractors.spec.ts` — new panel-open/Escape-close specs; other touched e2e specs adjust assertions for the panel replacing direct navigation.
