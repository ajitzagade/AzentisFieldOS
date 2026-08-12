# Story 1.5: Sign In

Status: review

## Story

As an Owner/Admin or Site Supervisor,
I want to sign in with my Tenant-issued credentials,
so that I can access AzentisFieldOS as myself, scoped to my Tenant.

## Acceptance Criteria

1. **Given** a valid Clerk-issued account for this Tenant, **when** I submit my credentials on the Sign In screen, **then** I land on the application shell route, authenticated, with no tenant-selection step (single-tenant by construction, AD-1).
2. **And** an invalid credential attempt shows an inline, actionable error — never a raw auth-provider error (e.g. never a raw Clerk API error code/message surfaced verbatim).
3. **And** no hand-rolled password/session/MFA code exists anywhere in the implementation (AD-10) — all credential verification, session issuance, and token validation happens through the `@clerk/nextjs` SDK.
4. **And** an unauthenticated visit to any protected route redirects to the Sign In screen (route protection actually enforced, not just a UI that happens to be the first thing rendered).
5. **And** the Sign In screen's visual output matches `mockups/00-login.html`'s layout and token usage (centered card on an `accent-navy-800` field, branded mark, tagline, email/password fields, single-tenant footer note) — built from story 1.1/1.2's tokens and `Card`/`Button` components, not new one-off styling.

## Tasks / Subtasks

- [x] Task 1: Read the Next.js 16 docs before touching routing/middleware (AC: all)
  - [x] `apps/web/AGENTS.md` (and the root-inherited `CLAUDE.md`) carries a standing warning: Next.js 16 has breaking changes vs. training-data assumptions, and the resolved guide lives under `apps/web/node_modules/next/dist/docs/`. Before writing `middleware.ts` or any App Router file for this story, read the relevant sections there (middleware/proxy conventions, route protection patterns) — do not assume Next 14/15-era middleware conventions still apply.
