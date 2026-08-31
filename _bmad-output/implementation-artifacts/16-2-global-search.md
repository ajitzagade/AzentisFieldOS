---
baseline_commit: f712ede0bf1670bbe54676c0dcbc7330419c06c7
---

# Story 16.2: Global Search

Status: done

## Story

As any signed-in user,
I want one search entry point in the app shell that finds a Site or a Material by typing,
so that I never have to remember which of hundreds of Sites I'm looking for, or manually scroll a list to find it.

## Acceptance Criteria

1. **Given** I open the global search (a visible control in the app shell, plus a keyboard shortcut), **when** I type a query, **then** matching Sites (by name, location, or contract reference) and active Materials (by name) appear grouped by type, updated as I type (debounced), ranked with best matches first.
2. **Given** I select a Site result, **when** I confirm the selection, **then** I land directly on that Site's detail page.
3. **Given** I select a Material result, **when** I confirm the selection, **then** I land on the Material's detail page (interim target — Story 16.3's dedicated cross-site availability view will replace this destination once it exists; see Dev Notes).
4. **Given** more results exist than fit inline, **when** I reach the end of the inline list, **then** a "See all N results" action opens the corresponding filtered list — Sites via Story 16.1's `/sites?q=` platform, Materials via the existing Materials taxonomy page's own client-side filter (`/materials?q=`) — search does not duplicate list pagination/filter logic for either.
5. **Given** a tenant has 1,000+ Sites, **when** I search, **then** matching happens via a server-side query against the database, never a client-side filter over a fully fetched list, and responds fast enough to feel instant while typing.
6. **Given** the search box is empty, **when** it's focused, **then** it shows nothing — never an error or a loading spinner with nothing to load.
7. **Given** I am a Site Supervisor, **when** I use global search, **then** results are the same shape as for Owner/Admin — this story does not add new role-based data restrictions beyond what each result's own detail page already enforces.

## Tasks / Subtasks

