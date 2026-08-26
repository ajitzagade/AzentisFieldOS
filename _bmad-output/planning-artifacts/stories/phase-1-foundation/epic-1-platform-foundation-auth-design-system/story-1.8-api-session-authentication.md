---
epic: 1
story: "1.8"
phase: "1 — Foundation"
title: API Session Authentication
---

# Story 1.8: API Session Authentication

As an Owner/Admin or Site Supervisor,
I want every write I make through `apps/api` to be attributed to me as the real signed-in user,
So that DSRs, photos, and other records carry a trustworthy author instead of a shared placeholder, and the API rejects unauthenticated callers.

## Context (why this story exists)

`apps/web` is fully Clerk-protected (`apps/web/proxy.ts` guards every route via `clerkMiddleware`), but **`apps/api` has no request-level auth at all**:

- `apps/web` calls `apps/api` with **no `Authorization` header** today — there is no token-passing and no central API client; `fetch` calls are scattered across the `app/(app)/**` pages and `actions.ts` Server Actions.
- `apps/api` has **no Clerk backend SDK installed** and stamps writes with `getPlaceholderUserId()` (`apps/api/src/common/get-placeholder-user-id.ts`), which upserts a hardcoded `system-placeholder@internal.local` / `clerkId: 'system-placeholder'` User. Used in:
  - `apps/api/src/dsr/dsr.service.ts` (2 call sites → `submittedByUserId`)
  - `apps/api/src/storage/storage.service.ts` (1 call site → `uploadedByUserId`)

This story replaces that placeholder with the real authenticated Clerk user, end to end. It closes the AGENTS.md TODO: *"DSR/photo/expense/RMC-entry endpoints currently use a placeholder 'system' User row … Replace with the real authenticated user id once apps/api validates a Clerk session per-request (AD-10)."*

## Acceptance Criteria

**Given** a request to any protected `apps/api` route carrying a valid Clerk session token in `Authorization: Bearer <token>`
**When** the request is handled
**Then** the token is verified server-side using Clerk's backend SDK (no hand-rolled JWT/crypto — AD-10)
**And** the local `User` row is resolved (or provisioned) by `clerkId`, with `name`/`email` taken from the verified token claims
**And** the resolved user id is used for `submittedByUserId` / `uploadedByUserId` — `getPlaceholderUserId` is deleted and has no remaining callers

**Given** a request with a missing, malformed, or invalid/expired token
**When** it hits a protected route
**Then** the API responds `401 Unauthorized` through the shared error shape — it never falls back to the placeholder user

**Given** the daily-report Cron endpoint (`apps/api/src/reports/reports.controller.ts`, gated by `CRON_SECRET`)
**When** Vercel Cron calls it with the `CRON_SECRET` bearer (not a Clerk user token)
**Then** it is **exempt** from the Clerk guard and continues to authenticate via its existing `CRON_SECRET` check (the two auth mechanisms coexist; the Clerk guard must not break the cron path)

**Given** `apps/web` calls `apps/api` (from both client components and Server Actions/RSC)
**When** any such call is made
**Then** it attaches the current Clerk session token via a **single shared authed-fetch helper** (client variant using `useAuth().getToken()`, server variant using `auth().getToken()` from `@clerk/nextjs/server`) — no per-call-site hand-rolled header duplication (AD-5 spirit: one implementation, not N)

**Given** the health check (`GET /health`) and any other route that must stay public
**When** called without a token
**Then** it still succeeds (explicit public allowlist, not an accidental gap)

## Technical Notes

### `apps/api`
- Add dependency: `@clerk/backend` (free; no paid Clerk tier required for token verification).
- Create `ClerkAuthGuard` (NestJS `CanActivate`) that:
  - reads `Authorization: Bearer <token>`,
  - verifies via `@clerk/backend`'s `verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })` (or a `createClerkClient(...).authenticateRequest` equivalent — implementer's choice, but verification must be delegated to the SDK),
  - upserts the local `User` by `clerkId` (claims → `name`, `email`; default `role` for a first-seen user — confirm default is `SITE_SUPERVISOR` vs `OWNER_ADMIN` against Epic 14 story 14.2 intent; do **not** invent a third role — schema `Role` enum is `OWNER_ADMIN | SITE_SUPERVISOR` only),
  - attaches `req.user = { id, clerkId, role }`, or throws `UnauthorizedException` (→ 401).
- Add a `@CurrentUser()` param decorator to read `req.user` in controllers.
- Register the guard globally via `APP_GUARD`, with a `@Public()` decorator + reflector escape hatch for `GET /health` and the `CRON_SECRET`-gated cron route.
- Thread the real user id from the controller (where `req.user` exists) **down into** `dsr.service.ts` / `storage.service.ts` method signatures — the services currently call `getPlaceholderUserId` internally; change them to accept `userId` as a parameter. Delete `apps/api/src/common/get-placeholder-user-id.ts`.
- Add env: `CLERK_SECRET_KEY` (already in `.env.example`). Confirm `apps/api` loads it (it already does `import 'dotenv/config'` in `main.ts`).

### `apps/web`
- Add one shared authed-fetch helper (e.g. `apps/web/lib/api.ts`) with two entry points:
  - client: `useAuthedFetch()` → wraps `fetch`, injects `Authorization: Bearer ${await getToken()}` from `@clerk/nextjs`'s `useAuth()`.
  - server: `authedFetch()` for Server Actions / RSC → uses `auth().getToken()` from `@clerk/nextjs/server`.
- Route the existing `apps/api` calls in `app/(app)/**` (pages + `actions.ts`) through it. Preserve the offline-queue path (story 3.2) — the queued client-side DSR submission must still attach a fresh token when it later syncs.

### Tests
- Unit-test `ClerkAuthGuard` with `@clerk/backend`'s `verifyToken` **mocked** (same mocking approach already used for `@aws-sdk/s3-request-presigner` in the storage tests): valid token → `req.user` populated + user upserted; invalid/missing → 401; cron route → bypassed.
- Update `dsr`/`storage` service specs for the new `userId` parameter (drop placeholder-user expectations).
- Keep everything on Vitest (`pnpm --filter @azentisfieldos/api test`), not Jest.

## Out of scope

- Admin user-management UI (create/disable users, assign roles) — that is **Epic 14 story 14.2** (`14-2-users-roles-permissions`). This story only validates sessions and attributes writes; user provisioning for the ~2 real users is done by hand in the Clerk dashboard for now.
- WhatsApp delivery channel (still blocked on BSP selection — PRD Open Question 3).

## Verification (requires the free Clerk instance)

Cannot be fully verified without real Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`). Unit tests run against mocked Clerk; end-to-end verification (sign in on web → submit a DSR → row carries the real `submittedByUserId`) happens once the tenant's free Clerk instance exists and its keys are in env.

## References

- Architecture AD-1 (single-tenant, no tenant selector), AD-3 (web → api over HTTP only), AD-5 (one implementation per primitive), AD-10 (Clerk owns auth, no hand-rolled auth), AD-11 (Role is the only in-app authz set)
- `apps/web/proxy.ts` (existing Clerk web protection — the pattern to mirror server-side)
- `apps/api/src/common/get-placeholder-user-id.ts` (the placeholder being removed)
- `apps/api/src/reports/reports.controller.ts` (the `CRON_SECRET` path that must stay exempt)
- Prisma `User` model in `infra/prisma/schema.prisma` (`clerkId @unique`, `Role` enum)
