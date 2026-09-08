---
title: 'Owner Dashboard "Command Center" redesign'
type: 'feature'
created: '2026-09-08'
status: 'done'
review_loop_iteration: 0
baseline_commit: '038a7b3eba76cfe34397dabc8e392d3c3d57264a'
context:
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/26-owner-dashboard-command-center.html'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The live Owner Dashboard is a flat stack of uniform tiles that Ajit rejected: it doesn't help the Owner understand the business at a glance, doesn't surface the actions required of him, and buries per-site reality behind cross-site totals.

**Approach:** Recompose the page per the approved Command Center mockup: navy hero band (date + quick actions + 7 Today KPIs, sparklines on the 3 trended ones), ranked "Needs your attention" queue, per-site operations DataTable with reconciling totals, inline low-stock strip, Money strip anchored by Cash Tied Up. Two additive read-only API endpoints supply the new data.

## Boundaries & Constraints

**Always:** Dashboard page only — `owner-dashboard.tsx`, its own tests, additive-only changes to packages/ui (new tokens/components/exports; never edit existing component behavior) and apps/api dashboard module (new endpoints; never change existing handler shapes — the cron and Supervisor Home consume `getToday`). Preserve every honesty rule: unpriced Purchases excluded from money figures (count, never ₹0); failed Money reads render "—"+"Couldn't load right now"; zero-Sites whole-page empty state unchanged; missing-report flags per-Site, folding defaults-open at 3+; pending-pricing count-of-1 deep-links to that Purchase's pricing page. Keep "Daily Report" naming; en-IN ₹ formatting; all styling via theme tokens (AD-4); DataTable is the only table primitive (AD-5); WCAG AA on-navy; keep an accessible heading whose name contains "Dashboard" and one containing "Today" (e2e selectors).

**Ask First:** Any change to `e2e/specs/owner-dashboard-and-pricing.spec.ts` beyond what still passes; any new dependency; any non-dashboard file change not listed in Tasks.

