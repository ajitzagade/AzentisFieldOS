---
title: 'Daily Report drafts — backbone (save/resume/finalize with deferred sync)'
type: 'feature'
created: '2026-09-18'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '5fee95a86a0095790dcf449bc2ec4a62956a773b'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A supervisor's day isn't one sitting — materials arrive, crew changes, expenses happen at different hours — but a Daily Report today is a single all-at-once submission that instantly becomes permanent history. There's no way to build a report up across the day; re-opening the form starts empty or (on reload) re-enters materials and **double-decrements stock**. Delete doesn't exist; update exists only as an append-only Correction.

**Approach:** Give `DailySiteReport` a `DRAFT | SUBMITTED` lifecycle. A DRAFT is private, editable, and discardable, and produces **zero** module side effects — no `Consumption`/`Expense`/`RmcEntry`/`WorkRecord`, no stock movement, photos hidden from the gallery. Only **Finalize** materialises sub-records, applies stock, and reveals photos — reusing the exact sync the current one-shot submit already runs. The existing one-shot submit is unchanged (defaults to SUBMITTED). Scope here is the backbone; a dedicated cross-site "My Drafts" management screen is deferred (`deferred-work.md`).

## Boundaries & Constraints

**Always:**
- A DRAFT creates NO `Consumption`/`Expense`/`RmcEntry`/`WorkRecord` and applies NO `SiteStock` delta — those happen only at Finalize, atomically, in one `$transaction`.
- Finalize reuses the current `create()` sub-record materialisation + `applySiteStockDelta` logic — factor it into a shared helper, never a second copy (AD-5).
- The draft-save validator is defined once in `packages/shared` and imported by API + web (AD-7).
- Every read path surfacing reports / today's activity / site photos / report compilation shows `SUBMITTED` only, excluding `DRAFT` — mirror how `supersededDsrIds()` already excludes superseded reports.
- Drafts are per `(siteId, reportDate)`; opening the form for that pair resumes the persisted draft, so re-entry can't double-count.
- A SUBMITTED report is still corrected via `POST /dsr/:id/correct`, never edited in place or deleted (AD-9).

