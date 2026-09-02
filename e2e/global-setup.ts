import { spawnSync } from "node:child_process";
import path from "node:path";
import { E2E_DATABASE_URL } from "./fixtures/constants";

const REPO_ROOT = path.resolve(__dirname, "..");

// Runs once before the whole suite: makes sure the DEDICATED e2e database's
// schema is current, then resets and reseeds it to a known starting state.
// Every command below is explicitly scoped to E2E_DATABASE_URL — this can
// never touch the dev DB (azentisfieldos), the vitest integration DB
// (azentisfieldos_test), or production (Neon, reached only via Vercel env
// vars this process never sets).
export default async function globalSetup() {
  console.log(`[e2e] Applying migrations to ${E2E_DATABASE_URL.replace(/:[^:@]*@/, ":***@")}`);
  const migrate = spawnSync("npx", ["prisma", "migrate", "deploy", "--config", "prisma.config.ts"], {
    cwd: REPO_ROOT,
    env: { ...process.env, DATABASE_URL: E2E_DATABASE_URL },
    stdio: "inherit",
    shell: true,
  });
  if (migrate.status !== 0) {
    throw new Error("[e2e] prisma migrate deploy failed against the e2e database");
  }

  console.log("[e2e] Resetting and seeding the e2e database");
  const seed = spawnSync("npx", ["tsx", "e2e/fixtures/seed.ts"], {
    cwd: REPO_ROOT,
    env: { ...process.env, DATABASE_URL: E2E_DATABASE_URL },
    stdio: "inherit",
    shell: true,
  });
  if (seed.status !== 0) {
    throw new Error("[e2e] seed script failed against the e2e database");
  }
}
