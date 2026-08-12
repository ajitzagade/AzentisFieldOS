# Tenant provisioning

Architecture spine AD-2: onboarding a new Tenant is this script, never a manual click-through in Vercel/Neon/Clerk/Cloudflare consoles. Run it, don't improvise it.

## What it does (in order)

1. Read `infra/tenants/<slug>.json` (copy `_example.json` first).
2. Create a Vercel project for the tenant, wired to this monorepo's `apps/web`, with the tenant's domain and branding env vars.
3. Create a Neon Postgres project/branch for the tenant, plus its paired staging branch (AD-12).
4. Run `infra/prisma/schema.prisma` migrations against the new tenant database.
5. Create a Clerk instance/config for the tenant (AD-10).
6. Create a Cloudflare R2 bucket for the tenant's DSR photos/documents.
7. Write the resulting connection strings/keys as environment variables on the Vercel project — never into `infra/tenants/*.json`, which is committed.

## Status

Each provider integration below is a **TODO** — this monorepo has no live Vercel/Neon/Clerk/Cloudflare account wiring yet. `provision.ts` is the intended entry point and command shape; do not treat any invocation here as working until a first real tenant is provisioned and this file is refreshed to match (per `AGENTS.md`'s greenfield discipline: no guessed command stated as fact).

```
pnpm provision <tenant-slug>   # TODO — not yet wired to any provider API
```
