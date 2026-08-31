---
baseline_commit: f712ede0bf1670bbe54676c0dcbc7330419c06c7
---

# Story 16.4: Navigation & Information Architecture Regroup

Status: done

## Story

As any signed-in user,
I want the sidebar grouped by what I'm trying to do (Stock, People, Money) instead of by raw entity name, with Search visible at the top,
so that I can find the right screen without already knowing which of 14 flat items it happens to be filed under.

## Acceptance Criteria

1. **Given** the current sidebar (14 entity-shaped items across 4 groups plus 3 ungrouped, with Vendors/RMC/Expenses under "Assets" and a single-item "Insights" group), **when** this story ships, **then** the groups become: Dashboard · Sites · Daily Activity (unchanged, ungrouped) — **Stock**: Inventory, Movements, Materials — **People**: Team & Labour, Payments — **Money**: Vendors, Expenses, RMC — **Machinery & Vehicles** — **Reports** — **Settings** (Owner/Admin only, unchanged).
2. **Given** this is a relabel/regroup only, **when** the change ships, **then** no page routes, components, or permissions change — every existing link still points at the exact same page it does today.
3. **Given** a Site Supervisor's sidebar (a subset of the same shell), **when** this story ships, **then** the same grouping applies to whichever items they see today — this story does not change what a Supervisor can or cannot access.
4. **Given** Story 16.2's global search control, **when** the sidebar renders, **then** search is visible near the top of the shell, above the grouped nav items.

## Tasks / Subtasks

- [x] Task 1: Regroup `nav-config.ts` (AC: #1, #2, #3)
  - [x] Rewrote `NAV_GROUPS` in `apps/web/app/(app)/_components/nav-config.ts`: renamed "Materials" → **Stock** (Inventory, Movements, Materials, plus Waste & Disposal per the resolved gap below); kept **People** exactly as-is (Team & Labour, Payments); split the old "Assets" group into **Money** (Vendors, Expenses, RMC) and a promoted, single-item **Machinery & Vehicles** group; renamed "Insights" → **Reports** (still the single Reports item). Every `href`/`icon`/`label` on every `NavItem` is byte-identical to before — only each `NavGroup`'s own `label` and which group an item sits under changed.
  - [x] **Resolved gap**: neither the epic's AC text nor the source review (`product-ux-review-2026-08-29.md` Appendix A) mentions the `/waste-disposal` nav item — it shipped in Epic 15 (Story 15.1), after that review was written. Placed in **Stock** (last item) rather than silently dropped, which would have violated AC #2.
  - [x] `UNGROUPED_NAV_ITEMS` and `SETTINGS_NAV_ITEM` untouched. `app-shell.tsx` required zero code changes — confirmed by making no edits to it at all in this story.
- [x] Task 2: Update existing tests for the new labels (AC: #1, #3)
  - [x] `app-shell.test.tsx`'s `"renders the full grouped sidebar for OWNER_ADMIN"` test updated to the new labels: `Stock`, `People` (unchanged), `Money`, `Machinery & Vehicles`, `Reports` — the "appears twice" assertion moved to `Machinery & Vehicles` and `Reports` (each now both a group label and its own single item's label), `Materials` now asserted to appear exactly once. Also added an explicit link assertion for `Waste & Disposal` (the resolved-gap item).
  - [x] The SITE_SUPERVISOR test's `getAllByText("Materials").length).toBeGreaterThan(0)` assertion still holds under the new grouping (count is now 1, still `> 0`) — left as-is since its actual intent (the shared shell renders for Supervisors too) is unaffected.
  - [x] Confirmed via repo-wide `grep` that no other test file references "Assets" or "Insights".
- [x] Task 3: Verify global search's position (AC: #4)
  - [x] Added one new test asserting DOM order via `compareDocumentPosition`: the desktop rail's Search button precedes the "Stock" group label in the document — confirms Story 16.2's existing placement (immediately after the brand mark, before `UNGROUPED_NAV_ITEMS`/`NAV_GROUPS`) still satisfies AC #4 after the regroup, with a red test now in place to catch a future regression. No new production code was needed for this AC.
- [x] Task 4: Regression & test coverage (AC: all)
  - [x] Full root `pnpm typecheck` — all 4 packages clean. Full root `pnpm test` — 827 API (56 skipped) + 686 web + 143 UI, all passing. Full root `pnpm lint` — confirmed via `diff` against Story 16.3's lint run that the flagged-file list is byte-identical; this story touches zero `apps/api` files, so the baseline is untouched by construction.
  - [x] Confirmed via `git diff` on `nav-config.ts` that every `NavItem`'s `href`/`icon`/`label` is byte-identical to before this story — only `NavGroup.label` values and which array each item lives in changed. Settings/PWA/Sign-out/mobile-drawer tests in `app-shell.test.tsx` all pass unchanged (this story only touched the one "grouped sidebar" test's label assertions plus one new test).

### Review Findings

