/**
 * Tenant provisioning entry point (architecture spine AD-2).
 * Status: skeleton — provider calls are TODO, see README.md. Do not wire
 * fake/guessed API calls here; each TODO becomes real code against a real
 * provider account, verified by actually provisioning a tenant.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require_ = createRequire(import.meta.url);

interface TenantConfig {
  slug: string;
  displayName: string;
  domain: string;
  /** Android application id for this tenant's TWA build (epic-20 story 20.3/20.4) -- [a-zA-Z][a-zA-Z0-9_]* per section, no hyphens. */
  androidPackageId: string;
  branding: {
    logoUrl: string;
    primaryColorToken: string;
    accentColorToken: string;
  };
  contact: { ownerName: string; email: string; phone: string };
  notificationChannels: { whatsapp: boolean; email: boolean; inApp: boolean };
}

async function loadTenantConfig(slug: string): Promise<TenantConfig> {
  const configPath = path.resolve(
    import.meta.dirname,
    "../tenants",
    `${slug}.json`,
  );
  const raw = await readFile(configPath, "utf-8");
  return JSON.parse(raw) as TenantConfig;
}

async function createVercelProject(_config: TenantConfig): Promise<void> {
  // TODO: Vercel API — create project bound to apps/web, set domain + branding env vars.
  throw new Error("not implemented — see infra/provisioning/README.md");
}

/**
 * Resolves `tsx`'s CLI binary the same way `infra/android/build.ts`'s
 * `resolveBubblewrapBin()` resolves Bubblewrap's — read the real bin path out
 * of the dependency's own package.json rather than assuming a relative path,
 * so a version bump can't silently break this. Unlike `@bubblewrap/cli`
 * (`bin` is an object keyed by command name), `tsx`'s `bin` field is a plain
 * string — there's only one binary to resolve.
 */
function resolveTsxBin(): string {
  const pkgJsonPath = require_.resolve("tsx/package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8")) as {
    bin?: string;
  };
  if (typeof pkg.bin !== "string" || pkg.bin.length === 0) {
    throw new Error(
      "unexpected tsx package.json bin field shape — check for a version bump " +
        `(read from ${pkgJsonPath}, expected pkg.bin to be a non-empty string).`,
    );
  }
  return path.join(path.dirname(pkgJsonPath), pkg.bin);
}

/**
 * Builds and signs this Tenant's Android TWA wrapper APK by spawning
 * `infra/android/build.ts` (Story 20.1) as a subprocess — that script is a
 * self-invoking CLI (`main().catch(...)` runs at module load), not a library
 * to import (same reasoning as `e2e/fixtures/seed.ts`'s
 * `require.main === module` guard), so we shell out to it exactly the way it
 * shells out to `bubblewrap`. `env: process.env` passes the shared signing
 * key (`ANDROID_KEYSTORE_BASE64`/`ANDROID_KEYSTORE_PASSWORD`, etc.) through
 * unchanged — this never generates or accepts a per-Tenant keystore. Arg
 * validation (https-only manifest URL, package id shape) is `build.ts`'s own
 * job; a bad arg still surfaces loudly via a non-zero exit.
 */
function buildAndroidApk(config: TenantConfig): Promise<void> {
  if (!config.domain) {
    throw new Error(
      `tenant "${config.slug}" has no domain configured — cannot build a manifest URL for the Android build`,
    );
  }

  const tsxBin = resolveTsxBin();
  const buildScript = path.resolve(import.meta.dirname, "../android/build.ts");
  const manifestUrl = `https://${config.domain}/manifest.webmanifest`;

  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        tsxBin,
        buildScript,
        "--manifest-url",
        manifestUrl,
        "--package-id",
        config.androidPackageId,
        "--slug",
        config.slug,
      ],
      { env: process.env, stdio: "inherit" },
    );
    child.on("error", (error) => {
      reject(
        new Error(
          `failed to spawn Android build for tenant "${config.slug}": ${error.message}`,
        ),
      );
    });
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
      } else if (signal) {
        reject(
          new Error(`Android build for tenant "${config.slug}" was killed by signal ${signal}`),
        );
      } else {
        reject(
          new Error(`Android build failed for tenant "${config.slug}" (exit code ${code})`),
        );
      }
    });
  });
}

async function createDatabase(_config: TenantConfig): Promise<void> {
  // TODO: Neon API — create project + production branch + staging branch (AD-12).
  throw new Error("not implemented — see infra/provisioning/README.md");
}

async function runMigrations(_config: TenantConfig): Promise<void> {
  // TODO: `prisma migrate deploy --schema infra/prisma/schema.prisma` against the new DB.
  throw new Error("not implemented — see infra/provisioning/README.md");
}

async function seedFirstAdmin(_config: TenantConfig): Promise<void> {
  // TODO: generate a unique JWT_SECRET for this tenant's apps/api deployment,
  // then run infra/prisma/seed.ts (or an equivalent direct insert) against
  // the new tenant's database with SEED_ADMIN_NAME/EMAIL set from
  // config.contact and a generated SEED_ADMIN_PASSWORD, so there's a
  // first OWNER_ADMIN able to log in immediately after provisioning.
  throw new Error("not implemented — see infra/provisioning/README.md");
}

async function createStorageBucket(_config: TenantConfig): Promise<void> {
  // TODO: Cloudflare R2 API — create bucket for DSR photos/documents.
  throw new Error("not implemented — see infra/provisioning/README.md");
}

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: pnpm tsx infra/provisioning/provision.ts <tenant-slug>");
    process.exit(1);
  }

  const config = await loadTenantConfig(slug);
  await createVercelProject(config);
  await buildAndroidApk(config);
  await createDatabase(config);
  await runMigrations(config);
  await seedFirstAdmin(config);
  await createStorageBucket(config);

  console.log(`Provisioned ${config.displayName} (${config.slug}).`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
