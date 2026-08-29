<!-- bmad:context -->
<!-- Verified 2026-08-12. No commit yet (greenfield, no git history). Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## AzentisFieldOS

White-label, deploy-per-tenant construction-contractor operations platform (TypeScript monorepo, Turborepo/pnpm, Next.js + NestJS, per-tenant Postgres). No code exists yet. Build contract: `_bmad-output/specs/spec-AzentisFieldOS/SPEC.md` (+ `glossary.md`, `functional-requirements.md`, `success-metrics.md`). Architecture: `_bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md` (AD-1 through AD-15). PRD: `_bmad-output/planning-artifacts/prds/prd-AzentisFieldOS-2026-08-11/prd.md`.

## Policy

- Never introduce a shared database, a `tenant_id` column, or any in-app "current tenant" selector — every deployment is single-tenant by construction (spine AD-1). This is the platform's core security guarantee to a resale business.
- Never build an in-app cross-tenant "Platform Operator" role or screen — tenant provisioning is credential-level tooling outside the running app (AD-11).
- Never `UPDATE` or `DELETE` a row in a transaction-history table (Purchase, Movement, Consumption, Advance, AdvanceAdjustment, Payment) — a correction is a new, reason-carrying row linked to the one it corrects (AD-9).
- Never merge a change that regresses WCAG AA or the Lighthouse >95 budgets (Performance/Accessibility/Best Practices/SEO). CI enforces both (AD-15): `.github/workflows/ci.yml` runs `pnpm lint`/`typecheck`/`test` on every PR (jsx-a11y rules are bumped to `error` in `apps/web/eslint.config.mjs` — `eslint-config-next`'s `core-web-vitals` ships them at `warn` by default, which wouldn't fail a build; do not add a separate `eslint-plugin-jsx-a11y` package, it throws a duplicate-plugin error), and `.github/workflows/lighthouse.yml` runs Lighthouse CI (`apps/web/lighthouserc.js`, `minScore: 0.95` on all four categories) against `/sign-in` on PRs touching `apps/web`/`packages/ui`/`packages/shared`/`packages/config`. **TODO:** the Lighthouse job needs `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`/`CLERK_SECRET_KEY` configured as GitHub Actions repository secrets before it can run — confirmed locally that `next start` throws (`Missing publishableKey`) without them, so the job is wired but not yet live-verified. Lighthouse coverage is also currently limited to the one unauthenticated route (`/sign-in`); expanding to authenticated routes needs an e2e auth-seeding mechanism that doesn't exist yet (see the Playwright TODO below).

## Where things are

- Full functional detail (FR-1..FR-54) with per-requirement testable consequences: `_bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md`
- Domain vocabulary — use these terms verbatim, no synonyms: `_bmad-output/specs/spec-AzentisFieldOS/glossary.md`
- Planned source tree, stack versions, ERD, deployment topology: architecture spine, "Structural Seed" and "Stack" sections

## Running and verifying

