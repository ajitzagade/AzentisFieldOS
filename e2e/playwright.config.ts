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
      command: `pnpm --filter @azentisfieldos/web exec next dev -p ${WEB_PORT}`,
      url: `${WEB_BASE_URL}/sign-in`,
      cwd: REPO_ROOT,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        API_URL: API_BASE_URL,
        NEXT_PUBLIC_API_URL: API_BASE_URL,
      },
    },
  ],
});
