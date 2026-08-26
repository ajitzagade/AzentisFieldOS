---
baseline_commit: efdacf73ae7e58da7331fe290f77ed1f01a60e10
---

# Story 1.8: API Session Authentication

Status: done

<!-- Implementation artifact for the planning story:
_bmad-output/planning-artifacts/stories/phase-1-foundation/epic-1-platform-foundation-auth-design-system/story-1.8-api-session-authentication.md
Read that file as the authoritative spec; this artifact tracks status + the Dev Agent Record. -->

## Story

As an Owner/Admin or Site Supervisor,
I want every write I make through `apps/api` to be attributed to me as the real signed-in user,
So that DSRs, photos, and other records carry a trustworthy author instead of a shared placeholder, and the API rejects unauthenticated callers.

## Acceptance Criteria

1. A valid Clerk session token in `Authorization: Bearer <token>` on a protected `apps/api` route is verified server-side via Clerk's backend SDK (no hand-rolled JWT/crypto — AD-10); the local `User` row is resolved/provisioned by `clerkId` (name/email from verified claims); the resolved user id is used for `submittedByUserId`/`uploadedByUserId`; `getPlaceholderUserId` is deleted with no remaining callers.
2. A missing/malformed/invalid/expired token on a protected route → `401 Unauthorized` through the shared error shape; never falls back to the placeholder user.
3. The `CRON_SECRET`-gated daily-report cron route is exempt from the Clerk guard and keeps authenticating via `CRON_SECRET` (both mechanisms coexist; the guard must not break the cron path).
4. `apps/web` attaches the current Clerk session token via a single shared authed-fetch helper (client variant via `useAuth().getToken()`; server variant via `auth().getToken()`), no per-call-site header duplication (AD-5). The offline-queue DSR path (story 3.2) still attaches a fresh token when it later syncs.
5. `GET /health` (and any other must-stay-public route) still succeeds without a token via an explicit `@Public()` allowlist, not an accidental gap.

## Tasks / Subtasks