**Never:** No charting library. No changes to Supervisor Home, app-shell, sidebar, other pages, or existing API endpoint responses. No DB schema/migration changes. No `tenant_id`, no transaction-history UPDATE/DELETE.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Site-breakdown happy path | ≥1 Site, mixed activity today | Per-Site rows: report submitted?+`createdAt` time, labour, received, consumed, expenses; plus Godown bucket row (received count only — consumption/expenses/labour always have a siteId) | N/A |
| Site with no activity | Active Site, no report today | Row present, "No Daily Report yet today" state, metric cells "—" | N/A |
| Trends happy path | 7 local days (Asia/Kolkata via `localDayRange`) | Per-day: sitesReporting, labourWorking, expensesTotal; today = last element | N/A |
| Trends/breakdown read fails | API error on new endpoints | Band renders KPIs without sparklines; site table falls back to existing sites-preview cards' data? No — table shows DataTable error state; rest of page unaffected (additive-context pattern) | `getJSONSafe` → null |
| On-hold site | Site status ON_HOLD | Row shown "On hold — no report expected", not counted in missing-report flags (existing rule) | N/A |
| Unpriced purchases today | 3 pending pricing | Received counts include them; money figures exclude them; queue row shows count | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/_components/owner-dashboard.tsx` — the page body to recompose; keep `getJSON`/`getJSONSafe`, all existing fetches, `pendingPricingHref` logic (L99-146), empty-state gate (L187), `SITE_STATUS_BADGE`.
- `apps/web/app/(app)/page.tsx` — mounts `OwnerDashboard()` (async RSC, no Suspense) — do not touch.
- `apps/web/app/(app)/page.test.tsx` — the only unit test; `mockDashboard` helper routes `global.fetch` by URL substring (L64-95) — extend with the two new endpoints; update label/structure assertions, keep href/behavior assertions.
- `packages/ui/src/styles/theme.css` — token source: raw values in `:root` (L25-64), `.dark` overrides (L72-101), `@theme` bridge (L103-226), `@utility action-button-row` (L232). Navy band is theme-constant like the sidebar (navy-800 has no `.dark` override, see L66-71 note).
- `packages/ui/src/components/stat-tile.tsx`, `gap-flag.tsx`, `gap-flag-list.tsx`, `data-table.tsx` (generic columns/state, `mobileCard`, `rowHref`), `bar-chart.tsx` (div-based, AD-5 precedent; no SVG chart exists yet), `empty-state.tsx`, `card.tsx`, `badge.tsx` — reuse; `packages/ui/src/index.ts` — export barrel.
- `apps/api/src/dashboard/dashboard.controller.ts` / `dashboard.service.ts` — add handlers/methods; reuse `localDayRange` (`local-day.ts` L79), `currentDsrRowsWhere`/`supersededDsrIds` (`apps/api/src/common/superseded-dsrs.ts`), `sitesService.list()`. Per-site labour = `workRecord` groupBy `siteId` where `workDate: dateOnly, attended: true` (distinct member); DSR time = `DailySiteReport.createdAt`; `Purchase.siteId` null ⇔ Godown destination. No `@Roles` on this controller (Supervisor Home consumes `/dashboard/today`) — match that.
- `apps/api/src/dashboard/dashboard.service.spec.ts` (mocked-Prisma pattern, IST boundary case L211-235) and `dashboard.controller.spec.ts` (delegate tests) — extend.
- `e2e/specs/owner-dashboard-and-pricing.spec.ts` — load-bearing selectors: heading name contains "Dashboard" (L13) and "Today" (L14), site name visible (L15), `/inward .* waiting for pricing/` + "Add Pricing" link (L50-51). Design keeps these passing (eyebrow h1 "Owner Dashboard"; section heading "Today's Pulse"; site names in table; queue keeps existing strings).

## Tasks & Acceptance

**Execution:**
- [x] `packages/ui/src/styles/theme.css` — add tokens (`:root` + `@theme` bridge, no `.dark` override — band is theme-constant): `navy-panel #1E3149`, `navy-panel-border #2C405C`, `ink-on-navy #F1EEE4`, `ink-on-navy-muted #C7CCD6`, `ink-on-navy-faint #8D95A3`, `gold-on-navy #E3B24B`, `sparkline-on-navy #4FB8AE`, `chart-teal #00968A`, `chart-gold #C08420`, `chart-blue #4A72B8`; type role `kpi-compact` (26px/700/1.1/-0.02em) — per DESIGN.md 2026-09-08 entries.
- [x] `packages/ui/src/components/sparkline.tsx` (+ export in `src/index.ts`) — new single-series inline-SVG primitive per DESIGN.md "Sparkline": props `{ points: number[]; className?; "aria-label"? }`, 2px round-cap line via `currentColor`, ~12% same-hue area fill, ringed end dot; no axes/legend/labels; `aria-hidden` when unlabeled; fixed small viewBox, caller sizes/colors via className (e.g. `text-sparkline-on-navy`).
- [x] `apps/api/src/dashboard/dashboard.service.ts` — add `getSiteBreakdown(now?, tz?)` → `{ sites: [{ id, name, location, status, report: { submitted: boolean; submittedAt: string|null }, labour: number|null, received: number, consumed: number, expenses: number }], godown: { received: number } }` (ACTIVE + ON_HOLD Sites via `sitesService.list()` — COMPLETED Sites excluded per review finding, today-operations semantics; today via `localDayRange`, superseded-DSR filter on consumption/expenses) and `getTrends(now?, tz?)` → `{ days: [{ date, sitesReporting, labourWorking, expensesTotal }] }` (7 local days ending today, per-day `localDayRange`).
- [x] `apps/api/src/dashboard/dashboard.controller.ts` — add `GET /dashboard/site-breakdown` and `GET /dashboard/trends` delegates (no `@Roles`, matching the controller).
- [x] `apps/api/src/dashboard/dashboard.service.spec.ts` + `dashboard.controller.spec.ts` — cover the I/O matrix rows (incl. IST day-boundary, Godown purchase bucketing, superseded-DSR exclusion, on-hold site row) in the existing mocked style.
- [x] `apps/web/app/(app)/_components/owner-dashboard.tsx` — recompose per mockup: navy hero band (eyebrow h1 "Owner Dashboard", date as visual hero, existing quick-actions bar + `DashboardSearchButton` inside band, 7 KPI panels `bg-navy-panel`/`kpi-compact`, `Sparkline` on sites-reporting/labour/expenses from `/dashboard/trends` via `getJSONSafe`); "Needs your attention" section (existing GapFlagList/GapFlag rows + pricing + draft-terms flags, existing strings/links verbatim); "Today's Pulse" heading over band or table section retains "Today"-containing heading; per-site DataTable (from `/dashboard/site-breakdown` via `getJSONSafe`, `mobileCard`, `rowHref` → `/sites/[id]`, totals row content, DataTable error state on null); low-stock strip via existing `GET /stock/low-stock` (`getJSONSafe`; returns `{name, unit:{name}, godownQuantity}[]` — render "N materials low · Name — qty unit · … · Inventory →", omit strip entirely on null/empty); Money strip (existing 4 cards + Cash Tied Up emphasized; fold Outstanding Advances value + `AdvanceQuickEntryTrigger` and Pending Payments count into cards as mock shows, keeping `/payments` links and Record Advance reachable); `RecentlyViewedChips` retained.
- [x] `apps/web/app/(app)/page.test.tsx` — extend `mockDashboard` for the 2 new endpoints; update layout-coupled assertions; keep all href contracts, degrade-to-"—" checks, empty-state, pricing deep-link cases green.

**Acceptance Criteria:**
- Given an Owner with Sites, when the dashboard renders, then the band shows all 7 KPI values, quick actions, and sparklines on exactly the 3 trended KPIs; per-site table rows reconcile to band totals for labour/received/consumed/expenses.
- Given the two new endpoints fail, when the page renders, then KPIs render without sparklines and the site table shows the shared DataTable error state — no crash, all other sections intact.
- Given the existing test suite's behavioral contracts (hrefs, degrade "—", empty state, pricing count/deep-link, missing-report fold), when `pnpm --filter @azentisfieldos/web test` runs, then all pass with updated layout assertions.
- Given `pnpm test:e2e` dashboard spec, when run unmodified, then it passes (heading names still contain "Dashboard"/"Today", site name visible, Add Pricing flow intact).

