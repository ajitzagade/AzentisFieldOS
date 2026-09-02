# End-to-end tests

Real browser tests (Playwright) driving `apps/web` + `apps/api` together
exactly as a signed-in user would — Owner and Site Supervisor, daily flows,
D4 corrections, D7 pricing, plus one create-and-verify smoke test per
remaining module.

## Safety: database isolation

This suite runs against **`azentisfieldos_e2e`** — a dedicated local Postgres
database that is not the dev DB (`azentisfieldos`), not the vitest
integration DB (`azentisfieldos_test`), and never production. Every process
this suite starts has `DATABASE_URL` explicitly overridden to that database;
nothing here reads `apps/api/.env` or `apps/web/.env.local`, and nothing here
can reach a Vercel/Neon production URL.

`e2e/fixtures/seed.ts` truncates and reseeds this database on every run. It
refuses to run (`assertSafeToWipe`) unless `DATABASE_URL` contains
`azentisfieldos_e2e` — treat that guard as load-bearing.

## Running

```
pnpm test:e2e          # headless run
pnpm test:e2e:ui        # Playwright's interactive UI mode
pnpm test:e2e:report    # reopen the last HTML report
```

First time only: `psql -U <you> -c "CREATE DATABASE azentisfieldos_e2e;"` —
`global-setup.ts` applies migrations itself after that, every run.

## Layout

- `playwright.config.ts` — starts `apps/api` (port 3101) and `apps/web`
  (port 3100), deliberately not 3000/3001, so this never collides with a
  developer's own `pnpm dev`.
- `global-setup.ts` — migrates + reseeds the e2e database once before the
  whole suite runs.
- `fixtures/seed.ts` — the reset+seed logic. **CLI-only** (guarded by
  `require.main === module`) — never import this file directly; import
  `fixtures/test-users.ts` instead for the seeded credentials/names. See the
  incident note at the top of `seed.ts` for why this matters.
- `fixtures/auth.ts` — `loginAsOwner(page)` / `loginAsSupervisor(page)`,
  drives the real `/sign-in` form.
- `fixtures/ui.ts` — `pickCombobox()` for the app's searchable pickers
  (never native `<select>`), and `visibleText()` for asserting on content
  inside `packages/ui`'s `DataTable`, which renders both a desktop and a
  mobile copy of every row simultaneously (one CSS-hidden) — plain
  `getByText().first()` picks by DOM order, which is wrong on a mobile
  viewport.
- `specs/` — deep journey specs (`auth`, `supervisor-daily-flow`,
  `owner-dashboard-and-pricing`, `corrections`).
- `specs/smoke/` — one create-and-verify test per remaining module.

## Known dev-mode-only quirks

- Next's Turbopack dev overlay can transiently intercept a click right after
  a route's first compile. Prefer `page.context().clearCookies()` over
  clicking "Sign out" mid-test where the test doesn't specifically need to
  exercise that button; `.click({ force: true })` is the fallback when it
  does.
- A task-card link's accessible name includes its hint paragraph (e.g.
  `"Material Received New stock arrived at site or Godown"`) — anchor
  matches with `/^Material Received/`, not `{ name: "...", exact: true }`,
  unless you've confirmed via the accessibility snapshot that the label
  really has no trailing text in the DOM.
