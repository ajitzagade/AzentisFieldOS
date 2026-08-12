# Story 2.2: Update Site Details & Status Transitions

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to edit a Site's details and change its status between Active, On Hold, and Completed,
so that the Sites list always reflects reality.

## Acceptance Criteria

1. **Given** an existing Site, **when** I update its name, location, contract reference, or status via an Edit form, **then** the change saves and is reflected immediately in the Sites list and (once it exists) the Site detail view.
2. **And** each status change updates the Site's `updatedAt` timestamp — this project treats that as sufficient "timestamped" evidence per the glossary; no separate status-history log is required (see Dev Notes for why).
3. **And** this uses a normal Edit/PATCH affordance — Site master data is not transaction history, so AD-9's append-only "Correct" pattern does **not** apply here; a direct in-place update is correct.
4. **Given** I submit an edit with an invalid value (e.g. empty name, name over 200 chars), **when** I submit, **then** inline validation errors show next to the offending field, sourced from the same shared Zod schema the API enforces (AD-7).
5. **Given** I submit an edit with no fields changed, **when** I submit, **then** the update succeeds as a no-op (equivalent to a partial update with zero effective changes) rather than erroring.

## Tasks / Subtasks

- [ ] Task 1: Add an update schema (AC: #4)
  - [ ] Add `updateSiteSchema` to `packages/shared/src/schemas/site.ts` as `createSiteSchema.partial()` — every field optional, same validation rules per field as create (min/max lengths, enum). Export `type UpdateSiteInput = z.infer<typeof updateSiteSchema>`. Do not hand-write a second set of field rules; derive from the existing schema so create/update can never silently drift apart.
  - [ ] Do not add an `id` field to this schema — the Site being updated is identified by the route param, not the body.

- [ ] Task 2: Add the update endpoint (AC: #1, #2, #3, #4, #5)
  - [ ] Add `PATCH /sites/:id` to `apps/api/src/sites/sites.controller.ts`, validated via `ZodValidationPipe(updateSiteSchema)` (same pattern already used on `POST /sites` — see current file, already loaded into this story's context).
  - [ ] Add `update(id: string, input: UpdateSiteInput)` to `sites.service.ts`, calling `this.prisma.site.update({ where: { id }, data: input })`. Prisma's generated `@updatedAt` on `updatedAt` handles AC #2 automatically — no manual timestamp-setting code needed.
  - [ ] A `PATCH` to a nonexistent Site ID must return a `404`, not a generic `500` — Prisma throws `P2025` (record not found) on `update` against a missing row; catch it in the service or controller and re-throw as a NestJS `NotFoundException`. This is not handled by the existing `create`/`list` code (neither needs it) — it is new for this story.

- [ ] Task 3: Edit Site page (AC: #1, #3, #4, #5)
  - [ ] Create `apps/web/app/sites/[id]/edit/page.tsx`. Fetch the current Site via `GET {API_URL}/sites` and find by ID for now (there is no `GET /sites/:id` endpoint yet — that's Story 2.3's job; do not build one here just to make this page's data-fetching cleaner, since that would duplicate Story 2.3's work ahead of it. Fetching the list and filtering client-side, or fetching the list server-side and finding the match, is an acceptable interim approach for this story alone).
  - [ ] Pre-fill the form with the Site's current values (name, location, status, contract reference).
  - [ ] Server Action (`'use server'`) calls `PATCH {API_URL}/sites/{id}` with only the changed fields (or all fields — `updateSiteSchema.partial()` accepts either) — same AD-3 HTTP-only rule as Story 2.1's create form: no direct Prisma/database access from `apps/web`.
  - [ ] On success, redirect back to `/sites`.
  - [ ] Reuse the same field components/validation logic built in Story 2.1's create form where the shapes overlap (name/location/status/contractReference are identical fields) — do not duplicate that form markup wholesale; extract a shared field-rendering piece if Story 2.1 didn't already leave one reusable, but don't over-engineer a generic "SiteForm" abstraction beyond what these two call sites actually need.

## Dev Notes

- **This story depends on Story 2.1 having shipped** `apps/web/app/sites/page.tsx` (the list this story's edit flow returns to) and the `createSiteSchema` this story's `updateSiteSchema` derives from. If Story 2.1 has not been implemented yet when this story is picked up, implement Story 2.1's minimum first (or coordinate — this story cannot function meaningfully without a list to edit from and return to).
- Read Story 2.1's actual implementation (`apps/web/app/sites/*`, `packages/shared/src/schemas/site.ts`) before starting — this story extends both, and its own File List/Completion Notes are the best source for exact current shapes, better than assuming from this story file alone.
- **Why `updatedAt` alone satisfies "status changes are timestamped":** the product glossary calls for Site status changes to be timestamped, but Site is explicitly *not* one of the append-only transaction-history tables (Purchase, Movement, Consumption, Advance, AdvanceAdjustment, Payment — per `AGENTS.md` policy and AD-9). A Site has exactly one current status at a time, not a log of status events. Prisma's `@updatedAt` on the existing `updatedAt` field already timestamps every write, including status changes, with zero extra schema work. Do **not** add a `SiteStatusHistory` table or similar for this story — that would be scope creep beyond what FR-1/the glossary actually ask for. If a future requirement explicitly asks for a full status-change audit trail, that is a new story, not an implicit part of this one.
- No commits exist in this repository yet — no git history to learn from.

### Project Structure Notes

- `packages/shared/src/schemas/site.ts` — UPDATE (add `updateSiteSchema`).
- `apps/api/src/sites/sites.controller.ts`, `sites.service.ts` — UPDATE (add `PATCH /sites/:id`).
- `apps/web/app/sites/[id]/edit/page.tsx` — NEW.
- No Prisma schema changes — `model Site`'s existing `updatedAt` field covers AC #2.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-2] — Story 2.2 acceptance criteria (verbatim source).
- [Source: _bmad-output/planning-artifacts/epics/phase-2-field-operations-core/epic-2-site-management.md] — epic-level context.
- [Source: _bmad-output/implementation-artifacts/2-1-create-and-list-sites.md] — previous story in this epic; this story extends its schema and reuses its AD-3 HTTP-only pattern and form conventions.
- [Source: _bmad-output/specs/spec-AzentisFieldOS/glossary.md] — Site definition: "Status changes are timestamped."
- [Source: `AGENTS.md` policy section / architecture AD-9] — the explicit list of append-only transaction-history tables; Site is not among them, confirming a normal Edit affordance is correct here.
- [Source: packages/shared/src/schemas/site.ts] — `createSiteSchema` this story's `updateSiteSchema` derives from.
- [Source: apps/api/src/sites/sites.controller.ts, sites.service.ts] — existing endpoint pattern to extend.
- [Source: infra/prisma/schema.prisma#model-Site] — confirms `updatedAt DateTime @updatedAt` already exists, no migration needed.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/02-sites.html, 03-site-detail.html] — visual reference for status badges (Active=success, On Hold=warning, Completed=neutral).

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
