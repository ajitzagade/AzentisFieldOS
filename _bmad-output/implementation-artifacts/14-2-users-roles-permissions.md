---
baseline_commit: 215aa3ab80798738677387e164e927a4ecb3bd41
---

# Story 14.2: Users, Roles & Permissions

Status: done

> **Reconciliation note (Story 1.8 already shipped the auth foundation):** This spec predates Story 1.8, which built the per-request `ClerkAuthGuard` (global via `APP_GUARD`), the `@CurrentUser()`/`@Public()` decorators, per-request `User` resolution/provisioning by `clerkId`, and deleted `getPlaceholderUserId`. So in this story: **do NOT build a new guard** (Task 2's "add a `ClerkAuthGuard`" is done — reuse `apps/api/src/auth/`), and Task 1's "placeholder still exists / no User-creation mechanism" premise is stale (1.8's guard already provisions users as a fallback). This story's remaining scope: the Svix webhook (the *authoritative* user-creator carrying invitation roles), `GET /users/me`, the Users admin endpoints, an **authorization** (OWNER_ADMIN-only) role check (1.8 built authN, not authZ), the shared schemas, and wiring `AppShell`'s real role.

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to manage which people have accounts in my Tenant and what role they hold — Owner/Admin or Site Supervisor,
so that access matches who's actually on the team, with no third role tier or cross-tenant surface ever appearing.

## Acceptance Criteria

1. **Given** I invite a user to my Tenant, **when** I assign them a role, **then** only Owner/Admin and Site Supervisor exist as options — never a Platform Operator or any cross-tenant role. (AD-1, AD-11, FR-48)
2. A `User` row exists in this Tenant's own database for every person with access — created from a real Clerk signup/invitation acceptance, never fabricated or pre-seeded with fake identities.
3. This story resolves the project's standing TODO: `apps/web` gets a real, Postgres-backed current-user/role fetch through `apps/api`, replacing `AppShell`'s hardcoded `role="OWNER_ADMIN"` — see Dev Notes.
4. "Permissions" means the two roles' fixed, already-designed capability split (Owner/Admin: full access; Site Supervisor: mobile DSR entry, no Settings/admin surfaces) — not a configurable permission matrix. See Dev Notes.

## Tasks / Subtasks

- [x] Task 1 — Clerk webhook: the missing link that makes `User` rows exist at all (AC: #2)
  - [x] **No mechanism creating `User` rows exists anywhere in this codebase yet** — `apps/api` has no webhook handler, no Clerk-signup listener, nothing beyond the `User` model itself and a `get-placeholder-user-id.ts` stopgap (Epic 5 Story 5.5's documented, deliberate placeholder for `recordedByUserId`). This story builds the real mechanism both of those have been waiting on. Add `apps/api/src/users/clerk-webhook.controller.ts`: `POST /webhooks/clerk`, verified via Svix signature (Clerk webhooks are Svix-signed — use `svix`'s verification library against the raw request body and the `CLERK_WEBHOOK_SECRET` env var; reject unverified requests with `401`, never process an unverified payload).
  - [x] On a Clerk `user.created` event: create a `User` row (`clerkId`, `name`, `email` from the Clerk payload). Role assignment: if this is the very first `User` in the database (a fresh Tenant's first sign-in, from provisioning), assign `OWNER_ADMIN`; otherwise, read the intended role from the Clerk invitation's `publicMetadata` (set at invite time, Task 3) — an invited Site Supervisor must not land as an `OWNER_ADMIN` by default. On `user.updated` (email/name changes in Clerk), sync those fields. Do not implement `user.deleted` handling beyond what's needed to not crash — deciding whether a departing user's historical records (DSRs, Payments they recorded) should be preserved or reassigned is a real product decision this story's AC doesn't ask for; leave the `User` row in place (append-only-adjacent — every other model's `submittedByUserId`/`recordedByUserId` FK would break if the row were deleted) and flag full deprovisioning as a follow-up.
- [x] Task 2 — Current-user resolution: the other half of the same standing gap (AC: #3)
  - [x] Add an `apps/api` auth guard (`ClerkAuthGuard`, NestJS) that validates the Clerk session token on a request (per AD-10: "`apps/api` validates a Clerk-issued session token on every request via middleware") and resolves the corresponding `User` row by `clerkId`, attaching it to the request context. Apply this guard to `GET /users/me` (new) at minimum — see Dev Notes on why this story does **not** retroactively apply it to every other epic's endpoints.
  - [x] `GET /users/me` returns the current `User` row (id, name, email, role). This is the endpoint `apps/web`'s `AppShell` (Epic 1 Story 1.6) has been waiting on since the project's own `AGENTS.md` TODO was written — wire `apps/web/app/(app)/layout.tsx` to call it (server-side, at render time) and pass the real `role` to `AppShell` instead of the hardcoded `"OWNER_ADMIN"` literal. Remove the `AGENTS.md` TODO entry once this lands.
- [x] Task 3 — `apps/api`: Users admin endpoints (AC: #1, #2)
  - [x] `apps/api/src/users/users.controller.ts` + `.service.ts`, `UsersModule` (register in `app.module.ts`). `GET /users` (every `User` row plus every pending Clerk invitation for this Tenant, merged into one list — call Clerk's Invitations API for the pending set, don't store invitation state in Postgres, Clerk owns identity per AD-10), `POST /users/invite` (`{ email, role }` — calls Clerk's `invitations.createInvitation()` with `role` in `publicMetadata`, consumed by Task 1's webhook on acceptance), `PATCH /users/:id/role` (`{ role }` — updates an existing `User`'s role; this is master data, a normal `PATCH`, not append-only).
  - [x] Apply `ClerkAuthGuard` + a role check (`OWNER_ADMIN` only) to every endpoint in this controller — a Site Supervisor must not be able to list Users, invite anyone, or change a role, even by calling the API directly (not just a hidden UI button).
- [x] Task 4 — Shared Zod schema (AC: #1)
  - [x] Create `packages/shared/src/schemas/user.ts`: `inviteUserSchema` (`email: z.email()`, `role: z.enum(["OWNER_ADMIN", "SITE_SUPERVISOR"])` — reuse `packages/shared/src/roles.ts`'s existing `ROLES` constant for this enum rather than redeclaring the two values, the exact "single source of truth for the Role set" that file's own comment already establishes), `updateUserRoleSchema` (`{ role: z.enum(ROLES) }`). Export from `packages/shared/src/index.ts`.
- [x] Task 5 — `apps/web` UI (AC: #1, #2)
  - [x] Extend `apps/web/app/(app)/settings/page.tsx` (Story 14.1) with a "Users & Roles" section: `DataTable` (Name / Email / Role badge / Status — "Active" for a real `User`, "Pending" for an unaccepted invitation, matching `17-settings.html`), an "Invite User" form (email + role `SelectField`, populated only with `OWNER_ADMIN`/`SITE_SUPERVISOR` — AC #1's guarantee, enforced by the Zod schema already excluding anything else, not just by the UI not offering a third option), and a role-change action on each Active row.
  - [x] This whole section — and the rest of `/settings` — must not render for a Site Supervisor at all: confirm `AppShell`'s existing role-based navigation (Epic 1 Story 1.6) already hides Settings from the Site Supervisor's minimal top bar now that Task 2 wires a real role through; if the page itself is still directly reachable by URL for a Site Supervisor, add a server-side role check on the page/layout too (AC #4's "no permission" state per `EXPERIENCE.md`'s State Patterns table: "Surface hidden from navigation entirely — not a visible-but-blocked screen," which for a directly-typed URL still means a hard redirect/404, not a rendered-but-broken page).
- [x] Task 6 — Tests (AC: all)
  - [x] `clerk-webhook.controller.spec.ts`: rejects an unverified Svix signature; `user.created` creates a `User` with `OWNER_ADMIN` for the first-ever user and the invited role from `publicMetadata` for subsequent ones.
  - [x] `users.service.spec.ts`: invite/role-change delegation; every endpoint rejects a non-`OWNER_ADMIN` caller (mock the guard's resolved user) with `403`, not silently succeeding.
  - [x] `apps/web` component test: `AppShell` renders the Site Supervisor's minimal shell (not the Owner/Admin sidebar) when `/users/me` resolves that role — the concrete regression test for the `AGENTS.md` TODO this story closes.

## Dev Notes

**This story closes the project's oldest standing gap — the `AGENTS.md` TODO written back in Epic 1.** That TODO is explicit: `AppShell` takes a real `role` prop, is fully built and tested, but its one call site hardcodes `"OWNER_ADMIN"` "pending a Postgres-backed current-user/role fetch through `apps/api`." Every epic since has worked around the absence of real identity (Epic 5 Story 5.5's `recordedByUserId` placeholder, Epic 8/6's role-gating deferred to "whenever auth exists") rather than building it, correctly, since building it wasn't any single feature epic's job — it's this epic's. Task 1 (Clerk → `User` sync) and Task 2 (`/users/me` + the guard) are the two missing pieces; do both, in that order, since Task 2's guard needs Task 1's `User` rows to resolve against.

**This story does *not* retroactively add `ClerkAuthGuard` to every endpoint built across Epics 2–13.** That's real, substantial, cross-cutting work (every controller in `apps/api` today is unauthenticated at the API layer — only `apps/web`'s `proxy.ts` middleware protects *browser navigation*, not direct API calls) — but it's not what FR-48 asks for, and folding it into "Users, Roles & Permissions" would balloon this story into an unscoped security-hardening pass touching a dozen modules. This story applies the guard exactly where FR-48 requires it: the Users admin endpoints themselves, and `/users/me` as the foundation everything else can build on. Flag broad API-wide auth enforcement explicitly as its own follow-up — a real gap, named, not silently expanded into this story or silently left unnamed.

**"Permissions" (FR-48) means the fixed two-role split already designed, not a new configurable system.** `EXPERIENCE.md`'s own Role definitions (Owner/Admin: full tenant access; Site Supervisor: mobile DSR entry, scoped to whichever Site they're actively logging for) are the entire permission model this product has — AD-11 explicitly forbids a third tier, and nothing in FR-48's text or this epic's Implementation Notes describes a granular, admin-configurable permission matrix (the "no enterprise-ERP density" brief mandate rules that out anyway). Story scope is "who has which of the two fixed roles," not "what can each role do" — that was already decided by Epic 1.

**Invitation state lives in Clerk, not in a new Postgres table.** AD-10 is explicit that identity belongs to Clerk. A "pending" row in the Users list (AC #1, the mockup's "Status" column) comes from Clerk's own Invitations API at read time, not from a parallel `Invitation` model this project would then have to keep in sync with Clerk's own state machine.

**Depends on**: Epic 1 (`AppShell`, `packages/shared/src/roles.ts`), the `User` Prisma model (existed since the initial commit).

**Architecture constraints in force:** AD-1, AD-3, AD-4, AD-5, AD-6, AD-10 (Clerk owns identity — this story adds the missing *validation and sync* layer AD-10 always specified, it doesn't relitigate who owns what), AD-11 (exactly two roles, enforced at the Zod layer via the existing `ROLES` constant, not redeclared).

### Project Structure Notes

- New `apps/api/src/users/` module (`clerk-webhook.controller.ts`, `users.controller.ts`/`.service.ts`, a new `ClerkAuthGuard`).
- Extends `apps/web/app/(app)/layout.tsx` (removes the hardcoded role) and `apps/web/app/(app)/settings/page.tsx` (Story 14.1).
- Removes the `AGENTS.md` TODO entry this story resolves.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-14] (FR-48)
- [Source: AGENTS.md — the exact standing TODO this story closes: AppShell's hardcoded role, pending a Postgres-backed current-user/role fetch]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-10, AD-11]
- [Source: _bmad-output/planning-artifacts/stories/phase-7-administration/epic-14-tenant-configuration-settings/story-14.2-users-roles-permissions.md]
- [Source: infra/prisma/schema.prisma#User]
- [Source: packages/shared/src/roles.ts — single source of truth for the Role set, reused not redeclared]
- [Source: _bmad-output/implementation-artifacts/5-5-record-consumption.md — the recordedByUserId placeholder this story finally replaces]
- [Source: _bmad-output/implementation-artifacts/14-1-branding-configuration.md — the Settings page section this story adds to]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/17-settings.html — Users & Roles section]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.8 (1M context) — claude-opus-4-8[1m]

### Debug Log References

- `svix`'s `Webhook` is instantiated with `new`. Mocking it as `vi.fn().mockImplementation(() => ({ verify }))` mis-constructs under this repo's SWC (unplugin-swc) Vitest transform — `new Webhook()` throws instead of returning the object. Fix: mock `Webhook` as a real `class { verify(...) { return verifyMock(...); } }`. Applied in both `clerk-webhook.controller.spec.ts` and `users.controller.integration.spec.ts`.

### Completion Notes List

Implemented per the Story 1.8 reconciliation note — reused 1.8's global `ClerkAuthGuard`, `@CurrentUser()`, `@Public()`; did NOT build a second auth guard.

- **Clerk webhook (authoritative user-creator):** `apps/api/src/users/clerk-webhook.controller.ts` — `POST /webhooks/clerk`, `@Public()`, Svix-verified against `req.rawBody` + `CLERK_WEBHOOK_SECRET` (fail-closed: missing secret / raw body / headers → 401; unverified signature → 401, never processed). `user.created` upserts by clerkId; role = OWNER_ADMIN if no OTHER user exists yet (so a guard-provisioned first user is NOT demoted), else the invited role from `public_metadata.role` (validated against `ROLES`, default SITE_SUPERVISOR). `upsert.update` overwrites the guard's fallback default with the invited role (coordination case). `user.updated` syncs name/email only — never clobbers an admin-changed role. `user.deleted` is a deliberate no-op on the User row (FK preservation; full deprovisioning flagged as follow-up).
- **rawBody:** `main.ts` now `NestFactory.create(AppModule, { rawBody: true })` — additive, leaves all existing JSON body parsing intact (full suite re-run confirms).
- **GET /users/me:** `UsersController.me` reads `@CurrentUser().id`, returns `{ id, name, email, role }`.
- **Users admin:** `GET /users` merges local Users (Active) + pending Clerk invitations (Pending, via `createClerkClient(...).invitations.getInvitationList({ status: 'pending' })` — no Postgres invitation table). `POST /users/invite` → `invitations.createInvitation({ emailAddress, publicMetadata: { role } })`. `PATCH /users/:id/role` → in-place role update (P2025 → 404).
- **AuthZ:** new reusable `@Roles(...)` + `RolesGuard` (`apps/api/src/auth/`). The three admin endpoints are `@Roles('OWNER_ADMIN')`; `/users/me` carries none (open to any authenticated user). A Site Supervisor calling an admin endpoint directly gets 403 (proven over HTTP in the integration spec).
- **Shared schema:** `packages/shared/src/schemas/user.ts` — `inviteUserSchema` / `updateUserRoleSchema`, both reusing `ROLES` (no redeclare). Exported from index.
- **Web:** `apps/web/app/(app)/layout.tsx` now fetches `GET /users/me` server-side via `authedFetch` and passes the REAL role to `AppShell` (least-privilege SITE_SUPERVISOR fallback on lookup failure — never over-grants). Settings page gains a real "Users & Roles" section (`users-roles-section.tsx`: DataTable Name/Email/Role badge/Status, invite form with a ROLES-only SelectField, inline per-row role change — all shared `packages/ui` primitives, mutations via `authedFetch`), plus a server-side `notFound()` guard so a directly-typed `/settings` 404s for a Supervisor. Removed the resolved AppShell-hardcoded-role TODO from `AGENTS.md` and the stale module comment in `app-shell.tsx`.
- **Env/deps:** added `svix@^2.1.0`; added `CLERK_WEBHOOK_SECRET` to `.env.example` (`CLERK_SECRET_KEY` already present). No schema change (User model already had `clerkId @unique` + Role enum).
- **Caveat (follow-up):** `svix` v2 is ESM-only; `apps/api` builds to CJS. Node 22's `require(ESM)` handles this, and the app's dev-server boot is separately broken today (documented AGENTS.md TODO), so nothing runnable regresses — but the real presigned webhook round-trip is unverified against a live Clerk instance (no `CLERK_WEBHOOK_SECRET` exists in any environment this has run in). Also unchanged from the reconciliation: broad API-wide authN enforcement across Epics 2–13 remains explicitly out of scope (named follow-up).
- **Verification:** `pnpm --filter @azentisfieldos/api test` → 688 passed / 51 skipped (0 failures; the known dsr/consumption integration flakes did not trigger this run) + typecheck clean. `pnpm --filter @azentisfieldos/web` typecheck/lint/build clean, test → 533 passed.

### File List

**Added**
- apps/api/src/auth/roles.decorator.ts
- apps/api/src/auth/roles.guard.ts
- apps/api/src/auth/roles.guard.spec.ts
- apps/api/src/users/clerk-client.provider.ts
- apps/api/src/users/clerk-webhook.controller.ts
- apps/api/src/users/clerk-webhook.controller.spec.ts
- apps/api/src/users/users.service.ts
- apps/api/src/users/users.service.spec.ts
- apps/api/src/users/users.controller.ts
- apps/api/src/users/users.controller.spec.ts
- apps/api/src/users/users.controller.integration.spec.ts
- apps/api/src/users/users.module.ts
- packages/shared/src/schemas/user.ts
- apps/web/app/(app)/settings/users-roles-section.tsx
- apps/web/app/(app)/layout.test.tsx

**Modified**
- apps/api/src/main.ts (rawBody: true)
- apps/api/src/app.module.ts (register UsersModule)
- apps/api/package.json (add svix)
- packages/shared/src/index.ts (export user schemas)
- apps/web/app/(app)/layout.tsx (real role from /users/me)
- apps/web/app/(app)/settings/page.tsx (Users & Roles section + Supervisor 404 guard)
- apps/web/app/(app)/_components/app-shell.tsx (module comment refresh)
- .env.example (CLERK_WEBHOOK_SECRET)
- AGENTS.md (remove resolved AppShell-hardcoded-role TODO)
- pnpm-lock.yaml (svix)

## Suggested Review Order

**Reconciliation** — reuses Story 1.8's global auth guard; adds only the authZ + provisioning layers on top.

**AuthZ (new — 1.8 built authN, not authZ)**

- `RolesGuard` + `@Roles()` — reads the resolved `req.user.role`; no-metadata = any authenticated user, `@Roles('OWNER_ADMIN')` = 403 for a Supervisor.
  [`roles.guard.ts:1`](../../apps/api/src/auth/roles.guard.ts#L1)

- Applied: admin endpoints `@Roles('OWNER_ADMIN')`; `GET /users/me` open to any authed user.
  [`users.controller.ts:1`](../../apps/api/src/users/users.controller.ts#L1)

**Authoritative user creation (Svix webhook)**

- `@Public()` Svix-verified webhook — fail-closed, never processes an unverified payload.
  [`clerk-webhook.controller.ts:1`](../../apps/api/src/users/clerk-webhook.controller.ts#L1)

- `handleUserCreated` — first-user→OWNER_ADMIN else invited role; upsert makes the invited role authoritative over 1.8's guard fallback.
  [`users.service.ts:142`](../../apps/api/src/users/users.service.ts#L142)

- raw-body enabled for Svix without breaking normal JSON parsing.
  [`main.ts`](../../apps/api/src/main.ts)

**Web — closes the standing AppShell TODO**

- Real role from `GET /users/me`, least-privilege (SITE_SUPERVISOR) fallback on failure — never over-grants admin.
  [`layout.tsx:1`](../../apps/web/app/(app)/layout.tsx#L1)

- Settings server-side `notFound()` for Supervisors + the Users & Roles admin section.
  [`settings/page.tsx`](../../apps/web/app/(app)/settings/page.tsx)

**Tests** — webhook signature/role logic, 403 on non-admin caller, AppShell role.
  [`roles.guard.spec.ts:1`](../../apps/api/src/auth/roles.guard.spec.ts#L1)
