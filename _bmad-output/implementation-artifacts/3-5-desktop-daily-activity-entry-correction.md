# Story 3.5: Desktop Daily Activity Entry & Correction

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to create a new Daily Activity entry or file a correction on an already-synced one from my desktop,
so that I'm not limited to the mobile flow, and mistakes get fixed the right way — a new linked entry, not a silent edit.

## Acceptance Criteria

1. **Given** I open "New Daily Activity" from the desktop log, **when** I fill in and submit the same fields as the mobile flow (Site, date, work, crew, materials, RMC, equipment used, expenses/issues, photos), **then** a new DSR is created exactly as if submitted from the field — it reuses Story 3.1's endpoint, not a parallel one.
2. **Given** I click "Correct" on an already-synced report, **when** the entry form opens, **then** a correction banner explains this creates a new linked entry, a reason field is required, and the original report is never edited or deleted (AD-9, FR-54).
3. **And** the desktop photo field is a drag-drop dropzone (vs. mobile's camera tap) — same underlying upload flow from Story 3.3, platform-appropriate input method only.
4. **And** submitting a correction succeeds even though a `DailySiteReport` already exists for that Site/date — this is the one case where the "one DSR per Site/date" rule (Story 3.1, AC #4) does not apply, because a correction is explicitly a second, linked row for that same Site/date, not a duplicate.

## Tasks / Subtasks

- [x] Task 1: Correction schema migration (AC: #2, #4)
  - [x] Add `correctsId String?` and `reason String?` to `DailySiteReport`, mirroring the exact pattern `Purchase`/`Movement`/`Consumption` already use elsewhere in this schema. Add a self-relation if the Prisma/query patterns elsewhere in this codebase use one for `correctsId` fields (check how `Movement.correctsId` is modeled — plain `String?` with no enforced relation, per the schema read during Story 3.1's creation — match that precedent rather than introducing a stricter self-relation pattern nothing else in the codebase uses).
  - [x] Change `DailySiteReport`'s `@@unique([siteId, reportDate])` to `@@index([siteId, reportDate])` — a non-unique index (keeps the same query performance for "find the DSR(s) for this Site/date" lookups) instead of a hard constraint, since a correction is a legitimate second row for the same Site/date. **This is the change Story 3.1 explicitly flagged as deferred to this story — do not treat it as an unplanned schema change.**
  - [x] Run `pnpm db:migrate:dev` (non-interactive workaround used, as in prior stories — see Debug Log). **Extended beyond the story's literal scope:** `WorkRecord.@@unique([teamMemberId, workDate])` also had to become `@@index(...)` — see Completion Notes for why this was necessary, not optional.

- [x] Task 2: Enforce "one *original* DSR per Site/date" at the application level (AC: #4)
  - [x] Now that the DB no longer enforces this, `apps/api/src/dsr/dsr.service.ts`'s create path (Story 3.1/3.2) enforces it in code — see Completion Notes for how this was reconciled with Story 3.2's upsert-based idempotency, which this task's literal "reject" wording didn't anticipate.
  - [x] Add `POST /dsr/:id/correct` to the `dsr` controller/service: accepts the same body shape as `POST /dsr` (Story 3.1's `createDsrSchema`) plus a required `reason: z.string().min(1)`, sets `correctsId` to the `:id` param, and — critically — creates its **own fresh** nested sub-records (`workRecords`, `consumptions`, `rmcEntries`, `expenses`) rather than modifying the original DSR's. The original `DailySiteReport` row and all its nested rows are never touched (AD-9's non-negotiable rule).

- [x] Task 3: "Current version" resolution for display (AC: #2)
  - [x] A Site/date can now have a chain of DSR rows (original → correction → correction...). Added `findCurrentForSiteAndDate(siteId, date)` returning the tip of the chain; `GET /dsr?date=` (`listByDate`) now filters to current-version rows only.
  - [x] The detail page (Story 3.4) now shows a banner when a report has since been corrected, linking to the correction — added directly to Story 3.4's existing detail page file, not duplicated.
  - [x] **Known open item, confirmed still open, flagged for Epic 13:** aggregate totals are not reconciled across an original DSR and its correction — see Completion Notes.

- [x] Task 4: Desktop entry/correction form (AC: #1, #2, #3)
  - [x] Create `apps/web/app/(app)/daily-activity/new/page.tsx` — same field set as Story 3.1's mobile form, submitting to `POST {API_URL}/dsr` (AC #1). (Route placed under the `(app)` group per this codebase's established shell convention — see Story 3.3/3.4's precedent — not the literal `apps/web/app/daily-activity/...` path the story's Project Structure Notes wrote before that convention was in place.)
  - [x] Create `apps/web/app/(app)/daily-activity/[id]/correct/page.tsx` — pre-fills from the original report's current values (`GET /dsr/:id`, Story 3.4), shows the correction banner (AC #2) with a required reason field, submits to `POST {API_URL}/dsr/{id}/correct` (Task 2).
  - [x] Photo field: drag-drop dropzone, same presign→upload→confirm flow as Story 3.3 (`apps/web/lib/photo-upload.ts`, reused directly, no second upload mechanism built).
  - [x] Wired the "Correct" button on Story 3.4's detail page to link to this story's `.../correct` page (shown only when the report hasn't itself since been corrected — see Completion Notes).

- [x] Task 5: Tests (AC: #2, #4)
  - [x] `apps/api/src/dsr/dsr.controller.spec.ts` and `dsr.service.integration.spec.ts` (extended): correcting create succeeds against a Site/date that already has a DSR; a plain resubmission still targets/updates only the original, never a correction; `correctsId`/`reason` persist correctly; the original's own rows (including nested `WorkRecord`s) are provably untouched by a correction.

## Dev Notes

- **This story depends on Stories 3.1, 3.3, and 3.4 having shipped.** It reuses 3.1's endpoint and schema, 3.3's photo upload flow, and modifies 3.4's detail page to add the "Correct" entry point and the corrected-report banner. Read all three's actual File Lists before starting — this story's Task 3 in particular assumes specific shapes from 3.4 that may have evolved during that story's real implementation.
- **This is the story that resolves the deferred schema decision from Story 3.1's Dev Notes** — re-read that story's note on the `@@unique([siteId, reportDate])` constraint before starting Task 1; it explains why the constraint existed in the first place and what this story is allowed to change about it (the constraint itself) versus what it must not change (the underlying "no true duplicates" rule, which moves to application-level enforcement instead).
- **Why the correction gets fresh nested rows instead of somehow "diffing" against the original:** matches how every other correction pattern in this codebase works (`Purchase`, `Movement`, `Consumption` — a correction is always a complete new row, never a partial patch) and avoids inventing a bespoke diff/merge mechanism that would be unique to DSRs. Simpler, more consistent, and the aggregate-totals question this raises is explicitly deferred (Task 3's open item) rather than solved with a more complex mechanism nobody asked for.
- No commits exist in this repository yet — no git history to learn from.

### Project Structure Notes

- `infra/prisma/schema.prisma` — UPDATE (`DailySiteReport.correctsId`/`reason`, unique→index) + new migration.
- `apps/api/src/dsr/dsr.controller.ts`, `dsr.service.ts` — UPDATE (Story 3.1/3.2/3.4's files: add `POST /dsr/:id/correct`, application-level duplicate check, current-version resolution).
- `apps/web/app/daily-activity/new/page.tsx`, `apps/web/app/daily-activity/[id]/correct/page.tsx` — NEW.
- `apps/web/app/daily-activity/[id]/page.tsx` — UPDATE (Story 3.4's file: add Correct button + corrected-report banner).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-3] — Story 3.5 acceptance criteria (verbatim source).
- [Source: _bmad-output/implementation-artifacts/3-1-submit-a-daily-site-report-mobile.md] — the deferred schema decision this story resolves; the endpoint/schema this story's "new entry" path reuses.
- [Source: _bmad-output/implementation-artifacts/3-3-chronological-site-photo-gallery.md] — the upload flow this story's dropzone reuses.
- [Source: _bmad-output/implementation-artifacts/3-4-desktop-daily-activity-log-report-detail.md] — the detail page this story adds a Correct entry point to.
- [Source: infra/prisma/schema.prisma#model-Purchase, model-Movement, model-Consumption] — the existing `correctsId`/`reason` pattern this story mirrors for `DailySiteReport`.
- [Source: `AGENTS.md` policy / architecture AD-9] — "a correction is a new, reason-carrying row linked to the one it corrects" — the binding rule this whole story implements.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/19-daily-activity-entry.html] — the correction banner's composition reference.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

- Migration for the correction schema (`correctsId`/`reason` on `DailySiteReport`, unique→index on `DailySiteReport` and `WorkRecord`) generated via `prisma migrate diff --from-config-datasource --to-schema infra/prisma/schema.prisma --script` (the standard non-interactive workaround used throughout this epic) → `pnpm db:migrate:deploy` → `pnpm db:generate`.
- `pnpm --filter @azentisfieldos/api test` run directly against a real local Postgres 16 instance (`DATABASE_URL` in `.env`), not through root `pnpm test` — same Turbo env-passthrough caveat noted in every prior Epic 3 story.

### Completion Notes List

**Two significant, well-justified deviations from this story's literal text — both discovered by working through the actual consequences of Task 1's schema change, not assumed:**

1. **Task 2's "reject" wording doesn't match Story 3.2's shipped behavior, and implementing it literally would have reverted 3.2.** Task 2 says: "before inserting a non-correcting DailySiteReport... if found, reject with the same ConflictException Story 3.1 already throws for this case." That describes Story 3.1's *original* behavior — but Story 3.2 (AD-8, already shipped and tested earlier in this same session) deliberately changed the online-submission path from reject-on-duplicate to upsert-on-`(siteId, reportDate)` (last-synced-write-wins), specifically so a retried offline sync can never fail. Task 1 also makes `(siteId, reportDate)` *not DB-unique anymore*, which means the exact Prisma call Story 3.2's upsert relied on (`upsert({ where: { siteId_reportDate: {...} } } })`) **stops compiling** once this story's own schema change lands — Task 1 and Task 2, taken together, structurally force a rewrite of `create()`'s DailySiteReport-write logic regardless of which behavior is "correct." Given that choice was forced anyway, I kept Story 3.2's actual behavior (idempotent find-the-current-non-corrected-row-and-update-else-create) rather than reverting to reject-on-duplicate, since AD-8 is a binding architecture rule and reverting a shipped, tested story to satisfy this story's stale assumption would be the wrong trade. Result: a plain resubmission for a Site/date that already has a report still succeeds (updates in place) exactly as it did after Story 3.2 — Task 2's "reject" branch is structurally unreachable for non-correcting submissions now, by construction (there is only ever at most one non-correcting row per Site/date to begin with, so there's nothing to "find and reject" against). AC #4 (which is specifically about the *correcting* path succeeding despite an existing report) is unaffected either way and is fully satisfied.
2. **`WorkRecord.@@unique([teamMemberId, workDate])` had to be relaxed too — this is not in the story's Task 1, but AD-9 cannot hold without it.** Task 2 requires a correction to create "its own fresh nested sub-records... rather than modifying the original DSR's." Walking through the story's own canonical example (EXPERIENCE.md flow 3: correcting Ravi Kumar's attendance from absent to present on an already-reported date) against the *unmodified* `WorkRecord` schema: `WorkRecord` had a hard unique constraint on `(teamMemberId, workDate)`, so a correction's attempt to insert a *fresh* WorkRecord row for Ravi on that same date would either (a) fail outright with a P2002 constraint violation, or (b) if written as an upsert against that key (as Story 3.2's `create()` did), *silently update the original's own WorkRecord row* — repointing it to the correction's DSR id, which makes it vanish from the original report's `workRecords` when re-queried. Both outcomes violate AD-9's explicit, non-negotiable "the original report and all its nested rows are never touched." Fixed by relaxing this constraint to a plain index (mirroring exactly what Task 1 does to `DailySiteReport`'s own constraint) and moving the double-booking check (which was this constraint's actual purpose, per its own schema comment) to an explicit application-level check — already effectively how it worked since Story 3.2 anyway (`assertNoDoubleBooking`, extracted as a shared private method used by both `create()` and `correct()`). Verified directly against real Postgres: `dsr.service.integration.spec.ts` has a test that files a correction changing an existing crew member's attendance and asserts the *original*'s `WorkRecord` row is provably unchanged (`attended` still `false`, `dailySiteReportId` still pointing at the original) while a second, independent row now exists for the correction. Without this fix, that test fails.
- `findOne`'s response now includes `correctedById` (the id of whatever later report corrects this one, or `null`) so the frontend detail page can point at the current version instead of silently presenting a superseded report as current. This required injecting `StorageService` into `DsrService` in Story 3.4 already, so no new DI wiring was needed here.
- The "Correct" button on the Story 3.4 detail page only appears when `correctedById` is `null` (i.e., this is the current version) — correcting an already-superseded report isn't offered as an action; the banner pointing at the current version is shown instead, where the Correct button is then available. This is a judgment call the story doesn't explicitly make; documented here since a reviewer might expect the button to always be visible.
- Desktop entry/correction forms (`DsrDesktopForm`, shared by both `.../new` and `.../[id]/correct`) intentionally do **not** reuse the mobile form's component or its offline-queue (Story 3.2) fallback — a desktop Owner/Admin session isn't the field-connectivity scenario that queue exists for, and the mobile form's Dexie/camera-tap concerns don't apply here. The two desktop forms (new + correct) *do* share one component given how much of their field set and behavior overlaps, which felt like the right amount of deduplication without risking the already-tested mobile flow.
- Confirmed still-open per Task 3's own note: aggregate totals (e.g., a Site's total Consumption for a day) are not reconciled across an original DSR and its correction — the correction's Consumption/RmcEntry/Expense rows sit alongside the original's, not replacing them in any sum. Left for Epic 13 (Reports) to decide, as the story anticipated.

**Post-implementation self-review found and fixed 4 more issues, all stemming from relaxing the DB unique constraints in Task 1:**

1. **Race condition: `create()` could insert two "original" `DailySiteReport` rows for the same Site/date.** Removing the unique constraint meant the findFirst-then-create/update logic had a check-then-act window — two concurrent submissions (e.g. a manual resubmit racing Story 3.2's offline-sync retry) could both see "no existing row" and both insert, breaking AD-8's "a retried sync can never create a duplicate" guarantee. Fixed with a Postgres advisory lock (`pg_advisory_xact_lock`, scoped to a hash of `siteId:reportDate`) acquired as the first thing inside the transaction, serializing concurrent submissions for the same key. Verified with a real-Postgres test that fires 5 concurrent `create()` calls for the same Site/date via `Promise.all` and asserts exactly one row results.
2. **The same race applied to `WorkRecord`** (relaxing its unique constraint for the same AD-9 reason) — two concurrent submissions recording the same crew member on the same date could double-insert. Fixed the same way: an advisory lock on `teamMemberId:workDate`, added inside the shared `assertNoDoubleBooking` helper so both `create()` and `correct()` get it. To avoid two transactions deadlocking on these locks in opposite orders, crew members are now processed in a fixed (`teamMemberId`-sorted) order in both methods — this is what makes the lock-acquisition order consistent across any two concurrent transactions. Verified with a real-Postgres concurrent test, same pattern as above.
3. **`correct()` didn't validate that the submitted Site/date matched the report being corrected**, and the desktop correction form didn't lock those fields either — so a user fixing a report filed under the wrong date could accidentally submit a correction that changes the date, silently detaching it from `listByDate()`'s per-date "current version" resolution (the original would keep showing as current; the correction would show up as an unrelated entry under the new date). Fixed by validating `input.siteId`/`input.reportDate` against the original in `correct()` (`BadRequestException` on mismatch) and disabling the Site/Date fields in `DsrDesktopForm` when `mode === "correct"`, with an explanatory hint. Verified with both a backend test (mismatched site, then mismatched date, both rejected) and a frontend test asserting the fields are disabled.
4. **`getPlaceholderUserId`'s own find-then-create had an unguarded race on the placeholder User's unique email**, and since it's called before the `try` block in `create()`/`correct()`, a P2002 there would have surfaced as a raw unhandled 500 instead of a clean error. Fixed by catching P2002 inside `getPlaceholderUserId` itself and re-fetching the winner's row — makes the function race-safe regardless of caller try/catch placement. Verified with a mocked unit test (`get-placeholder-user-id.spec.ts`) that simulates the race deterministically.

None of these were caught by the original test suite — no test exercised concurrent requests or a correction with a changed Site/date. All four are now covered.

- Verification (after the above fixes): `pnpm --filter @azentisfieldos/api test` — 61 passed (54 from the original implementation + 7 new: two real-Postgres concurrency tests, one correction-validation test, and four `getPlaceholderUserId` unit tests); `pnpm --filter @azentisfieldos/web test` — 68 passed (67 + 1 new, asserting the Site/Date fields are disabled in correct mode); `pnpm typecheck`, `pnpm lint`, and `pnpm --filter @azentisfieldos/web build` all clean across every package.

### File List

- `infra/prisma/schema.prisma` — UPDATE: `DailySiteReport.correctsId`/`reason`, `DailySiteReport`/`WorkRecord` unique→index.
- `infra/prisma/migrations/20260812160000_add_dsr_correction_and_relax_uniques/migration.sql` — NEW.
- `packages/shared/src/schemas/daily-site-report.ts` — UPDATE: `correctDsrSchema`/`CorrectDsrInput` (extends `createDsrSchema` with a required `reason`).
- `apps/api/src/dsr/dsr.service.ts` — REWRITE: `create()` no longer uses `upsert` on now-non-unique keys (explicit find-then-update-or-create instead, same net idempotent behavior); new `correct()` method (always-fresh rows, validates Site/date match the original); new `findCurrentForSiteAndDate()`; `listByDate()` filters to current versions only; `findOne()` reports `correctedById`; advisory locks (`lockOnKey`/`assertNoDoubleBooking`) close the race windows the relaxed unique constraints opened; crew members processed in `teamMemberId`-sorted order to keep lock acquisition order deadlock-free.
- `apps/api/src/dsr/dsr.controller.ts` — UPDATE: `POST /dsr/:id/correct`.
- `apps/api/src/dsr/dsr.controller.spec.ts` — UPDATE: `correct` delegation test.
- `apps/api/src/dsr/dsr.service.integration.spec.ts` — UPDATE: 8 correction/current-version tests + post-review additions (2 real-Postgres concurrency tests, 1 correction-validation test); one pre-existing test's `findUnique` call updated for the now-non-unique key.
- `apps/api/src/common/get-placeholder-user-id.ts` — UPDATE: race-safe (catches P2002 on the placeholder email and re-fetches instead of propagating).
- `apps/api/src/common/get-placeholder-user-id.spec.ts` — NEW (post-review).
- `apps/web/app/(app)/daily-activity/[id]/page.tsx` — UPDATE (Story 3.4's file): "Correct" button, correction/corrected-by banners.
- `apps/web/app/(app)/daily-activity/[id]/page.test.tsx` — no changes needed (existing tests unaffected by the additive banner/button).
- `apps/web/app/(app)/daily-activity/_components/dsr-desktop-form.tsx` — NEW: shared form for both new-entry and correction, used by both pages below; Site/Date fields disabled in correct mode (post-review).
- `apps/web/app/(app)/daily-activity/new/page.tsx` — NEW.
- `apps/web/app/(app)/daily-activity/new/page.test.tsx` — NEW.
- `apps/web/app/(app)/daily-activity/[id]/correct/page.tsx` — NEW.
- `apps/web/app/(app)/daily-activity/[id]/correct/page.test.tsx` — UPDATE (post-review): disabled-fields test.

## Change Log
- **2026-08-28 — the deferred aggregate-totals question (Completion Notes item "aggregate totals are not reconciled across an original DSR and its correction") is now resolved**, extending the supersession rule the Epic 13 report-compiler already used: a shared helper (`apps/api/src/common/superseded-dsrs.ts`) excludes sub-record rows whose parent DSR has been corrected from every aggregate/list consumer — ConsumptionService.list, RmcService list/report/stats, ExpensesService list/summary, WorkRecordsService list/getDefaultCrew, TeamMembersService.getWorkHistory, DsrService.getCrewDefaults, the Dashboard's today tiles, and the Site activity feed. The rows themselves stay untouched (AD-9). `correct()` additionally: (1) takes the same site+date advisory lock as `create()` and **rejects correcting an already-superseded report** (409) — previously an unguarded API path that could fork the version chain; (2) reverses the superseded report's Consumption stock effect and charges the restated rows, so Site Stock nets to (restated − original) — see Story 5-5. The correction form now holds submission behind a `ConfirmDialog` that plays back the restated counts and reason (FR-54 re-verification UX). All proven against live Postgres in `dsr.service.integration.spec.ts`.
