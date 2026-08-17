# Story 13.1: Auto-Compile & Deliver Branded Daily Report

Status: ready-for-dev

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

- [ ] Task 1 — Schema additions (must land before anything else in this epic) (AC: #1, #2, #3)
  - [ ] **`BrandingConfig` doesn't exist anywhere in the schema, but AC #1 requires it from day one.** Add a singleton config model: `model BrandingConfig { id String @id @default(uuid(7)), tenantName String, logoUrl String?, primaryColor String @default("#0F5257"), createdAt DateTime @default(now()), updatedAt DateTime @updatedAt }`. This is **not** a `Tenant` table in AD-1's forbidden sense (no `tenant_id`, no cross-tenant selector) — it's a single-row app-configuration record scoped implicitly to this one deployment's database, the same category of thing as `infra/tenants/*.json`'s committed config, just runtime-editable per FR-47's "no publish step" requirement (which a build-time/env-var config couldn't satisfy). Seed exactly one row at deploy time with sensible defaults (Tenant name from `infra/tenants/*.json` if readable at seed time, else a placeholder like "Your Company"; `primaryColor` defaulting to this product's own `accent-teal-700` token value as a neutral placeholder; no logo). Epic 14 later adds the admin UI to edit this row — this story only needs the row and its seeded defaults to exist.
  - [ ] Add `model DailyReport { id String @id @default(uuid(7)), siteId String, site Site @relation(fields: [siteId], references: [id]), dailySiteReportId String, dailySiteReport DailySiteReport @relation(fields: [dailySiteReportId], references: [id]), reportDate DateTime @db.Date, content Json, generatedAt DateTime @default(now()), @@unique([siteId, reportDate]) }`. `content` is the fully-rendered/compiled report payload (site name, date, branding snapshot, work/labour/material/RMC/machinery/expense summary drawn from the linked DSR's own relations) — **denormalized and stored at generation time**, deliberately: if `BrandingConfig` or the underlying DSR data changed after generation, a historical report must still read exactly as it was delivered, never silently re-render with today's branding. `dailySiteReportId` is required (AC #4 — no `DailyReport` row is created for a Site/day with no DSR at all, this isn't a nullable "maybe compiled" field).
  - [ ] Add `model ReportDelivery { id String @id @default(uuid(7)), dailyReportId String, dailyReport DailyReport @relation(fields: [dailyReportId], references: [id]), channel String, status String @default("PENDING"), attempts Int @default(0), lastError String?, deliveredAt DateTime?, createdAt DateTime @default(now()) }`. One row per `(DailyReport, channel)`. `status`/`attempts`/`lastError`/`deliveredAt` are narrowly mutable via retry — this is a lifecycle-completion field set, the same reasoning Epic 5 Story 5.2's `confirmReceipt` and Epic 7 Story 7.3's `markPaid` already established for "completing an in-progress event is not an AD-9 correction" — cite that precedent rather than re-deriving it, and don't add `correctsId`/`reason` here.
  - [ ] Run `pnpm db:generate`.
- [ ] Task 2 — Shared Zod schema (AC: #1, #2)
  - [ ] Create `packages/shared/src/schemas/branding-config.ts`: `updateBrandingConfigSchema` (`tenantName: z.string().min(1).max(200).optional()`, `logoUrl: z.url().optional()`, `primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional()`) — full CRUD lifecycle for this is Epic 14's job; this story only needs enough to seed and read it, but define the update schema now since the seed/admin boundary is identical to every other lookup-table precedent in this project (create the shape once, Epic 14 wires the UI to it later).
  - [ ] Export from `packages/shared/src/index.ts`.
- [ ] Task 3 — `apps/api`: compile + deliver (AC: #1, #2, #3, #4)
  - [ ] `apps/api/src/reports/` module: `reports.module.ts`, `report-compiler.service.ts` (builds a `DailyReport.content` payload from a `DailySiteReport` and its relations, plus the current `BrandingConfig` row, for a given Site+date), `report-delivery.service.ts` (per-channel send logic), `reports.controller.ts` (the Cron entry point and read endpoints for Stories 13.2–13.4 to extend).
  - [ ] `POST /cron/compile-daily-reports` — the Vercel Cron target (AD-13). Verify the request via Vercel Cron's standard mechanism (the `Authorization: Bearer $CRON_SECRET` header Vercel sends, checked against a `CRON_SECRET` env var) — reject any request without it, this endpoint must not be publicly callable. Add the schedule to `vercel.json`'s `crons` array (e.g. `{ "path": "/api/cron/compile-daily-reports", "schedule": "0 18 * * *" }` — 6 PM local per the mockup's example delivery times; confirm the exact hour with the product owner rather than treating `18` as authoritative, it's a reasonable placeholder matching the mockup's "6:45 PM" delivered-at examples, not a specified requirement).
  - [ ] The Cron handler: for every `Site`, find today's `DailySiteReport` (if none, skip — AC #4); for each Site with one, `ReportCompilerService.compile(site, dsr)` builds and inserts the `DailyReport` row (skip if one already exists for that `(siteId, reportDate)`, idempotent re-runs); then for each enabled channel (Task 4), create a `ReportDelivery` row and call `ReportDeliveryService.send(delivery)`.
  - [ ] `ReportDeliveryService.send`: `IN_APP` channel marks `status: 'SENT'`, `deliveredAt: now()` immediately — no external call, the report simply existing and being viewable in the product **is** in-app delivery. `EMAIL` channel sends via Resend (architecture spine's decided vendor) to every `User` with `role: 'OWNER_ADMIN'`'s email address (FR-50's full "which channels, to whom" configuration is Epic 14 — this is a scoped, sensible default: notify the Owner/Admins, not an open recipient list). `WHATSAPP` channel — see Dev Notes, this is genuinely blocked on an unmade business decision, not an implementation gap.
  - [ ] Retry policy: on a channel send failure, increment `attempts` and set `lastError`; retry up to 3 total attempts (e.g., on the same Cron run with a short in-process backoff, or via a second scheduled retry-sweep Cron hitting `PENDING`/failed-but-under-3-attempts rows — either is acceptable, pick the simpler one: a retry-sweep Cron reusing the same idempotent `send` call is simpler than in-process retry-with-backoff inside a single serverless invocation, which has its own execution-time limits). After the 3rd failed attempt, set `status: 'FAILED'` and stop retrying — this is what AC #3's "surfaces in-app" then displays.
  - [ ] `GET /reports/daily?siteId=&from=&to=` — the "Recent Reports" delivery log (mockup's table), returning `DailyReport` rows joined with their `ReportDelivery` rows' latest status per channel, for Story 13.1's own list section. `GET /reports/daily/:id` — the full `content` payload, for the branded report-preview card.
- [ ] Task 4 — `apps/web` UI (AC: #1, #2, #3)
  - [ ] Replace the stub `apps/web/app/(app)/reports/page.tsx` with the real Reports shell: a "Recent Reports" section (`DataTable`: Report / Site / Period / Generated / Delivery Status badge / "View report" action), matching `16-reports.html`'s log table, **scoped to the "Daily Site Report" row type only** — see Dev Notes on why the mockup's Weekly/Monthly report rows aren't built by this epic. Delivery Status badge: `success` "Delivered" when every enabled channel's `ReportDelivery.status = 'SENT'`, `warning` "Pending" while any channel is still retrying, `danger` "Failed" once a channel has exhausted retries (AC #3's visible surface).
  - [ ] `apps/web/app/(app)/reports/daily/[id]/page.tsx` — the branded report-preview card (`16-reports.html`'s `.report-preview` treatment: navy header with logo-placeholder/wordmark from `BrandingConfig`, body rendering the compiled `content`, footer showing delivery confirmation per channel) — this reads the stored `content` snapshot, it does not re-fetch/re-render live DSR data (per Task 1's denormalization rationale).
  - [ ] No "Send Report" button anywhere on this page or the list — confirm this explicitly during review, it's the epic's own named UX-DR19 requirement and the easiest thing to accidentally add out of habit (every other transactional screen in this project has a primary "Add/Record X" button; this one deliberately doesn't).
- [ ] Task 5 — Tests (AC: all)
  - [ ] `report-compiler.service.spec.ts`: compiles a correct `content` payload from a DSR fixture; skips a Site with no DSR for the day.
  - [ ] `report-delivery.service.spec.ts`: `IN_APP` marks sent immediately with no external call; `EMAIL` send failure increments `attempts`/sets `lastError` without throwing out of the Cron handler (one Site's delivery failure must not abort compiling/delivering for every other Site in the same run); after 3 failed attempts, status becomes `FAILED` and a 4th attempt is not made.
  - [ ] `reports.controller.spec.ts`: the Cron endpoint rejects a request missing/wrong `CRON_SECRET`.
  - [ ] `apps/web` component test: Delivery Status badge reflects each of the three states correctly; no "Send" control exists anywhere on the rendered page (an explicit `queryByText`/`queryByRole` assertion that nothing matches "Send," not just an absence of a test for it).

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