## Design Notes

- Band = one `rounded-xl bg-accent-navy-800` section at top (theme-constant dark, like sidebar); on-navy text uses the new `ink-on-navy*` tokens, money `gold-on-navy`; secondary buttons inside the band need an on-navy variant achieved via className overrides on existing `buttonVariants` output, not a new Button variant.
- Godown row: real data exists only for received (nullable `Purchase.siteId`); labour/consumed/expenses render "—" — honest, matches schema.
- Trends: compute 7 `localDayRange` windows in the service (one loop, ≤3 queries via `groupBy` over the full window then bucket in JS — avoid 21 queries).

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/api test` — expected: all pass incl. new dashboard specs.
- `pnpm --filter @azentisfieldos/web test` — expected: page.test.tsx green.
- `pnpm lint && pnpm typecheck` — expected: clean (jsx-a11y at error; decorative SVGs need `aria-hidden`).
- `pnpm test:e2e -- owner-dashboard-and-pricing` — expected: passes unmodified.

**Manual checks (if no CLI):**
- Run dev, sign in as Owner: band AA contrast, mobile viewport (band wraps, table `mobileCard`), zero-Sites empty state unchanged.

## Spec Change Log

- 2026-09-08 (step-04 review, patch round — no loopback): review found the site table unbounded (every COMPLETED Site forever, vs the old 6-site preview cap). Amended the `getSiteBreakdown` task line to exclude COMPLETED Sites (today-operations semantics; ON_HOLD stays, per the I/O matrix row). Also patched without spec text changes: totals-row labour now reuses the band's distinct cross-Site headcount (per-Site distinct sums double-count multi-Site members); fabricated-0 totals guard; submitted-without-time badge fallback; stricter breakdown/trends payload validation (`days.length === 7`, per-row numeric checks); Sparkline non-finite guard + non-scaling-stroke geometry; low-stock id keys, quantity guard, 6-chip cap. KEEP: the honesty rules (0 only when a report vouches the day, "—" otherwise), the Godown received-only bucket, verbatim gap-flag strings, and the e2e-compatible heading names all verified correct — must survive any future re-derivation.

## Suggested Review Order

**Page recomposition (design intent)**

- Entry point: the recomposed Owner Dashboard — band → attention → operations → money reading order.
  [`owner-dashboard.tsx:284`](../../apps/web/app/(app)/_components/owner-dashboard.tsx#L284)

- "Needs your attention" queue — existing gap-flag rules and strings carried verbatim.
  [`owner-dashboard.tsx:383`](../../apps/web/app/(app)/_components/owner-dashboard.tsx#L383)

**Per-site operations table (honesty rules)**

- New client component: DataTable columns, Godown row, band-sourced labour total, error state.
  [`site-operations-table.tsx:60`](../../apps/web/app/(app)/_components/site-operations-table.tsx#L60)

- The 0-vs-"—" vouching rule wiring per metric cell.
  [`site-operations-table.tsx:137`](../../apps/web/app/(app)/_components/site-operations-table.tsx#L137)

**Additive API reads**

- `getSiteBreakdown` — roster minus COMPLETED, three groupBys, Godown bucket, superseded-DSR filter.
  [`dashboard.service.ts:244`](../../apps/api/src/dashboard/dashboard.service.ts#L244)

- `getTrends` — 7 DST-safe local days, 3 full-window queries bucketed in JS.
  [`dashboard.service.ts:359`](../../apps/api/src/dashboard/dashboard.service.ts#L359)

- Two role-open delegates, matching the controller's existing posture.
  [`dashboard.controller.ts:32`](../../apps/api/src/dashboard/dashboard.controller.ts#L32)

**Design-system additions**

- New Sparkline primitive — non-scaling-stroke geometry, finite-points guard, a11y states.
  [`sparkline.tsx:41`](../../packages/ui/src/components/sparkline.tsx#L41)

- Navy-band/chart tokens + `kpi-compact` type role, theme-constant (no `.dark` override).
  [`theme.css:58`](../../packages/ui/src/styles/theme.css#L58)

**Peripherals (tests, trigger tweaks)**

- Page test: totals arithmetic, metric-cell honesty pins, degrade paths, preserved href contracts.
  [`page.test.tsx:1`](../../apps/web/app/(app)/page.test.tsx#L1)

- Service spec: Godown bucketing, IST boundary, superseded-DSR exclusion, multi-Site member fixture.
  [`dashboard.service.spec.ts:435`](../../apps/api/src/dashboard/dashboard.service.spec.ts#L435)

- Additive `className` pass-throughs so the band restyles the two client triggers.
  [`advance-quick-entry-trigger.tsx:1`](../../apps/web/app/(app)/_components/advance-quick-entry-trigger.tsx#L1)
