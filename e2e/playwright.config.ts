import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { API_BASE_URL, API_PORT, E2E_DATABASE_URL, WEB_BASE_URL, WEB_PORT } from "./fixtures/constants";

const REPO_ROOT = path.resolve(__dirname, "..");

// Real end-to-end browser tests, driving apps/web + apps/api exactly as a
// signed-in user would, against a dedicated local Postgres database
// (azentisfieldos_e2e — never the dev DB, the vitest integration DB, or
// production). See e2e/README.md for how to run this locally.
//
// Both app servers are started and torn down by this config on ports
// 3100/3101 — deliberately NOT 3000/3001, so this suite never collides with
// (or gets mistaken for) a developer's normal `pnpm dev` session, and
// `reuseExistingServer` is always false so a stale/unrelated process on
// those ports can never be silently adopted as the server-under-test.
export default defineConfig({
  testDir: "./specs",
  fullyParallel: false,
  // All specs share one seeded database (see global-setup.ts) — serial
  // execution avoids cross-test races over that shared state.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: path.join(__dirname, "report") }]],
  globalSetup: "./global-setup.ts",
  timeout: 45_000,
  use: {
    baseURL: WEB_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Real root cause of a long-standing sign-in flakiness class (found
    // 2026-09-07): PwaClient (apps/web/app/pwa-client.tsx) only registers
    // the offline service worker in production builds — its own comment
    // already flags this as "caching friction" to avoid in dev/test. That
    // protection only worked by accident, because e2e ran `next dev`
    // (NODE_ENV !== "production") until now; switching to a real
    // production build + `next start` (below) to remove Turbopack's
    // dev-mode cold-compile flakiness activated the SW for the first time
    // in e2e, and its install/claim races were themselves hanging
    // navigation's "load" event unpredictably. Block service workers
    // browser-side instead of threading a test-only env var through
    // production app code.
    serviceWorkers: "block",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
      testMatch: /supervisor-daily-flow\.spec\.ts/,
    },
  ],
  webServer: [
    {
      command: "pnpm --filter @azentisfieldos/api start",
      url: `${API_BASE_URL}/health`,
      cwd: REPO_ROOT,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
      // Playwright's webServer.env REPLACES process.env rather than merging
      // with it (per its own type docs: "process.env by default" — i.e.
      // only when you don't set this) — spreading process.env first is
      // required or PATH/HOME/NODE_PATH vanish and the spawned pnpm/node
      // process can't even start.
      env: {
        ...process.env,
        DATABASE_URL: E2E_DATABASE_URL,
        PORT: String(API_PORT),
        JWT_SECRET: "e2e-local-secret-not-for-production-use",
        CORS_ORIGIN: WEB_BASE_URL,
      },
    },
    {
      // A real production build + `next start`, not `next dev` — Turbopack
      // dev mode compiles each route on first hit, and a long sequential
      // suite hitting 20+ never-before-compiled routes back to back could
      // push a single compile past the sign-in wait's timeout (the exact
      // flakiness class documented in fixtures/auth.ts). A build takes
      // ~10s for this app and removes that failure mode entirely — every
      // route is already compiled before the first test runs.
      command: `pnpm --filter @azentisfieldos/web build && pnpm --filter @azentisfieldos/web exec next start -p ${WEB_PORT}`,
      url: `${WEB_BASE_URL}/sign-in`,
      cwd: REPO_ROOT,
      reuseExistingServer: false,
      timeout: 180_000,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        API_URL: API_BASE_URL,
        // Next.js inlines NEXT_PUBLIC_* vars at BUILD time, not runtime —
        // this must be set for the `build` half of the command above, not
        // just the `start` half, or the client bundle would bake in the
        // wrong API origin.
        NEXT_PUBLIC_API_URL: API_BASE_URL,
      },
    },
  ],
});
