# AzentisFieldOS — Pre-Launch Checklist

Status as of 2026-08-27. Every planned epic (1–14) is implemented, reviewed, committed, and pushed; the full test suite is green (~749 api / ~539 web / 91 ui) and `apps/api` **boots and serves** against a real Postgres with the auth layer enforcing at runtime. What remains before real users is **operational** — provisioning, real credentials, live-service verification, and a few open product decisions — not missing or broken feature code.

This list is per **tenant deployment** (single-tenant by construction — AD-1/AD-2). Deferred *code* follow-ups (non-blocking) live in `_bmad-output/implementation-artifacts/deferred-work.md`; this doc is the go-live gate.

---

## ✅ Already verified (baseline — don't re-litigate)

- [x] All 14 epics' stories implemented, reviewed, committed, pushed.
- [x] `pnpm typecheck` / `test` / `nest build` / `next build` pass across every package.
- [x] `apps/api` boots (`nest build && node -r tsx/cjs dist/src/main.js`), all routes map, Prisma connects.
- [x] Runtime auth wiring proven: `GET /health`→200; tokenless `/sites` & `/users/me`→401; unsigned `/webhooks/clerk`→401; secretless `/cron/*`→401.
- [x] Migrations replay cleanly (`prisma migrate deploy` verified against throwaway DBs during dev).

---

## 1. Provisioning & environment (BLOCKING)

- [ ] **Provision the tenant stack** — Neon Postgres, Clerk instance, Cloudinary account, Resend, Vercel project. Do this through `pnpm provision <tenant-slug>` (`infra/provisioning/provision.ts`), **never a cloud console by hand** (AD-2). ⚠️ The provisioning script is currently a **skeleton — the provider API calls are not implemented** (AGENTS.md TODO). Implementing it is itself a pre-launch task, or provision via a documented, repeatable script.
- [ ] **Set every env var** in the deployment. `.env.example` is now complete (this session added the 6 that were missing). Required:
  - Core: `DATABASE_URL`, `API_URL`, `NEXT_PUBLIC_API_URL`, `PORT`, `CORS_ORIGIN` (browser origins), `APP_TIMEZONE`
  - Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
  - Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (or `CLOUDINARY_URL`) — server-only, apps/api alone
  - Email: `RESEND_API_KEY`, `REPORT_EMAIL_FROM` (a Resend-verified sender)
  - Cron: `CRON_SECRET` (same value in the code env and Vercel Cron config)
- [ ] **Run migrations against the real DB**: `pnpm db:migrate:deploy`.
- [ ] **Seed the singletons/defaults**: `pnpm db:seed` — `BrandingConfig` (1 row), `ExpenseCategory` (9 defaults), category defaults (employment/machinery/vehicle types), `NotificationChannelSetting` (EMAIL+IN_APP enabled, WHATSAPP disabled — matches Story 13.1 delivery defaults).
- [ ] **Clerk dashboard config**:
  - [ ] Register the webhook → `POST {API_URL}/webhooks/clerk`, subscribe to `user.created` / `user.updated`, and put its signing secret in `CLERK_WEBHOOK_SECRET`.
  - [ ] Set the instance **invite-only**. The auth model assumes Clerk only issues tokens to invited users; the very first authenticated user is auto-provisioned `OWNER_ADMIN` (Stories 1.8/14.2). An open sign-up instance would let the first arbitrary caller become admin.
  - [ ] Invite the real Owner/Admin first, then everyone else (roles flow via invitation `publicMetadata`).
- [ ] **Vercel Cron + routing**: the `vercel.json` cron paths are `/api/cron/...`, which **assume `apps/api` is served under `/api` by a deployment rewrite that is not yet wired** (see `vercel.json` `$comment` + AGENTS.md). Wire that rewrite (or adjust the paths) so the crons actually reach the API.

## 2. Live-service verification (mocked in tests — never run for real)

Tests mock every external service. Each of these needs one real end-to-end pass:

