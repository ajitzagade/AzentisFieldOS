# Story 14.2: Users, Roles & Permissions

Status: ready-for-dev

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

- [ ] Task 1 — Clerk webhook: the missing link that makes `User` rows exist at all (AC: #2)
  - [ ] **No mechanism creating `User` rows exists anywhere in this codebase yet** — `apps/api` has no webhook handler, no Clerk-signup listener, nothing beyond the `User` model itself and a `get-placeholder-user-id.ts` stopgap (Epic 5 Story 5.5's documented, deliberate placeholder for `recordedByUserId`). This story builds the real mechanism both of those have been waiting on. Add `apps/api/src/users/clerk-webhook.controller.ts`: `POST /webhooks/clerk`, verified via Svix signature (Clerk webhooks are Svix-signed — use `svix`'s verification library against the raw request body and the `CLERK_WEBHOOK_SECRET` env var; reject unverified requests with `401`, never process an unverified payload).
  - [ ] On a Clerk `user.created` event: create a `User` row (`clerkId`, `name`, `email` from the Clerk payload). Role assignment: if this is the very first `User` in the database (a fresh Tenant's first sign-in, from provisioning), assign `OWNER_ADMIN`; otherwise, read the intended role from the Clerk invitation's `publicMetadata` (set at invite time, Task 3) — an invited Site Supervisor must not land as an `OWNER_ADMIN` by default. On `user.updated` (email/name changes in Clerk), sync those fields. Do not implement `user.deleted` handling beyond what's needed to not crash — deciding whether a departing user's historical records (DSRs, Payments they recorded) should be preserved or reassigned is a real product decision this story's AC doesn't ask for; leave the `User` row in place (append-only-adjacent — every other model's `submittedByUserId`/`recordedByUserId` FK would break if the row were deleted) and flag full deprovisioning as a follow-up.
- [ ] Task 2 — Current-user resolution: the other half of the same standing gap (AC: #3)
  - [ ] Add an `apps/api` auth guard (`ClerkAuthGuard`, NestJS) that validates the Clerk session token on a request (per AD-10: "`apps/api` validates a Clerk-issued session token on every request via middleware") and resolves the corresponding `User` row by `clerkId`, attaching it to the request context. Apply this guard to `GET /users/me` (new) at minimum — see Dev Notes on why this story does **not** retroactively apply it to every other epic's endpoints.
  - [ ] `GET /users/me` returns the current `User` row (id, name, email, role). This is the endpoint `apps/web`'s `AppShell` (Epic 1 Story 1.6) has been waiting on since the project's own `AGENTS.md` TODO was written — wire `apps/web/app/(app)/layout.tsx` to call it (server-side, at render time) and pass the real `role` to `AppShell` instead of the hardcoded `"OWNER_ADMIN"` literal. Remove the `AGENTS.md` TODO entry once this lands.
- [ ] Task 3 — `apps/api`: Users admin endpoints (AC: #1, #2)
  - [ ] `apps/api/src/users/users.controller.ts` + `.service.ts`, `UsersModule` (register in `app.module.ts`). `GET /users` (every `User` row plus every pending Clerk invitation for this Tenant, merged into one list — call Clerk's Invitations API for the pending set, don't store invitation state in Postgres, Clerk owns identity per AD-10), `POST /users/invite` (`{ email, role }` — calls Clerk's `invitations.createInvitation()` with `role` in `publicMetadata`, consumed by Task 1's webhook on acceptance), `PATCH /users/:id/role` (`{ role }` — updates an existing `User`'s role; this is master data, a normal `PATCH`, not append-only).
  - [ ] Apply `ClerkAuthGuard` + a role check (`OWNER_ADMIN` only) to every endpoint in this controller — a Site Supervisor must not be able to list Users, invite anyone, or change a role, even by calling the API directly (not just a hidden UI button).
- [ ] Task 4 — Shared Zod schema (AC: #1)
  - [ ] Create `packages/shared/src/schemas/user.ts`: `inviteUserSchema` (`email: z.email()`, `role: z.enum(["OWNER_ADMIN", "SITE_SUPERVISOR"])` — reuse `packages/shared/src/roles.ts`'s existing `ROLES` constant for this enum rather than redeclaring the two values, the exact "single source of truth for the Role set" that file's own comment already establishes), `updateUserRoleSchema` (`{ role: z.enum(ROLES) }`). Export from `packages/shared/src/index.ts`.
- [ ] Task 5 — `apps/web` UI (AC: #1, #2)
  - [ ] Extend `apps/web/app/(app)/settings/page.tsx` (Story 14.1) with a "Users & Roles" section: `DataTable` (Name / Email / Role badge / Status — "Active" for a real `User`, "Pending" for an unaccepted invitation, matching `17-settings.html`), an "Invite User" form (email + role `SelectField`, populated only with `OWNER_ADMIN`/`SITE_SUPERVISOR` — AC #1's guarantee, enforced by the Zod schema already excluding anything else, not just by the UI not offering a third option), and a role-change action on each Active row.
  - [ ] This whole section — and the rest of `/settings` — must not render for a Site Supervisor at all: confirm `AppShell`'s existing role-based navigation (Epic 1 Story 1.6) already hides Settings from the Site Supervisor's minimal top bar now that Task 2 wires a real role through; if the page itself is still directly reachable by URL for a Site Supervisor, add a server-side role check on the page/layout too (AC #4's "no permission" state per `EXPERIENCE.md`'s State Patterns table: "Surface hidden from navigation entirely — not a visible-but-blocked screen," which for a directly-typed URL still means a hard redirect/404, not a rendered-but-broken page).
- [ ] Task 6 — Tests (AC: all)
  - [ ] `clerk-webhook.controller.spec.ts`: rejects an unverified Svix signature; `user.created` creates a `User` with `OWNER_ADMIN` for the first-ever user and the invited role from `publicMetadata` for subsequent ones.
  - [ ] `users.service.spec.ts`: invite/role-change delegation; every endpoint rejects a non-`OWNER_ADMIN` caller (mock the guard's resolved user) with `403`, not silently succeeding.
  - [ ] `apps/web` component test: `AppShell` renders the Site Supervisor's minimal shell (not the Owner/Admin sidebar) when `/users/me` resolves that role — the concrete regression test for the `AGENTS.md` TODO this story closes.

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