**Ask First:**
- Any change making a SUBMITTED `DailySiteReport` or a ledger row (`Consumption`/`Expense`/`RmcEntry`) UPDATE/DELETE-in-place.
- Offline-draft support (the IndexedDB queue can't mint auth tokens — `apps/web/public/sw.js`); drafts are online-only here.

**Never:**
- No standalone site-photo uploader — photos stay DSR-bound (confirmed).
- No deleting/hard-editing a SUBMITTED report; no `tenant_id`/cross-tenant concept.
- A DRAFT must never appear in the Dashboard "Sites Reporting" count, the `/daily-activity` log, the site photo gallery, or the compiled Daily Report PDF.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Behavior | Error Handling |
|----------|--------------|-------------------|----------------|
| Save draft | Partial report, tap Save Draft | `DailySiteReport{status:DRAFT}` upserted per (site,date); no ledger rows / stock; returns draft id | Invalid input → inline errors, nothing persisted |
| Resume | Open form for a (site,date) with a DRAFT | Form pre-fills from stored draft (narrative + sub-records + photos) | No draft → empty form |
| Finalize | DRAFT with materials/expenses/photos | status→SUBMITTED; sub-records created; SiteStock decremented once; photos gallery-visible; shows in `/daily-activity` | Insufficient stock → whole finalize rolls back, stays DRAFT, clear error |
| Discard | DRAFT, tap Discard | Draft row + its gallery-hidden photos hard-deleted; no ledger rows existed | Discard on a SUBMITTED id → refused |
| Finalize non-draft | Finalize on a SUBMITTED id | Rejected, no double sync | 409 |
| Reload mid-draft | Save → reload → resume → Finalize | Stock decrements exactly once (no double-count) | — |

</frozen-after-approval>

## Code Map

- `infra/prisma/schema.prisma` -- `DailySiteReport` L663-702: add enum `DsrStatus { DRAFT SUBMITTED }`, `status DsrStatus @default(SUBMITTED)`, `draftContent Json?` (holds not-yet-materialised sub-records while DRAFT), `@@index([siteId, reportDate, status])`. `Photo` L704-712 unchanged (stays DSR-bound). Additive migration → `pnpm db:migrate:dev` (no pg_trgm/GIN object, so the AGENTS.md drift caveat doesn't apply).
- `apps/api/src/dsr/dsr.service.ts` -- `create()` L93-~350: add `status:SUBMITTED` to the upsert lookup (L110-112); factor sub-record materialisation + `applySiteStockDelta` (L139-284) into `materializeSubRecords(tx, dsrId, input)`. Add `saveDraft()`, `getDraft()`, `deleteDraft()`, `finalizeDraft()` (finalize = flip status + `materializeSubRecords` + clear `draftContent`, one `$transaction`). `correct()` L353-538 unchanged.
- `apps/api/src/dsr/dsr.controller.ts` -- L32-41: add `POST /dsr/draft`, `GET /dsr/draft?siteId&date`, `DELETE /dsr/draft/:id`, `POST /dsr/:id/finalize` (allowed to SITE_SUPERVISOR + OWNER_ADMIN).
- `apps/api/src/common/superseded-dsrs.ts` -- extend the read-path exclusion so callers also drop `status:DRAFT`.
- `apps/api/src/dashboard/*` -- "Sites Reporting"/today counts count `SUBMITTED` only.
- `apps/api/src/sites/site-photo-gallery.ts` L16-49 (+ web `sites/[id]/photos/page.tsx`, `sites/[id]/page.tsx` `getSitePhotos`) -- exclude photos whose parent DSR is `DRAFT`.
- `apps/api/src/reports/*` (daily-report compile) -- compile from `SUBMITTED` only.
- `packages/shared/src/schemas/daily-site-report.ts` L59-73 -- add `saveDraftSchema` (all sub-records optional), reused API+web (AD-7).
- `apps/web/app/(app)/dsr/new/page.tsx` -- add Save Draft / Finalize / Discard; on mount fetch + pre-fill any existing draft for the picked (site,date). Offline "Saved on device" path unchanged.
- `apps/web/app/(app)/daily-activity/page.tsx` + `[id]/page.tsx` -- log shows SUBMITTED only (drafts excluded). No new drafts-list screen here (deferred).

## Tasks & Acceptance

**Execution:**
- [x] `infra/prisma/schema.prisma` (+ migration) -- add `DsrStatus`, `status`, `draftContent`, index; `pnpm db:migrate:dev`.
- [x] `packages/shared/src/schemas/daily-site-report.ts` -- add `saveDraftSchema` (sub-records optional) -- single validator (AD-7).
- [x] `apps/api/src/dsr/dsr.service.ts` -- factor `materializeSubRecords`; add `saveDraft`/`getDraft`/`deleteDraft`/`finalizeDraft`; gate `create()`+reads on `status:SUBMITTED`.
- [x] `apps/api/src/dsr/dsr.controller.ts` -- add draft + finalize routes with role guards.
- [x] `apps/api/src/common/superseded-dsrs.ts` (+ dashboard, reports, site-photo-gallery callers) -- exclude `DRAFT` from every submitted-report read path.
- [x] `apps/web/app/(app)/dsr/new/page.tsx` -- Save Draft + Finalize + Discard + resume-on-mount (also removes the reload double-count).
- [x] `apps/web/app/(app)/daily-activity/page.tsx` (+ `[id]/page.tsx`) -- exclude drafts from the log/detail.
- [x] Tests -- `dsr.service.integration.spec.ts`: deferred sync (draft = no ledger/stock), finalize atomicity, insufficient-stock rollback, discard, no-double-count-on-resubmit; web action test for draft parse; regression asserting a finalized report's materials→stock, expenses→Expenses (site-specific), photos→gallery.

**Acceptance Criteria:**
- Given a DRAFT with 50 bags consumed, when I inspect stock and the Inventory/Expenses/Movements modules, then nothing changed and no Consumption/Expense rows exist.
- Given that DRAFT, when I Finalize, then exactly one Consumption row exists, SiteStock decrements by 50 once, its expenses appear in Expenses scoped to that site, and its photos appear in `/sites/[id]/photos`.
- Given a DRAFT, when I save → reload → resume → Finalize, then stock decrements exactly once.
- Given a DRAFT, when I Discard, then the row and its photos are gone with no ledger rows ever created; a SUBMITTED report refuses delete and offers Correct.
- Given a DRAFT, when the Owner views the Dashboard / `/daily-activity` / compiled Daily Report, then the draft does not appear.

## Design Notes

Sub-records live as `draftContent` JSON on the draft row — not as real Consumption/Expense/RmcEntry rows — so a discarded draft leaves the append-only ledger untouched and no read path needs per-row draft filtering; only the parent DSR's `status` is checked. Photos are the exception: the FK is non-nullable, so a draft's photos attach to the draft row and are filtered from the gallery by parent `status` until finalize (discarding a draft deletes them — they never became history). Finalize and one-shot submit share `materializeSubRecords`, so the two paths can't drift on how stock is applied (the double-count bug class).

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/api test` -- new draft/finalize integration tests pass.
- `pnpm typecheck && pnpm lint` -- clean across api/web/shared.
- `pnpm db:migrate:dev` -- additive migration applies; `pnpm db:generate` client has `DsrStatus`.
- `pnpm test:e2e` -- existing DSR specs still green.

**Manual checks:**
- Save a draft with a material + expense + photo; confirm Inventory, Expenses, and the site gallery show nothing; Finalize; confirm all three reflect it, exactly once.

## Suggested Review Order

**Design intent (start here)**

- The DRAFT|SUBMITTED lifecycle + `draftContent` — the whole feature's backbone
  [`schema.prisma:671`](../../infra/prisma/schema.prisma#L671)

**Lifecycle & deferred sync (API service)**

- Finalize: flip status, materialise sub-records, apply stock — all under one lock
  [`dsr.service.ts:606`](../../apps/api/src/dsr/dsr.service.ts#L606)
- Shared materialiser so finalize and one-shot submit can never drift on stock
  [`dsr.service.ts:104`](../../apps/api/src/dsr/dsr.service.ts#L104)
- Save draft: per-user upsert + block when a SUBMITTED report already exists
  [`dsr.service.ts:419`](../../apps/api/src/dsr/dsr.service.ts#L419)
- Resume / Discard, scoped to the authoring user, discard under the same lock
  [`dsr.service.ts:491`](../../apps/api/src/dsr/dsr.service.ts#L491)

**Read-path exclusion (the blast radius)**

- Single source spread across ~10 read paths so a DRAFT never surfaces as a report
  [`superseded-dsrs.ts:20`](../../apps/api/src/common/superseded-dsrs.ts#L20)

**API surface & validation**

- New draft/finalize routes with role guards + query/param Zod validation
  [`dsr.controller.ts:55`](../../apps/api/src/dsr/dsr.controller.ts#L55)

**Shared validator (AD-7)**

- One draft-save schema imported by both API and web
  [`daily-site-report.ts:87`](../../packages/shared/src/schemas/daily-site-report.ts#L87)

**Web entry UX**

- Finalize with a photo-upload catch; Discard behind confirm + in-flight guard
  [`page.tsx:510`](../../apps/web/app/(app)/dsr/new/page.tsx#L510)
- Resume banner so a pre-filled form reads as "continuing a saved draft"
  [`page.tsx:686`](../../apps/web/app/(app)/dsr/new/page.tsx#L686)

**Migrations & tests (supporting)**

- Additive status/draftContent migration, then the per-user partial unique index
  [`migration.sql`](../../infra/prisma/migrations/20260918100000_dsr_draft_private_unique_index/migration.sql#L1)
- Deferred-sync, block, per-user, re-validation, and read-path-exclusion coverage
  [`dsr.service.integration.spec.ts:1`](../../apps/api/src/dsr/dsr.service.integration.spec.ts#L1)