- `pnpm install` at repo root — do not `npm install` or `yarn`, the workspace is pnpm-only (`pnpm-workspace.yaml`).
- `pnpm build` / `pnpm lint` / `pnpm typecheck` / `pnpm test` run through Turborepo across every app/package; scope to one with `pnpm --filter @azentisfieldos/web build`.
- `apps/api` tests run on Vitest (`pnpm --filter @azentisfieldos/api test`), not Jest — the Nest CLI's default was deliberately swapped out for consistency with the rest of the monorepo (spine "Stack").
- `pnpm db:generate` (root) regenerates the Prisma client from `infra/prisma/schema.prisma` into `apps/api/src/generated/` — config lives in root `prisma.config.ts` (Prisma 7), schema lives under `infra/prisma/` since it's identical across every tenant deployment (AD-2), not under `apps/api`.
- `pnpm db:migrate:dev` / `pnpm db:migrate:deploy` (root) run migrations against `DATABASE_URL`.
- PrismaClient is imported from `apps/api/src/generated/prisma/client`, never from an `@prisma/client` package import — Prisma 7's `prisma-client` generator emits a self-contained client, not a thin wrapper.
- **TODO:** e2e via Playwright — not yet set up; add when there's a real cross-app flow worth testing.
- **TODO:** `pnpm provision <tenant-slug>` (`infra/provisioning/provision.ts`) — skeleton exists, provider API calls (Vercel/Neon/Clerk/Cloudinary) are not yet implemented. Never provision through a cloud console by hand (AD-2).
- **RESOLVED (2026-08-27):** `apps/api` now boots and serves. The `dev`/`start` scripts (`nest build && node -r tsx/cjs dist/src/main.js`) sidestep the old raw-`.ts` workspace-dep problem: `nest build` (tsc) emits `apps/api` with decorator metadata, and the `tsx/cjs` require hook transpiles the raw-`.ts` `@azentisfieldos/shared`/`ui` imports at load time. Verified end-to-end against the local Postgres: `Nest application successfully started`, every route mapped, Prisma connected, and — with the global guard — `GET /health`→200, tokenless `GET /sites`/`/users/me`→401, `POST /cron/run-report-schedules` (no `CRON_SECRET`)→401. Still unverified against real external services (Cloudinary, Resend/WhatsApp) — see the credential TODOs.
- **RESOLVED (2026-08-29):** auth is custom username/password, not Clerk (Clerk fully removed — see git history around this date). A global `CustomAuthGuard` (`apps/api/src/auth/`) verifies apps/api's own self-signed JWT per request and attributes writes to the real user; `getPlaceholderUserId` is deleted. `@Roles`/`RolesGuard` authZ and `AppShell`'s real role via `GET /users/me` are unaffected by the auth-provider swap. New users are created directly via `POST /users` (admin sets a password immediately) — no invitation/webhook flow.
- **TODO:** `apps/api/vercel.json`'s cron jobs (daily-report compile/retry, hourly report-schedule runner) are currently NOT deployed — Vercel Hobby allows at most 2 cron jobs, each limited to a once-daily schedule, and this deployment needs 3 (two of them sub-daily). Redesign the schedules to fit that limit, or move to Pro, before re-adding `apps/api/vercel.json`'s `crons` array. Also fix the cron paths when re-adding: they were written assuming a `/api` prefix from a routing layer that was never wired — apps/api's actual mapped routes are unprefixed (e.g. `/cron/compile-daily-reports`).
- **TODO:** `apps/api/src/storage/cloudinary-client.ts` and the `POST /photos/presign`/`POST /photos` endpoints (story 3.3) are implemented and unit-tested against a mocked Cloudinary client (`api_sign_request`), but never exercised against a real Cloudinary account — no `CLOUDINARY_*` credentials have run against a live account in any environment this codebase has run in yet. apps/api mints a signed direct-upload request (`api_sign_request` over `{ public_id, timestamp }`); the browser POSTs the bytes straight to Cloudinary and apps/api never proxies them (NFR-5/AD-3); delivery is a public `res.cloudinary.com/<cloud>/image/upload/<public_id>` CDN URL (no presign). Verify the actual signed upload + delivery round-trip once real creds exist (`infra/provisioning`'s Cloudinary TODO, above). Also unaddressed: if the DSR submission itself falls into story 3.2's offline queue, staged photos in the mobile form do not auto-upload once that queued submission later syncs — a fully offline-durable photo queue is real follow-up work.

## Conventions that differ from defaults

- All styling goes through the single design-token theme (`packages/ui`, Tailwind v4 `@theme`) — no inline styles, no one-off hex/px/rgba literals in component code (AD-4).
- One implementation per UI primitive (button, input, form, modal, dialog, table, card, toast, loader, alert) lives in `packages/ui` — never re-implemented per screen; new variants extend the shared component's prop API (AD-5).
- Any component that fetches or mutates server data renders its full state set (loading, empty, success, error, validation-failure) via the shared `packages/ui` state components — never an ad-hoc partial-state screen (AD-6).
- Form validation schemas are defined once (Zod) in `packages/shared`, imported by both `apps/api` (source of truth) and `apps/web` — never two independently hand-written validators for the same fields (AD-7).
- `apps/web` never imports a database client directly — all writes go through `apps/api` over HTTP (AD-3).
- `packages/ui` and `packages/shared` are consumed as raw TypeScript source (no build step) by both a Bundler-resolution consumer (`apps/web`/Turbopack) and a nodenext-resolution consumer (`apps/api`/tsc). Do not add `"type": "module"` to their `package.json` or `.js` extensions to their internal relative imports — that combination satisfies Node-strict-ESM rules for `apps/api`'s typecheck but breaks Turbopack's resolution of `apps/web`'s workspace imports. Leave them extensionless with no `"type"` field; this is a deliberate, verified-working choice, not an oversight.

<!-- /bmad:context -->
