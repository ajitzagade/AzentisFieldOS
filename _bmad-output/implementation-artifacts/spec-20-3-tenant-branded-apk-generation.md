---
title: 'Tenant-Branded APK Generation'
type: 'feature'
created: '09-04-2026'
status: 'done'
route: 'one-shot'
---

# Tenant-Branded APK Generation

## Intent

**Problem:** Story 20.1's TWA build pipeline (`build.ts`) already derives an APK's app name and icon per tenant from that tenant's own live web manifest, but no tenant yet has a stable, unique Android package id, and the claim that two different tenants actually get distinct branding through this pipeline — with zero separate Android-layer config — had never been directly verified.

**Approach:** Add an `androidPackageId` field to `infra/tenants/*.json` (unique per tenant, `[a-zA-Z][a-zA-Z0-9_]*`-per-section — confirmed against `@bubblewrap/core`'s own `util.validatePackageId`, which caught that the epic doc's own hyphenated example would have failed), wire the field into `provision.ts`'s `TenantConfig` type, and directly verify — by calling the exact `TwaManifest.fromWebManifest` function `build.ts` uses, against two distinct manifest fixtures — that per-tenant app name and icon differentiation already works end-to-end with no `build.ts` code changes needed. Documented the verified mechanism, and the one branding dimension (theme/icon color) that is *not* yet tenant-differentiated, in `infra/android/README.md`.

## Suggested Review Order

**Per-tenant package id (the new field)**

- The three tenant configs' new field — `sandeep_enterprises`/`bhakti_enterprises` deliberately distinct, `example_contractor` as the template default.
  [`sandeep-enterprises.json:5`](../../infra/tenants/sandeep-enterprises.json#L5)

- Format/uniqueness rule documented at the source, since the epic doc's own example (`sandeep-enterprises`, hyphenated) fails this exact validator.
  [`_example.json:2`](../../infra/tenants/_example.json#L2)

- Type contract for the loaded config — required field, not yet runtime-validated (pre-existing `JSON.parse as T` pattern, deferred separately).
  [`provision.ts:15`](../../infra/provisioning/provision.ts#L15)

**Verified branding mechanism (documentation, no code change)**

- Why no `build.ts` change was needed: the manifest-driven mechanism already differentiates app name/icon per tenant.
  [`README.md:13`](../../infra/android/README.md#L13)

- Package id immutability + cross-tenant uniqueness requirement, called out next to the format rule.
  [`README.md:43`](../../infra/android/README.md#L43)
