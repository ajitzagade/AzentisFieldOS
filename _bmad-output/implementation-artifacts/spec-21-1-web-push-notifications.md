---
title: 'Web Push Notifications (Story 21.1)'
type: 'feature'
created: '2026-09-05'
status: 'done'
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-21-context.md', '{project-root}/_bmad-output/planning-artifacts/stories/phase-8-post-launch/epic-21-web-push-notifications/story-21.1-web-push-notifications.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Neither role has any way to learn about a handful of genuinely important events (a Daily Report coming in, a Purchase or Site Contract left in a pending state, a Payment being recorded) without actively checking the app.

**Approach:** Standard Web Push API + VAPID (`web-push` npm package) — no Firebase/FCM SDK, no vendor account, free at any scale, works identically across the installed PWA and the Android TWA. A `PushNotificationsService`/`PushSubscription` model backs subscribe/unsubscribe and send; five services (DSR, Purchases, Site Contracts, Payments, Subcontractor Payments) fire a push as a side effect of their existing `create()` on the specific condition that makes that event actually worth notifying about, always excluding the acting user. A sixth, time-based reminder (`MissingReportRemindersService`) is code-complete but not wired to a schedule, blocked on the pre-existing Vercel Hobby cron-job limit.

**Approach — no-assumptions verification:** built and verified per explicit user instruction to avoid "back and forth" — every claim was backed by a real, demonstrated proof: a real FCM subscription created in a real (non-incognito, non-headless-for-permission-checks) Chromium browser, a real `PushSubscription` row, a real API-triggered `web-push` send, and a real notification displayed by the service worker with the expected title/body/url. This process directly surfaced one real application bug (see Review Findings below) that unit tests alone would not have caught.

## Boundaries & Constraints

**Always:** Both roles can subscribe (per-device opt-in, no `@Roles` restriction on `POST/DELETE /push-subscriptions`). Every event-driven trigger excludes the acting user via `sendToRole(role, payload, excludeUserId)`. A push failure never fails or rolls back the write that triggered it (fire-and-forget, caught and logged internally). `PushSubscription` is session/config state, not a transaction-history table — AD-9's append-only rule does not apply; a dead subscription (404/410) is deleted outright.

