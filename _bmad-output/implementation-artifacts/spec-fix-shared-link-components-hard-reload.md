---
title: 'Fix hard-reload bug in DataTable/CorrectAction/StatTile/EntityChip'
type: 'bugfix'
created: '2026-09-07'
status: 'done'
route: 'one-shot'
baseline_commit: '85d27189ea436b19ba1d028726e24af89809f7d9'
---

# Fix hard-reload bug in DataTable/CorrectAction/StatTile/EntityChip

## Intent

**Problem:** Clicking a table row (Vendors, Subcontractors, Sites, Team, Reports, etc.), a "Correct" action, a clickable KPI stat tile, or a "recently viewed" chip caused a full browser page reload instead of a fast client-side transition, because `packages/ui`'s shared `DataTable`, `CorrectAction`, `StatTile`, and `EntityChip` rendered their `href`-based links as plain `<a href>` tags, which Next.js's client router never intercepts.

**Approach:** Replace the plain `<a>` in all four shared components with `next/link`'s `Link` (`prefetch={false}`, since some render many links per view). This required adding `next` as a `peerDependency` of `packages/ui`, formally reversing that package's previously-documented "zero next dependency" design (which never actually worked as intended — see AGENTS.md's Conventions section for the revised rationale).

## Suggested Review Order

**Root cause and fix**

- Why `<a href>` never got Next's client-side routing, and the fix (`next/link`'s `Link`).
  [`data-table.tsx:2`](../../packages/ui/src/components/data-table.tsx#L2)

- Every visible row/column renders its own `Link`; `prefetch={false}` avoids one background prefetch request per cell.
  [`data-table.tsx:183`](../../packages/ui/src/components/data-table.tsx#L183)
  [`data-table.tsx:306`](../../packages/ui/src/components/data-table.tsx#L306)

- Same fix applied to the "Correct" row action.
  [`correct-action.tsx:25`](../../packages/ui/src/components/correct-action.tsx#L25)

- Same fix applied to clickable KPI/stat tiles.
  [`stat-tile.tsx:49`](../../packages/ui/src/components/stat-tile.tsx#L49)

- Same fix applied to "recently viewed" entity chips; comment revised to drop the now-inaccurate "no next dependency" rationale.
  [`entity-chip.tsx:28`](../../packages/ui/src/components/entity-chip.tsx#L28)

**Dependency wiring**

- `next` added as a `peerDependency` (matching `apps/web`'s exact `16.3.0` pin) rather than a regular `dependency`, since `packages/ui` is only ever consumed by `apps/web`'s own Next.js install, never bundled standalone.
  [`package.json:22`](../../packages/ui/package.json#L22)

**Documentation**

- Records the architectural reversal (packages/ui is no longer next-agnostic) and why, matching this repo's convention of documenting such decisions.
  [`AGENTS.md:46`](../../AGENTS.md#L46)
