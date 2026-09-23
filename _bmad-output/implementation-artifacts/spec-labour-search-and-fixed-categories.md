---
title: 'Labour list: search + fixed categories (Men/Women/Mistri)'
type: 'feature'
created: '2026-09-23'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '74c2fc1d9568ad0766f981ec14d8ab88a9c729db'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Labour list (`/labour-payments`) has no search/filter/pagination — a plain unbounded server-rendered table — and `DailyLabourer.category` is free text with no fixed set, unlike the request's Men/Women/Mistri requirement.

**Approach:** Wire the Labour list onto the same epic-16 search/sort/pagination platform already used by Vendors/Sites/Team Members (`useListQueryState`, `useDebouncedSearch`, `DataTable`+`Pagination`, backend `paginationParams()`), searching `q` across both name and category. Keep `category` a `String` column (soft constraint only) — `DailyLabourer` is one day old with zero seed/production data and no downstream aggregation reads it, so a hard Prisma enum migration buys no real safety here; Zod (`z.enum`) + a `SelectField` in the create form enforce Men/Women/Mistri going forward.

## Boundaries & Constraints

**Always:**
- Mirror `apps/api/src/vendors/vendors.service.ts`'s `list()` shape exactly (same `paginationParams()`, same `Vendor[] | PaginatedResult<Vendor>` return pattern) — no new backend pattern invented.
- `q` matches name OR category (`contains`, case-insensitive) — both fields, per the ask.
- `category` stays a Prisma `String` — only Zod/UI constrain it to the fixed set; no migration.
- Export the fixed category list as one reusable const in `packages/shared` so the DSR labour dropdown goal (deferred) can reuse it without re-deriving.

**Ask First:** None identified.

**Never:**
- No `DetailPanel`/side-panel — that's Vendors-specific UI not requested here; copy only the search+sort+pagination subset of `vendors-list-client.tsx`, not the panel machinery.
- No Prisma enum / DB migration for `category`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Search by name | `q="Ramesh"` | Rows whose name matches | N/A |
| Search by category | `q="Mistri"` | Rows whose category matches | N/A |
| No match | `q` matches neither field | Empty state: "No Labourers match your search" + Clear filters | N/A |
| Create, valid category | `category: "Men"` | Accepted | N/A |
| Create, invalid category | `category: "Mason"` (old free-text style) | Rejected | Zod enum error |
| Pagination | >25 Labourers | Paginated, `Pagination` control shown | N/A |

</frozen-after-approval>

## Code Map

