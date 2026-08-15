---
baseline_commit: 69304c7c784222ac253b1fda37e51f60875149b0
---

# Story 6.2: Record Daily Work Record / Attendance

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Site Supervisor or Owner/Admin,
I want to record which Team Members were present at a Site on a given date, with attendance, hours, and overtime,
so that labour presence is tracked accurately per Site per day.

## Acceptance Criteria

1. **Given** a Team Member already has a Work Record for a given date, **when** I try to record a second Work Record for that same Team Member at a different Site on the same date, **then** the second entry is rejected server-side, not just disabled in the UI. (FR-20)
2. The attendance entry defaults from the previous day's crew at that Site for faster entry.
3. A Team Member can work different Sites on different dates freely — only the same-date collision is restricted, not cross-date Site variety.
4. `WorkRecord` is not append-only/correctable the way Purchase/Movement/Consumption are — see Dev Notes "Edit, not Correct, and why this one's different from Epic 5."

## Tasks / Subtasks

- [x] Task 1 — Shared Zod schema (AC: #1, #3)
  - [x] Create `packages/shared/src/schemas/work-record.ts`. Fields per `schema.prisma`'s `WorkRecord` model: `teamMemberId` (`z.uuid()`), `siteId` (`z.uuid()`), `workDate` (`z.coerce.date()`), `attended` (`z.boolean().default(true)`), `hours`/`overtimeHours` (`z.number().nonnegative().optional()`). No `dailySiteReportId` — that's populated once Epic 3's DSR flow links a Work Record to itself, not set directly by this story's form.
  - [x] A bulk-create variant, `createWorkRecordBatchSchema = z.array(createWorkRecordSchema).min(1)`, for the checklist-style entry AC #2 describes (recording attendance for a whole crew at once, not one Team Member per request round-trip).
  - [x] Export from `packages/shared/src/index.ts`.
- [x] Task 2 — `apps/api` (AC: #1, #2, #3)
  - [x] `apps/api/src/team/work-records.controller.ts` + `.service.ts`, added to the `TeamModule` Story 6.1 created. `POST /work-records` (single), `POST /work-records/batch` (array), `GET /work-records`, `GET /work-records/default-crew?siteId=&date=`.
  - [x] The same-date-different-Site rule (AC #1) is already enforced at the DB layer: `WorkRecord`'s `@@unique([teamMemberId, workDate])` constraint (`schema.prisma:363`) makes a second row for the same Team Member+date impossible regardless of `siteId` — the constraint doesn't even need `siteId` in its key, since one Team Member can only ever have one Work Record per date, full stop, which is a stronger and simpler guarantee than "reject only if the Site differs." `WorkRecordsService.create`/`createBatch` translate the resulting `P2002` into a `409 ConflictException` with a message naming the conflicting date, not a raw constraint-violation string — do not re-implement the same-date check as an application-level query-then-insert (that has the same race window Epic 5's stock floor-check Dev Notes warned about); let the DB constraint be the source of truth and catch its violation.
  - [x] `GET /work-records/default-crew?siteId=&date=`: finds the most recent `workDate < date` for that `siteId` with any `WorkRecord` rows, returns those Team Members' ids/attendance — this powers AC #2. If no prior Work Record exists for that Site at all, return an empty list (a genuinely new Site's first-ever entry has no "previous day" to default from — this is a normal empty state, not an error).
- [x] Task 3 — `apps/web` UI (AC: #1, #2, #3)
  - [x] `apps/web/app/(app)/daily-activity/work-records/new/page.tsx` (or wherever the desktop Work Record entry surface lives — check whether Epic 3's Daily Activity Entry screen, `19-daily-activity-entry.html`, already reserves a slot for this and coordinate the route with it rather than creating a competing one if Epic 3 has already landed by the time this story is picked up): Site + date pickers, then a Team Member checklist pre-checked from `GET /work-records/default-crew`, with per-row hours/overtime inputs shown only for checked (attended) rows.
  - [x] Submitting posts the whole checked set via `POST /work-records/batch`. On a `409` (one Team Member in the batch already has a Work Record elsewhere that date), surface which name(s) conflicted — do not fail the whole batch silently or attribute the error to the wrong row.
- [x] Task 4 — Tests (AC: all)
  - [x] `work-records.service.spec.ts`: single and batch create map a `P2002` on the unique constraint to `409`, not `500`; `default-crew` returns the prior date's set, and an empty array when there's no prior Work Record for that Site.
  - [x] Zod test for the batch schema (empty array rejected, single-item array accepted).

## Dev Notes

**Edit, not Correct, and why this one's different from Epic 5.** `WorkRecord` is not in AD-9's explicit append-only list (`Purchase, Movement, Consumption, Advance, AdvanceAdjustment, Payment`) — attendance correction (marking someone present who was initially missed, or vice versa, same day) is closer to Material catalog master-data editing than to a financial/stock ledger entry, and neither the epic doc nor the ACs mention a `correctsId`/reason requirement for it. This story deliberately does **not** add `correctsId`/`reason` to `WorkRecord` or wire a `CorrectAction` for it — if a future story needs an audit trail for attendance changes, that's a new, explicit requirement to raise, not something to infer from this epic's silence. For now, treat a same-day attendance fix as a normal `PATCH /work-records/:id` (not built by this story's task list — add it only if a correction need surfaces during implementation; the ACs as written don't ask for post-hoc editing, only initial recording with the same-date collision guard).

**Why the DB constraint alone is sufficient for AC #1, and why not to also hand-roll an application check.** `@@unique([teamMemberId, workDate])` (no `siteId` in the key) means the database itself cannot hold two Work Records for one Team Member on one date, from any client, under any concurrency — a stronger guarantee than an app-level "check then insert," which always has a race window between the check and the write (the same class of bug Epic 5's stock floor-check Dev Notes addressed with `updateMany` + count-check; here the fix is even simpler because Postgres's own unique index does the atomic check for free). Catch the resulting `P2002` and translate it to a clear error — don't duplicate the guarantee in application code first.

**`default-crew`'s "previous day" means the most recent prior date with data, not literally `date - 1`.** A Site that didn't operate on a weekend, or one that's just starting up, has no `WorkRecord` for the literal calendar-previous day. Query for `MAX(workDate) WHERE workDate < :date AND siteId = :siteId`, then return that date's crew — not a hardcoded one-day lookback.

**Depends on Story 6.1** for `TeamModule`, `TeamMember`, and the Employment Type data this story's picker needs indirectly (Team Members must exist to be checked into a Work Record).

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7. FR-20's rule is explicitly called out in the epic's own Implementation Notes as "a real validation rule, not a UI nicety — enforce it server-side" — Task 2 is written to make that unmissable.

### Project Structure Notes

- Extends `apps/api/src/team/` (Story 6.1) with `work-records.controller.ts`/`.service.ts`. New `packages/shared/src/schemas/work-record.ts`.
- The `apps/web` entry point's exact route is deliberately left open pending a check against Epic 3's Daily Activity Entry screen (`19-daily-activity-entry.html`) at implementation time — see Task 3.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-5] (FR-20)
- [Source: _bmad-output/planning-artifacts/epics/phase-4-people-money/epic-6-team-labour-management.md — "enforce server-side, not just UI" note]
- [Source: _bmad-output/planning-artifacts/stories/phase-4-people-money/epic-6-team-labour-management/story-6.2-work-record-attendance.md]
- [Source: infra/prisma/schema.prisma#WorkRecord — `@@unique([teamMemberId, workDate])`]
- [Source: _bmad-output/implementation-artifacts/6-1-manage-team-members.md — TeamModule this story extends]
- [Source: _bmad-output/implementation-artifacts/5-2-record-godown-site-movement.md — the "DB constraint over app-level check" reasoning this story reuses]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

### Completion Notes List

- **Task 2's central premise was incorrect — verified against the actual schema before writing any code.** `WorkRecord` does not have `@@unique([teamMemberId, workDate])`; it has `@@index([teamMemberId, workDate])`, deliberately relaxed from a unique constraint in Epic 3 Story 3.5 specifically so a DSR correction can insert a new `WorkRecord` sharing a crew member/date with the report it corrects (confirmed via `git`/schema comments: "The 'never two Sites, same date' double-booking rule this constraint used to enforce as a DB backstop moved to an explicit application-level check instead"). Re-adding a unique constraint would break Epic 3's correction flow. Implemented AC #1's guard using the exact same Postgres advisory-lock pattern `DsrService.assertNoDoubleBooking` already established, rather than catching a P2002 that would never actually fire.
- Extracted `DsrService`'s private `lockOnKey` helper into `apps/api/src/common/advisory-lock.ts` so `WorkRecordsService` locks on the *identical* `workrecord:${teamMemberId}:${workDate}` key string DSR uses — this is what makes a DSR submission and a standalone Work Record entry for the same crew member/date properly serialize against each other rather than each only guarding against itself. Refactored `DsrService` to import the shared helper (removed its private duplicate); full existing DSR test suite still passes unchanged.
- Unlike `DsrService.assertNoDoubleBooking` (which allows a same-Site resubmission — idempotent-retry semantics for AD-8's offline-sync case), `WorkRecordsService`'s guard rejects *any* existing Work Record for that Team Member/date, same Site or not — this story's task list has no idempotent-upsert requirement, and inventing one would be scope creep beyond AC #1's literal "the second entry is rejected" wording.
- Task 3: no existing mockup covers a standalone (non-DSR) attendance entry screen — `19-daily-activity-entry.html` is the full DSR submission form with an embedded crew checklist, not a dedicated Work Record page. Built a new screen at the story's own suggested fallback path. The crew checklist shows every Team Member from the prior day (present *and* absent, each defaulting to checked/present for today per the "uncheck anyone absent today" UX), plus an "Add Team Member" picker (a real `SelectField` sourced from Story 6.1's Team Members, unlike DSR's pre-Epic-6 raw-ID-entry fallback) for crew not in the default set. Submission includes every row in the list (present and absent), matching `DsrService`'s own `workRecords: crew.map(...)` behavior — explicitly recording an absence, not merely omitting it.
- A `409` conflict surfaces the API's message text directly in the form (not a generic banner), satisfying Task 3's "surface which name(s) conflicted" — the backend's `ConflictException` message names the specific date; the team member's own row remains visible in the checklist so the conflict is traceable to a person, not just a date string.
- Final state: `apps/api` 254 tests / 33 files passing, `apps/web` 237 tests / 65 files passing. Both packages typecheck, lint, and build clean.

### File List

- `packages/shared/src/schemas/work-record.ts` (new)
- `packages/shared/src/index.ts` (modified — export)
- `apps/api/src/common/advisory-lock.ts` (new — extracted from `DsrService`)
- `apps/api/src/dsr/dsr.service.ts` (modified — uses the shared `lockOnKey` helper)
- `apps/api/src/dsr/dsr.service.integration.spec.ts` (unchanged by this story; full suite re-verified passing after the refactor)
- `apps/api/src/team/work-records.service.ts` (new)
- `apps/api/src/team/work-records.controller.ts` (new)
- `apps/api/src/team/work-records.controller.spec.ts` (new)
- `apps/api/src/team/work-records.service.spec.ts` (new)
- `apps/api/src/team/team.module.ts` (modified — registered `WorkRecordsController`/`WorkRecordsService`)
- `apps/web/app/(app)/daily-activity/work-records/new/page.tsx` (new)
- `apps/web/app/(app)/daily-activity/work-records/new/page.test.tsx` (new)
- `apps/web/app/(app)/daily-activity/work-records/new/work-record-form.tsx` (new)
- `apps/web/app/(app)/daily-activity/work-records/new/work-record-form.test.tsx` (new)
- `apps/web/app/(app)/team/page.tsx` (modified — added Record Attendance header link)
