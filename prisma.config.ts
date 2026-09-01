import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma 7 central config (replaces schema.prisma's datasource url/directUrl).
// Schema lives under infra/prisma (AD-2: identical schema, run per tenant
// deployment) even though this file sits at repo root, per Prisma's
// documented monorepo pattern.
//
// The datasource URL is read lazily from process.env with a placeholder
// fallback, NOT via Prisma's env() helper — env() throws while the config
// module is being loaded, which breaks commands that don't need a database
// at all (`prisma generate` during a Vercel Preview build, where no
// DATABASE_URL exists). The placeholder keeps config loading side-effect
// free; any command that actually connects (migrate deploy/dev) fails loudly
// on the unreachable placeholder if the real URL is missing — never
// silently succeeding against the wrong database.
export default defineConfig({
  schema: path.join(__dirname, "infra/prisma/schema.prisma"),
  migrations: {
    path: path.join(__dirname, "infra/prisma/migrations"),
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://missing-database-url:5432/missing",
  },
});
