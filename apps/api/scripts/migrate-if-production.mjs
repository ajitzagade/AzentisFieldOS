// Runs `prisma migrate deploy` as part of the Vercel build, but only when
// building for Production (VERCEL_ENV, a Vercel-injected build-time var —
// distinct from the runtime-exposure project setting). Preview builds have
// no DATABASE_URL and must not silently no-op past a failed migration:
// on 2026-09-01, three migrations were merged but never deployed, and
// nothing in the build caught the drift until pages started 500ing in
// production. A failed migration here fails the build, on purpose.
import { spawnSync } from "node:child_process";

if (process.env.VERCEL_ENV !== "production") {
  console.log(`Skipping prisma migrate deploy (VERCEL_ENV=${process.env.VERCEL_ENV ?? "unset"})`);
  process.exit(0);
}

// `migrate deploy` needs the datasource URL, which Prisma 7 only resolves
// from prisma.config.ts (schema.prisma deliberately has no datasource.url —
// AD-2). `prisma generate --schema ...` above works fine without it, but
// `migrate deploy` requires pointing at the root config explicitly, since
// this script's cwd (apps/api) isn't where prisma.config.ts lives.
const result = spawnSync("prisma", ["migrate", "deploy", "--config", "../../prisma.config.ts"], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
