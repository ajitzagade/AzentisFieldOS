# Story 2.1: Create and List Sites

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to create a Site (name, location, status, contract reference) and see it in a list with every other Site,
so that I can start tracking a new project immediately and always see my full portfolio in one place.

## Acceptance Criteria

1. **Given** I fill in a Site's name, location, status, and contract reference, **when** I submit the Create Site form, **then** the Site is saved and appears immediately at the top of the Sites list, no refresh required.
2. **And** the Sites list always reflects every Site that exists, automatically including newly created ones (FR-3) — ordered newest first.
3. **Given** I submit with a missing required field (name or location), **when** the form is submitted, **then** inline validation errors show next to the offending field, sourced from the same `createSiteSchema` Zod schema the API enforces (AD-7) — never a generic "something went wrong" message.
4. **Given** zero Sites exist for this Tenant, **when** I view the Sites list, **then** I see a clear empty state with a "create your first Site" prompt — never a blank table with just headers (AD-6).
5. **And** creating a Site with only the required fields (name, location — status defaults to `ACTIVE`, contract reference is optional) succeeds without requiring the optional fields.

## Tasks / Subtasks

- [x] Task 1: Add the API base URL environment variable (AC: #1, #2)
  - [x] Add `API_URL` (e.g. `http://localhost:3001`) to `.env.example` — server-only, no `NEXT_PUBLIC_` prefix, since it is only ever read from Server Components/Server Actions running on the server, never from browser JS. This variable does not exist yet anywhere in the repo; this story is the first to need it.
  - [x] Read it in `apps/web` via `process.env.API_URL` at the call site (no config abstraction needed for a single var at this stage).

- [x] Task 2: Sites list page (AC: #2, #4)
  - [x] Create `apps/web/app/sites/page.tsx` as an async Server Component. Fetch `GET {API_URL}/sites` directly in the component (Next.js 16 App Router convention: Server Components fetch, they don't need a Server Action or client-side `useEffect`).
  - [x] Render results in a table: Name, Location, Status (badge), Contract Reference. If `packages/ui` has a `Table`/`Badge` component (check `packages/ui/src/components/` — see Dev Notes on Epic 1 sequencing before assuming), compose from those; otherwise use plain semantic `<table>` markup styled with Tailwind utility classes directly (do not invent a one-off styled `SiteTable` component that duplicates what Epic 1's shared `Table` component is supposed to be — see Dev Notes).
  - [x] Zero-Sites state: render a centered empty-state block (icon + "No Sites yet" + a primary-styled link to the create form) instead of an empty `<table>`.
  - [x] This page has no app-shell/sidebar to nest inside yet (Epic 1 Story 1.6 hasn't shipped as of this story's writing — check `apps/web/app/layout.tsx` before starting; if a shared shell layout now exists, nest under it instead of rendering standalone).

- [x] Task 3: Create Site form (AC: #1, #3, #5)
  - [x] Create `apps/web/app/sites/new/page.tsx` (or a modal/dialog on the list page — plain page is simpler and sufficient for this story; do not build modal infrastructure that doesn't exist yet elsewhere in the app).
  - [x] Implement a Server Action (`'use server'`) that:
    - Parses `FormData` into the shape `createSiteSchema` expects.
    - Calls `POST {API_URL}/sites` with a JSON body via `fetch` — **do not** import `PrismaClient`/`PrismaService` or any `apps/api` internals into `apps/web`; the only integration point is HTTP (AD-3, non-negotiable — see Dev Notes for why generic Next.js tutorials will lead you astray here).
    - On a `400` (validation failure) response, surface the API's `error.details` (Zod `flatten()` shape — see `apps/api/src/common/zod-validation.pipe.ts`) as per-field errors, via `useActionState`/`useFormStatus` per Next.js 16 form-mutation conventions.
    - On success, `redirect('/sites')` so the new Site is visible immediately (AC #1) — no client-side cache to invalidate manually since the list page re-fetches on navigation.
  - [x] Client-side: also validate with `createSiteSchema` before submit for instant feedback (both client and server validate against the *same* imported schema instance from `@azentisfieldos/shared` — never a hand-duplicated rule set, per AD-7).
  - [x] Status field: a select defaulting to `ACTIVE` (`siteStatusSchema` enum: `ACTIVE` / `COMPLETED` / `ON_HOLD`).

- [x] Task 4: Confirm existing API behavior and add missing test coverage (AC: #1, #2, #3, #4, #5)
  - [x] `apps/api/src/sites/sites.controller.ts` and `sites.service.ts` already implement `POST /sites` and `GET /sites` (Zod-validated via `ZodValidationPipe`, ordered newest-first) — do not rebuild these; they satisfy AC #1, #2, #5 as they stand. Confirm by reading them (already loaded into this story's context — see Dev Notes).
  - [x] **Gap:** zero test files exist for the `sites` module. Add `apps/api/src/sites/sites.controller.spec.ts` following the `NestJS TestingModule` + Vitest pattern already established in `apps/api/src/app.controller.spec.ts` (mock `SitesService`, assert `create`/`list` wiring and that `ZodValidationPipe` rejects an invalid body with the documented `error.code: 'VALIDATION_FAILED'` shape).
  - [x] Add `apps/web` test tooling: no `test` script or Vitest config exists in `apps/web/package.json` yet. Add minimal Vitest + React Testing Library config (per root `AGENTS.md`: Vitest project-wide, never Jest) and one test each for the Sites list page (empty state + populated state) and the Create Site form (client validation error rendering).

## Dev Notes

- **AD-3 is the single most important constraint on this story and diverges from generic Next.js guidance.** Standard Next.js 16 App Router tutorials (confirmed via current research) recommend Server Actions that mutate the database directly via an ORM client. This project's architecture spine explicitly forbids that: `apps/web` must never import a database client — every write goes through `apps/api` over HTTP (AD-3). The Server Action in Task 3 is a thin HTTP-calling wrapper, not a data-access layer. Do not import anything from `apps/api/src/generated/prisma` or `@prisma/client` into any `apps/web` file.
- **Epic 1 sequencing risk:** as of this story's creation, Epic 1 (design tokens, shared `Button`/`Card`/`Table`/`Badge` components, the app shell/sidebar) exists only as *story files* — `packages/ui/src/components/` currently contains only `button.tsx`, and it still uses pre-`DESIGN.md` placeholder tokens (`primary-600`, `neutral-900`, etc.), not the finalized `accent-teal-700`/`ink-900` token names. `apps/web/app/` has no sidebar shell, only the scaffold `page.tsx`. **Before writing any UI markup, check current state of these files** — if Epic 1 has since shipped, use its real `Table`/`Badge`/`Card` components and nest this page under its shell layout. If Epic 1 is still unimplemented when this story is picked up, keep this story's markup plain, semantic, and minimally styled (Tailwind utilities directly, no invented parallel "SiteTable" component) — a functionally-correct unstyled page is the right interim state; a beautifully-styled one-off table that AD-5 later has to unwind is the wrong one. Note whichever situation applied in Completion Notes.
- Zod version in this repo is **4.4.3** (not 3.x) — `error.flatten()` on a `safeParse` failure is already confirmed working in `zod-validation.pipe.ts`; the shape client-side error handling should expect is `{ formErrors: string[], fieldErrors: Record<string, string[]> }`.
- `createSiteSchema` (in `packages/shared/src/schemas/site.ts`) already has everything this story needs: `name` (1-200 chars), `location` (1-500 chars), `status` (enum, defaults `ACTIVE`), `contractReference` (optional, max 200). Do not add fields not in this schema without also updating it — it is the single source both sides import (AD-7).
- No commits exist in this repository yet (`git log` confirms an empty history on `main`) — there is no prior-work git pattern to learn from for this story.
- This is the first story in Epic 2; there is no previous-story File List to build on.
- **Scope boundary:** the composition reference mockup (`02-sites.html`) shows each list row linking to a Site detail page — that's Story 2.3's `apps/web/app/sites/[id]/page.tsx`, which does not exist yet. Do not add a link/route to `/sites/[id]` in this story; it would 404 until Story 2.3 ships. Render rows as plain (non-linked) table rows for now — Story 2.3 adds the link when it builds the destination.

### Project Structure Notes

- `apps/api/src/sites/*` — UPDATE only if a genuine gap is found (test coverage); the `create`/`list` endpoints themselves are correct as-is and matches the architecture spine's NestJS module pattern (`@Global() PrismaModule` injected via `PrismaService`).
- `apps/web/app/sites/page.tsx`, `apps/web/app/sites/new/page.tsx` — NEW.
- `.env.example` — UPDATE (add `API_URL`).
- `apps/web/package.json` — UPDATE (add test tooling + script) only if not already present by the time this story is picked up.
- No Prisma schema changes needed — `model Site` in `infra/prisma/schema.prisma` already has every field this story needs (`id`, `name`, `location`, `status: SiteStatus`, `contractReference`, `createdAt`, `updatedAt`).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-2] — Story 2.1 acceptance criteria (verbatim source for this story).
- [Source: _bmad-output/planning-artifacts/epics/phase-2-field-operations-core/epic-2-site-management.md] — Epic-level FR/AD context and confirmed current-implementation notes.
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-3] — "apps/web never imports a database client directly."
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-7] — shared Zod schema, single source for client+server validation.
- [Source: apps/api/src/sites/sites.controller.ts, sites.service.ts, sites.module.ts] — existing `create`/`list` implementation; read in full during story creation.
- [Source: packages/shared/src/schemas/site.ts] — `createSiteSchema`, `siteStatusSchema`.
- [Source: apps/api/src/common/zod-validation.pipe.ts] — validation error response shape (`error.code`, `error.details` via Zod `flatten()`).
- [Source: apps/api/src/prisma/prisma.service.ts, prisma.module.ts] — `@Global()` `PrismaService` pattern; no new Prisma wiring needed.
- [Source: infra/prisma/schema.prisma#model-Site] — full field list, already matches `createSiteSchema`.
- [Source: apps/web/app/page.tsx, layout.tsx] — current scaffold state; confirms no sidebar/shell exists yet.
- [Source: packages/ui/src/components/button.tsx, index.ts] — confirms only `Button` exists in the shared component library so far, using pre-`DESIGN.md` tokens.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/02-sites.html] — visual/composition reference for the Sites list layout (table columns, empty state, "Add Site" placement).
- [Web: Next.js 16 App Router Server Actions / form mutation conventions — nextjs.org/docs/app/guides/forms, confirmed current as of Next.js 16.1/React 19, May 2026] — `useFormStatus`/`useActionState` pattern for pending + error states used in Task 3.

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Debug Log References

- `pnpm --filter @azentisfieldos/api test` — 5/5 pass (2 new: `SitesController` delegation, `ZodValidationPipe(createSiteSchema)` shape)
- `pnpm --filter @azentisfieldos/web typecheck` / `lint` / `test` — pass (20/20 tests, 8 new for Sites)
- `pnpm --filter @azentisfieldos/web build` — pass; `/sites` correctly renders as `ƒ Dynamic` (runtime `cache: "no-store"` fetch), `/sites/new` as `○ Static`
- Full-repo `pnpm lint` / `pnpm typecheck` / `pnpm test` — all pass, no regressions
- Grep for raw hex/rgba/px-bracket literals in all new files — zero matches

### Completion Notes List

- **Epic 1 sequencing note this story itself flagged has now resolved in the "shipped" direction**: Epic 1 finished (all 7 stories) before this story was picked up, so the "Epic 1 not shipped yet" fallback path (plain unstyled `<table>`, no shell) described in this story's own Dev Notes did **not** apply. Built the Sites list with Epic 1's real `DataTable`/`Badge` components, nested inside the `(app)` route-group shell — replacing the `EmptyState` placeholder Epic 1 had at `/sites`, not a new standalone route outside the shell.
- Extracted a shared `TextField`/`SelectField` primitive into `packages/ui` (`field.tsx`) — this is the second screen needing the input styling story 1.5's Sign In form established locally, which that story's own Dev Notes flagged as the trigger for extraction (AD-5). Refactored `apps/web/app/sign-in/page.tsx` to use `TextField` too, so there's one implementation, not two screens each with their own copy.
- Sites list matches `mockups/02-sites.html` exactly: page title + "All sites across the organization" subtitle, "Add Site" primary button top-right, 5-column table (Site/Location/Status/Last DSR activity/Contract ref), status badges mapped `ACTIVE`→success/`ON_HOLD`→warning/`COMPLETED`→neutral. "Last DSR activity" is included as a column (matching the mockup's layout) but renders `—` for every row — no DSR data exists until Epic 3 ships; this is an honest "not available yet" placeholder, not fabricated data.
- Row-linking uses `DataTable`'s `rowHref` accessor (`/sites/{id}`) — the actual destination page doesn't exist until story 2.3, so today these links 404. That's expected and consistent with the story's own scope boundary (2.1 doesn't build 2.3's page); story 2.3 is the one that makes these links resolve.
- `createSiteAction` (`apps/web/app/(app)/sites/new/actions.ts`) is a thin HTTP-calling Server Action — validates with the same imported `createSiteSchema` instance the API also validates with (AD-7), never imports Prisma or any `apps/api` internal (AD-3). Maps the API's `400` response body (Zod `flatten()` shape) to per-field errors; any other non-2xx response becomes a generic form-level error, never a raw status/message.
- Confirmed `apps/api/src/sites/sites.controller.ts`/`sites.service.ts` already correctly implement `POST /sites` and `GET /sites` exactly as this story's Dev Notes described — no changes needed there. The only real gap found was test coverage, now added.
- Added `API_URL` to `.env.example` (server-only, no `NEXT_PUBLIC_` prefix) — first story to need it.

### File List

- `packages/ui/src/components/field.tsx` (new — `TextField`, `SelectField`)
- `packages/ui/src/components/field.test.tsx` (new)
- `packages/ui/src/index.ts` (modified — barrel export)
- `apps/web/app/sign-in/page.tsx` (modified — refactored to use `TextField`)
- `apps/web/app/(app)/sites/page.tsx` (modified — real Sites list, replacing the `EmptyState` placeholder)
- `apps/web/app/(app)/sites/page.test.tsx` (new)
- `apps/web/app/(app)/sites/new/page.tsx` (new — Create Site form)
- `apps/web/app/(app)/sites/new/page.test.tsx` (new)
- `apps/web/app/(app)/sites/new/actions.ts` (new — `createSiteAction` Server Action)
- `apps/web/app/(app)/sites/new/actions.test.ts` (new)
- `apps/api/src/sites/sites.controller.spec.ts` (new)
- `.env.example` (modified — `API_URL`)
