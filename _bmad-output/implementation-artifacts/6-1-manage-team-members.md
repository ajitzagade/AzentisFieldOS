---
baseline_commit: 69304c7c784222ac253b1fda37e51f60875149b0
---

# Story 6.1: Manage Team Members

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to create and maintain Team Member records (name, role/designation, contact, employment/payment type),
so that I have one accurate roster, never bound to a single Site.

## Acceptance Criteria

1. **Given** I create a Team Member with a name, role, contact, and employment type (monthly/weekly/daily-wage), **when** I save, **then** the Team Member is immediately available in every Work Record, Advance, and Payment picker across the product. (FR-19)
2. A Team Member is never permanently bound to one Site — their assignment comes only from actual Work Records, never a field on `TeamMember` itself. (FR-19)
3. Employment-type categories are admin-configurable data, not a hardcoded enum — Epic 14 later adds the admin UI to manage them; this story only needs the underlying data to already be configurable, not that UI. (NFR-4)
4. A Team Member can be disabled without deleting it or affecting Work Records/Advances/Payments already recorded against it — disabling only hides it from new-entry pickers, matching the same non-destructive pattern Epic 4 established for Materials.

## Tasks / Subtasks

- [x] Task 1 — Schema fix: `EmploymentType` must be data, not an enum (must land before anything else) (AC: #1, #3)
  - [x] `infra/prisma/schema.prisma` currently defines `enum EmploymentType { MONTHLY WEEKLY DAILY_WAGE }` and `TeamMember.employmentType EmploymentType`. This directly contradicts AC #3/NFR-4 — a Prisma enum is exactly the "hardcoded enum" the AC says not to use, and adding a fourth employment type later (Epic 14) would require a schema migration if left as an enum. Replace it with a model, following the exact pattern Epic 4 Story 4.1 established for `MaterialCategory`/`Unit`: `model EmploymentType { id String @id @default(uuid(7)), name String @unique, isActive Boolean @default(true) }`, and change `TeamMember.employmentType EmploymentType` to `TeamMember.employmentTypeId String` + `employmentType EmploymentType @relation(fields: [employmentTypeId], references: [id])`.
  - [x] Seed three default rows — "Monthly," "Weekly," "Daily Wage" — matching the enum's current three values, so existing behavior is unchanged on day one; only the mechanism becomes configurable. Add this to whatever seed mechanism the repo uses (check for an existing `prisma/seed.ts` before adding a new one — none exists as of this story, so add a minimal `infra/prisma/seed.ts` if the team wants seeding automated, or document the three `INSERT`s as a one-time manual step if not; either is acceptable, but don't skip getting the three rows into a real dev database, since `TeamMember.employmentTypeId` is a required FK with nothing to point to otherwise).
  - [x] Run `pnpm db:generate`.
