---
baseline_commit: d213ce16424f777bd790ee6bbec5c5f6aa54e6c7
---

# Story 7.4: Outstanding Advance Visibility

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to see total Outstanding Advances at a glance, drillable per Team Member,
so that I always know how much is owed back to the business without adding it up manually.

## Acceptance Criteria

1. **Given** Advances and Adjustments exist across multiple Team Members, **when** I view the Outstanding Advances summary, **then** the total reconciles exactly to the sum of individual Team Members' balances. (FR-25)
2. Clicking through from the summary opens the specific Team Member's Advance ledger.

## Tasks / Subtasks

- [x] Task 1 — `apps/api` (AC: #1)
  - [x] `apps/api/src/team/team-members.controller.ts` (Epic 6, extend): `GET /team-members/outstanding-advances` — returns `{ total, byTeamMember: [{ teamMemberId, name, outstandingAdvanceBalance }] }`, where `total` is `SUM(outstandingAdvanceBalance)` across all Team Members with a non-zero balance. Because `TeamMember.outstandingAdvanceBalance` is materialized (Story 7.1), this is a single aggregate query over an already-correct column — **not** a re-derivation from `Advance`/`AdvanceAdjustment` history. AC #1's "reconciles exactly" is true by construction here, the same way FR-14's stock reconciliation was true by construction in Epic 5 Story 5.7 — no new write-path logic, this task is read-only.
- [x] Task 2 — `apps/web` UI (AC: #1, #2)
  - [x] Wire the "Total Outstanding Advances" stat tile on `apps/web/app/(app)/team/page.tsx` (left as a placeholder by Epic 6 Story 6.1, and referenced again by Story 7.3's Payments list) to Task 1's endpoint — one shared number, sourced once, not computed separately on each page that displays it.
  - [x] A dedicated summary view — either a section on the Team list page or a small drill-down table (Team Member / Outstanding Balance, sorted descending) — where each row links to `apps/web/app/(app)/team/[id]/page.tsx` (Story 7.1's Advance Ledger section), satisfying AC #2. Reuse the existing `DataTable`'s `rowHref`, don't build a custom click handler.
- [x] Task 3 — Tests (AC: #1)
  - [x] `team-members.service.spec.ts` (extend): `outstanding-advances` sums correctly across multiple Team Members, excludes/includes zero-balance members per whatever the UI needs (a Team Member who's fully repaid shows `₹0`, not omitted — don't silently drop them from `byTeamMember`, that would make the list look incomplete rather than accurate).

## Dev Notes

**This story is almost entirely a read on top of Story 7.1's materialized column — by far the thinnest story in this epic.** All the real design work (what "Outstanding Balance" means, how it stays race-safe and always-correct) was done in Stories 7.1 and 7.2. Do not add any new balance-computation logic here; if the aggregate in Task 1 doesn't match what the Team list page shows per-Team-Member, that's a sign Story 7.1's materialization has a bug, not a sign this story needs its own parallel computation to "double check."

**Depends on Story 7.1 entirely** (the materialized `outstandingAdvanceBalance` column) and benefits from **Story 6.3**'s existing Team Member detail page as the drill-down target (AC #2).

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6 (an empty-Advances Tenant shows a genuine `₹0` total, not an error or a missing section).

### Project Structure Notes

- One new endpoint on the existing `team-members.controller.ts` (Epic 6). No new files at the API layer.
- Extends `apps/web/app/(app)/team/page.tsx`, already touched by Epic 6 Story 6.1 and Story 7.3.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-6] (FR-25)
- [Source: _bmad-output/planning-artifacts/stories/phase-4-people-money/epic-7-advances-payments/story-7.4-outstanding-advance-visibility.md]
- [Source: _bmad-output/implementation-artifacts/7-1-record-an-advance.md — the materialized balance column this story only reads]
- [Source: _bmad-output/implementation-artifacts/5-7-stock-lifecycle-visibility-low-stock-flagging.md — the parallel "read-only rollup over an already-correct materialized value" precedent from Epic 5]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `pnpm --filter @azentisfieldos/api test`, `pnpm --filter @azentisfieldos/web test` — full suites green (285 + 323 passed, no regressions; 51 pre-existing DB-integration tests skipped, same baseline as Stories 7.1-7.3).
- `pnpm typecheck`, `pnpm build` — clean; `/team` and `/payments` still resolve correctly with the new endpoint wired in.
- `pnpm lint` — this story's files lint clean in isolation; the full monorepo run still surfaces the same pre-existing, unrelated failure in `apps/web/app/(app)/daily-activity/work-records/new/work-record-form.tsx` noted in Story 7.3's Debug Log (Epic 3/6 scope, never touched by Epic 7).

### Completion Notes List

- Task 1: `GET /team-members/outstanding-advances` added to `TeamMembersController`/`TeamMembersService` (registered before `:id`, same reasoning as the existing `team-summary` route). `getOutstandingAdvances()` is two queries — a `findMany` (id/name/outstandingAdvanceBalance, ordered descending) and an `aggregate` `_sum` — both directly over the materialized column, no Advance/AdvanceAdjustment re-derivation. As part of wiring this in, removed the now-superseded `totalOutstandingAdvances` field (and its `advance`/`advanceAdjustment` aggregate queries) from `getTeamSummary()` — Task 2 explicitly called for both consuming pages to move onto this story's new endpoint as "one shared number, sourced once," so the old computation became dead weight rather than a second parallel source of truth.
- Task 2: `team/page.tsx`'s "Total Outstanding Advances" stat tile and `payments/page.tsx`'s matching tile (Story 7.3) both now read `GET /team-members/outstanding-advances`. Added a new "Outstanding Advances" `DataTable` section to the Team list page (Team Member / Outstanding Balance, `rowHref` to `/team/[id]`, sorted descending) — filtered to non-zero balances for the drill-down view specifically (a "who's owed" list showing every fully-repaid Team Member alongside the ones who matter would bury the signal), while the API's own `byTeamMember` still returns everyone per Task 3's explicit requirement. AD-6: an empty section renders "No Team Member currently has an Outstanding Advance." rather than being hidden or erroring.
- Task 3: extended `team-members.service.spec.ts` with `getOutstandingAdvances` coverage (sum-across-multiple-Team-Members, zero-balance inclusion in `byTeamMember`, empty-Tenant `₹0` case, descending sort order) and `team-members.controller.spec.ts` with the delegation test. Updated `getTeamSummary`'s existing tests to drop the removed `totalOutstandingAdvances` assertions. Updated `team/page.test.tsx` and `payments/page.test.tsx` mocks/assertions for the new endpoint and stat-tile wiring, and added tests for the new drill-down table (renders, links, empty state).

### File List

- `apps/api/src/team/team-members.controller.ts` (modified)
- `apps/api/src/team/team-members.controller.spec.ts` (modified)
- `apps/api/src/team/team-members.service.ts` (modified — added `getOutstandingAdvances`, removed superseded `totalOutstandingAdvances` from `getTeamSummary`)
- `apps/api/src/team/team-members.service.spec.ts` (modified)
- `apps/web/app/(app)/team/page.tsx` (modified — new endpoint wiring + drill-down section)
- `apps/web/app/(app)/team/page.test.tsx` (modified)
- `apps/web/app/(app)/payments/page.tsx` (modified — new endpoint wiring)
- `apps/web/app/(app)/payments/page.test.tsx` (modified)

## Change Log

- 2026-08-15: Story implemented end-to-end (API endpoint, web wiring, tests). Status set to review.
