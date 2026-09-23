---
title: 'Labour Attendance: separate Day/Night shifts with Half Day'
type: 'feature'
created: '2026-09-23'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: 'e552d81ec5a1ae5422711b1d1627368b2ad221af'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `DailyLabourAttendance` has no shift or half-day dimension — one row per labourer/site/date, `attended` boolean only. The business needs the same labourer to have an independent Day entry AND Night entry on the same date, each Full or Half Day, stored and displayed separately.

**Approach:** Add `shift` (DAY/NIGHT enum) and `isHalfDay` (boolean) columns to `DailyLabourAttendance`. `perDayAmount` keeps meaning "the actual amount earned by this row" as it already does today — Half Day is a descriptive flag, not a multiplier applied anywhere; the UI suggests half of `defaultPerDayAmount` when Half Day is toggled, always overridable. Each calendar-cell day shows two independently-clickable Day/Night indicators instead of one. (The weekly-ledger Day/Night earnings breakdown is a separate, deferred follow-up — `totalEarned` already sums correctly across mixed Day/Night rows with no changes needed here.)

## Boundaries & Constraints

**Always:**
- `shift`/`isHalfDay` live on `DailyLabourAttendance` itself (no new table) — correction chain, `perDayAmount`, site/date FKs apply per-row identically.
- Migration backfills existing rows `shift=DAY, isHalfDay=false` — standard `pnpm db:migrate:dev` flow (fully schema-declared, not AGENTS.md's undeclared-object danger case).
- A correction's shift must match the original's (alongside the existing labourerId match).
- A fresh (non-correcting) create is rejected if a current row already exists for the same labourerId+workDate+shift; corrections are exempt.
- Fix the stale "Mon-Sun calendar" comment at `daily-labour-attendance.service.ts:67` while touching this file.

**Ask First:** None identified; halt and ask if a new ambiguity surfaces mid-build.

**Never:**
- No Night-shift rate premium — same free-form `perDayAmount` entry either shift.
- No attendance correction UI — `correctsId`/`correctionReason` already exist unused at schema/service level, stays that way.
- No weekly-ledger Day/Night breakdown (`dayEarned`/`nightEarned` on `DailyLabourWeeklyPayment`) — deferred to its own spec (`deferred-work.md`); `totalEarned`'s existing sum is unaffected and needs no change.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Day + Night same date | Two creates, same labourer+date, shift DAY then NIGHT | Both persist as separate current rows | N/A |
| Duplicate shift, fresh create | Create matches an existing current row's shift, no `correctsId` | Rejected | "already has a Day/Night entry for this date — correct it instead" |
| Correction, matching shift | `correctsId` set, shift equals original's | Accepted, original superseded | N/A |
| Correction, mismatched shift | `correctsId` set, shift differs from original's | Rejected | "correction's Shift must match the row it corrects" |
| Half Day amount | `isHalfDay: true` | Stored as given; UI suggests `defaultPerDayAmount/2`, overridable | N/A |
| Weekly total, mixed shifts | Week has Day + Night attended rows | `totalEarnedThisWeek` sums both correctly (already shift-agnostic) | N/A |

</frozen-after-approval>

## Code Map

- `infra/prisma/schema.prisma:698-713` -- `DailyLabourAttendance`: add `shift LabourShift @default(DAY)`, `isHalfDay Boolean @default(false)`, new `enum LabourShift { DAY NIGHT }`.
- `packages/shared/src/schemas/labour-payment.ts:29-64` -- add `shift: z.enum(["DAY","NIGHT"])`, `isHalfDay: z.boolean().default(false)` to `createDailyLabourAttendanceSchema`.
- `apps/api/.../daily-labour-attendance.service.ts` -- `create()` L20-65: correction check L30-34 adds shift equality; new duplicate-shift guard for fresh creates (reuse imported `supersededAttendanceIds`/`currentAttendanceWhere`); persist `shift`/`isHalfDay` L39-49. Fix stale "Mon-Sun" comment L67 → "Sun-Sat".
- `apps/web/.../attendance-form-modal.tsx` -- `shift` prop (read-only display + hidden input); "Day Type" Full/Half `SelectField` (only when Present) whose change recomputes `perDayAmount` from `defaultPerDayAmount` (mirrors existing quick-amount pattern L104, still overridable).
- `apps/web/.../labourer-detail-client.tsx` -- `AttendanceRow` L13-19 add `shift`/`isHalfDay`; `attendanceByDate` L104 key `${date}::${shift}`; calendar cell L148-174 → two independently-clickable Day/Night sub-rows; `attendanceModal` state L67,222-235 → `{date,shift}|null`; `totalEarnedThisWeek` L105-107 unaffected (already shift-agnostic).
- `apps/web/.../parse.ts:9-26` -- add `shift`, `isHalfDay: formData.get("isHalfDay") === "1"`.
- Tests: `daily-labour-attendance.service.spec.ts`, `parse.test.ts`, `labourer-detail-client.test.tsx`.

## Tasks & Acceptance

**Execution:**
- [x] `infra/prisma/schema.prisma` + migration -- `LabourShift` enum, `shift`/`isHalfDay` on attendance -- backfillable; hand-written via `prisma migrate diff` due to pre-existing unrelated local-dev drift on `Movement.destinationSiteId`, applied via `db:migrate:deploy` (schema-declared, identical to what `migrate dev` would have produced)
- [x] `packages/shared/src/schemas/labour-payment.ts` -- add `shift`/`isHalfDay` -- AD-7 shared validation
- [x] `apps/api/.../daily-labour-attendance.service.ts` -- shift-aware correction match, duplicate-shift guard, persist columns, fix stale comment
- [x] `apps/web/.../attendance-form-modal.tsx` -- shift prop, Day Type selector with amount auto-suggest
- [x] `apps/web/.../labourer-detail-client.tsx` -- two-indicator cells, shift-aware modal invocation
- [x] `apps/web/.../parse.ts` -- coerce `shift`/`isHalfDay`
- [x] Extended the 3 planned test files, plus `labour-payments.integration.spec.ts` (not in original Code Map, broke on the type change)

**Acceptance Criteria:**
- Given a labourer with no attendance today, when Day and then Night are each recorded, then both persist as independent, separately-displayed entries for the same date.
- Given a current Day entry already exists for a date, when a fresh (non-correcting) Day create is submitted for the same labourer/date, then it's rejected with a clear error; Night is unaffected.
- Given Half Day is toggled in the modal with a `defaultPerDayAmount` set, when toggled, then the amount field suggests half that value while remaining editable.
- Given a week with both Day and Night attendance, when the live weekly total is computed, then it correctly sums both without any code change to that computation.

## Spec Change Log

**Patch (2026-09-23, post-review):** 4 confirmed findings fixed, no Intent/Boundaries change:
1. Duplicate-shift guard (`daily-labour-attendance.service.ts`'s `create()`) was missing `siteId` in its `findFirst` `where` — contradicted the model's own "One row per Labourer per Site per date per shift" doc comment. Added `siteId: input.siteId` to the guard.
2. `attendance-form-modal.tsx`'s "Attended" `SelectField` didn't reset `isHalfDay` when toggled to Absent, letting a hidden `isHalfDay: true` submit alongside `attended: false`. Reset `isHalfDay` to `false` in that field's `onChange` when the new value is Absent.
3. `labour-payments/[id]/actions.ts`'s `postJson` only read `responseBody.error?.message`, but a plain-string NestJS `BadRequestException` (used by the new duplicate-shift/correction-mismatch errors) puts `message` at the top level, not nested — so the specific error text was silently swallowed into a generic fallback. Added `responseBody.message` as a fallback source, matching the pattern already used in `movements/purchases/[id]/pricing/actions.ts`.
4. `labourer-detail-client.tsx`'s new per-shift Day/Night buttons lost their date association for screen readers once the date `<span>` became a sibling rather than a descendant of the button. Added an `aria-label` per shift button combining date + shift + current status.

Also added: a unit test proving a fresh Day create for a different Site on the same labourer/date/shift is allowed, and a component test proving the Night sub-cell (not just Day) opens the modal scoped to `shift: "NIGHT"`.

## Design Notes

`perDayAmount` already means "amount earned by this row," summed directly (never multiplied) — Half Day only changes the UI's suggested amount, not the sum logic.

The duplicate-shift guard mirrors `WorkRecordsService.assertNoExistingWorkRecord`/`DsrService.assertNoDoubleBooking` elsewhere, scoped to labourerId+workDate+shift via this module's own existing helpers — no new query pattern.

## Verification

**Commands:**
- `pnpm db:migrate:dev` -- expected: clean migration, check output for an unexpected second auto-generated migration (AGENTS.md's standing warning)
- `pnpm --filter @azentisfieldos/api test`, `pnpm --filter @azentisfieldos/web test`, `pnpm typecheck` -- expected: all pass

**Run (2026-09-23):**
- Migration applied to local dev DB via `db:migrate:deploy` (hand-written, see Execution above) — `prisma migrate status` reported up to date.
- `pnpm --filter @azentisfieldos/web test` -- 210 files / 1215 tests passed.
- `pnpm --filter @azentisfieldos/api test` with `DATABASE_URL` unset -- initially inconsistent because the new migration had NOT yet been applied to the dedicated `azentisfieldos_test` DB (only the dev DB); first run against `azentisfieldos_test` failed 3 integration tests with `The column DailyLabourAttendance.shift does not exist`. Fixed by running `DATABASE_URL=...azentisfieldos_test prisma migrate deploy` directly; re-run passed 129 files / 1426 tests.
- `pnpm typecheck` -- 4/4 packages passed (cache hit).

**Re-run after patch (2026-09-23):**
- `pnpm --filter @azentisfieldos/web test` -- 210 files / 1216 tests passed (+1 for the new Night-sub-cell test).
- `pnpm --filter @azentisfieldos/api test` with `DATABASE_URL` unset -- 120 files / 1304 tests passed, 9 files / 123 tests skipped (integration specs self-skip without a DB).
- `pnpm --filter @azentisfieldos/api test` with `DATABASE_URL=postgresql://priyanka@localhost:5432/azentisfieldos_test?schema=public` (after confirming `prisma migrate deploy` against that DB reported "No pending migrations to apply" -- schema unchanged by this patch) -- 129 files / 1427 tests passed (+1 for the new siteId-guard test).
- `pnpm typecheck` -- 4/4 packages passed.

**Manual checks (if no CLI):**
- Record a Day Full-Day and a Night Half-Day for the same date: both display independently in the calendar cell and both roll correctly into the weekly total.

## Suggested Review Order

**Schema: the new shift dimension**

- Entry point: the enum and columns the whole feature hangs off.
  [`schema.prisma:696`](../../infra/prisma/schema.prisma#L696)

- Shared Zod validation mirrors the Prisma enum (AD-7).
  [`labour-payment.ts:11`](../../packages/shared/src/schemas/labour-payment.ts#L11)

**Server-side invariants (correction match, duplicate guard)**

- A correction must restate the same shift as the row it corrects.
  [`daily-labour-attendance.service.ts:35`](../../apps/api/src/labour-payments/daily-labour-attendance.service.ts#L35)

- The duplicate-shift guard, patched post-review to include `siteId` — matches the model's own "per Labourer per Site per date per shift" doc comment, which the first pass missed.
  [`daily-labour-attendance.service.ts:46`](../../apps/api/src/labour-payments/daily-labour-attendance.service.ts#L46)

**Client wiring (calendar cells → modal → form submit)**

- Each date now keys two independent rows (Day and Night), not one.
  [`labourer-detail-client.tsx:114`](../../apps/web/app/(app)/labour-payments/[id]/_components/labourer-detail-client.tsx#L114)

- Accessibility fix, post-review: the per-shift button's `aria-label` restores the date association a screen reader lost when the date span became a sibling instead of a descendant.
  [`labourer-detail-client.tsx:176`](../../apps/web/app/(app)/labour-payments/[id]/_components/labourer-detail-client.tsx#L176)

- Toggling to Absent now resets Half Day too, post-review fix — previously a stale `isHalfDay: true` could submit alongside `attended: false`.
  [`attendance-form-modal.tsx:107`](../../apps/web/app/(app)/labour-payments/[id]/_components/attendance-form-modal.tsx#L107)

**Error surfacing (post-review fix)**

- The duplicate-shift error's plain-string `BadRequestException` puts `message` at the top level, not nested under `.error` — `postJson` was missing the fallback that sibling modules already use, so the specific error text was silently lost until this patch.
  [`actions.ts:30`](../../apps/web/app/(app)/labour-payments/[id]/actions.ts#L30)

**Peripherals**

- Regression tests across `daily-labour-attendance.service.spec.ts`, `parse.test.ts`, `labourer-detail-client.test.tsx`, and the type-compat updates to `labour-payments.integration.spec.ts` — see the Spec Change Log for what each new test proves.