- `packages/shared/src/schemas/labour-payment.ts:11-18` -- export `DAILY_LABOURER_CATEGORIES = ["Men","Women","Mistri"] as const`; `createDailyLabourerSchema.category` → `z.enum(DAILY_LABOURER_CATEGORIES)`; update "no lookup table" comment.
- `apps/api/src/vendors/vendors.service.ts:25-80` -- reference pattern to mirror exactly (`VendorsListQuery`, `isVendorSortField`, `where`/`orderBy`/`paginationParams` shape).
- `apps/api/src/labour-payments/daily-labourers.service.ts` -- `list()` → `list(query: DailyLabourersListQuery = {})`, same shape as vendors' `list()`; `where` ORs `name`/`category` contains when `q` set; sortable on name/category.
- `apps/api/src/labour-payments/daily-labourers.controller.ts:22-25` -- `@Get()` gains `@Query('q'|'page'|'pageSize'|'sort'|'order')` params (mirrors `vendors.controller.ts:37-46`).
- `apps/web/app/(app)/labour-payments/page.tsx` -- `getLabourers()` → paginated fetch with querystring (mirrors `vendors/page.tsx:43-56`'s `getVendors`); delegates render to new `LabourersListClient` instead of inline `DataTable`.
- New `apps/web/app/(app)/labour-payments/labourers-list-client.tsx` -- mirrors `vendors/vendors-list-client.tsx:1-91,229-297` MINUS the `DetailPanel`/`useVendorDetail` machinery (L92-227, L299-307) — just `useListQueryState`+`useDebouncedSearch`+search `TextField`+`DataTable` (sortKey on Name/Category)+`Pagination`+empty states.
- `apps/web/app/(app)/labour-payments/new/new-labourer-form.tsx:41-49` -- `TextField` → `SelectField` using `DAILY_LABOURER_CATEGORIES`.
- Tests: `apps/web/app/(app)/labour-payments/page.test.tsx` (update fixture shape to `PaginatedResult`), new `labourers-list-client.test.tsx` (mirrors `vendors-list-client.test.tsx`'s search/pagination cases, no panel tests), new `apps/web/app/(app)/labour-payments/new/parse.test.ts` (category enum accept/reject — no test exists for this form today).

## Tasks & Acceptance

**Execution:**
- [x] `packages/shared/src/schemas/labour-payment.ts` -- export `DAILY_LABOURER_CATEGORIES`, `category` → `z.enum(...)`
- [x] `apps/api/.../daily-labourers.service.ts` + `.controller.ts` -- add `q`/sort/pagination, mirroring vendors exactly
- [x] `apps/web/app/(app)/labour-payments/page.tsx` -- paginated fetch, delegate to new client component
- [x] `apps/web/app/(app)/labour-payments/labourers-list-client.tsx` (new) -- search+sort+pagination UI, no DetailPanel
- [x] `apps/web/app/(app)/labour-payments/new/new-labourer-form.tsx` -- category `SelectField`
- [x] Extend/add the 3 test files in Code Map
- [x] `infra/prisma/schema.prisma` (review patch) -- fixed the stale "Free text... no lookup table" comment on `DailyLabourer.category`, left behind by the initial pass which only updated the Zod schema's comment
- [x] `apps/api/.../daily-labourers.controller.spec.ts` (review patch, new) -- controller-level test proving all 5 query params reach the service, matching the precedent already set by `daily-labour-weekly-payments.controller.spec.ts`

**Acceptance Criteria:**
- Given the Labour list, when a name or category substring is typed into search, then only matching rows show.
- Given the create-Labourer form, when a category other than Men/Women/Mistri is submitted, then it's rejected.
- Given >25 Labourers, when the list loads, then it's paginated (not an unbounded fetch).

## Spec Change Log

**Patch (2026-09-23, post-review, single blind-hunter pass — proportionate to a low-risk, well-precedented change):**
1. `infra/prisma/schema.prisma`'s `DailyLabourer.category` doc comment was stale ("Free text... no lookup table") — the initial pass updated the Zod schema's comment but not the Prisma model's. Fixed.
2. Added `daily-labourers.controller.spec.ts` — no test previously verified the 5 new query params actually reach `list()`, matching a precedent already set elsewhere in this module.

Everything else the review found (missing pg_trgm index, `DailyLabourer` absent from global search, no edit/PATCH endpoint for `DailyLabourer`, several UX polish suggestions) was deferred to `deferred-work.md` — real but non-blocking, out of this spec's original scope, or pre-existing gaps not caused by this change.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/api test`, `pnpm --filter @azentisfieldos/web test`, `pnpm typecheck` -- expected: all pass

**Run (2026-09-23):**
- `pnpm typecheck` -- 4/4 packages passed.
- `pnpm --filter @azentisfieldos/web test` -- 212 files / 1233 tests passed.
- `pnpm --filter @azentisfieldos/api test` against `azentisfieldos_test` -- 129 files / 1431 tests passed.

**Re-run after patch (2026-09-23):**
- `pnpm typecheck` -- 4/4 packages passed.
- `pnpm --filter @azentisfieldos/api test` against `azentisfieldos_test` -- 130 files / 1434 tests passed (+1 file, +3 tests for the new controller spec).

**Manual checks (if no CLI):**
- Open `/labour-payments`, search by a category name and by a labourer name, confirm both filter correctly; open "Add Labourer" and confirm Category is now a fixed-choice select.

## Suggested Review Order

**Fixed categories**

- Entry point: the fixed category list, exported for reuse by the deferred DSR labour dropdown goal.
  [`labour-payment.ts:21`](../../packages/shared/src/schemas/labour-payment.ts#L21)

- The enum swap on the create schema.
  [`labour-payment.ts:30`](../../packages/shared/src/schemas/labour-payment.ts#L30)

- Prisma model comment kept in sync, post-review patch.
  [`schema.prisma:683`](../../infra/prisma/schema.prisma#L683)

**Search/sort/pagination (mirrors Vendors)**

- The list query shape, matching `VendorsListQuery` exactly.
  [`daily-labourers.service.ts:23`](../../apps/api/src/labour-payments/daily-labourers.service.ts#L23)

- The `list()` implementation itself — `q` ORs across name and category, per the ask.
  [`daily-labourers.service.ts:42`](../../apps/api/src/labour-payments/daily-labourers.service.ts#L42)

**Peripherals**

- `daily-labourers.controller.spec.ts` (post-review patch) — proves the 5 query params actually reach the service.
- `labourers-list-client.tsx`, `page.tsx`, `new-labourer-form.tsx` and their tests — client wiring, no logic beyond what the backend/schema sections already establish.
