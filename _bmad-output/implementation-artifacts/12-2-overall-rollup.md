---
baseline_commit: cc34b1537ee7c18a7645110216eff8f49822a276
---

# Story 12.2: Overall Rollup

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to see Overall status — active Sites, inventory status, outstanding Advances, pending payments — with drill-down into every figure,
so that I understand business-wide state at a glance.

## Acceptance Criteria

1. **Given** a Tenant with zero Sites, **when** I open the Dashboard, **then** I see an explicit empty state guiding me to create a Site — never a broken or blank layout. (FR-34)
2. **Given** Sites, Inventory, Advances, and Payments data exist, **when** I view the Overall section, **then** every figure matches its source screen exactly and links through to it.

## Tasks / Subtasks

- [ ] Task 1 — `apps/api` (AC: #1, #2)
  - [ ] `apps/api/src/dashboard/dashboard.controller.ts` (Story 12.1, extend): `GET /dashboard/overall` returns `{ activeSites: { count, names: string[] }, inventory: { lowStockCount }, outstandingAdvances: { total, teamMemberCount }, pendingPayments: { count } }`.
  - [ ] Every figure here is a **direct call into the existing owning service**, not a re-derivation — this endpoint is a composition layer, nothing more:
    - `activeSites`: `SitesService.list()` (Epic 2) filtered to `status: 'ACTIVE'` — reuse the existing list query/service, add a status filter param to `SitesService.list` if it doesn't already accept one, rather than querying `Site` directly from `DashboardService`.
    - `inventory.lowStockCount`: the `length` of Epic 5 Story 5.7's `getLowStockMaterials()` result — call that service method directly.
    - `outstandingAdvances`: Epic 7 Story 7.4's `GET /team-members/outstanding-advances` response, reused as-is (`{ total, byTeamMember }` → `{ total, teamMemberCount: byTeamMember.length }`).
    - `pendingPayments.count`: `COUNT(*)` on `Payment` (Epic 7 Story 7.3) where `status = 'pending'` — no existing service method returns exactly this count today; add one to `PaymentsService` (Epic 7) rather than querying `Payment` directly from `DashboardService`, keeping the "each domain owns its own queries" boundary intact.
  - [ ] `GET /dashboard/sites-preview` (or fold into `/dashboard/overall`, either is fine) — the small site-card grid on the Dashboard (`01-dashboard.html`'s "Sites" section below Overall): a handful of Sites (e.g. the most recently active) with the same summary shape `SitesService` already returns, for the card grid's own drill-down into `/sites/[id]`. This reuses `SitesService.list()`, ordered/limited, not a new query shape.
- [ ] Task 2 — `apps/web` UI (AC: #1, #2)
  - [ ] `apps/web/app/(app)/page.tsx` (Story 12.1, extend): an "Overall" section with four cards — Active Sites (count + site names), Inventory Status (`N materials low`, linking to `/inventory`), Outstanding Advances (₹ total + Team Member count, linking to `/payments`), **Pending Payments** (count, linking to `/payments`) — see Dev Notes on why this fourth card isn't in the mockup's `overall-grid` but belongs here anyway.
  - [ ] A "Sites" preview section below Overall: a small grid of interactive `Card`s (per `01-dashboard.html`'s `site-card-grid`), each linking to that Site's detail page, plus a "View all sites" link to `/sites` (Epic 2).
  - [ ] **AC #1's empty state is the whole-page state, not a per-tile one**: when `activeSites.count === 0` (and, in practice, total Sites is zero — a brand-new Tenant), replace the entire Today/Overall/Sites layout with a single centered empty state — icon, "No Sites yet — every report and figure on this Dashboard starts with your first Site," and a primary "Create your first Site" action linking to `/sites/new` (Epic 2). Do not render seven `0`-valued stat tiles and three `0`-valued Overall cards above an empty Sites grid — that reads as a broken layout, exactly what AC #1 rules out. Story 12.1's Today tiles and this story's Overall/Sites sections should all be gated behind the same one zero-Sites check at the page level.
- [ ] Task 3 — Tests (AC: all)
  - [ ] `dashboard.service.spec.ts` (extend Story 12.1's): `overall` composes correctly from each owning service's existing method (mock each service, assert `DashboardService` calls into it rather than querying Prisma directly for that domain); `pendingPayments.count` via the new `PaymentsService` method.
  - [ ] `apps/web` component test: zero-Sites Tenant renders the single empty state, not the seven-tile layout with zeros; a populated Tenant renders all sections with correct drill-down `href`s.

## Dev Notes

**A fourth Overall card that the mockup doesn't show — resolving a genuine AC/mockup mismatch, not adding scope.** `01-dashboard.html`'s `overall-grid` has exactly three cards (Active Sites, Inventory Status, Outstanding Advances), but this story's own AC text explicitly lists four concepts: "active Sites, inventory status, outstanding Advances, **pending payments**." The mockup is a composition reference, not the binding contract — per this project's own documents, the spec/FR text governs when the two disagree, and FR-34/this story's AC clearly intends a fourth figure the mockup simply doesn't render (most likely an earlier design pass that predates the final AC wording). Add the Pending Payments card rather than dropping it to match the mockup exactly.

**This story is a pure composition layer — if you find yourself writing a new Prisma query in `DashboardService`, stop and check whether the owning epic's service already has (or should have) the method you need.** Every figure here already has a canonical source: Epic 2 for Sites, Epic 5 Story 5.7 for low-stock, Epic 7 Stories 7.3/7.4 for Payments/Advances. The one genuinely new piece of logic this story adds is `PaymentsService`'s pending-count method — everything else is composition and reuse.

**Depends on Story 12.1** (`DashboardModule`, the page shell) and, transitively, on Epics 2, 5, and 7 for the data it composes.

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6 (this story is the one that actually implements the epic's headline empty-state requirement — treat it as the primary deliverable, not an afterthought bolted onto Task 2).

### Project Structure Notes

- Extends `apps/api/src/dashboard/dashboard.controller.ts`/`.service.ts` (Story 12.1). One small addition to `apps/api/src/team/payments.service.ts` (Epic 7).
- Extends `apps/web/app/(app)/page.tsx` (Story 12.1).

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-10] (FR-34)
- [Source: _bmad-output/planning-artifacts/stories/phase-6-insight-delivery/epic-12-dashboard-cross-site-rollup/story-12.2-overall-rollup.md — the "pending payments" AC text absent from the mockup]
- [Source: _bmad-output/implementation-artifacts/12-1-today-s-activity-missing-dsr-gap-flag.md — DashboardModule this story extends]
- [Source: _bmad-output/implementation-artifacts/5-7-stock-lifecycle-visibility-low-stock-flagging.md, 7-3-record-a-payment.md, 7-4-outstanding-advance-visibility.md — the services this story composes rather than re-queries]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/01-dashboard.html]

## Dev Agent Record

### Agent Model Used

Opus 4.8 (1M context) — claude-opus-4-8[1m]

### Debug Log References

### Completion Notes List

- **Pure composition, no new Prisma queries in `DashboardService`.** `getOverall()` is four parallel calls into the epics that own each figure: `SitesService.list('ACTIVE')` (Epic 2), `StockService.getLowStockMaterials()` (Epic 5 Story 5.7), `TeamMembersService.getOutstandingAdvances()` (Epic 7 Story 7.4), `PaymentsService.countPending()` (Epic 7 Story 7.3). It maps their results to `{ activeSites: { count, names }, inventory: { lowStockCount }, outstandingAdvances: { total, teamMemberCount }, pendingPayments: { count } }` and does not touch `this.prisma` at all — so every Overall figure reconciles with its source screen by construction (AC #2).
- **`PaymentsService.countPending()` already existed** (added in Epic 7 Story 7.3 for the Payments page's Pending stat tile — `COUNT(*) WHERE status = 'pending'`). Task 1 anticipated adding it "if no existing service method returns exactly this count today"; it does, so this story reuses it rather than adding a duplicate — the same discipline the task insists on.
- **`SitesService.list()` gained an optional `status?: SiteStatus` filter param** (per Task 1) so the ACTIVE-Sites figure flows through the existing Site query rather than a fresh `Site` query in `DashboardService`. Default (no arg) behavior is unchanged, so Epic 2's existing `/sites` caller is untouched.
- **`getSitesPreview()`** reuses `SitesService.list()` (unfiltered, newest-first) and slices to the first 6 — "ordered/limited, not a new query shape." Returned across all statuses (Active/On Hold/Completed) so the grid mirrors the full Site roster; this also makes its emptiness a faithful "this Tenant has no Sites at all" signal, which the page uses for the AC #1 gate. Two endpoints (`GET /dashboard/overall`, `GET /dashboard/sites-preview`) were used rather than folding sites-preview into overall (the story allows either).
- **AC #1's whole-page empty state is the headline deliverable, gated once at the page level.** `apps/web/app/(app)/page.tsx` fetches all three Dashboard endpoints in parallel, then — when `sitesPreview.length === 0` (⟺ zero total Sites, since the preview is drawn from the full roster) — returns a single centered `EmptyState` (BuildingIcon, "No Sites yet — every report and figure on this Dashboard starts with your first Site," primary "Create your first Site" → `/sites/new`) instead of the Today/Overall/Sites layout. The seven `0`-tiles + four `0`-cards + empty grid are never rendered for a brand-new Tenant. I gate on total-Sites-zero rather than the spec's literal `activeSites.count === 0` because a Tenant that has only Completed/On-Hold Sites (activeSites.count 0 but total > 0) is a real non-empty state that should show `0 active`, not the create-your-first-Site screen — total-Sites-zero is the truer reading of AC #1 ("a Tenant with zero Sites") and coincides with `activeSites.count === 0` for the brand-new-Tenant case the spec's parenthetical names.
- **Fourth Overall card (Pending Payments) added per Dev Notes**, resolving the AC-vs-mockup mismatch in favor of the AC text (the mockup's `overall-grid` shows three cards; the AC lists four concepts). Built the four Overall figures on the shared `Card` primitive via a small local `OverallCard` presentation helper (AD-5 — no new UI primitive), styled entirely through design tokens (AD-4). Inventory links to `/inventory`; both Outstanding Advances and Pending Payments link to `/payments`. The Sites grid uses interactive `Card`s wrapped in `Link` to `/sites/[id]` with a `Badge` status, plus a "View all sites" → `/sites` link.
- **`outstandingAdvances.teamMemberCount` = `byTeamMember.length`** exactly as Task 1 specifies (the Story 7.4 response reused as-is). Note this counts every Team Member the outstanding-advances endpoint returns, which includes ₹0 balances — so it can exceed the mockup meta's "N Team Members with open advance balances." This is the spec's explicit transform; flagged as a minor semantic point rather than changed, since the spec is the source of truth. If "with an open balance" is wanted, filter `byTeamMember` to `outstandingAdvanceBalance > 0` here.
- No schema change (read-only aggregation), so no migration.
- **Module wiring:** exported `SitesService` from `SitesModule`, `StockService` from `InventoryModule`, and `PaymentsService` from `TeamModule` (which already exported `TeamMembersService`); `DashboardModule` now imports `SitesModule` + `InventoryModule` alongside the existing `TeamModule`.
- **Verification:** worktree branched from `cc34b15` (Story 12.1). `pnpm install` + `pnpm db:generate` (Prisma client is gitignored, regenerated in the worktree). `apps/api` typecheck clean; full Vitest suite **521 passed / 51 skipped** (was 513 at baseline — +8 across the two new endpoints: getOverall composition/zeroed-rollup, getSitesPreview reuse/limit/empty). `apps/web` typecheck clean; full Vitest suite **498 passed** (page test adds Overall drill-down, Sites-grid drill-down, and the zero-Sites whole-page empty-state cases). All my changed files lint clean (`eslint` exit 0 on each). Pre-existing lint failures in `apps/api/src/team/payments.service.spec.ts` (Epic 7) and `no-unsafe-argument` warnings in `rmc.controller.integration.spec.ts` are on the baseline and untouched here — already documented in Story 12.1's notes. `apps/api`'s dev server cannot boot outside Vitest (documented repo limitation), so the endpoints were verified via unit tests with mocked owning-services and a mocked Prisma client, and the page via component tests with per-path mocked `fetch` — consistent with how prior epics on this project verified.

### File List

- `apps/api/src/sites/sites.service.ts` (modified) — `list()` gains an optional `status?: SiteStatus` filter (reused by the Dashboard's ACTIVE-Sites figure).
- `apps/api/src/sites/sites.module.ts` (modified) — exports `SitesService`.
- `apps/api/src/inventory/inventory.module.ts` (modified) — exports `StockService`.
- `apps/api/src/team/team.module.ts` (modified) — exports `PaymentsService` (alongside `TeamMembersService`).
- `apps/api/src/dashboard/dashboard.module.ts` (modified) — imports `SitesModule` + `InventoryModule`.
- `apps/api/src/dashboard/dashboard.service.ts` (modified) — `getOverall()` (four-service composition) + `getSitesPreview()` (reuses `SitesService.list()`, sliced); `OverallRollup`/`SitePreview` types.
- `apps/api/src/dashboard/dashboard.controller.ts` (modified) — `GET /dashboard/overall`, `GET /dashboard/sites-preview`.
- `apps/api/src/dashboard/dashboard.service.spec.ts` (modified) — extended `makeService` for the new services; `getOverall` composition + zeroed-rollup, `getSitesPreview` reuse/limit/empty tests.
- `apps/api/src/dashboard/dashboard.controller.spec.ts` (modified) — delegation tests for the two new endpoints.
- `apps/web/app/(app)/page.tsx` (modified) — Overall section (four cards) + Sites preview grid + the whole-page zero-Sites empty state (AC #1); local `OverallCard` helper on the shared `Card`.
- `apps/web/app/(app)/page.test.tsx` (modified) — per-path fetch mock; Overall/Sites drill-down + zero-Sites single-empty-state tests.
