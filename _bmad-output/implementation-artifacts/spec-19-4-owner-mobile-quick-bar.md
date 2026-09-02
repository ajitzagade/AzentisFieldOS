---
title: 'Owner Mobile Quick-Bar (Story 19.4)'
type: 'feature'
created: '2026-09-02'
status: 'in-progress'
baseline_commit: '8d103cd5f1f8dc58d9d5c174acc1c17fea18c5e8'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-19-context.md', '{project-root}/_bmad-output/planning-artifacts/stories/phase-8-post-launch/epic-19-owner-quick-access-and-mobile-alignment/story-19.4-owner-mobile-quick-bar.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Below the `lg` breakpoint, Owners have no persistent fast-access bar the way Supervisors do (`SupervisorQuickBar`) — every action falls back to the full responsive sidebar.

**Approach:** Add an `OwnerQuickBar` mirroring `SupervisorQuickBar`'s structure exactly (fixed bottom nav, active-state convention, safe-area padding), with 5 slots: Dashboard · Sites · a center "+" Quick Add sheet · Search · More — the last three are actions, not routes, so they call existing app-shell state (`search.setOpen`, `setNavOpen`) rather than navigating.

## Boundaries & Constraints

**Always:** New `OwnerQuickBar` component in `app-shell.tsx`, structurally mirroring `SupervisorQuickBar` (`app-shell.tsx:185-213`): same `fixed inset-x-0 bottom-0 z-30 border-t border-border-hairline bg-surface-1 pb-[env(safe-area-inset-bottom)] lg:hidden` shell, same `isActive()` helper for Dashboard/Sites, same `aria-current={active ? "page" : undefined}` and color+weight (never color-alone) active styling. Gate rendering at `role === "OWNER_ADMIN"` alongside the existing `role === "SITE_SUPERVISOR"` check (both mutually exclusive, so exactly one bar ever renders). Extend the `main` bottom-padding condition (`app-shell.tsx:328`) to cover `OWNER_ADMIN` too (`pb-24 lg:pb-8`), same as Supervisor. "Search" calls the same `search.setOpen(true)` already in scope in `SidebarShell` (line 221) — no new controller instance. "More" calls the same `setNavOpen(true)` that the existing hamburger button uses (line 268-277) — opens the identical full-sidebar drawer, not a new one. "+" opens a new bottom-anchored `Dialog` (Base UI, mirroring `advance-quick-entry-modal.tsx`'s `Dialog.Root/Portal/Backdrop/Popup` skeleton, `Popup` re-styled `fixed inset-x-0 bottom-0` instead of centered) listing the same curated actions Story 19.2 introduces (`packages/shared/src/content/help-content.ts`'s curated-actions array, per spec-19-2's Code Map) — no second curated-actions list. Selecting "Record Advance" from the sheet opens 19.1's `AdvanceQuickEntryModal` (reused, not forked); every other action navigates via existing hrefs, closing the sheet first.

**Ask First:** If Story 19.2's curated-actions array is not yet present on disk when this story starts (19.2 is still `in-progress` per sprint-status.yaml), HALT and ask whether to inline a minimal duplicate list now (to be de-duplicated later) or block on 19.2 landing first.

**Never:** No new global-search controller instance. No new "full sidebar" drawer — reuse the existing one. No change to `SupervisorQuickBar` or its 4 items. No `OWNER_QUICK_BAR_ITEMS` exceeding 5 slots.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| OWNER_ADMIN below `lg` | Any screen | `OwnerQuickBar` visible: Dashboard · Sites · + · Search · More | N/A |
| Tap "+" | Sheet closed | Bottom sheet opens with 19.2's curated action list | N/A |
| Tap "Search" | Sheet/drawer closed | Global search palette opens (same instance as ⌘K) | N/A |
| Tap "More" | — | Full sidebar drawer opens (same instance as hamburger) | N/A |
| SITE_SUPERVISOR on mobile | — | `SupervisorQuickBar` renders unchanged; `OwnerQuickBar` never renders | N/A |
| Bar visible, page has a submit button near viewport bottom | Any OWNER_ADMIN page | `pb-24` keeps the button clear of the fixed bar | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/_components/app-shell.tsx:185-213` -- `SupervisorQuickBar`, the structural pattern to mirror for `OwnerQuickBar` (new function, colocated in the same file).
- `apps/web/app/(app)/_components/app-shell.tsx:216,221` -- `SidebarShell`'s local state: `navOpen`/`setNavOpen` (216) and `search = useGlobalSearchController()` (221) — both already in scope where `OwnerQuickBar` will be rendered as a sibling; pass what's needed as props exactly like `pathname` is passed to `SupervisorQuickBar`.
- `apps/web/app/(app)/_components/app-shell.tsx:328` -- `main`'s `cn(..., role === "SITE_SUPERVISOR" && "pb-24 lg:pb-8")`; extend the condition to include `OWNER_ADMIN`.
- `apps/web/app/(app)/_components/app-shell.tsx:334` -- the `role === "SITE_SUPERVISOR" ? <SupervisorQuickBar .../> : null` conditional; add the `OWNER_ADMIN` branch alongside.
- `apps/web/app/(app)/_components/app-shell.tsx:268-277` -- hamburger `onClick={() => setNavOpen(true)}`, the exact call `OwnerQuickBar`'s "More" button reuses.
- `apps/web/app/(app)/_components/app-shell.tsx:280-284` -- `GlobalSearchButton onClick={() => search.setOpen(true)}`, the exact call `OwnerQuickBar`'s "Search" button reuses.
- `apps/web/app/(app)/_components/nav-config.ts:22-26,125-130` -- `NavItem` type + `SUPERVISOR_QUICK_BAR_ITEMS`; add `OWNER_QUICK_BAR_LINKS: NavItem[]` (Dashboard `/`, Sites `/sites`) using the same type, for the two plain-link slots only.
- `packages/ui/src/components/advance-quick-entry-modal.tsx:108-165` -- `Dialog.Root/Portal/Backdrop/Popup` skeleton to restyle bottom-anchored for the new Quick Add sheet (new file, e.g. `packages/ui/src/components/quick-add-sheet.tsx`).
- `apps/web/app/(app)/_components/advance-quick-entry-trigger.tsx` -- `AdvanceQuickEntryTrigger`, reused for the sheet's "Record Advance" entry.
- `packages/shared/src/content/help-content.ts` (per spec-19-2) -- curated actions array; the Quick Add sheet's list source, not a new one.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/app/(app)/_components/nav-config.ts` -- add `OWNER_QUICK_BAR_LINKS` (Dashboard, Sites)
- [ ] `packages/ui/src/components/quick-add-sheet.tsx` -- new component: bottom-anchored `Dialog` listing 19.2's curated actions, `Record Advance` opening `AdvanceQuickEntryModal`, others navigating + closing
- [ ] `apps/web/app/(app)/_components/app-shell.tsx` -- add `OwnerQuickBar` (mirrors `SupervisorQuickBar`), render Dashboard/Sites links + "+" (opens `QuickAddSheet`) + Search (`search.setOpen(true)`) + More (`setNavOpen(true)`); gate on `role === "OWNER_ADMIN"`; extend `main`'s bottom-padding condition
- [ ] Unit tests: `OwnerQuickBar` renders 5 items with correct `aria-current`/active styling and is absent for SITE_SUPERVISOR; `QuickAddSheet` renders the curated list and routes/opens correctly per item; `app-shell` regression test confirms `SupervisorQuickBar` behavior is unchanged

**Acceptance Criteria:**
- Given OWNER_ADMIN on a screen below `lg`, when any screen renders, then a fixed bottom bar shows Dashboard · Sites · + · Search · More
- Given "+" is tapped, then the Quick Add sheet opens with the same curated action list as 19.2's palette
- Given "Search" is tapped, then 19.2's palette opens, touch-first
- Given "More" is tapped, then the full sidebar drawer opens — no capability hidden, only de-emphasized
- Given SITE_SUPERVISOR views any mobile screen, then `SupervisorQuickBar` is unchanged and `OwnerQuickBar` never renders
- Given the Owner bar is visible, then page content gets bottom padding so the bar never covers a submit button
- Given the active tab is Dashboard or Sites, then active state is shown via color + weight + `aria-current`, never color alone

## Spec Change Log

## Design Notes

`SupervisorQuickBar` items are uniform (`NavItem[]`, all plain links) — the Owner bar is not: 2 of its 5 slots are links, 3 are actions against existing app-shell state. Rather than forcing a discriminated-union item array through the same generic `.map()` renderer, `OwnerQuickBar` maps `OWNER_QUICK_BAR_LINKS` for the two link slots and renders the three action buttons explicitly inline — simpler than generalizing `NavItem` for a five-slot, non-reused widget.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/ui typecheck` -- expected: clean
- `pnpm --filter @azentisfieldos/ui test` -- expected: new `QuickAddSheet` tests pass
- `pnpm --filter @azentisfieldos/web typecheck` -- expected: clean
- `pnpm --filter @azentisfieldos/web test` -- expected: new `OwnerQuickBar` tests pass, existing `app-shell`/Supervisor tests unchanged

**Manual checks (if no CLI):**
- Sign in as Owner on a mobile viewport: confirm all 5 slots render and behave per the ACs above, and that content never sits under the bar. Sign in as Supervisor and confirm their bar is unaffected.