**Never:** No Firebase/FCM SDK. No per-tenant VAPID key reuse — each tenant deployment needs its own keypair generated at provision time (`infra/provisioning`'s own per-tenant secret generation is still a TODO itself; this just needs a fresh keypair whenever that pipeline exists). No new `tenant_id`/cross-tenant concept (AD-1 unaffected — this is entirely within-deployment).

</frozen-after-approval>

## Code Map

- `apps/api/src/push-notifications/` — `PushNotificationsService` (subscribe/unsubscribe/sendToUsers/sendToRole), `PushSubscriptionsController` (`POST`/`DELETE /push-subscriptions`), `PushNotificationsModule` (`@Global()`, like `PrismaModule`).
- `apps/api/src/dsr/dsr.service.ts`, `apps/api/src/inventory/purchases.service.ts`, `apps/api/src/subcontractors/site-contracts.service.ts`, `apps/api/src/team/payments.service.ts`, `apps/api/src/subcontractors/subcontractor-payments.service.ts` — each `create()` fires a push as a side effect on its specific trigger condition.
- `apps/api/src/reports/missing-report-reminders.service.ts` + `.controller.ts` — time-based reminder, `POST /cron/send-missing-report-reminders`, not yet scheduled.
- `infra/prisma/schema.prisma` — `PushSubscription` model; `infra/prisma/migrations/20260905131705_add_push_subscription/` — the migration (hand-corrected, see Review Findings).
- `packages/shared/src/schemas/push-subscription.ts` — `createPushSubscriptionSchema` (with a push-service host allowlist), `deletePushSubscriptionSchema`.
- `apps/web/lib/use-push-notifications.ts` — the `usePushNotifications()` hook (supported/permission/subscribed/subscribe/unsubscribe).
- `apps/web/app/(app)/_components/app-shell.tsx` — the sidebar's enable/on/blocked control.
- `apps/web/public/sw.js` — `push`/`notificationclick` event listeners.
- `turbo.json` — `NEXT_PUBLIC_VAPID_PUBLIC_KEY` declared as build-hash-affecting env.

## Tasks & Acceptance

**Execution:**
- [x] `PushNotificationsService`/`PushSubscriptionsController`/`PushNotificationsModule` — subscribe, unsubscribe (scoped to the calling user), sendToUsers, sendToRole (with excludeUserId)
- [x] `PushSubscription` Prisma model + migration
- [x] Event-driven triggers: DSR (first submission only), Purchases (D7 pending-pricing, non-correction), Site Contracts (Draft missing terms), Payments + Subcontractor Payments (non-correction) — all excluding the acting user
- [x] Time-based `MissingReportRemindersService`/`POST /cron/send-missing-report-reminders` — code-complete, not scheduled (blocked on Vercel Hobby cron limit)
- [x] `usePushNotifications()` hook + sidebar subscribe/unsubscribe UI (both roles)
- [x] Service worker `push`/`notificationclick` handlers
- [x] Real end-to-end verification (real subscription → real DB row → real API-triggered send → real displayed notification)
- [x] Full adversarial code review (Blind Hunter, Edge Case Hunter, Verification Gap layers) + all 13 resulting patch findings fixed

**Acceptance Criteria:** see `story-21.1-web-push-notifications.md`.

## Review Findings

_Code review run 2026-09-06 (no spec existed at implementation time, so this record and the story file above were authored as this review's output). 0 decision-needed, 13 patch (all fixed), 4 defer, 2 dismissed as noise._

- [x] [Review][Patch] Migration silently dropped every `pg_trgm` search index as a side effect (auto-generated `prisma migrate dev` diff) — hand-rewritten to only add `PushSubscription`; dev DB restored; verified via a clean `migrate deploy` replay on a scratch database. [`infra/prisma/migrations/20260905131705_add_push_subscription/migration.sql`]
- [x] [Review][Patch] `turbo.json` didn't declare `NEXT_PUBLIC_VAPID_PUBLIC_KEY` as build-hash-affecting env — would have silently disabled push in every Vercel deployment (same failure class this repo has hit twice before). [`turbo.json`]
- [x] [Review][Patch] Post-commit `site`/`teamMember` lookups (used only for the push body) were unguarded — a transient failure there could turn an already-successful DSR/Purchase/Payment write into a client-visible error. Wrapped in try/catch + `Logger`. [`dsr.service.ts`, `purchases.service.ts`, `payments.service.ts`]
- [x] [Review][Patch] `unsubscribe` wasn't scoped to the calling user — any authenticated user submitting another user's `endpoint` could delete their subscription. Scoped by `userId`. [`push-notifications.service.ts`, `push-subscriptions.controller.ts`]
- [x] [Review][Patch] `endpoint` was an unrestricted client-supplied URL later POSTed to server-side by `web-push` (blind SSRF). Allowlisted known push-service hosts. [`packages/shared/src/schemas/push-subscription.ts`]
- [x] [Review][Patch] `usePushNotifications`'s `supported` flag was computed synchronously in the render body (unlike `permission`/`subscribed`), risking an SSR/hydration mismatch. Deferred into state computed post-mount. [`use-push-notifications.ts`]
- [x] [Review][Patch] Self-notification exclusion was inconsistent — `DsrService`/`PurchasesService` didn't exclude the acting Owner/Admin. Actor id threaded through both. [`dsr.service.ts`, `purchases.service.ts`, `purchases.controller.ts`]
- [x] [Review][Patch] Core push-trigger branches had zero test coverage (Purchases pending-pricing, SiteContract needs-terms + its hand-synced `isPendingTerms`/`countDraftPendingTerms` predicate, Payment/SubcontractorPayment correction-exclusion, DSR resubmission not re-firing). Added across 6 spec files.
- [x] [Review][Patch] `sendToRole`/`sendToUsers` had no `.catch` at any fire-and-forget call site — a DB error could become an unhandled rejection. Caught internally. [`push-notifications.service.ts`]
- [x] [Review][Patch] `MissingReportRemindersService`'s Owner push body joined every missing Site's name with no cap. Capped at 8, "and N more" beyond that. [`missing-report-reminders.service.ts`]
- [x] [Review][Patch] `use-push-notifications.ts`'s `supported` check omitted `"Notification" in window`. Added.
- [x] [Review][Patch] AGENTS.md's TODO referenced `infra/provisioning`'s "per-tenant secret pattern," which doesn't exist yet, and claimed the feature was unverified end-to-end (it has been, once). Reworded.
- [x] [Review][Defer] `isPendingTerms()`/`countDraftPendingTerms()` duplicate the same predicate by hand — not extracted into shared code (would force the DB-side COUNT into an in-memory filter, a real perf regression); instead a regression test cross-checks the two stay in agreement. — deferred, a genuine shared-implementation fix would trade correctness-guarding for a performance regression
- [x] [Review][Defer] No e2e/Playwright coverage of the push flow. [`e2e/`] — deferred, real E2E proof was done manually once; a permanent automated version needs a persistent-context Playwright harness (no incognito, realistic FCM registration timeouts) that doesn't exist yet
- [x] [Review][Defer] No component test for the sidebar's push UI states (enable/on/blocked/disabled-while-subscribing). [`app-shell.test.tsx`] — deferred, lower risk than the trigger-logic gaps that were fixed
- [x] [Review][Defer] No pruning mechanism for abandoned `PushSubscription` rows beyond reactive 404/410 cleanup. — deferred, low urgency at current scale
- [x] [Review][Defer] Service worker's notification `badge` reuses the full-color app icon instead of a proper monochrome asset. [`sw.js`] — deferred, needs a real design asset, not a code fix

Also appended to `deferred-work.md` under "Deferred from: code review of story-21.1 (2026-09-06)".

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/api exec tsc --noEmit` — clean
- `pnpm --filter @azentisfieldos/web exec tsc --noEmit` — clean
- `pnpm --filter @azentisfieldos/shared exec tsc --noEmit` — clean
- `pnpm --filter @azentisfieldos/api lint` — 93 problems (48 errors, 45 warnings), unchanged pre-existing baseline (confirmed via a clean `git worktree` diff against `main`)
- `pnpm --filter @azentisfieldos/web lint` — clean (one unrelated pre-existing warning in `app-shell.test.tsx`)
- `DATABASE_URL=<azentisfieldos_test> pnpm --filter @azentisfieldos/api exec vitest run` — 118 files / 1176 tests passed
- `pnpm --filter @azentisfieldos/web exec vitest run` — 187 files / 977 tests passed
- `npx prisma migrate deploy` against a throwaway scratch database — all 35 migrations replay cleanly; 44 trigram/stock indexes and `PushSubscription` both present afterward

**Manual checks performed:**
- Real Chromium browser (persistent, non-incognito context): subscribed via the sidebar control, confirmed a real FCM `PushSubscription` endpoint, confirmed the row in the database, submitted a real Daily Report, confirmed the resulting push was delivered and displayed by the service worker with the exact expected title/body/url.
- Found and fixed a real bug in the process: the UI conflated `permission === "granted"` with an actual live subscription; fixed by deriving `subscribed` from a direct `pushManager.getSubscription()` check.

**Known residual gaps (not closeable from this environment):** actual behavior on a physical Android device running the distributed TWA APK, and on a physical iOS Safari device (16.4+, installed-PWA-only).
