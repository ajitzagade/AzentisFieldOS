---
title: 'Recently-Viewed Shortcuts (Story 19.6)'
type: 'feature'
created: '2026-09-02'
status: 'done'
baseline_commit: '8d103cd5f1f8dc58d9d5c174acc1c17fea18c5e8'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-19-context.md', '{project-root}/_bmad-output/planning-artifacts/stories/phase-8-post-launch/epic-19-owner-quick-access-and-mobile-alignment/story-19.6-recently-viewed-shortcuts.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Owners who don't open the app daily have no way to jump back to a Site/Vendor/Team Member/Subcontractor they were just looking at — they must re-navigate from scratch every session.

**Approach:** Record the last 4-6 distinct viewed records (device-local, localStorage) as each of the four detail pages mounts, and render them as a horizontally-scrolling chip row on the Dashboard, most-recent-first, generalizing the existing single-value `site-field.tsx` localStorage idiom into a small MRU list.

## Boundaries & Constraints

**Always:** New localStorage key (e.g. `azentisfieldos:recently-viewed`) storing a JSON array of `{ type: "site"|"vendor"|"team-member"|"subcontractor", id, name }`, most-recent-first, capped at 6, deduped by `type+id` (a re-view moves the entry to front, never duplicates). Reuse the try/catch-around-`window.localStorage` idiom from `site-field.tsx` (not raw unguarded calls) for private/embedded-webview safety. Each of the four Server Component detail pages mounts one new client-island component (mirroring `AdvanceQuickEntryTrigger`'s pattern inside `owner-dashboard.tsx`) that records the view on mount — no page becomes a Client Component itself. The Dashboard's chip row is a new client-island component reading the list via `useSyncExternalStore` (same SSR-safe idiom as `site-field.tsx`), rendered between the header block and the "Today" section (`owner-dashboard.tsx`, between lines 211 and 213). Sign-out clears this list — extend the existing `onSubmit={clearRememberedSite}` handler (`app-shell.tsx:166`) to also call a new `clearRecentlyViewed()`. New chip visual lives in `packages/ui` (a navigable pill: tinted icon + name + muted entity-type suffix), styled from `badge.tsx`'s `cva` pill conventions but as a `Link`, not a status label — `Badge` itself stays untouched.

**Ask First:** None.

**Never:** No server-side persistence of this list (device-local only, per the `SiteField` convention). No pinning, no manual reordering, no empty-state placeholder when the list is empty — the row simply doesn't render. No change to `Badge` or `site-field.tsx`'s own single-Site storage.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| View a Site/Vendor/Team Member/Subcontractor detail page | Any record | Added to front of the list; Dashboard's row shows it next visit | localStorage write wrapped in try/catch, silent no-op on failure |
| More than 6 viewed | List at cap | Oldest entry dropped, newest 4-6 retained | N/A |
| Click a chip | Chip present | Navigates directly to that record's detail page | N/A |
| Sign out then sign in | — | Recently-viewed row is empty | N/A |
| Zero records viewed | Fresh device/session | Row does not render — no placeholder | N/A |
| View the same record twice | Already in list | Moves to front, not duplicated | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/_components/site-field.tsx:12,20-41,81,107-118` -- `LAST_SITE_STORAGE_KEY`, `readStoredSite`/`clearRememberedSite`/write-on-change, and the `useSyncExternalStore(subscribeToStorage, readStoredSite, () => null)` SSR-safe idiom to generalize for a multi-item MRU list (new file, e.g. `apps/web/lib/recently-viewed.ts`: `recordRecentlyViewed(entry)`, `useRecentlyViewed()`, `clearRecentlyViewed()`).
- `apps/web/app/(app)/_components/advance-quick-entry-trigger.tsx` + `owner-dashboard.tsx:4,419` -- the client-island-inside-a-Server-Component pattern to mirror for both the per-detail-page "record this view" component and the Dashboard's chip row.
- `apps/web/app/(app)/sites/[id]/page.tsx:283`, `apps/web/app/(app)/vendors/[id]/page.tsx:134`, `apps/web/app/(app)/team/[id]/page.tsx:184`, `apps/web/app/(app)/subcontractors/[id]/page.tsx:105` -- all Server Components; each mounts one new `<RecordRecentlyViewed type="..." id={...} name={...} />` client component near the top.
- `apps/web/app/(app)/_components/owner-dashboard.tsx:211-213` -- insertion point for the new `<RecentlyViewedChips />` client component, between the header block and the "Today" `<h2>`.
- `apps/web/app/(app)/_components/app-shell.tsx:31,163-176` -- `onSubmit={clearRememberedSite}` on the sign-out form; extend to also call the new `clearRecentlyViewed()`.
- `packages/ui/src/components/badge.tsx:9-25` -- `cva` pill styling/icon-slot template to base a new navigable chip component on (new file, e.g. `packages/ui/src/components/entity-chip.tsx`: tinted icon tile + name + muted type suffix, rendered as a `Link`).

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/lib/recently-viewed.ts` -- new MRU-list localStorage utility (record/read/clear, dedupe-and-move-to-front, cap 6)
- [ ] `packages/ui/src/components/entity-chip.tsx` -- new navigable chip component (tinted icon + name + muted type suffix)
- [ ] New client component (e.g. `apps/web/app/(app)/_components/record-recently-viewed.tsx`) -- calls `recordRecentlyViewed()` on mount; mounted in the four detail pages
- [ ] New client component (e.g. `apps/web/app/(app)/_components/recently-viewed-chips.tsx`) -- reads the list, renders the horizontally-scrolling row of `EntityChip`s, nothing when empty; mounted in `owner-dashboard.tsx`
- [ ] `apps/web/app/(app)/_components/app-shell.tsx` -- extend sign-out `onSubmit` to also call `clearRecentlyViewed()`
- [ ] Unit tests: dedupe/move-to-front/cap-at-6 behavior in `recently-viewed.ts`; chip row renders/omits correctly; sign-out clears the list

**Acceptance Criteria:**
- Given a Site/Vendor/Team Member/Subcontractor detail page is opened, when the Dashboard is later viewed, then that record appears in the "Recently viewed" row, most-recent-first
- Given more than 6 records have been viewed, then only the most recent 4-6 are shown
- Given a chip is clicked, then the browser navigates to that record's detail page
- Given sign-out then sign-in, then the recently-viewed list is empty
- Given zero records viewed, then the row does not render
- Given the same record is viewed twice, then it moves to front rather than appearing twice

## Design Notes

`site-field.tsx`'s storage is a single raw string with an intentionally inert `subscribe` (latched at mount). The MRU list needs a real subscription so the Dashboard's chip row and a same-tab detail-page visit can both observe updates without a full reload — still `useSyncExternalStore`, but with a subscribe function that fires on the utility's own write calls (a simple internal pub-sub), not on the browser's cross-tab `storage` event alone (which never fires in the same tab that wrote it).

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/ui typecheck` -- expected: clean
- `pnpm --filter @azentisfieldos/ui test` -- expected: new `entity-chip` test passes
- `pnpm --filter @azentisfieldos/web typecheck` -- expected: clean
- `pnpm --filter @azentisfieldos/web test` -- expected: new `recently-viewed`/chip-row/detail-page tests pass, no regressions

**Manual checks (if no CLI):**
- Visit a Site, then a Vendor, then a Team Member; return to Dashboard and confirm all three appear, most-recent-first, each linking to the correct detail page. Sign out and back in; confirm the row is gone.