- [x] Task 1: Ranked cross-entity search endpoint (AC: #1, #5, #6, #7)
  - [x] Added `SitesService.searchCandidates(q: string)` — same soft-delete (`deletedAt: null`) + name/location/contractReference `OR`/`contains`/`insensitive` shape as `SitesService.list()`'s `q` filter, capped `take: 200` as a safety valve, `count()` unbounded by the cap so the reported total stays accurate. Returns `{ candidates: Site[]; total: number }`. 1 new unit test.
  - [x] Added `MaterialsService.searchCandidates(q: string)` — `isActive: true` + `name` `contains`/`insensitive`, `include: { category: true }` (disambiguates the same Material name across two different Categories, per `@@unique([categoryId, name])`), same `take: 200` cap. Exported `MaterialsService` from `MaterialsModule` (mirrors `SitesModule`'s `exports: [SitesService]`). 1 new unit test (new `materials.service.spec.ts` — didn't exist before).
  - [x] Added `apps/api/src/search/rank-by-query.ts`: `rankByQuery<T>(items, query, getText)` — three tiers (exact, starts-with, rest), alphabetical within tier, non-mutating. 4 unit tests.
  - [x] Added `packages/shared/src/types/search-result.ts`: `SiteSearchResult`, `MaterialSearchResult`, `SearchResultGroup<T>`, `SearchResponse`. Exported from `packages/shared/src/index.ts`. Plain types, matching Story 16.1's `ListQuery`/`PaginatedResult<T>` precedent.
  - [x] Added `apps/api/src/search/search.service.ts` — blank/whitespace `q` short-circuits with no DB call; otherwise fetches both candidate sets in parallel, ranks each, slices to 5 inline, keeps the true `total`. 3 unit tests.
  - [x] Added `apps/api/src/search/search.controller.ts` (`GET /search`, plain `@Query('q')`) and `search.module.ts` (imports `SitesModule`, `MaterialsModule`), registered in `AppModule`. 2 controller tests.
  - [x] All new/touched files lint-clean (targeted `eslint` run); `pnpm --filter @azentisfieldos/api typecheck`/`test` green (823 passed, 56 skipped).
- [x] Task 2: `packages/ui` — `SearchPalette` component (AC: #1, #4, #6)
  - [x] Added `packages/ui/src/components/search-palette.tsx` — the first command-palette-style primitive (AD-5): a modal on Base UI's `Dialog` (not `AlertDialog`), with a search `<input>` (`SearchIcon`, matching `ComboboxField`'s icon-slot convention) and grouped results below. **Deviation from the original plan**: instead of `role="listbox"`/`role="option"` + a synthetic `activeIndex`, results render as plain, individually-focusable `<button>`s — Enter/Space already activate a focused native button for free, so ArrowUp/ArrowDown only need to move real DOM focus between them (`buttonRefs`), with no custom Enter handling and no risk of an incorrect hand-rolled ARIA listbox pattern tripping the project's `jsx-a11y`-as-error CI gate (AD-15). Escape-to-close still comes from Base UI's `Dialog` for free. Also dropped `href`/`seeAllHref` from the props entirely — `onSelect(groupKey, item)` and `onSeeAll(groupKey)` callbacks report *which* item/group was chosen and let the caller (apps/web, which owns `next/navigation`) decide the destination, keeping this component exactly as framework-agnostic as `Pagination`/`DataTable`.
  - [x] Props: `open`, `onOpenChange`, `query`, `onQueryChange`, `groups: SearchResultGroup[]` (`{ key, label, items: { id, label, description? }[], total }`), `loading?`, `error?`, `onSelect(groupKey, item)`, `onSeeAll(groupKey)`. Empty `query` renders nothing below the input (AC #6); non-empty + loading shows `role="status"`; non-empty + error shows `role="alert"`; non-empty + loaded + zero total across all groups shows "No results"; otherwise each group renders its heading, its items, and (when `total` exceeds the items shown) a trailing "See all {total} results" button in the same ArrowUp/ArrowDown sequence.
  - [x] 8 unit tests: empty-query renders nothing, loading/error/empty-results states, groups + conditional "See all" render correctly, clicking an item/"See all" calls the right callback with the right group key, ArrowDown from the input focuses the first result, ArrowDown/ArrowUp move focus between results and back to the input.
- [x] Task 3: Wire global search into the app shell (AC: #1, #2, #3, #4, #5, #6, #7)
  - [x] Added `apps/web/lib/use-global-search.ts` (`"use client"`) — same shape as `use-site-stock.ts`'s `useStock`: takes a (caller-debounced) query string, fetches `GET /search?q=` via `useAuthedFetch()`, request-cancellation on rapid typing, exposes `{ data, loading, error }`. Never calls the endpoint for a blank/whitespace query (AC #6). 4 unit tests.
  - [x] Added `apps/web/app/(app)/_components/global-search.tsx` exporting `useGlobalSearchController()`, `GlobalSearchButton`, `GlobalSearchDialog` — **deviation from the original single-component plan**: split into three pieces instead of one `<GlobalSearch />`, because the trigger button needs to render in three places (desktop rail, mobile drawer, mobile top bar) while the dialog + `Cmd/Ctrl+K` listener + fetch state must exist exactly **once** — a single self-contained component would have meant 2–3 independent keyboard listeners and 2–3 simultaneously-rendering dialogs (SidebarNav mounts twice: once always for the desktop `<aside>`, once more whenever the mobile drawer is open). The controller hook is called once (in `SidebarShell`) and its state is shared by every trigger via props — the same lifting pattern `app-shell.tsx` already uses for `pwaAvailable`/`onRequestInstall`. Maps `SearchResponse` into `SearchPalette`'s `groups` (Sites → label `name`, description `location`; Materials → label `name`, description `category.name`); `onSelect`/`onSeeAll` call `router.push` (Sites → `/sites/:id` or `/sites?q=`; Materials → `/materials/:id` — the interim AC #3 landing — or `/materials?q=`) and close the palette.
  - [x] Mounted the search trigger inside `SidebarNav` (rendered in both the desktop rail and the mobile drawer via the existing single-source component) and as an icon-only `GlobalSearchButton` in the mobile top bar `<header>` (reachable in one tap, not gated behind the drawer); `<GlobalSearchDialog controller={search} />` mounted exactly once in `SidebarShell`, outside every conditional.
  - [x] 5 tests in `global-search.test.tsx` (shortcut opens, debounce before fetching, Site/Material selection navigates + closes, "See all" carries the query) + 2 new tests in `app-shell.test.tsx` (OWNER_ADMIN and SITE_SUPERVISOR both see an identical, working "Search" control — confirms AC #7 by construction, no role branching exists to test against) + empty-query/loading/error rendering already covered by `search-palette.test.tsx` (Task 2).
- [x] Task 4: Materials "See all" destination reads the query string (AC: #4)
  - [x] `apps/web/app/(app)/materials/page.tsx` now reads Next 15 async `searchParams` (`{ q?: string }`) and passes `q` to `MaterialsTaxonomy` as `initialMaterialSearch`.
  - [x] `MaterialsTaxonomy` accepts the new optional `initialMaterialSearch` prop, using it to initialize its existing `materialSearch` state (`useState(initialMaterialSearch ?? "")`) — no new search mechanism, reusing the bounded-catalog client-side filter Story 16.1 deliberately left untouched (see Dev Notes). **Addition beyond the original plan**: `selectedCategoryId`'s initializer also checks whether any Material matches the carried-over search term and, if so, starts on *that* Material's own Category instead of the usual "first active Category" default — landing on an unrelated default Category with an empty result despite a correctly pre-filled search box would look broken, not just incomplete (the create-story workflow's "leave the system working end-to-end" standard).
  - [x] Tests: `materials/page.test.tsx` gained a new test asserting `?q=cement` both pre-fills the search box and auto-selects the matching Material's Category (no separate `materials-taxonomy.test.tsx` was created — `MaterialsTaxonomy` has no direct unit-test file in this codebase today; it's exercised exclusively through `page.test.tsx`, so the new coverage follows that existing convention rather than introducing a new one).
- [x] Task 5: Regression & test coverage (AC: all)
  - [x] Per-package unit/integration tests added for every new/changed file (listed per-task above) — 39 new tests total (10 API: 4 rank-by-query + 1 SitesService + 1 MaterialsService + 3 SearchService + 2 SearchController; 8 UI: SearchPalette; 4 web: use-global-search; 5 web: global-search.tsx; 2 web: app-shell.tsx; 1 web: materials/page.tsx).
  - [x] Full root `pnpm typecheck` — all 4 packages clean. Full root `pnpm test` — 823 API (56 skipped DB-integration specs, expected) + 675 web + 143 UI, all passing, zero regressions. Full root `pnpm lint` — `apps/api` reports the identical 33 pre-existing errors / 35 pre-existing warnings confirmed as Story 16.1's baseline (byte-identical file list, cross-checked via `grep`), zero new issues from this story's ~35 touched files; `apps/web`/`apps/ui`/`packages/shared` lint clean.
  - [x] Confirmed no regression: every existing `sites.service.spec.ts`/`materials`-related test, every `app-shell.test.tsx` test, and the full `GET /sites`/`GET /materials` caller surface (dozens of unpaginated picker call sites) pass unchanged — `searchCandidates` methods and the `MaterialsModule` export are additive-only; `app-shell.tsx`'s mount point only adds a new button + one dialog, touching no existing nav/PWA/logout behavior (all pre-existing app-shell tests still pass unmodified).

### Review Findings

- [x] [Review][Patch] `SitesService.searchCandidates`/`MaterialsService.searchCandidates` both call `findMany({ where, take: 200 })` with no `orderBy` before `rankByQuery` runs — when more than 200 rows match, Postgres/Prisma gives no ordering guarantee for which 200 come back, so the actual best/exact match can be silently excluded from the ranked top-5 even though `total` (from the separate, uncapped `count()`) correctly reports it exists [apps/api/src/sites/sites.service.ts:114-130, apps/api/src/materials/materials.service.ts:86-103] — independently confirmed by 3 of 4 review layers (blind-hunter, edge-case-hunter, verification-gap), verified directly against source. **Decision (2026-08-31): add a deterministic `orderBy`** (by the searched field) before the `take: 200` cap so candidate selection is at least reproducible, while keeping the existing documented cap tradeoff.
- [x] [Review][Patch] `rankByQuery` only scores Sites by `site.name`, but `SitesService.searchCandidates` matches on `name` OR `location` OR `contractReference` (AC #1) — a Site matching only via an exact `location`/`contractReference` hit gets no ranking credit for that match and can be pushed out of the top-5 by unrelated Sites whose name loosely contains the query [apps/api/src/search/search.service.ts, rankByQuery call for sites] — confirmed by acceptance-auditor+blind-hunter.
- [x] [Review][Patch] `SearchController.search(@Query('q') q?: string)` and the Materials page's `searchParams.q` both assume a single string — a repeated `?q=a&q=b` in the URL is parsed as a string array at the HTTP layer, and the first `.trim()` call downstream throws an unhandled `TypeError` instead of a clean response [apps/api/src/search/search.controller.ts:13-14, apps/web/app/(app)/materials/page.tsx] — independently confirmed by blind-hunter+edge-case-hunter.
- [x] [Review][Patch] `SearchService.search()`'s `Promise.all([sites.searchCandidates(...), materials.searchCandidates(...)])` fails both groups together if either throws — one entity's transient error surfaces "Search failed" for the whole palette even when the other entity's search would have succeeded. Switch to `Promise.allSettled` and treat a failed group as empty (`{ results: [], total: 0 }`) rather than failing the whole response.
- [x] [Review][Defer] `MaterialsService.searchCandidates` filters `Material.isActive` but not the related `MaterialCategory.isActive`, so a Material whose parent Category has since been disabled can still surface in search results — deferred, consistent with Story 14.3's existing precedent (disabling a Category does not cascade to hide its Materials elsewhere in the app either).
- [x] [Review][Defer] Materials search only matches `Material.name`, not `MaterialCategory.name` — a query for a category name (e.g. "Binders") returns zero results even though the result card shows the category. Not a violation (AC #1 explicitly scopes Material matching to "by name" only) — a reasonable future enhancement, not a current gap.

**Documentation-only, not a code defect:** this story's own Dev Notes/Change Log describe the Material result's `/materials/[id]` destination as an "interim" landing pending Story 16.3 — Story 16.3 has since shipped and repointed this to `/materials/[id]/availability`. The code is correct (verified); this file's prose is now stale relative to it. No action needed beyond this note, since Story 16.3's own file already documents the fix.

## Dev Notes

- **Materials was deliberately excluded from Story 16.1's server-pagination platform, and stays excluded here.** `MaterialsTaxonomy` (`apps/web/app/(app)/materials/materials-taxonomy.tsx`) already has its own working client-side `materialSearch`/`categorySearch` filter over a fully-fetched (but small, bounded — master-data, not transaction-history) list. Global search's Materials "See all" reuses that existing filter via a URL param, matching AC #4's "search does not duplicate list pagination logic" — it would be wrong to bolt a second, server-paginated Materials list onto a page that doesn't need one just to force a mechanical match to Story 16.1's shape.
- **Material result → detail page is a deliberate interim choice, not the final AC #3 destination.** The planning story's own text says the Material result should land on "the cross-site availability view for that Material (Story 16.3)" — but that view, and its backing `GET /stock/material/:materialId` aggregate endpoint, don't exist yet (Story 16.3 is still `ready-for-dev`). Building that view here would duplicate Story 16.3's entire scope. Instead, Material results link to the existing `/materials/[id]` detail page for now; the href is built from one named field (`material.id` → `/materials/${id}`) in `global-search.tsx` so Story 16.3 has a single line to change once its route exists — flagged there via a comment, not silently left as a dead end.
- **Ranking**: Postgres `contains`/`insensitive` has no built-in relevance score, and no `pg_trgm`-style extension is assumed to be configured. `rankByQuery`'s three-tier (exact → starts-with → contains) in-memory sort over a capped 200-row candidate set is the same pragmatic, no-raw-SQL tradeoff Story 16.1 Task 4 used for its top-k merge — correct for realistic query lengths, with the cap's edge case (a single-character query matching >200 rows) documented rather than hidden.
- **AD-5 discipline**: `SearchPalette` is the first command-palette-shaped primitive in `packages/ui` — built once, reusable if another global-search-like need ever arises, and kept fetch/navigation-free exactly like `Pagination`/`DataTable` so it doesn't take on framework dependencies apps/web-only code needs (`next/navigation`, `useAuthedFetch`).
- **Keyboard shortcut**: `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux) is the de facto command-palette convention (GitHub, Linear, Vercel). Verified `app-shell.tsx` has no existing global keydown listener to collide with (its only listener is Escape, scoped to `navOpen`).
- **Backward compatibility**: this story only adds new files, a new export (`MaterialsService` from `MaterialsModule`), and two small additive props (`initialMaterialSearch` on `MaterialsTaxonomy`, the new `<GlobalSearch />` mount in `app-shell.tsx`). No existing endpoint's behavior changes.

### Project Structure Notes

- `apps/api/src/search/` — new module, controller, service, `rank-by-query.ts` helper. Imports `SitesModule` + `MaterialsModule` for their services.
- `packages/shared/src/types/search-result.ts` — new, alongside `list-query.ts` from Story 16.1.
- `packages/ui/src/components/search-palette.tsx` — new, exported from `packages/ui/src/index.ts` alongside `Pagination`/`DataTable`.
- `apps/web/lib/use-global-search.ts` — new, alongside `use-site-stock.ts`, `use-list-query-state.ts`.
- `apps/web/app/(app)/_components/global-search.tsx` — new, alongside `flash-toast.tsx` in the same `_components` directory that already holds `app-shell.tsx`.

### References

- [Source: `_bmad-output/planning-artifacts/epics/phase-8-post-launch/epic-16-search-and-scale.md`] — parent epic.
- [Source: `_bmad-output/planning-artifacts/stories/phase-8-post-launch/epic-16-search-and-scale/story-16.2-global-search.md`] — original planning story.
- [Source: `_bmad-output/planning-artifacts/stories/phase-8-post-launch/epic-16-search-and-scale/story-16.3-cross-site-material-lookup-and-transfer.md`] — confirms the cross-site availability view and its aggregate endpoint don't exist yet; informs the interim-destination decision above.
- [Source: `_bmad-output/implementation-artifacts/16-1-list-search-filter-sort-pagination-platform.md`] — the shared pagination/search platform this story's Sites "See all" and its `ListQuery`/`PaginatedResult<T>` precedent both build on.
- [Source: `apps/api/src/sites/sites.service.ts`, `sites.module.ts`] — existing `q`-filter shape and the `exports: [SitesService]` precedent this story's `MaterialsModule` export change mirrors.
- [Source: `apps/api/src/materials/materials.service.ts`, `materials.module.ts`] — current unfiltered `list()`; `Material.isActive`, `Material.@@unique([categoryId, name])`.
- [Source: `apps/web/app/(app)/materials/materials-taxonomy.tsx`] — existing client-side `materialSearch`/`categorySearch` filtering this story reuses via a URL param, read completely before Task 4.
- [Source: `apps/web/app/(app)/_components/app-shell.tsx`] — mount point; confirmed no existing global keydown listener.
- [Source: `packages/ui/src/components/confirm-dialog.tsx`, `combobox-field.tsx`] — existing Base UI (`AlertDialog`, `Combobox`) integration patterns `SearchPalette` follows for focus/Escape/ARIA handling.
- [Source: `apps/web/lib/use-site-stock.ts`] — existing "debounced-caller + cancellable-fetch hook" pattern `use-global-search.ts` follows.
- [Source: `apps/api/src/app.module.ts`] — global `CustomAuthGuard` applies to the new `SearchModule` by default; no extra `@Roles` guard needed (AC #7).

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Built a single `GET /search?q=` endpoint (Sites + active Materials, in-memory three-tier ranking, capped candidate pool) and one reusable `SearchPalette` UI primitive, then wired both into the app shell behind a `Cmd/Ctrl+K` shortcut and a visible button reachable from every viewport.
- Two deliberate scope decisions, both recorded in Dev Notes and carried through to the code: (1) Material search results land on the existing `/materials/[id]` detail page, not Story 16.3's not-yet-built cross-site availability view — the href is built from one field so 16.3 has a single line to change; (2) Materials' "See all" reuses `MaterialsTaxonomy`'s existing client-side filter via a `?q=` prop rather than retrofitting Story 16.1's server-pagination platform onto bounded catalog data that doesn't need it.
- One implementation deviation from the original plan, found while building `SearchPalette`: dropped the planned `role="listbox"`/`role="option"` + synthetic `activeIndex` keyboard model in favor of plain, individually-focusable `<button>`s — native Enter/Space activation comes for free, ArrowUp/ArrowDown only need to move real DOM focus, and it avoids the risk of an incorrectly hand-rolled ARIA pattern tripping the project's `jsx-a11y`-as-error CI gate (AD-15).
- One structural deviation, found while wiring the app shell: split the originally-planned single `<GlobalSearch />` component into a controller hook (`useGlobalSearchController`, called once) plus separate `GlobalSearchButton`/`GlobalSearchDialog` pieces — `SidebarNav` mounts twice (desktop rail always, mobile drawer while open), so a single self-contained component would have registered 2–3 independent `Cmd/Ctrl+K` listeners and could render 2–3 simultaneous dialogs. Lifting shared state once and passing it down mirrors the existing `pwaAvailable`/`onRequestInstall` prop-drilling pattern already used for the install button.
- Hit the same fake-timers-vs-`findBy` Testing Library interaction that bit Story 16.1's debounced-search tests; fixed the same way (real timers + `fireEvent.change` + generous `waitFor` timeouts) and recorded in memory to avoid a third rediscovery.
- Full regression sweep clean: root `pnpm typecheck` (4/4 packages), `pnpm test` (823 API / 675 web / 143 UI, all passing), `pnpm lint` (apps/api's 33 errors/35 warnings confirmed byte-identical to Story 16.1's pre-existing baseline — zero new issues).
- Stayed local-only per standing instruction — no deploy/push performed as part of this story.

### File List

**New files:**
- `apps/api/src/search/rank-by-query.ts` (+ `.spec.ts`)
- `apps/api/src/search/search.service.ts` (+ `.spec.ts`)
- `apps/api/src/search/search.controller.ts` (+ `.spec.ts`)
- `apps/api/src/search/search.module.ts`
- `apps/api/src/materials/materials.service.spec.ts`
- `packages/shared/src/types/search-result.ts`
- `packages/ui/src/components/search-palette.tsx` (+ `.test.tsx`)
- `apps/web/lib/use-global-search.ts` (+ `.test.ts`)
- `apps/web/app/(app)/_components/global-search.tsx` (+ `.test.tsx`)

**Modified files:**
- `apps/api/src/app.module.ts` (registers `SearchModule`)
- `apps/api/src/sites/sites.service.ts` (+ `.spec.ts`) — `searchCandidates`
- `apps/api/src/materials/materials.service.ts`, `materials.module.ts` — `searchCandidates`, exports `MaterialsService`
- `packages/shared/src/index.ts` (exports `search-result` types)
- `packages/ui/src/index.ts` (exports `SearchPalette`)
- `apps/web/app/(app)/_components/app-shell.tsx` (+ `.test.tsx`) — mounts the search trigger + dialog
- `apps/web/app/(app)/materials/page.tsx` (+ `.test.tsx`), `materials-taxonomy.tsx` — reads `?q=`, pre-fills the search box and auto-selects the matching Category
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- **2026-08-31 — global search added to the app shell.** One `GET /search?q=` endpoint ranks and returns Sites + active Materials; a new `SearchPalette` primitive (`packages/ui`) renders them grouped, keyboard-navigable, behind a `Cmd/Ctrl+K` shortcut and a visible button reachable from desktop, the mobile drawer, and the mobile top bar. Site results land on the Site detail page; Material results land on the existing Material detail page as an interim destination pending Story 16.3's dedicated cross-site availability view. "See all" actions reuse Story 16.1's `/sites?q=` platform for Sites and `MaterialsTaxonomy`'s existing client-side filter (via a new `?q=` page param) for Materials — no duplicated list/filter logic for either. No schema/migration changes.
