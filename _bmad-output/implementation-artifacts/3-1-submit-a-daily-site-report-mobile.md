# Story 3.1: Submit a Daily Site Report (Mobile)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Site Supervisor,
I want to fill in work completed, crew present (defaulted from yesterday), materials consumed, RMC used, and photos on my phone and submit,
so that I can log a full day's activity in under 5 minutes without re-typing what didn't change (SM-2).

## Acceptance Criteria

1. **Given** I open the DSR entry flow for my Site today, **when** the form loads, **then** the crew checklist is pre-populated from yesterday's attendance at this Site (via `WorkRecord` rows for the most recent prior `workDate` at this `siteId`), and material/RMC pickers are search/dropdown/chip-add, never free-text (SM-C1: accuracy is never traded for speed).
2. **When** I submit with work completed, crew, at least one material or RMC entry, and photos, **then** the DSR and all its nested sub-records (`WorkRecord`s, `Consumption`s, `RmcEntry` rows, equipment-used tags) are created in a single transaction (FR-28) — a partial write (e.g. the DSR row exists but a `Consumption` failed) must never happen.
3. **And** a Team Member cannot appear present in two different Sites' DSRs on the same date — enforced by the existing DB-level `@@unique([teamMemberId, workDate])` on `WorkRecord`, surfaced to the Supervisor as a clear inline error, not a raw constraint-violation message.
4. **And** submitting a second DSR for the same Site/date **while online** (both requests reach the server) is rejected with a clear "a report for this Site today already exists" error — the *offline queued-edit* case (device hasn't synced yet) is Story 3.2's concern, not this one; this story's server-side behavior is the online baseline Story 3.2 builds its offline queue on top of.
5. **And** the machinery/vehicles marked "used today" are stored as informational tags on the DSR itself, **not** as `MachineryMovementLog`/`VehicleMovementLog` rows — those represent a location/status *change* and are Epic 8's dedicated concern; a DSR noting "JCB 3DX was in use" does not move it anywhere.

## Tasks / Subtasks

- [ ] Task 0: Two schema gaps must close before this story's API can be built (AC: #2, #5)
  - [ ] **Gap 1 — RMC has no link back to its DSR.** `RmcEntry` (unlike `Consumption`, `WorkRecord`, and `Expense`, which all already have an optional `dailySiteReportId`) has no such field, even though FR-28 explicitly lists "RMC used" as DSR content. Add `dailySiteReportId String?` + `dailySiteReport DailySiteReport? @relation(fields: [dailySiteReportId], references: [id])` to `RmcEntry`, mirroring `Consumption`'s exact pattern. Add the reverse relation `rmcEntries RmcEntry[]` to `DailySiteReport`.
  - [ ] **Gap 2 — no field for "equipment used today."** Neither `DailySiteReport` nor any join table captures which Machinery/Vehicles were in use. Add `equipmentUsed Json @default("[]")` to `DailySiteReport` — an array of `{ type: "MACHINERY" | "VEHICLE", id: string, name: string }` objects, denormalized (stores the name at time of entry, not just a foreign key) so the DSR feed reads correctly even if the asset is later renamed or deleted. This is deliberately **not** a relational join to `Machinery`/`Vehicle` — it is informational tagging, not a status-changing event (AC #5); a real relation would wrongly imply referential integrity this field doesn't need.
  - [ ] Run `pnpm db:migrate:dev` to generate and apply the migration. Name it descriptively (e.g. `add_dsr_rmc_link_and_equipment_used`).

- [ ] Task 1: Add the DSR creation Zod schema (AC: #1, #2)
  - [ ] Create `packages/shared/src/schemas/daily-site-report.ts`. Shape: `siteId` (uuid), `reportDate` (date string), `workCompleted`/`workInProgress`/`plannedWork`/`issuesBlockers`/`safetyObservations`/`notes` (all optional strings), `workRecords: z.array(z.object({ teamMemberId, attended: z.boolean().default(true), hours: z.number().optional(), overtimeHours: z.number().optional() }))`, `consumptions: z.array(z.object({ materialSizeId, quantity: z.number().positive(), activityReference: z.string().optional() }))`, `rmcEntries: z.array(z.object({ vendorId, quantityM3: z.number().positive(), grade: z.string(), ratePerM3: z.number().positive() }))` (compute `totalAmount = quantityM3 * ratePerM3` server-side, don't trust a client-sent total), `equipmentUsed: z.array(z.object({ type: z.enum(["MACHINERY", "VEHICLE"]), id: z.string(), name: z.string() }))`.
  - [ ] Also include `expenses: z.array(z.object({ categoryId: z.string(), amount: z.number().positive(), description: z.string().optional(), paymentMethod: z.string().optional(), personOrVendor: z.string().optional() }))` — `Expense` already has a `dailySiteReportId` field ready for this (no schema gap here, unlike RMC/equipment), and FR-28 explicitly lists "expenses" as DSR content; do not omit it.
  - [ ] Export `createDsrSchema` and `type CreateDsrInput`. Photos are handled separately (Story 3.3 owns upload; this story's schema does not include a `photos` field — see Dev Notes on why photo upload is intentionally out of this story's scope).

- [ ] Task 2: Add the `dsr` API module (AC: #2, #3, #4)
  - [ ] Create `apps/api/src/dsr/{dsr.module.ts, dsr.controller.ts, dsr.service.ts}` following the exact structure of `apps/api/src/sites/` (already loaded into this story's context — read it before starting, don't reinvent the module/controller/service split differently).
  - [ ] `POST /dsr`, `ZodValidationPipe(createDsrSchema)`. Service method wraps the whole write in `this.prisma.$transaction(...)`: create the `DailySiteReport` row, then create its `workRecords`, `consumptions`, `rmcEntries` (with server-computed `totalAmount`), and `expenses` as nested creates within the same transaction.
  - [ ] Catch Prisma's `P2002` (unique constraint violation) on the `WorkRecord` create — re-throw as a `ConflictException` ("A crew member is already recorded at another Site on this date") rather than letting a raw Prisma error reach the client (AC #3).
  - [ ] Catch `P2002` on `DailySiteReport`'s own `@@unique([siteId, reportDate])` — re-throw as `ConflictException` ("A report for this Site today already exists") (AC #4). **Do not** relax or remove this unique constraint in this story — Story 3.5 (Correction) will need to change how this works when it adds the append-only correction pattern to DSRs; that is explicitly deferred to that story, not this one. Leave a code comment noting the constraint will be revisited there so nobody "fixes" it as dead weight in the meantime.

- [ ] Task 3: Crew-default query (AC: #1)
  - [ ] In `dsr.service.ts`, add a method (or a `GET /dsr/defaults?siteId=&date=` endpoint the frontend calls when the form loads) that finds the most recent `WorkRecord.workDate` strictly before the given date for the given `siteId`, and returns the `TeamMember`s present on that date — this is "yesterday's crew" per AC #1, but "yesterday" means *the last day this Site had any attendance recorded*, not literally `date - 1`, since a Site might skip a day (weekend, no work).

- [ ] Task 4: Mobile DSR entry form (AC: #1, #2, #5)
  - [ ] Create `apps/web/app/dsr/new/page.tsx` (or nest under a Site-scoped route if `apps/web`'s routing conventions have solidified further by the time this is picked up — check current state of `apps/web/app/` before deciding, since Epic 1/Epic 2 stories may have shipped a shell/routing convention this should follow rather than diverging from).
  - [ ] Crew checklist: fetch the Task 3 defaults endpoint on load, pre-check attendees, allow unchecking.
  - [ ] Material/RMC pickers: search/dropdown/chip-add UI (per `EXPERIENCE.md`'s Component Patterns — reuse Epic 1's shared components if they exist by the time this is picked up; see Story 2.1's Dev Notes on the same Epic 1 sequencing risk, which applies identically here).
  - [ ] Expenses/issues: a simple amount+category+description entry (category picker sourced from `ExpenseCategory` — seeded defaults per Epic 11's Implementation Notes) plus a free-text issues/blockers field (maps to `DailySiteReport.issuesBlockers`, already on the model).
  - [ ] Equipment-used: a multi-select/chip-add against the Machinery/Vehicle lists — **note Epic 8 (Machinery & Vehicle Management) has not shipped as of this story's writing**, so there may be no `GET /machinery`/`GET /vehicles` endpoint yet to populate this picker from. If those don't exist when this story is picked up, this field can accept free-text entry as a graceful fallback (still satisfying the `{type, id, name}` shape with a client-generated placeholder `id`) rather than blocking this story on Epic 8 — flag this fallback explicitly in Completion Notes so it can be upgraded once Epic 8 ships real endpoints.
  - [ ] Submit calls `POST {API_URL}/dsr` (AD-3: HTTP only, no direct Prisma access from `apps/web` — see Story 2.1's Dev Notes for why this matters and what generic Next.js guidance gets wrong here).
  - [ ] Photo capture UI is a visual placeholder in this story (camera-icon tap, thumbnail preview) but does **not** yet upload anywhere — Story 3.3 wires the actual upload. Do not block this story's submit flow on photos; render the affordance, wire the upload call once 3.3 exists.

- [ ] Task 5: Tests (AC: #2, #3, #4)
  - [ ] `apps/api/src/dsr/dsr.controller.spec.ts` (Vitest + `NestJS TestingModule`, matching `apps/api/src/app.controller.spec.ts`'s pattern): assert the transaction wraps all sub-record creates, assert `P2002` on `WorkRecord` and on `DailySiteReport` both map to `ConflictException` with the documented messages.

## Dev Notes

- **This is the first story in Epic 3** — no previous-story File List to build on within this epic. It does, however, build directly on Epic 2's established patterns (module structure, `ZodValidationPipe`, AD-3 HTTP-only rule, `PrismaService`) — read `apps/api/src/sites/*` and `_bmad-output/implementation-artifacts/2-1-create-and-list-sites.md` before starting if the `sites` module's actual as-built shape differs from what's described there.
- **Photos are deliberately out of this story's API/data scope.** `Photo.storageKey` references a Cloudflare R2 object key, and no R2 client, credentials, or upload utility exist anywhere in the codebase yet (`infra/provisioning/provision.ts` has only a `// TODO: Cloudflare R2 API` comment). Building presigned-upload wiring is real, distinct work — it's Story 3.3's job (which also needs it for the gallery). Do not attempt to wire real photo upload in this story; a visual-only placeholder is the correct, honest interim state.
- **The RMC total is server-computed, never client-trusted** — `totalAmount = quantityM3 * ratePerM3`, computed in `dsr.service.ts`, not accepted as a field from the request body. This matches how money/quantity derived values should generally be treated in this codebase (client sends inputs, server computes derived totals) even though this is the first story to actually implement an RMC write path.
- **On the `@@unique([siteId, reportDate])` constraint:** this story treats it as a hard rule (one DSR per Site per date, full stop) for the online-submission case. Story 3.5 (Desktop Daily Activity Entry & Correction) needs to insert a *second* row for the same Site/date when someone corrects an already-synced report — it will need to relax this to an application-level check (reject only non-correcting duplicates) plus add `correctsId`/`reason` fields to `DailySiteReport`, mirroring the pattern `Purchase`/`Movement`/`Consumption` already use. That is explicitly Story 3.5's migration to make, not this one's — don't preemptively loosen the constraint here on the assumption it'll need to change later; a premature loosening here would let AC #4 silently fail before Story 3.5 exists to enforce the replacement rule.
- No commits exist in this repository yet — no git history to learn from.

### Project Structure Notes

- `infra/prisma/schema.prisma` — UPDATE (`RmcEntry.dailySiteReportId`, `DailySiteReport.equipmentUsed`) + new migration.
- `packages/shared/src/schemas/daily-site-report.ts` — NEW.
- `apps/api/src/dsr/*` — NEW module.
- `apps/web/app/dsr/new/page.tsx` — NEW.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-3] — Story 3.1 acceptance criteria (verbatim source).
- [Source: _bmad-output/planning-artifacts/epics/phase-2-field-operations-core/epic-3-daily-site-reporting.md] — epic-level context.
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-8] — "the idempotency key is per sub-record, not per DSR" — the exact mechanism Story 3.2 builds; this story's plain online-create endpoint is the foundation it extends.
- [Source: infra/prisma/schema.prisma] — `DailySiteReport`, `WorkRecord`, `Consumption`, `RmcEntry`, `Expense`, `Photo`, `TeamMember` models; exact current field lists confirmed by direct read during story creation, including the two gaps this story's migration closes.
- [Source: _bmad-output/implementation-artifacts/2-1-create-and-list-sites.md] — AD-3 HTTP-only pattern, `API_URL` env var, Epic 1 sequencing risk note — both apply identically here.
- [Source: apps/api/src/sites/*, apps/api/src/common/zod-validation.pipe.ts, apps/api/src/prisma/prisma.service.ts] — module/controller/service/validation/Prisma patterns this story's `dsr` module must match.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/04-dsr-entry.html] — mobile form composition reference (crew checklist, material chips, RMC row, photo tiles, submit button).
- [Web: Cloudflare R2 presigned upload pattern — `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`, `region: "auto"`, endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` — confirmed current practice, referenced here only to explain why it is explicitly deferred to Story 3.3, not implemented now.]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
