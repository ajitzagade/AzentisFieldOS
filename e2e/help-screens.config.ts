import path from "node:path";
import { defineConfig } from "@playwright/test";
import { API_BASE_URL, API_PORT, E2E_DATABASE_URL, WEB_BASE_URL, WEB_PORT } from "./fixtures/constants";

const REPO_ROOT = path.resolve(__dirname, "..");

// Help & Guides screenshot-capture run (`pnpm help:screens`) — NOT a test
// suite. Reuses the e2e harness wholesale (same globalSetup, same seeded
// azentisfieldos_e2e database, same 3100/3101 webServers as
// e2e/playwright.config.ts, which stays untouched) to drive the real app to
// every guide step's screen and write the committed screenshot + manifest
// artifacts under apps/web. See e2e/help-screens/capture.spec.ts.
export default defineConfig({
  testDir: "./help-screens",
  fullyParallel: false,
  // One worker, one project: the capture walks 5 guides × 2 viewports in a
  // controlled order so the committed manifest is deterministic.
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./global-setup.ts",
  // ~110 navigations against a dev-mode Next server (first-visit compiles
  // included) — generous single-test budget, still bounded.
  timeout: 1_800_000,
  use: {
    baseURL: WEB_BASE_URL,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [{ name: "capture" }],
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
      // (see e2e/playwright.config.ts) — spread process.env first.
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
