import path from "node:path";
import { defineConfig } from "@playwright/test";
import { API_BASE_URL, API_PORT, E2E_DATABASE_URL, WEB_BASE_URL, WEB_PORT } from "./fixtures/constants";

const REPO_ROOT = path.resolve(__dirname, "..");

// ONE-OFF PREVIEW CONFIG — runs only capture-video.spec.ts, a throwaway
// screen-recording script (not the committed Help & Guides pipeline). See
// that file's header comment. Reuses the same e2e harness (DB, servers) as
// help-screens.config.ts.
export default defineConfig({
  testDir: "./help-screens",
  testMatch: "capture-video.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./global-setup.ts",
  timeout: 300_000,
  use: {
    baseURL: WEB_BASE_URL,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [{ name: "video-preview" }],
  webServer: [
    {
      command: "pnpm --filter @azentisfieldos/api start",
      url: `${API_BASE_URL}/health`,
      cwd: REPO_ROOT,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
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
