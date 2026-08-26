---
baseline_commit: 1218a603b227b0bc12da1fadb0953dc6baf8d127
---

# Story 13.1: Auto-Compile & Deliver Branded Daily Report

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want each day's branded per-Site report to compile automatically from that day's DSR and deliver via WhatsApp/Email with no manual send step,
so that I get the day's summary without asking anyone to send it, and it always reflects my Tenant's own branding.

## Acceptance Criteria

1. **Given** a Site's DSR is submitted and synced for a given day, **when** the scheduled compile runs (Vercel Cron), **then** a branded report auto-generates reflecting the Tenant's branding configuration — seeded with sensible defaults (Tenant name, neutral placeholder colors, no logo) from day one, so this story doesn't hard-depend on Epic 14's admin UI. (FR-32)
2. The report delivers via the configured channel(s) with no manual "Send" action anywhere in the UI. (FR-33, UX-DR19)
3. **Given** delivery fails, **when** the retry policy is exhausted, **then** the failure surfaces in-app as a visible status, never silently dropped. (FR-33)
4. A Site with no DSR for a given day produces no report for that day — there is nothing to compile, and this is a normal state, not an error.

## Tasks / Subtasks

- [x] Task 1 — Schema additions (must land before anything else in this epic) (AC: #1, #2, #3)
  - [x] **`BrandingConfig` doesn't exist anywhere in the schema, but AC #1 requires it from day one.** Add a singleton config model: `model BrandingConfig { id String @id @default(uuid(7)), tenantName String, logoUrl String?, primaryColor String @default("#0F5257"), createdAt DateTime @default(now()), updatedAt DateTime @updatedAt }`. This is **not** a `Tenant` table in AD-1's forbidden sense (no `tenant_id`, no cross-tenant selector) — it's a single-row app-configuration record scoped implicitly to this one deployment's database, the same category of thing as `infra/tenants/*.json`'s committed config, just runtime-editable per FR-47's "no publish step" requirement (which a build-time/env-var config couldn't satisfy). Seed exactly one row at deploy time with sensible defaults (Tenant name from `infra/tenants/*.json` if readable at seed time, else a placeholder like "Your Company"; `primaryColor` defaulting to this product's own `accent-teal-700` token value as a neutral placeholder; no logo). Epic 14 later adds the admin UI to edit this row — this story only needs the row and its seeded defaults to exist.
  - [x] Add `model DailyReport { id String @id @default(uuid(7)), siteId String, site Site @relation(fields: [siteId], references: [id]), dailySiteReportId String, dailySiteReport DailySiteReport @relation(fields: [dailySiteReportId], references: [id]), reportDate DateTime @db.Date, content Json, generatedAt DateTime @default(now()), @@unique([siteId, reportDate]) }`. `content` is the fully-rendered/compiled report payload (site name, date, branding snapshot, work/labour/material/RMC/machinery/expense summary drawn from the linked DSR's own relations) — **denormalized and stored at generation time**, deliberately: if `BrandingConfig` or the underlying DSR data changed after generation, a historical report must still read exactly as it was delivered, never silently re-render with today's branding. `dailySiteReportId` is required (AC #4 — no `DailyReport` row is created for a Site/day with no DSR at all, this isn't a nullable "maybe compiled" field).
  - [x] Add `model ReportDelivery { id String @id @default(uuid(7)), dailyReportId String, dailyReport DailyReport @relation(fields: [dailyReportId], references: [id]), channel String, status String @default("PENDING"), attempts Int @default(0), lastError String?, deliveredAt DateTime?, createdAt DateTime @default(now()) }`. One row per `(DailyReport, channel)`. `status`/`attempts`/`lastError`/`deliveredAt` are narrowly mutable via retry — this is a lifecycle-completion field set, the same reasoning Epic 5 Story 5.2's `confirmReceipt` and Epic 7 Story 7.3's `markPaid` already established for "completing an in-progress event is not an AD-9 correction" — cite that precedent rather than re-deriving it, and don't add `correctsId`/`reason` here.
  - [x] Run `pnpm db:generate`.
- [x] Task 2 — Shared Zod schema (AC: #1, #2)
  - [x] Create `packages/shared/src/schemas/branding-config.ts`: `updateBrandingConfigSchema` (`tenantName: z.string().min(1).max(200).optional()`, `logoUrl: z.url().optional()`, `primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional()`) — full CRUD lifecycle for this is Epic 14's job; this story only needs enough to seed and read it, but define the update schema now since the seed/admin boundary is identical to every other lookup-table precedent in this project (create the shape once, Epic 14 wires the UI to it later).
  - [x] Export from `packages/shared/src/index.ts`.
- [x] Task 3 — `apps/api`: compile + deliver (AC: #1, #2, #3, #4)
  - [x] `apps/api/src/reports/` module: `reports.module.ts`, `report-compiler.service.ts` (builds a `DailyReport.content` payload from a `DailySiteReport` and its relations, plus the current `BrandingConfig` row, for a given Site+date), `report-delivery.service.ts` (per-channel send logic), `reports.controller.ts` (the Cron entry point and read endpoints for Stories 13.2–13.4 to extend).
  - [x] `POST /cron/compile-daily-reports` — the Vercel Cron target (AD-13). Verify the request via Vercel Cron's standard mechanism (the `Authorization: Bearer $CRON_SECRET` header Vercel sends, checked against a `CRON_SECRET` env var) — reject any request without it, this endpoint must not be publicly callable. Add the schedule to `vercel.json`'s `crons` array (e.g. `{ "path": "/api/cron/compile-daily-reports", "schedule": "0 18 * * *" }` — 6 PM local per the mockup's example delivery times; confirm the exact hour with the product owner rather than treating `18` as authoritative, it's a reasonable placeholder matching the mockup's "6:45 PM" delivered-at examples, not a specified requirement).
  - [x] The Cron handler: for every `Site`, find today's `DailySiteReport` (if none, skip — AC #4); for each Site with one, `ReportCompilerService.compile(site, dsr)` builds and inserts the `DailyReport` row (skip if one already exists for that `(siteId, reportDate)`, idempotent re-runs); then for each enabled channel (Task 4), create a `ReportDelivery` row and call `ReportDeliveryService.send(delivery)`.
  - [x] `ReportDeliveryService.send`: `IN_APP` channel marks `status: 'SENT'`, `deliveredAt: now()` immediately — no external call, the report simply existing and being viewable in the product **is** in-app delivery. `EMAIL` channel sends via Resend (architecture spine's decided vendor) to every `User` with `role: 'OWNER_ADMIN'`'s email address (FR-50's full "which channels, to whom" configuration is Epic 14 — this is a scoped, sensible default: notify the Owner/Admins, not an open recipient list). `WHATSAPP` channel — see Dev Notes, this is genuinely blocked on an unmade business decision, not an implementation gap.
  - [x] Retry policy: on a channel send failure, increment `attempts` and set `lastError`; retry up to 3 total attempts (e.g., on the same Cron run with a short in-process backoff, or via a second scheduled retry-sweep Cron hitting `PENDING`/failed-but-under-3-attempts rows — either is acceptable, pick the simpler one: a retry-sweep Cron reusing the same idempotent `send` call is simpler than in-process retry-with-backoff inside a single serverless invocation, which has its own execution-time limits). After the 3rd failed attempt, set `status: 'FAILED'` and stop retrying — this is what AC #3's "surfaces in-app" then displays.
  - [x] `GET /reports/daily?siteId=&from=&to=` — the "Recent Reports" delivery log (mockup's table), returning `DailyReport` rows joined with their `ReportDelivery` rows' latest status per channel, for Story 13.1's own list section. `GET /reports/daily/:id` — the full `content` payload, for the branded report-preview card.
- [x] Task 4 — `apps/web` UI (AC: #1, #2, #3)
  - [x] Replace the stub `apps/web/app/(app)/reports/page.tsx` with the real Reports shell: a "Recent Reports" section (`DataTable`: Report / Site / Period / Generated / Delivery Status badge / "View report" action), matching `16-reports.html`'s log table, **scoped to the "Daily Site Report" row type only** — see Dev Notes on why the mockup's Weekly/Monthly report rows aren't built by this epic. Delivery Status badge: `success` "Delivered" when every enabled channel's `ReportDelivery.status = 'SENT'`, `warning` "Pending" while any channel is still retrying, `danger` "Failed" once a channel has exhausted retries (AC #3's visible surface).
  - [x] `apps/web/app/(app)/reports/daily/[id]/page.tsx` — the branded report-preview card (`16-reports.html`'s `.report-preview` treatment: navy header with logo-placeholder/wordmark from `BrandingConfig`, body rendering the compiled `content`, footer showing delivery confirmation per channel) — this reads the stored `content` snapshot, it does not re-fetch/re-render live DSR data (per Task 1's denormalization rationale).
  - [x] No "Send Report" button anywhere on this page or the list — confirm this explicitly during review, it's the epic's own named UX-DR19 requirement and the easiest thing to accidentally add out of habit (every other transactional screen in this project has a primary "Add/Record X" button; this one deliberately doesn't).
- [x] Task 5 — Tests (AC: all)
  - [x] `report-compiler.service.spec.ts`: compiles a correct `content` payload from a DSR fixture; skips a Site with no DSR for the day.
  - [x] `report-delivery.service.spec.ts`: `IN_APP` marks sent immediately with no external call; `EMAIL` send failure increments `attempts`/sets `lastError` without throwing out of the Cron handler (one Site's delivery failure must not abort compiling/delivering for every other Site in the same run); after 3 failed attempts, status becomes `FAILED` and a 4th attempt is not made.
  - [x] `reports.controller.spec.ts`: the Cron endpoint rejects a request missing/wrong `CRON_SECRET`.
  - [x] `apps/web` component test: Delivery Status badge reflects each of the three states correctly; no "Send" control exists anywhere on the rendered page (an explicit `queryByText`/`queryByRole` assertion that nothing matches "Send," not just an absence of a test for it).

## Dev Notes

**Two schema gaps found — one is the largest this project has hit so far.** `BrandingConfig` doesn't exist anywhere, despite this story's own AC requiring it "from day one" — the biggest gap yet because it's not a missing field on an existing model, it's an entire model this epic depends on that was never scaffolded. `DailyReport`/`ReportDelivery` are new too, but expected — no epic before this one needed a "compiled document + delivery attempt" shape, so there was nothing to have gotten wrong earlier.

**The WhatsApp channel is genuinely blocked on an unmade business decision — implement around it, don't guess a vendor.** The architecture spine's own Deferred section says: *"WhatsApp BSP contract selection (Gupshup vs Interakt vs AiSensy) — a vendor/pricing decision, not an architectural one... Resolve when FR-33 is implemented (PRD Open Question 3)."* This story **is** "when FR-33 is implemented" — but the spine explicitly frames the vendor choice as the founder's decision, not an engineering one, and picking one silently here would lock in a specific BSP's API contract (auth scheme, message-template rules, webhook shape) without that decision actually having been made. Resolution: implement `ReportDeliveryService`'s `WHATSAPP` branch behind a small adapter interface (`WhatsAppSender.send(recipient, content): Promise<void>`), ship a `NotConfiguredWhatsAppSender` that immediately marks the delivery `FAILED` with `lastError: "WhatsApp BSP not yet selected (PRD Open Question 3)"` (a clear, honest in-app-visible reason, not a crash), and seed the default enabled-channels set (Task 1/3) to `EMAIL` + `IN_APP` only, leaving `WHATSAPP` disabled until a real adapter replaces the placeholder. This satisfies AC #2/#3 today (delivery works via the channels that are actually available, failures surface honestly) without fabricating a vendor integration nobody has chosen.

**The mockup's "Recent Reports" log shows Weekly Inventory and Monthly Labour report rows alongside the Daily Site Report — this epic doesn't build those, and that's a resolved scope boundary, not an oversight.** FR-32/FR-33 (this story's binding FRs) describe exactly one recurring, auto-delivered artifact: the daily per-Site report compiled from that day's DSR. Nothing in FR-32, FR-33, or this epic's Goal statement describes a weekly or monthly auto-compiled/auto-delivered report of any kind — Stories 13.2–13.4 build **on-demand, user-filtered** report *views* (Site/Inventory/Labour/Machinery/Financial), a genuinely different capability from "a document that compiles and delivers itself on a schedule." Building a general multi-cadence auto-report-scheduling system would be real, unscoped work no FR asks for. This story's "Recent Reports" list is scoped to `DailyReport` rows only; if a future epic wants scheduled weekly/monthly delivery of Stories 13.2–13.4's report views, that's new, explicitly-scoped work, not something to infer from one illustrative mockup row.

**Depends on**: Epic 3 (`DailySiteReport` as the compile source) and Epic 2 (`Site`). Independent of Epic 14, by design (Task 1's seeded-defaults approach) — re-read the epic's own Implementation Notes on this before assuming `BrandingConfig` needs Epic 14 first.

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-13 (Cron-triggered `apps/api` route, no separate worker service — do not introduce one), NFR-2-adjacent (delivery failures are surfaced explicitly, never silently retried forever or silently dropped).

### Project Structure Notes

- New `apps/api/src/reports/` module and three new Prisma models (`BrandingConfig`, `DailyReport`, `ReportDelivery`).
- `apps/web/app/(app)/reports/page.tsx` already exists as a stub — replaced here; Stories 13.2–13.4 extend it with the filterable-report tabs (`chip-row` in the mockup).
- New `vercel.json` `crons` entry.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-9 — Automated Report Generation & Delivery] (FR-32, FR-33)
- [Source: _bmad-output/planning-artifacts/epics/phase-6-insight-delivery/epic-13-reports-auto-delivery.md — "Epic 14 doesn't gate this epic" note; AD-13 binding]
- [Source: _bmad-output/planning-artifacts/stories/phase-6-insight-delivery/epic-13-reports-auto-delivery/story-13.1-auto-compile-deliver-report.md]
- [Source: infra/prisma/schema.prisma — BrandingConfig, DailyReport, ReportDelivery are new models this story's Task 1 adds]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-13, Deferred — WhatsApp BSP contract explicitly deferred to "when FR-33 is implemented"; Stack table — Resend, Vercel Cron]
- [Source: _bmad-output/implementation-artifacts/5-2-record-godown-site-movement.md, 7-3-record-a-payment.md — the "narrow lifecycle-completion update, not a correction" precedent ReportDelivery follows]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/16-reports.html]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.8 (1M context) (claude-opus-4-8[1m])

### Debug Log References

### Completion Notes List

- **Schema (Task 1).** Added three new models to `infra/prisma/schema.prisma` exactly as specified: `BrandingConfig` (singleton app-config, explicitly NOT an AD-1 tenant table — no `tenant_id`/selector), `DailyReport` (denormalized `content` Json snapshot, required `dailySiteReportId`, `@@unique([siteId, reportDate])`), `ReportDelivery` (lifecycle-completion fields, no `correctsId`/`reason` — cites the Story 5.2 `confirmReceipt` / 7.3 `markPaid` precedent per the task). Added back-relations (`dailyReports`) on `Site` and `DailySiteReport`.
- **Migration (repo lesson #1 applied first time).** Generated + committed `infra/prisma/migrations/20260826103944_add_branding_and_daily_reports/migration.sql` via `pnpm db:migrate:dev` — `pnpm db:generate` alone is not deployable (this repo ships DB changes via `pnpm db:migrate:deploy`). Regenerated the Prisma client. To avoid polluting the shared local dev DB used by parallel worktrees, the migration was generated/applied against a throwaway database (`azentisfieldos_wt_epic13`); verified `pnpm db:migrate:deploy` applies it cleanly to a fresh DB.
- **Seed.** `infra/prisma/seed.ts` now creates exactly one `BrandingConfig` row if none exists (idempotent, never a second row, never overwrites Epic 14 edits). Tenant name is read from the committed `infra/tenants/<slug>.json` `displayName` when present (verified: seeds "Sandeep Enterprises"), else falls back to "Your Company"; `primaryColor` uses the schema default (`#0F5257`, the accent-teal-700 token value); no logo.
- **Shared schema (Task 2).** `packages/shared/src/schemas/branding-config.ts` exports `updateBrandingConfigSchema` (all fields optional, hex-regex on `primaryColor`, `z.url()` on `logoUrl`) + type; exported from the package index. Only the update shape is needed now; Epic 14 wires the admin UI to it.
- **apps/api (Task 3).** New `apps/api/src/reports/` module: `ReportCompilerService` (pure `buildContent` + `compile` with idempotent create + `currentDsrsForDate` which excludes corrected-over DSRs, Story 3.5), `ReportDeliveryService` (`ensureDeliveries`/`send`/`retryPending`), `ReportsService` (read side: `listDaily` log + `findDaily` full snapshot), and `ReportsController`. Per-channel senders live behind small adapter interfaces in `report-senders.ts` selected via Nest DI tokens.
- **Cron + auth.** `POST /cron/compile-daily-reports` (+ `POST /cron/retry-report-deliveries`) verify Vercel Cron's `Authorization: Bearer $CRON_SECRET` header, fail-closed (a missing `CRON_SECRET` env var rejects everything). `vercel.json` (new) carries both `crons` entries.
- **Retry policy.** Chose the simpler retry-sweep-Cron option (not in-process backoff): each `send()` is one attempt; the first attempt runs inline during compile, the retry-sweep Cron re-attempts still-`PENDING` rows under the 3-attempt cap; the 3rd failure flips `status: 'FAILED'` and no 4th attempt is ever made. Failures record `lastError` and surface in-app (AC #3). One Site's delivery failure never throws out of the Cron run (AC: other Sites still deliver).
- **Enabled channels.** Default `ENABLED_CHANNELS = ['IN_APP', 'EMAIL']`. `IN_APP` marks SENT immediately with no external call. `EMAIL` sends via a `ResendEmailSender` that calls Resend's documented REST endpoint directly through `fetch` (no SDK dependency added — keeps the build dependency-clean and the call trivially mockable); when `RESEND_API_KEY`/`REPORT_EMAIL_FROM` are unset it throws an honest error that surfaces as the delivery's `lastError` (same not-yet-configured status as the R2 client — never exercised against a real Resend account).
- **apps/web (Task 4).** Replaced `app/(app)/reports/page.tsx` with the "Recent Reports" delivery log (shared `DataTable`, scoped to Daily Site Report rows only per Dev Notes) and added `app/(app)/reports/daily/[id]/page.tsx` (branded report-preview card rendering the stored `content` snapshot, delivery confirmation per channel). `delivery-status-badge.tsx` maps deliveries → success/warning/danger badge. There is deliberately NO "Send" control anywhere (UX-DR19), asserted explicitly in the test.
- **Tests (Task 5).** All new tests pass: `report-compiler.service.spec.ts` (buildContent correctness incl. Prisma Decimal, AC #4 skip, idempotency), `report-delivery.service.spec.ts` (IN_APP no-external-call, EMAIL failure increments without throwing, FAILED-after-3-and-no-4th, Owner/Admin recipients), `reports.controller.spec.ts` (Cron secret reject/accept/fail-closed), `reports.controller.integration.spec.ts` (repo lesson #2 — real INestApplication + supertest proving `/reports/daily` static wins over `:id` and `POST /cron/...` reaches the compile handler behind the secret), and `apps/web reports/page.test.tsx` (three badge states + explicit no-"Send" assertion).
- **Verification.** `apps/api` typecheck clean; `apps/web` typecheck + lint clean; `packages/shared` typecheck clean; reports lint clean (only the same pre-existing `no-unsafe-argument` warnings the `rmc.controller.integration.spec.ts` precedent carries). New reports tests 21/21 pass. Full `apps/web` suite 496/496 pass. Full `apps/api` suite: 571/572 pass — the single failure, `dsr/dsr.service.integration.spec.ts > listByDate`, is a **pre-existing** shared-local-DB isolation bug (its assertion expects submitter name "System (placeholder…)" but the unmodified `get-placeholder-user-id.ts` now creates "Field Team"; both files are untouched by this diff, and Story 11.1's own Dev Agent Record already documents this same spec as a pre-existing unrelated failure).

**Blocked on external decisions (not invented):**

- **WhatsApp channel.** Genuinely blocked on the deferred BSP contract decision (Gupshup vs Interakt vs AiSensy — PRD Open Question 3, architecture spine Deferred). Implemented behind a `WhatsAppSender` adapter with a `NotConfiguredWhatsAppSender` that fails honestly with an in-app-visible reason; `WHATSAPP` is left OUT of the default enabled-channels set until a real adapter replaces it. No vendor was silently chosen.
- **Cron schedule hour.** `18:00` compile + `19:00`/`21:00` retries in `vercel.json` are placeholders matching the mockup's "6:45 PM" examples, flagged for product-owner confirmation (incl. timezone: "today" is computed in UTC). Not treated as authoritative.

**Follow-ups / risks left open (consistent with existing epic-wide TODOs):**

- The `/api/...` cron path prefix assumes the deployment routes `apps/api` under `/api` — that rewrite is not yet wired (same class as the "apps/api dev-server boot" TODO in AGENTS.md). The Resend and (future) WhatsApp paths have never run against real vendor accounts.
- No per-request auth: EMAIL recipients are all `OWNER_ADMIN` users (the scoped default); FR-50's full recipient configuration is Epic 14.

**Code-review follow-ups applied (patch batch):**

- **Patch 1 — the delivered email is now actually branded (AC/FR-32 gap).** `renderReportEmailHtml` previously hardcoded the navy header and ignored the snapshot's `primaryColor`/`logoUrl`, even though the web preview honored them — so the primary delivered artifact wasn't branded. Fixed: the email header background is now `content.branding.primaryColor`, and `content.branding.logoUrl` renders as an `<img>` when present, falling back to the tenant wordmark. Inline styles are the correct, accepted exception to AD-4 for email HTML (clients strip `<style>`/classes).
- **Patch 2 — HTML-escape all free-text before interpolation (injection).** Added an `escapeHtml()` helper and wrapped every interpolated free-text `content.*` value (site/tenant names, work text, material names/sizes/units, RMC grades, logo URL) in the server-built email string; React auto-escapes the web preview but this hand-built string did not, so a DSR value with `<`/`>`/`&`/`"`/`'` could break markup or inject content.
- **Patch 3a — DB-level delivery idempotency.** Added `@@unique([dailyReportId, channel])` to `ReportDelivery` + the deployable migration `20260826110000_add_report_delivery_channel_unique/migration.sql` (`CREATE UNIQUE INDEX`). Generated by hand to match Prisma's output because `prisma migrate dev` refuses to run non-interactively when it emits a constraint-add warning; verified `pnpm db:migrate:deploy` applies it cleanly on a fresh DB and `prisma migrate status` reports the schema in sync (no drift).
- **Patch 3b — idempotent `ensureDeliveries`.** The findMany-then-create pre-check was non-atomic (a Cron re-run or `?date=` backfill could re-create + re-send an EMAIL row). Now the create's `P2002` unique-violation is caught and treated as "already exists / skip send". Invariant: a second `ensureDeliveries` for the same report creates zero rows and triggers zero sends — no double-delivery.
- **Patch 3c — resilient compile loop.** `compileDailyReports` now wraps each Site's `compile()` + `ensureDeliveries()` in try/catch, recording the failed `siteId` (returned as `failedSiteIds`) and continuing to the remaining Sites, so one Site's DB error no longer aborts the whole run (`compiled` can now be `< sitesWithDsr`).
- **Patch 4 — tests for all of the above.** Added `report-senders.spec.ts` (email header uses `primaryColor`; logo renders as `<img>`; wordmark fallback; injected `<script>`/`<` in DSR fields is escaped, plus an `escapeHtml` unit test). Extended `report-delivery.service.spec.ts` with a store-backed harness covering `ensureDeliveries` (creates exactly ENABLED_CHANNELS and sends each once; zero creates/sends when all exist; P2002-race → skip send, no double-deliver), `retryPending`'s `{ status: 'PENDING', attempts: { lt: MAX_DELIVERY_ATTEMPTS } }` filter, and the zero-recipient EMAIL path recording `lastError`/`FAILED` (AC #3, not a silent drop). Extended `reports.controller.spec.ts` with the `failedSiteIds` field and a one-Site-fails-loop-continues assertion.
- **Minor — doc comment fix.** `DailyReport.content`'s schema comment now says the payload carries the DSR's free-text `equipmentUsed` tags (informational, not machinery-at-site location data), not a "machinery" summary.
- **Still the open PO item:** the Cron "today" timezone / schedule hour remains flagged as the pending product-owner decision — deliberately not changed.
- **Post-patch verification:** `apps/api` typecheck clean; reports lint clean (only the same pre-existing `no-unsafe-argument` warnings the `rmc.controller.integration.spec.ts` precedent carries); reports tests 32/32 pass; `apps/web` build compiles with both `/reports` and `/reports/daily/[id]` routes. Full `apps/api` suite: the only failures are `dsr.service.integration.spec.ts` and (run-order-dependent) `consumption.service.integration.spec.ts` — both are **pre-existing** shared-local-DB test-isolation flakiness (each passes in isolation on a fresh DB / the dsr one is the baseline placeholder-name mismatch Story 11.1 already documented), touch none of this story's tables, and are absent from this diff.

### File List

- `infra/prisma/schema.prisma` (modified — `BrandingConfig`, `DailyReport`, `ReportDelivery` models + `Site`/`DailySiteReport` back-relations)
- `infra/prisma/migrations/20260826103944_add_branding_and_daily_reports/migration.sql` (new — the deployable migration for the three new models)
- `infra/prisma/migrations/20260826110000_add_report_delivery_channel_unique/migration.sql` (new — code-review Patch 3a: `@@unique([dailyReportId, channel])`)
- `infra/prisma/seed.ts` (modified — seed the singleton `BrandingConfig` row)
- `packages/shared/src/schemas/branding-config.ts` (new — `updateBrandingConfigSchema`)
- `packages/shared/src/index.ts` (modified — export branding-config)
- `apps/api/src/reports/reports.module.ts` (new)
- `apps/api/src/reports/report-compiler.service.ts` (new)
- `apps/api/src/reports/report-delivery.service.ts` (new)
- `apps/api/src/reports/report-senders.ts` (new — EmailSender/WhatsAppSender adapters + Resend/NotConfigured impls + branded, escaped email HTML)
- `apps/api/src/reports/report-senders.spec.ts` (new — code-review Patch 4: email branding + HTML-escaping tests)
- `apps/api/src/reports/reports.service.ts` (new — read side)
- `apps/api/src/reports/reports.controller.ts` (new — Cron + read endpoints)
- `apps/api/src/reports/report-compiler.service.spec.ts` (new)
- `apps/api/src/reports/report-delivery.service.spec.ts` (new)
- `apps/api/src/reports/reports.controller.spec.ts` (new)
- `apps/api/src/reports/reports.controller.integration.spec.ts` (new — route-ordering + Cron path guard)
- `apps/api/src/app.module.ts` (modified — register `ReportsModule`)
- `apps/web/app/(app)/reports/page.tsx` (modified — "Recent Reports" delivery log)
- `apps/web/app/(app)/reports/delivery-status-badge.tsx` (new)
- `apps/web/app/(app)/reports/daily/[id]/page.tsx` (new — branded report-preview card)
- `apps/web/app/(app)/reports/page.test.tsx` (new)
- `vercel.json` (new — Cron schedules)

## Suggested Review Order

**Schema (the story's data foundation)**

- BrandingConfig (singleton, not an AD-1 tenant table), DailyReport (denormalized content snapshot, @@unique[siteId,reportDate]), ReportDelivery (@@unique[dailyReportId,channel]).
  [`schema.prisma`](../../infra/prisma/schema.prisma)

- Migrations + seed (one BrandingConfig row from infra/tenants).
  [`seed.ts`](../../infra/prisma/seed.ts)

**Compile + deliver (apps/api)**

- Report compiler — builds the denormalized content payload from a DSR + current BrandingConfig.
  [`report-compiler.service.ts:1`](../../apps/api/src/reports/report-compiler.service.ts#L1)

- Delivery: idempotent per-channel fan-out (P2002-safe), 3-attempt retry sweep, honest failure recording.
  [`report-delivery.service.ts:1`](../../apps/api/src/reports/report-delivery.service.ts#L1)

- Senders — branded + HTML-escaped email (Resend); NotConfiguredWhatsAppSender fails honestly.
  [`report-senders.ts:1`](../../apps/api/src/reports/report-senders.ts#L1)

- Cron-secret-guarded controller — compile + retry Cron targets, resilient per-Site loop, read endpoints.
  [`reports.controller.ts:1`](../../apps/api/src/reports/reports.controller.ts#L1)

**Web UI (no manual "Send" — UX-DR19)**

- Recent-Reports delivery log with status badge; branded report-preview card from the stored snapshot.
  [`reports/page.tsx:1`](../../apps/web/app/(app)/reports/page.tsx#L1)

**Tests (supporting)**

- HTTP-level route-ordering + cron-secret guard.
  [`reports.controller.integration.spec.ts:1`](../../apps/api/src/reports/reports.controller.integration.spec.ts#L1)

- Delivery idempotency/retry/zero-recipient + email branding/escaping.
  [`report-delivery.service.spec.ts:1`](../../apps/api/src/reports/report-delivery.service.spec.ts#L1)
