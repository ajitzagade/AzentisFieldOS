---
title: 'Dashboard Quick-Actions Bar (Story 19.3)'
type: 'feature'
created: '2026-09-02'
status: 'done'
baseline_commit: '8d103cd5f1f8dc58d9d5c174acc1c17fea18c5e8'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-19-context.md', '{project-root}/_bmad-output/planning-artifacts/stories/phase-8-post-launch/epic-19-owner-quick-access-and-mobile-alignment/story-19.3-dashboard-quick-actions-bar.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Owner Dashboard's header has only one action ("New Daily Report") — Record Payment, Record Advance, Add Purchase, and Search each require navigating the sidebar first, adding avoidable click-depth to the Owner's most frequent tasks.

**Approach:** Add a quick-actions row beside "New Daily Report": Record Payment/Add Purchase as plain navigation links, Record Advance reusing 19.1's modal trigger, and a "Search ⌘K" chip that opens 19.2's existing singleton palette — following the button-group pattern already used on other list pages.

## Boundaries & Constraints

**Always:** Replace the single Link at `owner-dashboard.tsx:207-210` with a `flex flex-wrap gap-2` group (mirroring `inventory/page.tsx:122-136`), order: New Daily Report (primary, unchanged href/copy) → Record Payment (secondary Link → `/payments/new`) → `<AdvanceQuickEntryTrigger />` (reused unchanged, second mount) → Add Purchase (secondary Link → `/movements/purchases/new`) → Search chip (ghost, "Search ⌘K"). `owner-dashboard.tsx` stays a Server Component — no new server-side data fetching. The Search chip must open the one singleton palette `app-shell.tsx` already mounts via `useGlobalSearchController()` (documented "mounted ONCE per app-shell", `global-search.tsx:22-25`) — never a second independent instance. Since the Dashboard is a Server Component and can't call that hook itself, add a minimal `GlobalSearchContext` (exposes only `open: () => void`) in `global-search.tsx`, provide it from `app-shell.tsx` around its children wired to the existing controller's `setOpen`, and consume it from one new client component `dashboard-search-button.tsx`.

**Ask First:** None.

