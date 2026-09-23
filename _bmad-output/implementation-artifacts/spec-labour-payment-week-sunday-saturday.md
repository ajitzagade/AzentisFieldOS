---
title: 'Labour Payment week: Monday–Sunday → Sunday–Saturday'
type: 'feature'
created: '2026-09-23'
status: 'done'
review_loop_iteration: 1
context: []
baseline_commit: 'ccbd6c91c65f3e13bac9d313dfe71a8927f963e0'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Labour Payment module's weekly cycle (used for attendance-week navigation and weekly settlement) is currently anchored to Monday–Sunday. The business needs it anchored to Sunday–Saturday instead, for all defaults, navigation, validation, and settlement.

**Approach:** Swap the anchor day from Monday (`getUTCDay() === 1`) to Sunday (`getUTCDay() === 0`) at the single shared validation point and the client-side week-math helper, and update every test fixture that hardcodes a Monday-anchored date. This is a pure anchor-day swap with no backend schema change and no historical-data migration — `DailyLabourWeeklyPayment` creation is fully manual (an Owner explicitly picks a week and clicks settle; there is no cron job assuming Monday), and attendance queries filter by whatever `weekStartDate`/`weekEndDate` pair they're given, independent of anchor convention.

## Boundaries & Constraints

**Always:**
- Sunday (`getUTCDay() === 0`) is the new anchor for every NEW `weekStartDate` — validation, "current week" default, Prev/Next nav — in Labour Payment only.
- Existing `DailyLabourWeeklyPayment` rows keep their original Monday-anchored dates forever (append-only, AD-9) — never rewritten/backfilled.
- Rename `mondayOf` → `sundayOf` in `week-utils.ts` (header comment + call sites) so the name matches behavior.
- Update every test/fixture hardcoding a Monday-anchored date or the old "must start on a Monday" message.

**Ask First:** If a file outside the Code Map is found computing/filtering Labour Payment weeks, HALT and confirm before extending scope.