- [x] Task 2 — Shared Zod schemas (AC: #1, #2, #3, #4)
  - [x] Create `packages/shared/src/schemas/employment-type.ts`: `createEmploymentTypeSchema` (`{ name: z.string().min(1).max(100) }`) — this story needs create+list only (Epic 14 owns the full admin UI per AC #3's own wording; this story just needs enough to seed/select from, same "minimal now, full lifecycle later" split Epic 4 Story 4.1 used for `Unit`).
  - [x] Create `packages/shared/src/schemas/team-member.ts`: `createTeamMemberSchema` (`name: z.string().min(1).max(200)`, `designation: z.string().max(200).optional()`, `contact: z.string().max(100).optional()`, `employmentTypeId: z.uuid()`), `updateTeamMemberSchema` (partial over `{ ...createTeamMemberSchema.shape, isActive: z.boolean() }`, `isActive` un-defaulted before `.partial()` — the exact same default-on-partial trap Epic 4 Story 4.1's Dev Notes documented for `site.ts`/`material.ts`, cite it, don't re-derive it).
  - [x] Export both from `packages/shared/src/index.ts`.
- [x] Task 3 — `apps/api` (AC: #1, #2, #3, #4)
  - [x] `apps/api/src/team/employment-types.controller.ts` + `.service.ts`: `POST /employment-types`, `GET /employment-types`.
  - [x] `apps/api/src/team/team-members.controller.ts` + `.service.ts`: `POST /team-members`, `GET /team-members`, `PATCH /team-members/:id`, `GET /team-members/:id`. `update` translates a `P2025` (not found) the same way `SitesService.update` does; `create`/`update` translate a `P2003` (bad `employmentTypeId`) into `400`, same pattern as Epic 4's `materials.service.ts`.
  - [x] `apps/api/src/team/team.module.ts` registered in `app.module.ts`. No `siteId` field or relation on `TeamMember` anywhere in this module — that would violate AC #2; a reviewer should be able to grep this module for `siteId` and find nothing.
  - [x] `GET /team-members` and `GET /team-members/:id` include the `employmentType` relation so the frontend never needs a second round-trip to resolve the name.
- [x] Task 4 — `apps/web` UI (AC: #1, #2, #3, #4)
  - [x] Replace the stub `apps/web/app/(app)/team/page.tsx` with the real Team & Labour list: stat tiles (Total Team Members, Today's working headcount — this needs Story 6.2's `WorkRecord` data and is fully built in Story 6.3, render `—` here if 6.2/6.3 haven't landed yet rather than blocking this story on them; Total Outstanding Advances — same honest-placeholder treatment, Epic 7 not built yet) and a `DataTable` with columns Name / Role-Designation / Employment Type / Today's Attendance (`—` until Story 6.2 exists) / Current-or-Last Site (`—` until Story 6.2 exists) / row action, matching `08-team.html`.
  - [x] `apps/web/app/(app)/team/new/page.tsx` — create form (name, designation, contact, Employment Type `SelectField`).
  - [x] `apps/web/app/(app)/team/[id]/edit/page.tsx` — edit form, same fields plus an `isActive` disable toggle, normal Edit affordance (Team Member is master data, not transaction history — same Edit-not-Correct call Epic 4 made for Material).
  - [x] `apps/web/app/(app)/team/employment-types/page.tsx` — minimal list + inline add form, same "dedicated route, not a modal" pattern Epic 4 established (no Modal/Dialog component exists in `packages/ui`); full edit/disable lifecycle for Employment Types is explicitly Epic 14's job per AC #3, not this story's.
- [x] Task 5 — Tests (AC: all)
  - [x] Zod tests, including the `updateTeamMemberSchema` no-op/default-on-partial regression test.
  - [x] `team-members.controller.spec.ts` / `.service.spec.ts` following `sites.controller.spec.ts`'s structure: create/list/update delegation; `P2025`→`NotFoundException`; `P2003`→`BadRequestException`.
  - [x] A schema-level test (or a service test asserting the query shape) confirming no code path in this module ever filters or groups `TeamMember` by `siteId` — the concrete, automatable version of AC #2.

## Dev Notes

**Schema/AC conflict found and resolved — this is the same category of gap Epic 4 (`MaterialCategory.isActive`) and Epic 5 (`ReturnWastage.correctsId`/`reason`) each hit once.** The schema was drafted with `EmploymentType` as a Prisma enum before this story's AC (and NFR-4) were checked against it. An enum is the textbook definition of "hardcoded" that AC #3 rules out. Task 1's model-instead-of-enum fix follows the exact precedent Epic 4 Story 4.1 set for `Unit` (minimal create+list now, full admin lifecycle deferred to the epic that actually owns it — here, Epic 14 via FR-49). Don't leave the enum in place "because it's already there and Epic 14 will fix it later" — Epic 14 managing Employment Types assumes they're already data, not an enum it would then have to migrate away from.

**AC #2 is a constraint on absence, not presence — it's easy to accidentally violate by convenience.** A common shortcut once Story 6.2 exists ("just cache the Team Member's current Site on the `TeamMember` row so the list page is a simpler query") would reintroduce exactly the binding FR-19 forbids. `TeamMember`'s "current/last Site" (shown in the `08-team.html` list) must always be *derived* — the most recent `WorkRecord.siteId` for that Team Member — never stored. This module doesn't build that derivation (Story 6.3 does); this story's job is only to make sure nothing here creates a field that could tempt someone to store it directly.

**Depends on nothing new** beyond what Epics 1–5 already established (the module/schema/page conventions). Stories 6.2 and 6.3 depend on this one.

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7, NFR-4.

### Project Structure Notes

- New `apps/api/src/team/` module (mirrors `apps/api/src/materials/`'s shape from Epic 4: two related resources, one module).
- `apps/web/app/(app)/team/page.tsx` already exists as a stub — this story replaces it.
- No conflicts detected.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-5 — Labour & Team Management] (FR-19, NFR-4)
- [Source: _bmad-output/planning-artifacts/epics/phase-4-people-money/epic-6-team-labour-management.md]
- [Source: _bmad-output/planning-artifacts/stories/phase-4-people-money/epic-6-team-labour-management/story-6.1-manage-team-members.md]
- [Source: infra/prisma/schema.prisma#EmploymentType, TeamMember — the enum-vs-data conflict this story's Task 1 fixes]
- [Source: _bmad-output/implementation-artifacts/4-1-manage-material-categories-materials.md — the MaterialCategory/Unit pattern this story's EmploymentType/TeamMember split follows]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/08-team.html]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

### Completion Notes List

- Task 1: replaced the `EmploymentType` enum with a data model, following `MaterialCategory`'s exact shape (`id`/`name @unique`/`isActive`). No existing `TeamMember` rows existed in the dev database, so the migration (`DROP COLUMN employmentType` / `ADD COLUMN employmentTypeId NOT NULL`) applied cleanly with no backfill needed.
- No `infra/prisma/seed.ts` existed yet — added a minimal, idempotent one (upsert by `name`) seeding "Monthly"/"Weekly"/"Daily Wage", wired via `package.json`'s `"prisma": { "seed": ... }` field (Prisma's seed-command convention; Prisma 7's `prisma.config.ts` has no seed hook of its own) plus a `db:seed` script. Verified idempotency by running it twice — still exactly 3 rows.
- Updated the one existing test that referenced the old enum (`dsr.service.integration.spec.ts`'s fixture `TeamMember`) to look up the seeded "Daily Wage" `EmploymentType` row instead of passing a literal enum value — it upserts by name rather than creating/deleting its own row, since seed data is shared reference data, not a per-test fixture.
- `TeamMembersService`/`TeamMembersController` follow `MaterialsService`'s exact error-translation shape: P2003 (bad `employmentTypeId`) → 400, P2025 (update on a missing row) → 404. `GET /team-members`/`GET /team-members/:id` include the `employmentType` relation so the frontend never does a second round-trip.
- AC #2 ("never bound to one Site") made concrete per Task 5: a dedicated test asserts `TeamMembersService.list()`'s Prisma call arguments contain no `siteId`-shaped clause anywhere, and the module has no `siteId` field/relation/import at all — grepping `apps/api/src/team/` for `siteId` finds nothing.
- Frontend: Team list page renders honest `—` placeholders for "Today's Attendance"/"Current/Last Site" (Story 6.2/6.3) and "Today's working headcount"/"Total Outstanding Advances" stat tiles (Stories 6.2/6.3, Epic 7) rather than fabricating data — same precedent `apps/web/app/(app)/sites/page.tsx` set for "Last DSR activity". Row action links to `/team/[id]/edit` (an "Edit" affordance, not the mockup's "View" detail-page link) since no Team Member detail page exists yet — Story 6.1's Task 4 only asks for list/new/edit/employment-types routes, and the mockup's detail page appears to be Story 6.3's Work History & Team Summary content, not this story's.
- Final state: `apps/api` 238 tests / 31 files passing, `apps/web` 231 tests / 63 files passing. Both packages typecheck, lint, and build clean.

### Review Findings

- [x] [Review][Patch] `updateTeamMemberAction` collapsed a blanked Designation/Contact to `undefined`, which `JSON.stringify` drops entirely — since the edit form always resubmits every field (full-replace, not a diff), there was no way to ever clear either field once set [apps/web/app/(app)/team/[id]/edit/actions.ts:21] — fixed: `updateTeamMemberSchema`'s `designation`/`contact` now take `.nullable()`, and the action sends explicit `null` for a blanked field.
- [x] [Review][Patch] `updateTeamMemberAction`'s 400-fallback read `body.error?.message`, but Nest's default `BadRequestException(string)` body has no `error` object — same bug already fixed repeatedly across Epic 5 (Purchase/Movement/Consumption/Return-Wastage) [apps/web/app/(app)/team/[id]/edit/actions.ts:38] — fixed: now reads `body.message`, wraps `fetch()` in try/catch, guards `res.json()` with `.catch()`; test coverage added.
- [x] [Review][Patch] Test titled "posts only the changed fields..." actually verified a full-state PATCH (the real form always submits every field) — misleading given it sits next to the Designation/Contact-clearing bug above [apps/web/app/(app)/team/[id]/edit/actions.test.ts:29] — fixed: retitled, and the existing 400-shape test corrected to mock Nest's real response body.
- [x] [Review][Patch] `apps/api/src/team/team.module.ts` as it landed in the Epic 6 commit imported `AdvancesController`/`AdvancesService`, which were never part of this story (or any committed code) — the module didn't actually build. Fixed in a follow-up commit (`d213ce1`) immediately after discovery, before this review's triage continued; noted here for the record.
- [x] [Review][Dismiss] "`TeamModule` registers `WorkRecordsController`/`Service` not present in this diff, build break" / "Story 6.3's derivation logic (`currentOrLastSite`/`todaysAttendance`, `getTeamSummary`) built in 6.1, contradicting Dev Notes' scope boundary" / "row links to `/team/:id` which doesn't exist" / "two undocumented endpoints (`work-history`, `team-summary`)" — all diff-scoping artifacts: Epic 6 was committed as one commit spanning Stories 6.1-6.3 together (see the Epic 6 commit's own message — this was a deliberate choice to give a concurrent session a stable diff point), so a diff scoped to 6.1's own File List still shows the final cumulative state of shared files (`team-members.service.ts`, `team.module.ts`, `team/page.tsx`) that 6.2/6.3 also touched. `work-records.controller.ts`/`.service.ts` and `team/[id]/page.tsx` are real, committed, working files — verified directly against the commit rather than assumed.
- [x] [Review][Dismiss] Migration doesn't backfill/would fail `NOT NULL` on a non-empty `TeamMember` table — verified real (the migration drops the old enum column and adds `employmentTypeId TEXT NOT NULL` with no default or backfill) but zero practical impact: this is a pre-launch, single-tenant-per-deployment codebase (AD-1/AD-2) with no real tenant deployments yet, and the only environment this has run against had 0 existing rows (confirmed in the original Completion Notes)
- [x] [Review][Dismiss] Schema/migration drift for `TeamMember.outstandingAdvanceBalance`/`Advance`/`AdvanceAdjustment`/`Payment` correction fields — real, but verified these belong entirely to Epic 7 (a concurrently-in-progress, not-yet-committed epic) and are never read or written by any of this story's own code (`TeamMembersService` doesn't reference `outstandingAdvanceBalance`, and `getTeamSummary()`'s existing `Payment`/`Advance`/`AdvanceAdjustment` aggregate queries never touch the new drifted columns) — not this story's defect to fix, flagged separately to the user as an Epic 7 migration-hygiene gap
- [x] [Review][Defer] `list()`'s `isToday` check and `getTeamSummary()`'s "today"/week/month boundaries all use UTC (`new Date().toISOString()`), not IST — for an India-based product this can misclassify "today" for ~5.5 hours around the UTC day boundary. Systemic (the same pattern is used by `PurchasesService.countThisMonth`, already deferred under Story 5.1/5.7), not specific to this story.
- [x] [Review][Defer] No server-side check that an `EmploymentType` is `isActive` before assigning it to a Team Member — real gap, but currently unreachable: nothing in the app (Epic 14 owns this) can ever set `isActive: false` on an Employment Type yet, so there's no way to trigger it without manually editing the database
- [x] [Review][Defer] `EmploymentType.name` isn't trimmed or case-normalized, allowing near-duplicates ("Monthly" vs "monthly") — matches the same untrimmed-unique-name pattern already used by `MaterialCategory`/`Unit`/`Site` elsewhere in this codebase, not a new gap
- [x] [Review][Defer] `EditTeamMemberPage` fetches `getEmploymentTypes()` in parallel even when the Team Member 404s and the result goes unused — minor wasted read, not user-visible
- [x] [Review][Dismiss] No role/auth guard on Team/Employment Type endpoints — matches the already-tracked, epic-wide "no per-request auth yet" TODO in AGENTS.md

### File List

- `infra/prisma/schema.prisma` (modified — `EmploymentType` model, `TeamMember.employmentTypeId`)
- `infra/prisma/migrations/20260813140000_add_employment_type_model/migration.sql` (new)
- `infra/prisma/seed.ts` (new)
- `package.json` (modified — `db:seed` script, `prisma.seed` config)
- `apps/api/src/dsr/dsr.service.integration.spec.ts` (modified — fixture updated for the new FK)
- `packages/shared/src/schemas/employment-type.ts` (new)
- `packages/shared/src/schemas/team-member.ts` (new)
- `packages/shared/src/index.ts` (modified — exports)
- `apps/api/src/team/employment-types.service.ts` (new)
- `apps/api/src/team/employment-types.controller.ts` (new)
- `apps/api/src/team/employment-types.controller.spec.ts` (new)
- `apps/api/src/team/team-members.service.ts` (new)
- `apps/api/src/team/team-members.controller.ts` (new)
- `apps/api/src/team/team-members.controller.spec.ts` (new)
- `apps/api/src/team/team-members.service.spec.ts` (new)
- `apps/api/src/team/team.module.ts` (new)
- `apps/api/src/app.module.ts` (modified — registered `TeamModule`)
- `apps/web/app/(app)/team/page.tsx` (replaced stub)
- `apps/web/app/(app)/team/page.test.tsx` (new)
- `apps/web/app/(app)/team/new/page.tsx` (new)
- `apps/web/app/(app)/team/new/page.test.tsx` (new)
- `apps/web/app/(app)/team/new/new-team-member-form.tsx` (new)
- `apps/web/app/(app)/team/new/new-team-member-form.test.tsx` (new)
- `apps/web/app/(app)/team/new/actions.ts` (new)
- `apps/web/app/(app)/team/new/actions.test.ts` (new)
- `apps/web/app/(app)/team/[id]/edit/page.tsx` (new)
- `apps/web/app/(app)/team/[id]/edit/page.test.tsx` (new)
- `apps/web/app/(app)/team/[id]/edit/edit-team-member-form.tsx` (new)
- `apps/web/app/(app)/team/[id]/edit/edit-team-member-form.test.tsx` (new)
- `apps/web/app/(app)/team/[id]/edit/actions.ts` (new)
- `apps/web/app/(app)/team/[id]/edit/actions.test.ts` (new)
- `apps/web/app/(app)/team/employment-types/page.tsx` (new)
- `apps/web/app/(app)/team/employment-types/page.test.tsx` (new)
- `apps/web/app/(app)/team/employment-types/add-employment-type-form.tsx` (new)
- `apps/web/app/(app)/team/employment-types/actions.ts` (new)
- `apps/web/app/(app)/team/employment-types/actions.test.ts` (new)