- [x] Task 2: Install and configure Clerk (AC: #1, #3, #4)
  - [x] Add `@clerk/nextjs` at the pinned version `7.7.0` (architecture spine Stack table — "requires Next.js 16.0.10+, skip 16.0.0–16.0.9"; confirm the installed Next.js version, currently `16.3.0` per `apps/web/package.json`, satisfies this) to `apps/web/package.json` dependencies.
  - [x] Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env.example` (names only, per the existing convention — `DATABASE_URL` is the only entry today; real per-tenant values are deployment env vars set by `infra/provisioning`, per AD-2, never committed).
  - [x] Wrap the root layout (`apps/web/app/layout.tsx`) in `<ClerkProvider>` from `@clerk/nextjs`.
  - [x] Add `apps/web/middleware.ts` using `clerkMiddleware()` from `@clerk/nextjs/server`, configured so the Sign In route (and its Clerk-required subroutes/assets) is public and every other route requires an authenticated session — verify the exact matcher/config shape against the Next 16 docs read in Task 1, since middleware config conventions are a documented area of change risk.
- [x] Task 3: Build the custom-styled Sign In screen (AC: #1, #2, #5)
  - [x] New route `apps/web/app/sign-in/page.tsx` (or `apps/web/app/sign-in/[[...sign-in]]/page.tsx` if Clerk's catch-all routing convention requires it for its client-side auth state handling — confirm against the current `@clerk/nextjs` docs for the installed version rather than assuming a specific routing shape).
  - [x] Build the form using Clerk's headless/custom-flow hooks (`useSignIn` from `@clerk/nextjs`) rather than the prebuilt `<SignIn />` component — `mockups/00-login.html`'s exact card layout, spacing, and copy (brand mark, "Field operations, accounted for..." tagline, single-tenant footer note with the building icon) requires pixel-level control that the prebuilt component's `appearance` theming API doesn't cleanly give without heavy overrides fighting Clerk's own DOM structure; a custom form calling `signIn.create({ identifier, password })` / `signIn.attemptFirstFactor` still keeps Clerk as the sole owner of credential verification and session issuance (AC #3) — only the presentational layer is custom.
  - [x] Compose the screen from story 1.1's tokens and story 1.2's `Card`/`Button` components — the outer shell is `bg-accent-navy-800` full-viewport centered flex, the form itself is a `Card` (not `interactive`), fields use standard styled inputs consistent with `_shared-kit.html`'s `.field`/`input` treatment (token-driven border/focus-ring using `accent-teal-700`/`accent-teal-100`, per `DESIGN.md`'s Accessibility Floor: "Visible focus states on every interactive element, using the `accent-teal-100` focus ring token — never suppressed"). If `packages/ui` doesn't yet have a shared text-input component (Epic 1's UX-DR list doesn't include a form-input primitive), build the input styling locally in this screen using theme tokens directly — do not invent a new shared component under `packages/ui` for this alone, since no other Epic 1 story requests one and one screen's need doesn't yet justify a new AD-5 primitive; flag this as a likely future `packages/ui` `Input` component once a second screen needs the same styling.
  - [x] The submit button is story 1.2's `Button` with `variant="primary"` and full-width styling (`btn-block` in the mockup) — reuse the shared component, don't hand-roll button markup here.
  - [x] Map Clerk error responses to plain, actionable inline copy per `EXPERIENCE.md`'s Voice and Tone table (state what happened, no raw error codes, no exclamation points) — e.g. an invalid-credential Clerk error becomes something like "That email and password combination doesn't match our records," not Clerk's raw `form_password_incorrect` code or its default English message verbatim. Render the error inline near the form (not a toast, not a modal), consistent with `EXPERIENCE.md`'s State Patterns table ("Validation failure... Inline, per-field, next to the offending input").
- [x] Task 4: Wire the post-sign-in destination (AC: #1)
  - [x] On successful sign-in, redirect to `/` — the existing root route (`apps/web/app/page.tsx`), which today is the monorepo-scaffold placeholder ("AzentisFieldOS... Scaffold OK" button). This story does **not** build the real application shell (that's story 1.6, which replaces this same route's content with the sidebar+navigation shell) — landing on the current scaffold root, authenticated, satisfies this story's AC #1 today; story 1.6 upgrades what lives at that destination without this story's redirect wiring needing to change.
  - [x] Ensure the root route itself is one of the routes `middleware.ts` protects (Task 2) — an unauthenticated visit to `/` must redirect to `/sign-in`, not render the scaffold unauthenticated.
- [x] Task 5: Verify (AC: all)
  - [x] Run `pnpm --filter @azentisfieldos/web typecheck` and `pnpm --filter @azentisfieldos/web lint`.
  - [x] `pnpm --filter @azentisfieldos/web build` succeeds.
  - [x] Manual verification requires a real (test-mode) Clerk instance and keys — if none are available in this environment, implement all code paths correctly per the above and record in Completion Notes that live end-to-end sign-in was not manually exercised for lack of credentials, rather than skipping the implementation or fabricating a passing manual check. If Clerk keys *are* available, actually run the dev server and exercise: successful sign-in → lands on `/`; wrong password → inline actionable error, no raw Clerk error text visible; unauthenticated visit to `/` → redirected to `/sign-in`.
  - [x] Grep the new files for raw hex/px/rgba literals outside the token system (AD-4) — the same standard as every other Epic 1 component story.

## Dev Notes

- **Scope boundary — read before starting:** this story is `apps/web`-only. It does **not** include: an `apps/api` Clerk session-validation middleware (AD-10's "apps/api validates a Clerk-issued session token on every request" is real architecture but is not part of this story's stated AC or the epic's "Related Architecture Requirements" list — AD-3/AD-9/AD-11's Postgres-role-authorization wiring is future-epic work), syncing a Clerk user to the pre-existing `User` Prisma model (`infra/prisma/schema.prisma` already defines `User { id, clerkId, name, email, role, ... }` — this story does not add a webhook or any code path that creates/updates that row), or a Users & Roles administration screen (that's `17-settings.html`'s territory per `EXPERIENCE.md`'s IA table, not this story). Do not silently build any of these as "obviously needed" scope creep — they're real gaps but belong to later stories/epics; flag them in Completion Notes as known follow-on work instead of solving them here without a story spec to validate against.
- Next.js 16 breaking-changes warning (`apps/web/AGENTS.md`) is not boilerplate — Clerk's own middleware integration guidance is versioned against specific Next.js middleware/proxy conventions, and this app is on a very recent major (16.3.0) that predates most public Clerk+Next16 tutorials. Cross-check both the local Next 16 docs (Task 1) and the actually-installed `@clerk/nextjs@7.7.0`'s own type definitions/README (in `node_modules/@clerk/nextjs` once installed) rather than trusting general training-data knowledge of "how Clerk middleware usually works."
- The architecture spine's Consistency Conventions table states: "Auth is a Clerk session token validated per-request (AD-10); the `User.role` field... lives in Postgres, set by an Owner/Admin via the Admin Configuration screens, and is read on every request to authorize the action — Clerk owns *identity*, this schema owns *role*." This confirms the scope boundary above is deliberate, not an oversight: identity (this story) and role-based authorization (later work) are architecturally separate concerns.
- `mockups/00-login.html` is a static HTML prototype with a hardcoded `<a href="01-dashboard.html">` "Sign in" link (no real form submission) — treat its markup/CSS as the literal visual/structural reference, not its non-functional href-as-button behavior; this story replaces that with a real Clerk-backed form.
- Testing standard: Vitest per root `AGENTS.md`. Component-level tests for a Clerk-integrated form typically mock `@clerk/nextjs`'s `useSignIn` hook rather than hitting real Clerk APIs in unit tests — assert the error-mapping logic (Task 3) and the redirect-on-success call independently of Clerk's actual network behavior. Full end-to-end auth flow (if ever automated) is Playwright territory per the Stack table, but root `AGENTS.md` explicitly notes Playwright e2e isn't set up yet in this repo — don't introduce it as a side effect of this story.

### Project Structure Notes

- New files: `apps/web/middleware.ts`, `apps/web/app/sign-in/page.tsx` (or the Clerk-required catch-all route variant — confirm exact shape per Task 1/3), plus any colocated test file(s) for the sign-in form's error-mapping logic.
- Updated files: `apps/web/app/layout.tsx` (`ClerkProvider` wrapper), `apps/web/package.json` (new dependency), `.env.example` (new Clerk key names).
- No `packages/ui` changes are required unless the dev agent judges a shared `Input` primitive is warranted now rather than deferred (see Task 3 note) — the default expectation is to defer it.
- No `apps/api` or `infra/prisma` changes — explicitly out of scope per the Dev Notes scope boundary above.

### References

- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/00-login.html] — literal visual/structural reference for the Sign In screen.
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-10] — "Identity and MFA belong to Clerk, not to this codebase."
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-1] — single-tenant-by-construction, no tenant-selection step.
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md] — "Consistency Conventions" table row on Auth/Clerk/`User.role` split (identity vs. role-authorization scope boundary).
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#Stack] — `@clerk/nextjs` 7.7.0 pin and its Next.js 16.0.10+ minimum-version note.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md#Voice and Tone] — inline-error copy standard ("Cannot exceed..." style plain operational language, no raw error codes).
- [Source: apps/web/AGENTS.md] — standing Next.js 16 breaking-changes warning; read before touching middleware/routing.
- [Source: infra/prisma/schema.prisma] — existing `User` model (`clerkId`, `role`) confirming this story deliberately does not wire Postgres user sync.
- [Source: _bmad-output/implementation-artifacts/1-1-design-token-foundation.md], [Source: _bmad-output/implementation-artifacts/1-2-core-components-button-card-badge.md] — token/`Card`/`Button` dependencies this story's screen composes from.

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Debug Log References

- `pnpm --filter @azentisfieldos/web typecheck` — pass
- `pnpm --filter @azentisfieldos/web lint` — pass
- `pnpm --filter @azentisfieldos/web test` — 5/5 pass (error-mapping unit tests)
- `pnpm --filter @azentisfieldos/web build` — pass, output confirms `ƒ Proxy (Middleware)` registered
- Full-repo `pnpm typecheck` / `pnpm lint` — all 5 packages pass (no regressions)
- Grep for raw hex/rgba/px-bracket literals in all new/modified files — zero matches (after fixing one `max-w-[400px]` violation found during self-check, see below)

### Completion Notes List

- **Deviated from this story's own Task 2/3 wording, based on Task 1's research** — Next.js 16 renamed the "Middleware" file convention to "Proxy" (`middleware.ts` is deprecated; the file must be `proxy.ts`, exporting a default or named `proxy` function — confirmed directly from `apps/web/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Created `apps/web/proxy.ts` (not `middleware.ts`) with `export default clerkMiddleware(...)`; Clerk's `clerkMiddleware()` still returns a plain `(request, event) => response` handler, which is exactly what a Proxy default export expects — "functionality remains the same" per Next's own migration notes. The build output's `ƒ Proxy (Middleware)` line confirms Next.js recognized it correctly.
- **Also deviated from Task 3's literal `signIn.create()`/`signIn.attemptFirstFactor` wording** — the installed `@clerk/nextjs@7.7.0` (`@clerk/react@6.14.1` under the hood) ships a newer "SignIn Future" signals-based custom-flow API: `useSignIn()` returns `{ signIn, errors, fetchStatus }` where `signIn.password({identifier, password})` resolves with `{ error: ClerkError | null }` (no throw), and completing sign-in requires an explicit `signIn.finalize()` call rather than the older `setActive({session: createdSessionId})` pattern. Confirmed this directly from the installed package's `.d.mts` type definitions (`@clerk/shared`'s `signInFuture.d.mts`) rather than trusting general Clerk knowledge, since the story's own Dev Notes explicitly warned this SDK predates most public tutorials. `map-clerk-error.ts` reads a Clerk error's `.code` field directly (`ClerkError.code`), not the older REST-style `{errors: [...]}` array shape.
- Route protection: `proxy.ts` uses `createRouteMatcher(["/sign-in(.*)"])` and calls `auth.protect()` for every non-matching route, so an unauthenticated visit to `/` (or any other route) redirects to `/sign-in`.
- Sign-in form built from story 1.1 tokens and story 1.2's `Card`/`Button` — no shared `Input` primitive exists yet in `packages/ui` (not requested by any other Epic 1 story), so the email/password fields are styled locally with theme tokens directly, per this story's own Dev Notes guidance; flagged here as a likely future `packages/ui` `Input` component once a second screen needs the same styling.
- Error copy never surfaces a raw Clerk code/message — `mapClerkSignInError` (in a separate, unit-tested pure-function file) maps `form_password_incorrect` and `form_identifier_not_found` to the *same* friendly message ("That email and password combination doesn't match our records.") to avoid user enumeration, `too_many_requests` to a plain retry message, and everything else to a generic fallback.
- Discovered and fixed one AD-4 violation during self-check: the login card initially used `max-w-[400px]` (an arbitrary-bracket pixel literal) to match `mockups/00-login.html`'s `max-width: 400px` — replaced with `max-w-100`, which resolves to exactly 400px through this repo's `--spacing: 0.25rem` base (100 × 4px), staying within the token system rather than a literal.
- Set up Vitest for `apps/web` from scratch (mirroring `packages/ui`'s and `apps/api`'s existing config) — added `vitest` devDependency, `"test": "vitest run"` script, and `apps/web/vitest.config.mts` (node environment, no jsdom needed since the only test is a pure function). This groundwork will be reused by story 1.7's CI wiring and any future `apps/web` unit tests.
- Manual, credentialed verification (actually signing in against a live Clerk instance) was **not** performed — no test-mode Clerk keys were available in this environment. Per the story's own Task 5 guidance, this is recorded honestly rather than skipped or fabricated: `pnpm --filter @azentisfieldos/web build` succeeded even without real keys (`ClerkProvider` doesn't hard-fail static generation on a missing publishable key), which is a meaningful signal the wiring is structurally correct, but the actual credential-exchange round-trip, the inline-error-on-wrong-password behavior, and the `/sign-in` redirect-on-unauthenticated-visit have only been reviewed by code inspection against `proxy.ts`'s route matcher, not exercised live. Whoever has access to a test-mode Clerk instance should run through those three flows before treating AC #1/#2/#4 as fully verified end-to-end.
- Scope boundary honored per this story's Dev Notes: no `apps/api` Clerk session-validation middleware, no Postgres `User` row sync, no Users & Roles admin screen — all explicitly out of scope here.

### File List

- `apps/web/proxy.ts` (new)
- `apps/web/app/sign-in/page.tsx` (new)
- `apps/web/app/sign-in/map-clerk-error.ts` (new)
- `apps/web/app/sign-in/map-clerk-error.test.ts` (new)
- `apps/web/app/layout.tsx` (modified — `ClerkProvider` wrapper)
- `apps/web/package.json` (modified — `@clerk/nextjs` dependency, `vitest` devDependency, `test` script)
- `apps/web/vitest.config.mts` (new)
- `.env.example` (modified — Clerk env var names)
- `pnpm-lock.yaml` (modified)