- [x] [Review][Patch] `Movements` and `Waste & Disposal` both use `ArrowsIcon` and now sit in the same "Stock" group — the icon collision pre-dates this story (both already used `ArrowsIcon` in their old, separate groups) but this regroup makes it visually adjacent and noticeable for the first time. Give one of them a distinct icon [apps/web/app/(app)/_components/nav-config.ts].

## Dev Notes

- **This is the smallest story in Epic 16 by design** — the source review explicitly scoped it as "change grouping/labels only — no page rewrites." Do not touch `app-shell.tsx`'s rendering logic, any route file, any permission check, or any icon/href — the entire diff should be inside `nav-config.ts` plus the two test files it invalidates.
- **AD-5/AD-11 unaffected**: no new UI primitive, no new role/permission logic. `SETTINGS_NAV_ITEM`'s existing Owner/Admin-only gating (in `app-shell.tsx`, unchanged) is untouched.
- **The Waste & Disposal placement is a judgment call, not a spec requirement** — flagged explicitly above (Task 1) rather than silently resolved, since the epic's own planning artifacts have a genuine gap here (the nav item postdates the source review). If product feedback later disagrees with the Stock placement, this is a one-line change in `nav-config.ts`.
- **Backward compatibility**: every `NavItem.href` is preserved exactly — this task is a pure regroup/relabel of `NavGroup.label` and which array an item lives in, never a URL change. AC #2 makes this an explicit, testable constraint (Task 4's before/after href snapshot).

### Project Structure Notes

- `apps/web/app/(app)/_components/nav-config.ts` — the only file with a substantive change.
- `apps/web/app/(app)/_components/app-shell.test.tsx` — two existing tests updated for the new group labels.

### References

- [Source: `_bmad-output/planning-artifacts/stories/phase-8-post-launch/epic-16-search-and-scale/story-16.4-navigation-information-architecture.md`] — original planning story.
- [Source: `_bmad-output/reviews/product-ux-review-2026-08-29.md` Appendix A] — the proposed IA this story implements verbatim (Dashboard/Sites/Daily Activity unchanged; Stock/People/Money/Machinery & Vehicles/Reports/Settings), and the source of the Waste & Disposal gap noted above (that item isn't mentioned anywhere in the review's proposed IA — it shipped later, in Epic 15).
- [Source: `apps/web/app/(app)/_components/nav-config.ts`] — current `NAV_GROUPS`/`UNGROUPED_NAV_ITEMS`/`SETTINGS_NAV_ITEM`, read completely before Task 1.
- [Source: `apps/web/app/(app)/_components/app-shell.tsx`] — confirmed it renders `nav-config.ts`'s exports generically (no group-name-specific logic), and that Story 16.2's `<GlobalSearchButton>` already mounts before `UNGROUPED_NAV_ITEMS`/`NAV_GROUPS` inside `SidebarNav`.
- [Source: `apps/web/app/(app)/_components/app-shell.test.tsx`] — the two tests this story must update (hardcoded old group labels).

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Regrouped `NAV_GROUPS` per the 2026-08-29 product review's proposed IA: Stock (Inventory, Movements, Materials, Waste & Disposal), People (unchanged), Money (Vendors, Expenses, RMC), a promoted single-item Machinery & Vehicles group, and Reports (renamed from Insights). Every `href`/`icon`/`label` is byte-identical to before — confirmed via `git diff` — this is purely a regroup/relabel.
- Resolved a genuine gap in the source planning artifacts: the `/waste-disposal` nav item (added in Epic 15, after the 2026-08-29 review was written) isn't mentioned anywhere in that review's proposed IA. Placed it in Stock rather than silently dropping it from the sidebar, which would have violated this story's own AC #2.
- `app-shell.tsx` required zero code changes — it already renders `nav-config.ts`'s exports generically. The entire diff is `nav-config.ts` plus two updated/new assertions in `app-shell.test.tsx`.
- Added an explicit DOM-order regression test (`compareDocumentPosition`) proving the global search control (Story 16.2) still renders above every grouped nav item after the regroup, satisfying AC #4 with a red test now in place for future changes.
- Full regression sweep clean: root `pnpm typecheck` (4/4 packages), `pnpm test` (827 API / 686 web / 143 UI, all passing), `pnpm lint` (byte-identical to Story 16.3's baseline — this story touches no `apps/api` files).
- Stayed local-only per standing instruction — no deploy/push performed as part of this story.

### File List

**Modified files:**
- `apps/web/app/(app)/_components/nav-config.ts` — regrouped `NAV_GROUPS`
- `apps/web/app/(app)/_components/app-shell.test.tsx` — updated labels in the existing OWNER_ADMIN sidebar test, added the search-position regression test
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- **2026-08-31 — sidebar regrouped by task, not entity name.** `NAV_GROUPS` reorganized into Stock/People/Money/Machinery & Vehicles/Reports per the 2026-08-29 product review's proposed IA, replacing the old Materials/People/Assets/Insights grouping. Every route, component, and permission is unchanged — this is a config-data-only relabel/regroup. The `/waste-disposal` nav item (which postdates the source review) was placed in Stock rather than dropped. Global search (Story 16.2) remains visible above every grouped item, now with an explicit regression test.