**Never:**
- Touch `team-members.service.ts`'s `getTeamSummary` — its own, separately Monday-anchored week calc for the deliberately decoupled Team/Payment system (AGENTS.md).
- Backfill/rewrite historical `DailyLabourWeeklyPayment` dates.
- Add Day/Night duty breakdown to the weekly summary — separately deferred (`deferred-work.md`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Default week, page load | No week selected | `sundayOf`/`currentWeekStart` returns most recent Sunday; window is that Sunday–Saturday | N/A |
| Prev/Next nav | Click "Next week" | Window shifts exactly +7 days, stays Sunday-anchored | N/A |
| Weekly payment submit, valid | `weekStartDate` is a Sunday | Accepted; `weekEndDate` = start + 6 (Saturday) | N/A |
| Weekly payment submit, invalid | `weekStartDate` not a Sunday (e.g. old-rule Monday) | Rejected, client + API | "Week must start on a Sunday" |
| Pre-change historical row | Row created before this change, Monday-anchored | Ledger renders stored dates unchanged | N/A |
| Correction | `correctsId` set, must match original's `weekStartDate` | Anchor-agnostic exact-date check, unaffected | Existing "must restate the same week" error |

</frozen-after-approval>

## Code Map

- `packages/shared/src/schemas/labour-payment.ts:176-184` -- sole server-enforced anchor check (AD-7 shared): `superRefine` does `getUTCDay() !== 1`, message "...Monday". Change `1`→`0`, update message.
- `apps/web/.../[id]/week-utils.ts` -- `mondayOf` (L14-19, anchor diff), `currentWeekStart` (L30-32, calls it); `addWeeks`/`weekDates` anchor-agnostic. Header comment L1-3 "Mon-Sun" → update. Rename `mondayOf`→`sundayOf`; new diff: `-day`.
- `apps/web/.../labourer-detail-client.tsx:11,64,70-71,78,130,137,204` -- calls `currentWeekStart`/`weekDates`/`addWeeks` only, no direct `mondayOf` — updates automatically; verify compiles post-rename.
- `apps/api/.../daily-labour-weekly-payments.service.ts:44-45,62` -- anchor-agnostic, no change needed.
- Monday-anchored fixtures/assertions to update: `apps/web/.../week-utils.test.ts:4-37` (rewrite, rename to `sundayOf`), `apps/web/.../parse.test.ts:46-51,81-84` (`"2026-08-10"` fixture + rejection test), `apps/web/.../labourer-detail-client.test.tsx:4,66,99,128,136` (same date), `apps/api/.../daily-labour-weekly-payments.service.spec.ts:70,144-155`, `apps/api/.../labour-payments.integration.spec.ts:50,84,96`.

## Tasks & Acceptance

**Execution:**
- [x] `packages/shared/src/schemas/labour-payment.ts` -- day check `!== 1` → `!== 0`, message → "Week must start on a Sunday" -- sole real enforcement point (AD-7)
- [x] `apps/web/.../week-utils.ts` -- rename `mondayOf`→`sundayOf`, new diff formula (`-day`), update header comment -- keeps default/nav Sunday-anchored
- [x] `apps/web/.../week-utils.test.ts`, `parse.test.ts`, `labourer-detail-client.test.tsx`, `apps/api/.../daily-labour-weekly-payments.service.spec.ts`, `apps/api/.../labour-payments.integration.spec.ts` -- updated every Monday-anchored fixture date, comment, and rejection-test to Sunday -- keeps tests proving the new rule instead of the old one
- [x] `packages/shared/src/schemas/labour-payment.ts` (review patch) -- scope the Sunday day-check to `!data.correctsId` only, so a correction can still restate a pre-existing (Monday-anchored) row's exact week -- the unconditional check broke correcting any legacy row through the real API/Zod pipe; caught by the verification-gap review layer
- [x] `infra/prisma/schema.prisma` (review patch) -- update the `DailyLabourWeeklyPayment` doc comment from Monday to Sunday, note legacy rows stay Monday-anchored -- was left stale by the initial pass
- [x] `apps/web/.../parse.test.ts`, `apps/web/.../labourer-detail-client.test.tsx` (review patch) -- added a correction-with-Monday-weekStartDate acceptance test and a pre-change Monday-anchored ledger-render test -- closes the two test gaps the review found

**Acceptance Criteria:**
- Given no week is selected, when the labourer detail page loads, then "current week" runs Sunday–Saturday.
- Given Prev/Next controls, when clicked, then the window shifts exactly 7 days, staying Sunday-anchored.
- Given a weekly payment submit with a non-Sunday `weekStartDate`, when submitted (modal or API), then it's rejected with "Week must start on a Sunday" — both inline client and API validation.
- Given a pre-change `DailyLabourWeeklyPayment` row (Monday-anchored), when its ledger row renders, then its stored dates display unshifted.
- Given `team-members.service.ts`'s `getTeamSummary`, when this ships, then its own (separate) week computation is untouched.

## Spec Change Log

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/web test -- week-utils parse.test labourer-detail-client` -- expected: pass with Sunday-anchored assertions
- `pnpm --filter @azentisfieldos/api test -- daily-labour-weekly-payments labour-payments.integration` -- expected: pass
- `pnpm typecheck` -- expected: no errors from the `mondayOf`→`sundayOf` rename

**Manual checks (if no CLI):**
- In dev, open a labourer's detail page: default window is Sunday–Saturday, Prev/Next moves 7 days and stays Sunday-anchored, submitting a non-Sunday weekly payment is rejected inline.

## Suggested Review Order

**Anchor-day validation (the real enforcement point)**

- Entry point: the Sunday check itself, now correctly scoped to skip corrections so legacy Monday-anchored rows can still be corrected.
  [`labour-payment.ts:183`](../../packages/shared/src/schemas/labour-payment.ts#L183)

- Comment explaining why the check is conditional on `correctsId` — the root cause the review caught.
  [`labour-payment.ts:177`](../../packages/shared/src/schemas/labour-payment.ts#L177)

**Client week-math anchor swap**

- `mondayOf` renamed to `sundayOf` with a simplified diff formula for the new anchor.
  [`week-utils.ts:14`](../../apps/web/app/(app)/labour-payments/[id]/week-utils.ts#L14)

- The diff collapses to `-day` since Sunday (day 0) is now the anchor itself.
  [`week-utils.ts:17`](../../apps/web/app/(app)/labour-payments/[id]/week-utils.ts#L17)

**Documentation kept in sync**

- Prisma model comment corrected from Monday to Sunday, with a note that legacy rows stay Monday-anchored forever.
  [`schema.prisma:752`](../../infra/prisma/schema.prisma#L752)

- New comment recording when and why the anchor changed, for future readers of the schema.
  [`schema.prisma:758`](../../infra/prisma/schema.prisma#L758)

**Regression tests (peripherals)**

- Proves a correction can still restate a pre-existing Monday-anchored week — the review-patch test for the bug found.
  [`parse.test.ts:89`](../../apps/web/app/(app)/labour-payments/[id]/parse.test.ts#L89)

- Proves fresh (non-correction) submissions are still rejected on any non-Sunday date.
  [`parse.test.ts:81`](../../apps/web/app/(app)/labour-payments/[id]/parse.test.ts#L81)

- Proves a pre-change, Monday-anchored ledger row still renders its stored dates unshifted.
  [`labourer-detail-client.test.tsx:158`](../../apps/web/app/(app)/labour-payments/[id]/_components/labourer-detail-client.test.tsx#L158)

- Remaining Sunday-anchored fixture/assertion updates across `week-utils.test.ts`, `daily-labour-weekly-payments.service.spec.ts`, and `labour-payments.integration.spec.ts` — mechanical date shifts, no logic change.

**Run (2026-09-23):**
- `pnpm --filter @azentisfieldos/web test -- week-utils parse.test labourer-detail-client` -- full web suite ran (vitest ignored the filter args in this invocation form), 210 files / 1209 tests passed, including the updated Sunday-anchored fixtures.
- `pnpm --filter @azentisfieldos/api test -- daily-labour-weekly-payments labour-payments.integration` -- run twice: once without `DATABASE_URL` (integration spec self-skips, 120 files/1298 tests passed) and once with `DATABASE_URL` pointed at the local `azentisfieldos_test` Postgres DB (129 files / 1421 tests passed, including the real-DB integration spec exercising the Sunday-anchored `weekStartDate`/`weekEndDate` fixtures end to end).
- `pnpm typecheck` -- 4/4 packages passed, no errors from the `mondayOf`→`sundayOf` rename.

**Re-run after review patches (2026-09-23):** a 3-layer review (blind-hunter, edge-case-hunter, verification-gap) surfaced one real high-severity bug — the Sunday day-check applied unconditionally, including to `correctsId` corrections, permanently blocking correction of any pre-existing (Monday-anchored) `DailyLabourWeeklyPayment` row through the real API — plus a stale `schema.prisma` comment and a missing test for the "pre-change historical row renders unshifted" I/O matrix row. All three patched (see added Execution rows above). Full re-run after the patch:
- `pnpm typecheck` -- 4/4 packages, cache hit, all pass.
- `pnpm --filter @azentisfieldos/web test` -- 210 files / 1211 tests passed (was 1209; +2 for the new correction-acceptance and legacy-render tests).
- `pnpm --filter @azentisfieldos/api test` (no `DATABASE_URL`) -- 120 files / 1298 tests passed, 123 skipped (integration specs self-skip).
- `pnpm --filter @azentisfieldos/api test` (`DATABASE_URL` → local `azentisfieldos_test` Postgres DB) -- 129 files / 1421 tests passed, including the real-DB integration spec.