- [ ] **Clerk accept-path** — sign in on web → session token → `apps/api` validates it → `GET /users/me` returns the real role → `AppShell` renders Owner/Admin vs Site-Supervisor correctly. *(Only the reject/401 path is proven so far.)*
- [ ] **Cloudinary round-trip** — DSR photo AND branding-logo signed direct upload → object lands in Cloudinary → the stored `res.cloudinary.com/<cloud>/image/upload/<public_id>` delivery URL loads. (No `CLOUDINARY_*` creds have run against a real account in any environment.)
- [ ] **Resend** — a real auto-compiled daily report email delivers, branded and HTML-escaped, to the configured recipients.
- [ ] **Cron firing** — Vercel actually invokes `compile-daily-reports`, `retry-report-deliveries`, and `run-report-schedules` on schedule and the `CRON_SECRET` bearer check passes with Vercel's real header.
- [ ] **WhatsApp** — still blocked on BSP selection (PRD Open Question 3). Today `NotConfiguredWhatsAppSender` fails honestly and the channel is seeded disabled. Either pick a BSP + implement the sender, or leave WHATSAPP disabled and confirm the UI's "not yet available" framing is acceptable for launch.

## 3. Open product decisions (need an answer, not code)

- [ ] **Daily-report cron hour + timezone** — `0 18 * * *` UTC is a placeholder; "today" in the report/cron paths is computed in **UTC**, not the deployment-local day (Story 12.1's `local-day.ts` helper exists and should be adopted). Confirm the intended local delivery time. (deferred-work: 13.1)
- [ ] **Broad API role-gating** — Story 1.8 authenticates *every* route, but only the admin/config endpoints (Users, categories, notification/report settings) carry an `@Roles('OWNER_ADMIN')` check. Decide which of Epics 2–13's write endpoints must be role-gated (per EXPERIENCE.md's Owner/Admin vs Site-Supervisor split) and apply `@Roles` there. (deferred-work: 14.2)
- [ ] **`user.deleted` deprovisioning** — currently a deliberate no-op (deleting a `User` row would break historical `submittedByUserId`/`recordedByUserId` FKs). Decide preserve-vs-reassign for a departing user's records. (deferred-work: 14.2)

## 4. CI / quality gates (AD-15)

- [ ] **Lighthouse CI needs Clerk keys as GitHub Actions secrets** — `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` (else `next start` throws `Missing publishableKey`). The job is wired but **not yet live-verified** (CLAUDE.md TODO).
- [ ] **Confirm the WCAG-AA / Lighthouse >95 budgets actually pass** in CI once the keys are set. Coverage is currently only `/sign-in`; expanding to authenticated routes needs an e2e auth-seeding mechanism.
- [ ] **Add E2E (Playwright)** for the critical cross-app flow — sign in → submit a DSR → see it in the daily report. No E2E exists today (AGENTS.md TODO); the app has been verified at the API-server + unit level, not a full browser→web→api click-through.

## 5. Non-blocking code follow-ups (post-launch, tracked)

Full list in `_bmad-output/implementation-artifacts/deferred-work.md`. Highlights:

- **Auth hardening**: pass `authorizedParties` (azp) to `verifyToken`; fail-fast if `CLERK_SECRET_KEY` unset; guard the web API base-URL against an empty-string fallback; note the short session-revocation window of networkless `verifyToken`.
- **Systemic**: unvalidated `?date`/`from`/`to` query params (raw 500 vs clean 400); UTC-not-IST day boundaries across several stat/report paths; no pagination on list endpoints; corrections not visually distinguished in list tables.
- **Feature completeness**: richer per-type scheduled-report email bodies (currently a branded envelope); downward-correction cost sign on material/RMC financial rollup; fully offline-durable photo queue (staged photos don't auto-upload when a queued DSR later syncs).

---

### One-shot local smoke test (reproduce the runtime verification)

```bash
pnpm install
pnpm db:generate
pnpm --filter @azentisfieldos/api build
# with DATABASE_URL pointing at a running Postgres:
PORT=3011 node -r tsx/cjs apps/api/dist/src/main.js &
curl -s localhost:3011/health                 # -> {"status":"ok"}
curl -s -o /dev/null -w '%{http_code}\n' localhost:3011/sites   # -> 401 (guard enforces)
```
