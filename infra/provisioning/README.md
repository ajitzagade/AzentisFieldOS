# Tenant provisioning

Architecture spine AD-2: onboarding a new Tenant is this script, never a manual click-through in Vercel/Neon/Cloudflare consoles (auth is custom username/password, not Clerk — see `AGENTS.md`). Run it, don't improvise it.

## What it does (in order)

1. Read `infra/tenants/<slug>.json` (copy `_example.json` first).
2. Create a Vercel project for the tenant, wired to this monorepo's `apps/web`, with the tenant's domain and branding env vars.
3. Build and sign the tenant's Android TWA wrapper APK (`infra/android/build.ts`, epic-20) from the now-fetchable manifest, producing `infra/android/dist/<slug>.apk`. Requires `ANDROID_KEYSTORE_BASE64`/`ANDROID_KEYSTORE_PASSWORD` (the shared signing key, story 20.1) and a JDK on `PATH` in whatever environment runs this script — see `infra/android/README.md`.
4. Create a Neon Postgres project/branch for the tenant, plus its paired staging branch (AD-12).
5. Run `infra/prisma/schema.prisma` migrations against the new tenant database.
6. Seed the tenant's first `OWNER_ADMIN` user (`seedFirstAdmin`).
7. Create a Cloudflare R2 bucket for the tenant's DSR photos/documents.
8. Write the resulting connection strings/keys as environment variables on the Vercel project — never into `infra/tenants/*.json`, which is committed.

## Status

Each provider integration below is a **TODO** — this monorepo has no live Vercel/Neon/Cloudflare account wiring yet. `provision.ts` is the intended entry point and command shape; do not treat any invocation here as working until a first real tenant is provisioned and this file is refreshed to match (per `AGENTS.md`'s greenfield discipline: no guessed command stated as fact).

```
pnpm provision <tenant-slug>   # TODO — not yet wired to any provider API
```
