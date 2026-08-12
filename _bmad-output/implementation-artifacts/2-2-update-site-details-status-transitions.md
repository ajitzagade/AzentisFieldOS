# Story 2.2: Update Site Details & Status Transitions

Status: review

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

- [x] Task 1: Add an update schema (AC: #4)
  - [x] Add `updateSiteSchema` to `packages/shared/src/schemas/site.ts` as `createSiteSchema.partial()` — every field optional, same validation rules per field as create (min/max lengths, enum). Export `type UpdateSiteInput = z.infer<typeof updateSiteSchema>`. Do not hand-write a second set of field rules; derive from the existing schema so create/update can never silently drift apart.
  - [x] Do not add an `id` field to this schema — the Site being updated is identified by the route param, not the body.

- [x] Task 2: Add the update endpoint (AC: #1, #2, #3, #4, #5)
  - [x] Add `PATCH /sites/:id` to `apps/api/src/sites/sites.controller.ts`, validated via `ZodValidationPipe(updateSiteSchema)` (same pattern already used on `POST /sites` — see current file, already loaded into this story's context).
  - [x] Add `update(id: string, input: UpdateSiteInput)` to `sites.service.ts`, calling `this.prisma.site.update({ where: { id }, data: input })`. Prisma's generated `@updatedAt` on `updatedAt` handles AC #2 automatically — no manual timestamp-setting code needed.
  - [x] A `PATCH` to a nonexistent Site ID must return a `404`, not a generic `500` — Prisma throws `P2025` (record not found) on `update` against a missing row; catch it in the service or controller and re-throw as a NestJS `NotFoundException`. This is not handled by the existing `create`/`list` code (neither needs it) — it is new for this story.

- [x] Task 3: Edit Site page (AC: #1, #3, #4, #5)
  - [x] Create `apps/web/app/sites/[id]/edit/page.tsx`. Fetch the current Site via `GET {API_URL}/sites` and find by ID for now (there is no `GET /sites/:id` endpoint yet — that's Story 2.3's job; do not build one here just to make this page's data-fetching cleaner, since that would duplicate Story 2.3's work ahead of it. Fetching the list and filtering client-side, or fetching the list server-side and finding the match, is an acceptable interim approach for this story alone).
  - [x] Pre-fill the form with the Site's current values (name, location, status, contract reference).
  - [x] Server Action (`'use server'`) calls `PATCH {API_URL}/sites/{id}` with only the changed fields (or all fields — `updateSiteSchema.partial()` accepts either) — same AD-3 HTTP-only rule as Story 2.1's create form: no direct Prisma/database access from `apps/web`.
  - [x] On success, redirect back to `/sites`.
  - [x] Reuse the same field components/validation logic built in Story 2.1's create form where the shapes overlap (name/location/status/contractReference are identical fields) — do not duplicate that form markup wholesale; extract a shared field-rendering piece if Story 2.1 didn't already leave one reusable, but don't over-engineer a generic "SiteForm" abstraction beyond what these two call sites actually need.

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

claude-sonnet-5

### Debug Log References

- `pnpm --filter @azentisfieldos/api test` — 12/12 pass (7 new: controller `update` delegation, `ZodValidationPipe(updateSiteSchema)` ×3, `SitesService.update` ×3)
- `pnpm --filter @azentisfieldos/web typecheck` / `lint` / `test` — pass (30/30 tests, 10 new for the edit flow)
- `pnpm --filter @azentisfieldos/web build` — pass; `/sites/[id]/edit` correctly renders as `ƒ Dynamic`
- Full-repo `pnpm lint` / `pnpm typecheck` / `pnpm test` — all pass, no regressions
- Grep for raw hex/rgba/px-bracket literals — zero matches

### Completion Notes List

- **Caught and fixed a real bug via this story's own test-writing, not a pre-existing one**: `updateSiteSchema` was originally defined as `createSiteSchema.partial()`. Zod applies a field's `.default()` whenever that key is absent from input, independent of `.partial()` — so `updateSiteSchema.parse({})` was silently returning `{ status: "ACTIVE" }` instead of a true no-op, which would have reset *any* Site's status to Active on every partial update that didn't explicitly include status (e.g. editing just the name of a Site currently On Hold). Fixed by overriding `status` to the bare `siteStatusSchema` (no default) before calling `.partial()` — see `packages/shared/src/schemas/site.ts`'s comment for the full mechanism. Directly regression-tested via `ZodValidationPipe(updateSiteSchema)`'s "accepts an empty body as a no-op update" case.
- `SitesService.update` catches Prisma's `P2025` (record not found) and re-throws as `NotFoundException` — confirmed this is genuinely new (`create`/`list` never needed it) and doesn't swallow any other error type (a non-P2025 error re-throws unchanged, tested directly).
- Followed this story's own explicit instruction not to build `GET /sites/:id` early: the edit page fetches the full Sites list and finds by id client-side-equivalent (server-side `.find()`), exactly as story 2.2's Dev Notes specify, even though this is a known, temporary inefficiency story 2.3 resolves.
- **Entry-point UI deferred to story 2.3, mirroring how story 2.1 deferred its row-link**: neither `mockups/02-sites.html` (Sites list) nor `mockups/03-site-detail.html` (Site detail) shows an explicit "Edit" button anywhere — Sites-list rows are whole-row links to the detail view with no separate row-actions column (per the mockup's own markup, unlike `_shared-kit.html`'s generic row-actions example), and the detail mockup only shows a "View DSR Entry" secondary button, no Edit. `EXPERIENCE.md`'s Component Patterns table establishes that master data like Sites gets a normal Edit affordance, but no mockup pixel-specifies where. Rather than fabricating a placement not in any mockup (or reusing `CorrectAction`, whose entire purpose is structurally preventing an Edit-looking affordance — the opposite of what's needed here), this story builds the `PATCH` endpoint and `/sites/[id]/edit` page fully functional and directly reachable by URL; wiring an "Edit Site" trigger button belongs in story 2.3's detail-page header build, where a precedented secondary-button slot already exists next to "View DSR Entry." Flagged explicitly rather than silently decided.
- `EditSiteForm` reuses story 2.1's `TextField`/`SelectField`/`Card`/`Button` and the same field-rendering shape as `NewSitePage`'s create form (per this story's own Dev Notes) — pre-filled via `defaultValue` from the fetched Site, not a new form abstraction.
- `updateSiteAction` uses the same AD-3 (HTTP-only)/AD-7 (shared schema) pattern as story 2.1's `createSiteAction`; `id` is bound via `updateSiteAction.bind(null, site.id)` since a `useActionState` action only receives `(prevState, formData)`.

### File List

- `packages/shared/src/schemas/site.ts` (modified — `updateSiteSchema`, fixed default-leakage bug)
- `apps/api/src/sites/sites.controller.ts` (modified — `PATCH /sites/:id`)
- `apps/api/src/sites/sites.service.ts` (modified — `update()` with P2025→404 mapping)
- `apps/api/src/sites/sites.controller.spec.ts` (modified — new `update`/`ZodValidationPipe(updateSiteSchema)`/`SitesService.update` coverage)
- `apps/web/app/(app)/sites/[id]/edit/page.tsx` (new)
- `apps/web/app/(app)/sites/[id]/edit/page.test.tsx` (new)
- `apps/web/app/(app)/sites/[id]/edit/edit-site-form.tsx` (new)
- `apps/web/app/(app)/sites/[id]/edit/edit-site-form.test.tsx` (new)
- `apps/web/app/(app)/sites/[id]/edit/actions.ts` (new — `updateSiteAction` Server Action)
- `apps/web/app/(app)/sites/[id]/edit/actions.test.ts` (new)
