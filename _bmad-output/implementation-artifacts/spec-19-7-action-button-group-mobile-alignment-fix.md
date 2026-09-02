---
title: 'Action-Button Group Mobile Alignment Fix (Story 19.7)'
type: 'bugfix'
created: '2026-09-02'
status: 'done'
baseline_commit: '8d103cd5f1f8dc58d9d5c174acc1c17fea18c5e8'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-19-context.md', '{project-root}/_bmad-output/planning-artifacts/stories/phase-8-post-launch/epic-19-owner-quick-access-and-mobile-alignment/story-19.7-action-button-group-mobile-alignment-fix.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 14 action-button rows across the app use a plain `flex flex-wrap ... gap-2` className, which wraps unevenly on phones (390px) instead of stacking cleanly.

**Approach:** Add one new Tailwind `@utility` class in `packages/ui/src/styles/theme.css` (stock `sm` breakpoint, no new token) that stacks buttons full-width below `sm` and wraps inline at `sm`+, then swap it into all 14 call sites — a CSS-level fix (AD-4), not a new React component.

## Boundaries & Constraints

**Always:** Add `@utility action-button-row { @apply flex flex-col gap-2 sm:flex-row sm:flex-wrap; }` to `packages/ui/src/styles/theme.css` (extends the single design-token/utility source per AD-4 — never a one-off literal). At each of the 14 call sites, replace the row's base classes (`flex flex-wrap` → `action-button-row`) while preserving site-specific modifiers already composed via `cn()`/template strings (`justify-end`, `items-center`) alongside the new class. No new React wrapper component — none of the 14 sites share behavior, only layout, so this stays a class swap (AD-5 governs component reuse, not pure CSS).

**Ask First:** Two of the epic's named areas resolve to a `role="tablist"` pill strip, not an action-button row: `apps/web/app/(app)/rmc/page.tsx:162` ("Group RMC reporting by") and the identical unlisted pattern at `apps/web/app/(app)/reports/page.tsx:1495`. Stacking a tab selector full-width-per-tab is unusual UX (tabs are conventionally left as a horizontally-scrolling or wrapping row, not one-per-line). HALT and confirm: (a) should `action-button-row` also apply to these two tablists, (b) should they be left alone as a separate, later concern, or (c) was the epic's "RMC" callout referring to a button row that no longer exists in this form?

**Never:** No visual change at `sm`+ (640px) — desktop wrapping behavior is byte-identical to today. No change to any button's own styling (`buttonVariants`/`Button`), only the row wrapper's classes. No per-page bespoke fix — every call site adopts the same `action-button-row` class.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Any of the 14 rows below `sm` (< 640px) | Any page | Buttons stack full-width, single column | N/A |
| Any of the 14 rows at/above `sm` | Any page | Buttons wrap inline exactly as today | N/A |
| Movements page (6-button row), Owner or Supervisor session | 390px viewport | Both sessions render identically fixed — one shared page | N/A |

</frozen-after-approval>

## Code Map

New utility: `packages/ui/src/styles/theme.css` -- no existing `@layer utilities`/`@utility` block (grepped, zero hits); add one alongside the existing `@theme` tokens per AD-4's "extend this file, never a one-off literal" convention. Breakpoints already declared at `theme.css:196-200` (`--breakpoint-sm: 640px`) — no new token needed.

14 confirmed call sites (`flex flex-wrap`(`...`)`gap-2` on an action-button-row `<div>`, verified by reading context — excludes tag lists/tablists/headers that share the literal string but wrap non-button content):

| File:Line | Current classes | Buttons wrapped |
|---|---|---|
| `vendors/[id]/page.tsx:167` | `flex flex-wrap gap-2` | Edit Vendor, Delete |
| `subcontractors/[id]/page.tsx:127` | `flex flex-wrap gap-2` | Edit, Delete |
| `materials/page.tsx:69` | `flex flex-wrap gap-2` | Units, Full Material form |
| `expenses/page.tsx:62` | `flex flex-wrap items-center gap-2` | Categories, Record Expense |
| `sites/[id]/page.tsx:343` | `flex flex-wrap justify-end gap-2` | Today's Report, Site Photos, Edit Site, Delete |
| `sites/[id]/page.tsx:393` | `flex flex-wrap gap-2` | "Today at this Site" quick-entry links |
| `sites/[id]/contracts/[contractId]/page.tsx:228` | `flex flex-wrap gap-2` | Edit terms + contract actions |
| `daily-activity/page.tsx:150` | `flex flex-wrap items-center gap-2` | Previous day, Next day, Jump to today |
| `movements/movements-list-client.tsx:302` | `flex flex-wrap justify-end gap-2` | Direct Vendor→Site, Record Movement, Record Transfer (6-button row) |
| `team/page.tsx:112` | `flex flex-wrap gap-2` | Employment Types, Record Attendance, Add Team Member |
| `inventory/page.tsx:129` | `flex flex-wrap gap-2` | Record Movement, Record Purchase |
| `machinery-vehicles/page.tsx:60` | `flex flex-wrap gap-2` | Add Machine, Add Vehicle |
| `machinery-vehicles/vehicles/[id]/page.tsx:89` | `flex flex-wrap gap-2` | Record Movement, Edit |
| `machinery-vehicles/machinery/[id]/page.tsx:97` | `flex flex-wrap gap-2` | Record Movement, Edit |

(All paths relative to `apps/web/app/(app)/`.) Excluded, confirmed non-button-row matches sharing the same literal string: `dsr/new/page.tsx:694`, `daily-activity/_components/dsr-desktop-form.tsx:661` (photo grids), `daily-activity/work-records/new/work-record-form.tsx:160` (crew checklist), `daily-activity/[id]/page.tsx:219` (equipment tags), `movements/movements-list-client.tsx:237` (card text span), `owner-dashboard.tsx:443,491` (card headers/footers, not named in epic scope).

## Tasks & Acceptance

**Execution:**
- [ ] `packages/ui/src/styles/theme.css` -- add `@utility action-button-row`
- [ ] Swap `flex flex-wrap` → `action-button-row` (keeping existing modifiers) at all 14 call sites listed above
- [ ] Resolve the Ask-First tablist question and apply the agreed decision to `rmc/page.tsx:162` / `reports/page.tsx:1495` (or explicitly leave them, per the human's answer)
- [ ] Visual/regression check: re-run the screenshot audit that found the original bug at 390px across all 14 pages plus the Movements page under both Owner and Supervisor sessions

**Acceptance Criteria:**
- Given any of the 14 listed pages below the mobile breakpoint, then every button in the row renders full-width, stacked in a single column
- Given the same rows at or above `sm`, then buttons wrap inline exactly as today — no desktop regression
- Given a 390px-wide screen, then no listed row produces a jagged, unevenly-spaced wrap
- Given this is a shared responsive rule, then it is one utility class applied at every call site, not duplicated per page
- Given the Movements page (6 buttons), then both Owner and Supervisor sessions render identically fixed

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/ui typecheck` -- expected: clean
- `pnpm --filter @azentisfieldos/web typecheck` -- expected: clean
- `pnpm --filter @azentisfieldos/web test` -- expected: no regressions (className-only change; existing tests should be unaffected unless any assert exact className strings)

**Manual checks (if no CLI):**
- At 390px, visit all 14 listed pages plus Movements (Owner and Supervisor) and confirm buttons stack full-width with no jagged wrap. Widen to desktop and confirm every row's wrapping is visually unchanged from today.
