# Story 1.7: Accessibility & Performance CI Gate

Status: review

## Story

As the Development Team,
I want accessibility and performance budgets enforced automatically on every PR touching `apps/web`,
so that WCAG AA and the >95 Lighthouse budgets (AD-15) are enforced automatically, not left to discretionary review.

## Acceptance Criteria

1. **Given** a PR that modifies any file under `apps/web`, **when** CI runs, **then** `eslint`'s jsx-a11y rules (already bundled via `eslint-config-next`'s `core-web-vitals` — see Dev Notes correction below) error and block merge on any violation.
2. **And** a Lighthouse CI run reports Performance/Accessibility/Best Practices/SEO scores, failing the check if any drops below 95.
3. **And** this gate is documented in `AGENTS.md`'s Running and verifying section, replacing the current TODO placeholder.
4. **And** every automated test written across Epic 1's stories 1.1–1.6 actually executes in this CI pipeline (not just locally) — a missing `test` script in any touched package's `package.json` would silently make `turbo run test` a no-op for that package, which defeats the point of a CI gate.

## Tasks / Subtasks

- [x] Task 1: Correct the brief's premise on jsx-a11y before doing anything else (AC: #1)
  - [x] Root `AGENTS.md` already states explicitly: "`apps/web`'s ESLint config already enforces jsx-a11y rules (via `eslint-config-next`'s bundled `core-web-vitals` — do not add `eslint-plugin-jsx-a11y` separately, it throws a duplicate-plugin error)." Reading `apps/web/eslint.config.mjs` confirms this is already true today — it imports `eslint-config-next/core-web-vitals` (which bundles jsx-a11y's recommended rules) and carries a code comment explaining exactly why a second, standalone `eslint-plugin-jsx-a11y` install would break. **Do not** run `pnpm add -D eslint-plugin-jsx-a11y` in `apps/web` — that would directly reproduce the exact duplicate-plugin crash this codebase has already been set up to avoid. The original story brief's literal wording ("I want `eslint-plugin-jsx-a11y`... wired") describes an already-satisfied intent via a different, already-correct mechanism — verify, don't re-do.
  - [x] Confirm the bundled jsx-a11y rules are set to `error` severity (not `warn`) in the effective merged config — run `npx eslint --print-config apps/web/app/layout.tsx` (or equivalent) from `apps/web` and inspect a couple of jsx-a11y rule entries (e.g. `jsx-a11y/alt-text`, `jsx-a11y/anchor-is-valid`) to confirm severity. `eslint-config-next`'s `core-web-vitals` preset sets these to `error` by default — if for any reason the merged config in this repo has downgraded any to `warn`, that would silently defeat AC #1 ("errors ... block merge"), since ESLint warnings don't fail a CI run driven by exit code alone; flag and fix if found, otherwise just record the confirmation in Completion Notes.
  - [x] Note the pre-existing comment in `packages/config/eslint/base.mjs` ("apps/web additionally *layers* eslint-plugin-jsx-a11y rules — see apps/web/eslint.config.mjs") is slightly imprecise: `apps/web` doesn't separately *layer* the plugin, it *inherits* it via `eslint-config-next/core-web-vitals`. This is a harmless documentation nit, not a functional bug — correct the comment's wording while touched, but do not treat it as part of this story's real risk surface.
- [x] Task 2: Stand up the CI workflow (AC: #1, #4)
  - [x] New file `.github/workflows/ci.yml` (the `.github/workflows/` directory referenced by the architecture spine's Structural Seed doesn't exist yet — only `.github/agents/` does; this is genuinely new infrastructure, not an update). Trigger: `pull_request` (and reasonably `push` to `main`, matching common convention — the spine only mandates "CI: lint/typecheck/test per PR," push-to-main is an implementation-detail addition, not a requirement to skip).
  - [x] Steps: checkout, set up Node 22 (matches root `package.json`'s `engines.node`), set up pnpm (matching the pinned `packageManager: pnpm@11.5.2`), `pnpm install --frozen-lockfile`, then `pnpm lint`, `pnpm typecheck`, `pnpm test` (all three already exist as root Turborepo scripts — `turbo run lint`/`typecheck`/`test` — reuse them rather than hand-rolling per-package CI steps).
  - [x] Before wiring `pnpm test` into CI, audit every package/app touched by Epic 1 stories 1.1–1.6 for a `test` script in its `package.json`: `packages/ui/package.json` currently has only `lint`/`typecheck` scripts (no `test`), and depending how story 1.5 added its error-mapping test, `apps/web/package.json` may be in the same state. Add `"test": "vitest run"` (or the project's established Vitest invocation pattern — check `apps/api/package.json`'s existing `test` script, since `apps/api` already has Vitest wired per root `AGENTS.md`, and mirror its exact invocation rather than inventing a divergent one) to any package that has test files but no script to run them. A test file that never executes in CI is functionally equivalent to no test at all from a CI-gate perspective — this is exactly AC #4's concern, and it's a real gap risk given how many of Epic 1's stories added Vitest tests without this story's author being able to confirm each one wired its script correctly at authoring time.
  - [x] Scope the workflow to run on every PR (simplest, most reliable) — the spine's "every PR touching `apps/web`" language for the jsx-a11y/Lighthouse half specifically is naturally satisfied by path-scoping just the Lighthouse job (Task 3) to `apps/web` changes, since building/serving the whole app for a Lighthouse run is only worth the CI minutes when `apps/web` actually changed; lint/typecheck/test can reasonably run on every PR regardless of which package changed, since Turborepo's task caching already makes unaffected packages' runs cheap/no-op.
- [x] Task 3: Wire Lighthouse CI (AC: #2, #3)
  - [x] Add `@lhci/cli` as a root or `apps/web`-scoped dev dependency.
  - [x] Add a Lighthouse CI config (e.g. `apps/web/lighthouserc.js` or `.lighthouserc.json`) with `assert` budgets: `categories:performance`, `categories:accessibility`, `categories:best-practices`, `categories:seo` each `minScore: 0.95` (the founder's ">95" figure — confirm whether that means "at least 95," i.e. `0.95` inclusive, or "strictly above 95"; treat `minScore: 0.95` as the correct, standard interpretation of a ">95 budget" threshold since Lighthouse CI's own convention already reads `minScore` as an inclusive floor and this is the only value that makes "95" itself a passing score, which is what the architecture spine's own wording implies by calling it a "budget," not a strict inequality).
  - [x] Target URL(s) for the Lighthouse run: given every route except `/sign-in` requires authentication (story 1.5's middleware) and this repo has no automated-login/session-seeding mechanism yet (Playwright e2e is explicitly not set up per root `AGENTS.md`'s TODO), scope this story's Lighthouse run to the one realistically testable unauthenticated route — `/sign-in`. Document this scoping decision directly in the CI config or workflow file (a comment explaining *why* only `/sign-in` is measured, not restating the story) and flag in Completion Notes that expanding Lighthouse coverage to authenticated routes is future work contingent on an e2e auth-seeding mechanism that doesn't exist yet — don't attempt to build one as an unplanned side effect of this story.
  - [x] Wire the Lighthouse job in `ci.yml` (or a separate workflow file, dev agent's call — a separate `lighthouse.yml` triggered `on: pull_request` with a path filter for `apps/web/**` is arguably cleaner than folding it into the main lint/typecheck/test job, since it needs a build+serve step the others don't) to: `pnpm --filter @azentisfieldos/web build`, start the built app (`next start` or `@lhci/cli`'s own static-server support against `apps/web/.next`), run `lhci autorun` against the `/sign-in` route, and fail the job (non-zero exit) if any budget assertion fails.
  - [x] Lighthouse CI needs real Clerk env vars present even to build/boot `apps/web` (story 1.5 wraps the root layout in `ClerkProvider`, which typically requires at least a publishable key to initialize without throwing) — if CI doesn't have test-mode Clerk secrets available as repository/environment secrets, this job cannot actually run end-to-end in this environment. If that's the case here, implement the workflow file correctly and completely, but record in Completion Notes that it could not be executed/verified live for lack of CI-configured Clerk secrets, and note (without fabricating a passing run) what secret name(s) (e.g. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`) would need to be added as GitHub Actions repository secrets for this job to run for real.
- [x] Task 4: Update `AGENTS.md` (AC: #3)
  - [x] Replace the existing TODO line in root `AGENTS.md`'s Policy section — `**TODO:** Lighthouse CI budget gate in .github/workflows/ is not wired yet (AD-15); this line is the fallback until it is.` — with a short factual statement of what's now true: CI enforces jsx-a11y (via the existing `eslint-config-next` bundling, not a separate plugin) and Lighthouse CI budgets on `apps/web` PRs, naming the actual workflow file(s). If Task 3's Lighthouse job couldn't be live-verified due to missing CI secrets (see above), say so honestly in this update rather than claiming a fully-verified gate — e.g. "wired but pending CI secret configuration" is an accurate, non-misleading status if that's the real state.
  - [x] Leave the other existing TODO lines (`pnpm provision`, Playwright e2e) untouched — they're unrelated to this story.
- [x] Task 5: Verify (AC: all)
  - [x] Run `pnpm lint`, `pnpm typecheck`, `pnpm test` locally (root-level, all packages) and confirm they pass — this is the same set of checks CI will run, so a local pass is the most direct available verification given CI itself can't be triggered from within this session.
  - [x] If the GitHub CLI (`gh`) is available and the repo has a remote, this is a good candidate for a real PR-triggered verification once the user is ready to push — do not attempt to push or open a PR without the user's explicit go-ahead (per this session's standing instruction to confirm before actions visible to others); note in Completion Notes that live CI verification is pending an actual PR.

## Dev Notes

- This story's most important move is the correction in Task 1: the original story brief (like most of Epic 1's briefs) was written from `DESIGN.md`/`EXPERIENCE.md`/the architecture spine without cross-checking the actual current state of `apps/web/eslint.config.mjs`, which already correctly implements jsx-a11y enforcement and even carries an explanatory comment about why not to "fix" it the naive way. Re-implementing it as literally described in the brief (`pnpm add -D eslint-plugin-jsx-a11y`) would actively break the build. This is exactly the class of mistake ("reinventing wheels... breaking regressions") this story-creation process exists to catch before a dev agent wastes a cycle on it.
- AC #4 (every Epic 1 test actually running in CI) was not part of the original story brief's literal acceptance criteria — it's added here because "CI: lint/typecheck/test per PR" (the architecture spine's own Structural Seed description of `.github/workflows/`) is not honestly satisfied if `pnpm test` silently does nothing for packages that have test files but no script to invoke them, and no other Epic 1 story owns verifying this cross-cutting concern. This is the "leave the system working end-to-end" principle in practice — a CI-gate story is precisely where an un-wired test script becomes a real, not hypothetical, problem.
- Lighthouse's authenticated-routes gap (Task 3) is a genuine, load-bearing limitation, not a corner being cut casually — flagging it honestly (rather than either silently skipping Lighthouse entirely, or silently building a full auth-seeding mechanism unprompted) is the correct scope call for this story. A future story, once e2e infrastructure exists, is the right place to expand coverage.
- Testing/CI stack pins: Vitest 4.1.10, Playwright 1.62.1 (not yet wired, per root `AGENTS.md`), Turborepo 2.10.9 (architecture spine Stack table) — this story doesn't need Playwright at all; don't introduce it as an unplanned side effect of building the Lighthouse job.

### Project Structure Notes

- New files: `.github/workflows/ci.yml` (and possibly a separate `.github/workflows/lighthouse.yml`), `apps/web/lighthouserc.js` (or `.json`).
- Updated files: `AGENTS.md` (TODO replacement), `packages/config/eslint/base.mjs` (comment wording nit), `packages/ui/package.json` and/or `apps/web/package.json` (missing `test` script, if the audit in Task 2 finds a gap), root or `apps/web` `package.json` (`@lhci/cli` dependency).
- This story deliberately does **not** touch `apps/web/eslint.config.mjs` — it's already correct; touching it without a real reason would be the opposite of this story's actual job.

### References

- [Source: AGENTS.md] — existing jsx-a11y-already-bundled warning and the Lighthouse TODO line this story replaces.
- [Source: apps/web/eslint.config.mjs] — confirms jsx-a11y is already correctly wired via `eslint-config-next/core-web-vitals`.
- [Source: packages/config/eslint/base.mjs] — the slightly-imprecise comment this story's Task 1 tidies up.
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-15] — the binding rule this story implements (CI-enforced, not discretionary, budgets).
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#Structural Seed] — `.github/workflows/` described as "CI: lint/typecheck/test per PR," motivating AC #4.
- [Source: _bmad-output/implementation-artifacts/1-5-sign-in.md] — the `/sign-in` route and Clerk-secret dependency this story's Lighthouse scoping and potential live-verification gap both stem from.

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Debug Log References

- `npx eslint --print-config apps/web/app/layout.tsx` (before fix) — confirmed 6 jsx-a11y rules present at severity `1` (warn); (after fix) — confirmed all 6 at severity `2` (error)
- `node -e "require('eslint-config-next/core-web-vitals')..."` — confirmed the `warn` severity is `eslint-config-next`'s own upstream default, not a local misconfiguration
- `pnpm --filter @azentisfieldos/web build` + `pnpm --filter @azentisfieldos/web start` + `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/sign-in` — reproduced the real failure mode: HTTP 500, server log `Error: @clerk/nextjs: Missing publishableKey`
- `npx lhci autorun` (run directly, not just planned) — failed with `Runtime error ... Status code: 500`, consistent with the above
- Root `pnpm lint` / `pnpm typecheck` / `pnpm test` — all pass across all 5 packages (84 tests total: 74 `packages/ui` + 9 `apps/web` + 1 `apps/api`)

### Completion Notes List

- **Task 1 finding beyond what the story anticipated:** the story predicted jsx-a11y might be silently downgraded to `warn` and said to "flag and fix if found." It was found: `eslint-config-next`'s `core-web-vitals` preset ships its 6 jsx-a11y rules (`alt-text`, `aria-props`, `aria-proptypes`, `aria-unsupported-elements`, `role-has-required-aria-props`, `role-supports-aria-props`) at `warn` severity by *upstream default* (confirmed by inspecting the resolved plugin config directly, not just this repo's composition) — a plain `pnpm lint` would exit 0 even with a real accessibility violation, silently defeating AD-15's "CI-enforced, not discretionary" requirement. Fixed with a small rules-override block in `apps/web/eslint.config.mjs` bumping exactly those 6 rules to `error` — did not re-add `eslint-plugin-jsx-a11y` as a separate package (would reproduce the duplicate-plugin crash) and did not touch anything else in that file.
- Corrected the slightly-imprecise comment in `packages/config/eslint/base.mjs` (said `apps/web` "layers" the plugin; it inherits it via `core-web-vitals`) — wording-only, no functional change.
- Audited every package for a `test` script (AC #4): `apps/api`, `apps/web`, and `packages/ui` all already had one wired by prior Epic 1 stories (1.1 and 1.5 added them proactively); `packages/shared`/`packages/config` have no test files and correctly have no script. No gap found, but confirmed rather than assumed.
- New `.github/workflows/ci.yml`: runs `pnpm lint`/`typecheck`/`test` (the existing Turborepo root scripts) on every PR and on push to `main`.
- New `.github/workflows/lighthouse.yml`: separate workflow, path-filtered to `apps/web/**` and its three workspace dependencies (`packages/ui`, `packages/shared`, `packages/config`) so it only runs when a change could actually affect the built app. Builds `apps/web`, then runs `lhci autorun` against `apps/web/lighthouserc.js` (all four categories, `minScore: 0.95` — the standard inclusive-floor reading of a ">95 budget").
- **Verified live, not just reasoned about, that the Lighthouse job cannot currently succeed:** ran `pnpm --filter @azentisfieldos/web build` + `next start` + a direct request to `/sign-in` locally — got a real HTTP 500 with `Error: @clerk/nextjs: Missing publishableKey`, confirming `next build`'s static generation doesn't execute the failing code path but `next start`'s actual request handling does. Then ran `npx lhci autorun` directly against the same setup and it failed with `Runtime error ... Status code: 500`, the same failure GitHub Actions will hit without real secrets configured. This is stronger evidence than the story's own "if CI doesn't have secrets, this job cannot run" hypothesis — it's now a directly-reproduced, not assumed, fact. `.github/workflows/lighthouse.yml` passes `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`/`CLERK_SECRET_KEY` from GitHub Actions secrets at both the build and `lhci autorun` steps; until those secrets are added to the repository, the job will fail in exactly this way. Recorded honestly in `AGENTS.md` rather than claiming a fully verified gate.
- Lighthouse scope is deliberately limited to `/sign-in` (the only unauthenticated route) — expanding to authenticated routes needs an e2e auth-seeding mechanism that doesn't exist yet (root `AGENTS.md`'s pre-existing Playwright TODO); not built here, per this story's explicit scope boundary.
- `AGENTS.md`'s Policy-section TODO line was replaced with a factual statement of the CI gate's actual (partially-verified) state, and the two unrelated TODO lines (`pnpm provision`, Playwright e2e) were left untouched.
- No git remote is configured in this repository yet (confirmed via `git remote -v`), so an actual PR-triggered CI run could not be exercised from this session — local `pnpm lint`/`typecheck`/`test` (the same checks `ci.yml` runs) all pass, which is the most direct verification available without pushing. Did not push or open a PR without the user's explicit go-ahead.

### File List

- `apps/web/eslint.config.mjs` (modified — jsx-a11y severity override)
- `packages/config/eslint/base.mjs` (modified — comment wording)
- `.github/workflows/ci.yml` (new)
- `.github/workflows/lighthouse.yml` (new)
- `apps/web/lighthouserc.js` (new)
- `apps/web/package.json` (modified — `@lhci/cli` devDependency)
- `AGENTS.md` (modified — Policy-section TODO replaced with factual CI-gate status)
- `pnpm-lock.yaml` (modified)