- [x] Task 1 — `apps/api` guard + user resolution (AC #1, #2, #5)
  - [x] Add `@clerk/backend`. Create `ClerkAuthGuard` (`CanActivate`): read bearer, verify via `@clerk/backend` `verifyToken` (SDK-delegated), upsert `User` by `clerkId` (claims → name/email; first-seen default role — first-ever User → `OWNER_ADMIN`, subsequent → `SITE_SUPERVISOR`; only the two schema roles), attach `req.user = { id, clerkId, role }` or throw `UnauthorizedException`.
  - [x] `@CurrentUser()` param decorator. Register guard globally via `APP_GUARD` with a `@Public()` reflector escape hatch for `GET /health` and both cron routes.
- [x] Task 2 — Thread real user id (AC #1, #3)
  - [x] Change `dsr.service.ts` (2 sites → `submittedByUserId`) and `storage.service.ts` (1 site → `uploadedByUserId`) to accept `userId` as a parameter from the controller (`req.user`). Deleted `apps/api/src/common/get-placeholder-user-id.ts` (+ its spec); zero remaining references. Cron `CRON_SECRET` path kept working (exempt, verified by integration spec).
- [x] Task 3 — `apps/web` shared authed-fetch (AC #4)
  - [x] Shared helper: `apps/web/lib/authed-fetch-core.ts` (the single token-attaching impl), `apps/web/lib/api.ts` (server `authedFetch()` via `auth().getToken()`), `apps/web/lib/use-authed-fetch.ts` (client `useAuthedFetch()` via `useAuth().getToken()`). Routed all existing `apps/api` calls in `app/(app)/**` + `app/dsr/**` (99 server files auto-migrated + 4 client files) through it. Offline-queue re-token-on-sync preserved: `syncQueuedDsrs` now takes the authed-fetch helper, which reads the token fresh per call.
- [x] Task 4 — Tests
  - [x] `ClerkAuthGuard` spec with `@clerk/backend` `verifyToken` mocked (same style as the storage tests' `@aws-sdk/s3-request-presigner` mock): valid → `req.user` + upsert (incl. first-user-OWNER_ADMIN vs subsequent-SITE_SUPERVISOR); invalid/missing/malformed → 401; `@Public` route bypassed. Updated `dsr`/`storage` controller + service specs for the new `userId` param (dropped placeholder-user expectations). Vitest only.

## Out of scope

- Admin user-management UI (create/disable users, assign roles) — **Epic 14 Story 14.2**. This story only validates sessions and attributes writes; the ~2 real users are provisioned by hand in the Clerk dashboard for now.
- WhatsApp delivery channel (PRD Open Question 3).

## Architecture constraints in force

AD-1, AD-3, AD-5, AD-10 (Clerk owns auth, no hand-rolled auth), AD-11 (Role is the only in-app authz set).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8[1m] (Opus 4.8, 1M context)

### Debug Log References

- `pnpm --filter @azentisfieldos/api typecheck` → clean
- `pnpm --filter @azentisfieldos/api test` → 641 passed | 51 skipped (DB integration specs skip without `DATABASE_URL`)
- `pnpm --filter @azentisfieldos/web typecheck` → clean
- `pnpm --filter @azentisfieldos/web lint` → clean
- `pnpm --filter @azentisfieldos/web test` → 513 passed
- `pnpm --filter @azentisfieldos/web build` → success (exit 0)
- New/changed `apps/api` files lint-clean via `eslint --no-fix` (pre-existing `no-unsafe-assignment` errors in untouched specs like `payments.service.spec.ts` are baseline, not introduced here).

### Completion Notes List

- **Guard (AC #1/#2/#5):** `ClerkAuthGuard` (`apps/api/src/auth/clerk-auth.guard.ts`) verifies the `Authorization: Bearer <token>` via `@clerk/backend`'s `verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })` — no hand-rolled JWT/crypto (AD-10). Registered globally via `APP_GUARD` in `app.module.ts`. Missing/malformed/non-Bearer/invalid/expired → `UnauthorizedException` (401, standard Nest error shape), never a placeholder fallback.
- **User resolution / default role (AC #1, per 14.2 intent):** resolves the local `User` by `clerkId`; on first sight provisions one with `name`/`email` from verified claims (defensive claim reads with a deterministic unique email fallback). Default role: the *first-ever* `User` row → `OWNER_ADMIN` (owner sets up first), every subsequent first-seen user → `SITE_SUPERVISOR`. Only the two schema roles (AD-11). Concurrent-first-request P2002 race handled by re-fetch (mirrors the old placeholder's race handling). When 14.2 lands its Clerk webhook (the primary user-creator with invitation roles), this upsert becomes the resolver/fallback.
- **Public allowlist (AC #3/#5):** `@Public()` (`apps/api/src/auth/public.decorator.ts`) on `GET /health` and BOTH cron routes (`POST cron/compile-daily-reports`, `POST cron/retry-report-deliveries`) in `reports.controller.ts`. The cron routes keep authenticating via their existing `CRON_SECRET` check — verified by `reports.controller.integration.spec.ts` (201 with the secret, 401 without) which still passes with the guard global (that spec builds a per-controller module without `APP_GUARD`, so it exercises the `CRON_SECRET` path in isolation, exactly as before). **Controller audit:** presign/photo/branding endpoints are user-attributed writes called from the browser through `useAuthedFetch()`, so they carry a Clerk token and correctly stay protected; no webhook endpoints exist yet (14.2). No other route needed `@Public`.
- **Write attribution (AC #1):** `@CurrentUser()` param decorator (`apps/api/src/auth/current-user.decorator.ts`, exports `AuthUser`). `dsr.service.ts` `create`/`correct` and `storage.service.ts` `confirmUpload` now take `userId` as a parameter, threaded from `req.user` in the controllers. `apps/api/src/common/get-placeholder-user-id.ts` (+ `.spec.ts`) deleted — grep confirms zero remaining references.
- **Web shared authed-fetch (AC #4):** the token-attaching impl lives once in `apps/web/lib/authed-fetch-core.ts` (AD-5). Two thin bindings: server `authedFetch()` (`apps/web/lib/api.ts`, `auth().getToken()`) and client `useAuthedFetch()` (`apps/web/lib/use-authed-fetch.ts`, `useAuth().getToken()`, memoized on the stable `getToken`). Split into three files to respect Next's server/client import boundary (`@clerk/nextjs/server` must not be pulled into the client bundle). 99 server files (RSC pages + `actions.ts`) auto-migrated from `fetch(\`${process.env.API_URL}${path}\`, init)` to `authedFetch(path, init)` (drop-in — same `Response` contract); the 4 client files migrated by hand.
- **Offline-queue freshness (AC #4, story 3.2):** `syncQueuedDsrs` now takes the authed-fetch helper instead of a base URL. Because the helper reads the token fresh on every call, a DSR queued offline attaches a *current* token when it later drains — never a stale one captured at queue time. Verified by `dsr-sync.test.ts`.
- **Test infra:** added global Clerk mocks in `apps/web/vitest.setup.ts` (`auth`/`useAuth` return a fixed token; `getToken` reference kept stable to preserve `useMemo` identity and avoid effect re-fire loops) and a `@/*` → `./` alias in `apps/web/vitest.config.mts` so Vitest resolves `@/lib/api` like tsc/Next do. Three page/component-test assertions updated because the helper now always attaches a `headers` init arg.

### Risks / left incomplete

- Cannot fully verify without real Clerk keys — unit tests mock `verifyToken`; end-to-end (sign in on web → submit DSR → row carries real `submittedByUserId`) is deferred until the tenant's free Clerk instance keys exist (consistent with the repo and this story's Verification note). `CLERK_SECRET_KEY` already in `.env.example`; `apps/api` already does `import 'dotenv/config'`.
- Name/email claim extraction is defensive: default Clerk session tokens may not include email/name custom claims; when absent, name falls back to `"User"` and email to a deterministic unique `<clerkId>@users.noreply.local` (only used on first provision). 14.2's webhook will provision richer profiles.
- No `apps/api` route had to be marked `@Public` beyond health + the two cron routes. No web call site could not be migrated — every `app/(app)/**` and `app/dsr/**` `apps/api` call now routes through the shared helper.

### File List

**apps/api (new):**
- `src/auth/clerk-auth.guard.ts`
- `src/auth/clerk-auth.guard.spec.ts`
- `src/auth/public.decorator.ts`
- `src/auth/current-user.decorator.ts`

**apps/api (modified):**
- `package.json` (add `@clerk/backend`)
- `src/app.module.ts` (register `APP_GUARD`)
- `src/app.controller.ts` (`@Public()` on health)
- `src/reports/reports.controller.ts` (`@Public()` on both cron routes)
- `src/dsr/dsr.controller.ts`, `src/dsr/dsr.service.ts` (thread `userId`)
- `src/storage/storage.controller.ts`, `src/storage/storage.service.ts` (thread `userId`)
- `src/dsr/dsr.controller.spec.ts`, `src/dsr/dsr.service.integration.spec.ts`, `src/storage/storage.controller.spec.ts`, `src/storage/storage.service.spec.ts` (specs updated for new signatures)

**apps/api (deleted):**
- `src/common/get-placeholder-user-id.ts`
- `src/common/get-placeholder-user-id.spec.ts`

**apps/web (new):**
- `lib/authed-fetch-core.ts`
- `lib/api.ts` (server `authedFetch`)
- `lib/use-authed-fetch.ts` (client `useAuthedFetch`)

**apps/web (modified):**
- `lib/photo-upload.ts`, `lib/logo-upload.ts`, `lib/dsr-sync.ts` (accept the authed-fetch helper) + `lib/photo-upload.test.ts`, `lib/dsr-sync.test.ts`
- `vitest.setup.ts` (Clerk mocks), `vitest.config.mts` (`@/` alias)
- 4 client components: `app/dsr/new/page.tsx`, `app/(app)/daily-activity/_components/dsr-desktop-form.tsx`, `app/(app)/daily-activity/work-records/new/work-record-form.tsx`, `app/(app)/settings/branding-form.tsx`
- 99 server pages/actions under `app/(app)/**` auto-migrated to `authedFetch` (see git status for the full list)
- Test assertions updated: `app/(app)/payments/actions.test.ts`, `app/(app)/daily-activity/work-records/new/work-record-form.test.tsx`

## Code-review follow-ups applied

Full adversarial review (auth-critical path). One review layer completed; the other two hit a session limit, so the orchestrator self-verified their highest-risk assignments directly:
- **Migration completeness confirmed:** grep found zero remaining bare `fetch(${process.env.API_URL}...)` / `NEXT_PUBLIC_API_URL` call sites outside the shared helper — no web route silently 401s.
- **Offline-queue is data-safe:** `syncQueuedDsrs` only removes a queued item on `res.ok`; a 401 (e.g. token null at drain) leaves it queued and retries next drain — no data loss (the raised "offline data loss" concern does not apply).

Patches applied (security core hardening + the missing global-guard proof):
- **Global-guard integration test** (`src/auth/clerk-auth.guard.integration.spec.ts`, new): boots a real `INestApplication` with the guard wired via `APP_GUARD` exactly as `app.module.ts` does (verifyToken mocked) and drives it over HTTP — asserts a tokenless request to a normal route → 401, an SDK-rejected token → 401, a valid token → 200 with `req.user` threaded into the handler, and a `@Public()` route reachable tokenless. The unit spec (mocked ExecutionContext) structurally could not prove the global wiring; this closes AC #2/#5's real verification gap.
- **`claims.sub` guard** (`clerk-auth.guard.ts`): a verified token with a missing/empty `sub` now → 401 rather than keying `User` rows off an `undefined` clerkId (corrupt row / opaque 500). + unit test.
- **Guard-branch unit tests:** empty bearer token, array-valued `Authorization` header, the P2002 concurrent-provision recovery (mock plumbing existed but was never driven), and a non-P2002 create error propagating.
- Clarified the P2002-recovery comment (recovery is by `clerkId`; Clerk guarantees unique emails, so a cross-clerkId email collision isn't an expected path).

Verified: `apps/api` typecheck clean; full suite **650 passed / 51 skipped** (+9 from these patches).

## Suggested Review Order

**The auth gate (security-critical)**

- The guard — SDK-delegated verification (AD-10), bearer parsing, first-user role logic, user provisioning, 401 on any bad token.
  [`clerk-auth.guard.ts:1`](../../apps/api/src/auth/clerk-auth.guard.ts#L1)

- Global registration — one line that protects every route by construction.
  [`app.module.ts:35`](../../apps/api/src/app.module.ts#L35)

- The `@Public()` allowlist targets — health + both cron routes stay open (cron via CRON_SECRET).
  [`app.controller.ts:12`](../../apps/api/src/app.controller.ts#L12)
  [`reports.controller.ts:56`](../../apps/api/src/reports/reports.controller.ts#L56)

**Write attribution (placeholder deleted)**

- Controllers thread `@CurrentUser().id` into the services; `getPlaceholderUserId` is gone.
  [`dsr.controller.ts:1`](../../apps/api/src/dsr/dsr.controller.ts#L1)

**Web — one authed-fetch, fresh token per call**

- The single token-attaching core (offline-queue safe) + server/client bindings.
  [`authed-fetch-core.ts:1`](../../apps/web/lib/authed-fetch-core.ts#L1)

**Tests (the proof)**

- Global-guard-over-HTTP integration + guard-branch unit coverage.
  [`clerk-auth.guard.integration.spec.ts:1`](../../apps/api/src/auth/clerk-auth.guard.integration.spec.ts#L1)

### File List (code-review follow-up additions)

- `apps/api/src/auth/clerk-auth.guard.integration.spec.ts` (new — global-guard-over-HTTP proof)
- `apps/api/src/auth/clerk-auth.guard.ts` (hardened — `claims.sub` guard)
- `apps/api/src/auth/clerk-auth.guard.spec.ts` (extended — defensive-branch coverage)