**Never:** No new backend routes/endpoints. No new Payment/Purchase form variant. No second `SearchPalette`/controller instance. No changes to the Owner mobile quick-bar (19.4, separate story) or to Supervisor Home. No new role check inside `owner-dashboard.tsx` — it is already only rendered for non-`SITE_SUPERVISOR` roles by `page.tsx`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Click Record Payment / Add Purchase | Owner on Dashboard | Navigates to `/payments/new` or `/movements/purchases/new` | N/A |
| Click Record Advance | Owner on Dashboard | 19.1's modal opens in place; Dashboard stays mounted behind it | N/A |
| Click Search chip | Owner on Dashboard | The one singleton palette opens, identical to ⌘K / sidebar button | Consumer hook throws a clear dev-time error if ever rendered outside `app-shell`'s provider (should never occur given the fixed app-router layout) |
| SITE_SUPERVISOR views landing | Role = SITE_SUPERVISOR | Bar does not render; Supervisor Home unaffected | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/_components/owner-dashboard.tsx:198-211` -- header row; swap the single "New Daily Report" Link (currently 207-210) for the five-item button group described above.
- `apps/web/app/(app)/_components/advance-quick-entry-trigger.tsx` -- `AdvanceQuickEntryTrigger` (zero-prop, self-contained), reused unchanged as "Record Advance"; already imported once for the Outstanding Advances card (owner-dashboard.tsx:4) — mount a second instance in the new header group.
- `apps/web/app/(app)/_components/global-search.tsx:10-49` -- `useGlobalSearchController()`/`GlobalSearchController`; add `GlobalSearchContext` (`{ open: () => void } | null`, default `null`) and an exported `useOpenGlobalSearch()` hook that throws if the context is `null`.
- `apps/web/app/(app)/_components/app-shell.tsx:221,350` -- `const search = useGlobalSearchController()`; wrap the existing render tree in `<GlobalSearchContext.Provider value={{ open: () => search.setOpen(true) }}>`. The existing `GlobalSearchButton` (line ~280) and `<GlobalSearchDialog controller={search} />` (line 350) usages are unaffected.
- New file `apps/web/app/(app)/_components/dashboard-search-button.tsx` -- client component: `useOpenGlobalSearch()` + a `Button variant="ghost" size="sm"` labeled "Search ⌘K"; used only from `owner-dashboard.tsx`.
- `apps/web/app/(app)/inventory/page.tsx:122-136` -- reference precedent for the `flex flex-wrap gap-2` primary+secondary button-group markup.
- `packages/ui/src/components/button.tsx:21-45` -- `buttonVariants`/`Button` variant union (`primary`/`secondary`/`ghost`/`danger`), reused unchanged.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/app/(app)/_components/global-search.tsx` -- add `GlobalSearchContext` + `useOpenGlobalSearch()` -- lets a descendant open the one singleton palette without prop drilling or a second instance
- [ ] `apps/web/app/(app)/_components/app-shell.tsx` -- provide `GlobalSearchContext`, wired to the existing controller's `setOpen` -- exposes the singleton to the Dashboard
- [ ] `apps/web/app/(app)/_components/dashboard-search-button.tsx` -- new client component: "Search ⌘K" ghost chip calling `useOpenGlobalSearch().open()`
- [ ] `apps/web/app/(app)/_components/owner-dashboard.tsx` -- render the five-item header group (New Daily Report, Record Payment, `<AdvanceQuickEntryTrigger />`, Add Purchase, `<DashboardSearchButton />`) in place of the current single Link
- [ ] Unit tests: `owner-dashboard` test asserts all five actions render with correct hrefs/labels and the SITE_SUPERVISOR path is unaffected; `dashboard-search-button` test asserts click calls the context's `open()`; `app-shell` test asserts the provider forwards to the real controller's `setOpen` (existing ⌘K/button behavior unchanged)

**Acceptance Criteria:**
- Given OWNER_ADMIN opens the Dashboard, when the header renders, then "New Daily Report" (hero-primary) plus "Record Payment," "Record Advance," "Add Purchase," and "Search" (secondary/ghost) appear in one header row
- Given "Record Payment" is clicked, then the browser navigates to `/payments/new` — no new backend behavior
- Given "Record Advance" is clicked, then 19.1's modal opens in place, without leaving the Dashboard
- Given "Add Purchase" is clicked, then the browser navigates to `/movements/purchases/new`
- Given "Search" is clicked, then 19.2's palette opens — the same singleton instance ⌘K/the sidebar button open
- Given SITE_SUPERVISOR views their landing surface, then this bar does not appear; the Supervisor Home hero/task-grid is unaffected

## Spec Change Log

## Design Notes

`useGlobalSearchController()` creates an independent state instance on every call and is documented as "mounted ONCE per app-shell" (`global-search.tsx:22-25`) — calling it again from `owner-dashboard.tsx` would spawn a second, unsynced palette, which is exactly the pattern the doc comment warns against. Because `owner-dashboard.tsx` is a Server Component and can't consume Context directly, the fix is a thin Context boundary: `app-shell.tsx` (already a Client Component, already owning the one real controller) provides `open()` downward; `dashboard-search-button.tsx` is the one new Client Component that consumes it. One controller instance app-wide is preserved at the cost of one small new file.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/web typecheck` -- expected: clean
- `pnpm --filter @azentisfieldos/web test` -- expected: `owner-dashboard`/`app-shell` tests pass, new `dashboard-search-button` test passes, no regressions

**Manual checks (if no CLI):**
- Sign in as Owner, open Dashboard: confirm all five actions render and behave per the ACs above, and that ⌘K plus the existing sidebar Search button still open the same palette (regression check on the Context wiring). Sign in as Supervisor and confirm the bar does not appear.
