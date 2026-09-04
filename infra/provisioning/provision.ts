/**
 * Tenant provisioning entry point (architecture spine AD-2).
 * Status: skeleton — provider calls are TODO, see README.md. Do not wire
 * fake/guessed API calls here; each TODO becomes real code against a real
 * provider account, verified by actually provisioning a tenant.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

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
