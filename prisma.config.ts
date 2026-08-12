import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Prisma 7 central config (replaces schema.prisma's datasource url/directUrl).
// Schema lives under infra/prisma (AD-2: identical schema, run per tenant
// deployment) even though this file sits at repo root, per Prisma's
// documented monorepo pattern.
export default defineConfig({
  schema: path.join(__dirname, "infra/prisma/schema.prisma"),
  migrations: {
    path: path.join(__dirname, "infra/prisma/migrations"),
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
