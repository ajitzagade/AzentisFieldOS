---
baseline_commit: 229ffd8ab4e1b807a03183a8cc26f107e806b5ff
---

# Story 14.1: Branding Configuration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to configure my company's branding (name, logo, address, contact, GST, colors, report branding),
so that every generated report carries my own business's identity, not a generic default.

## Acceptance Criteria

1. **Given** I update the Tenant's branding configuration, **when** I save, **then** the change reflects in the next generated report automatically, with no separate publish step. (FR-47)
2. Every field the mockup's Branding section shows (organisation name, logo, brand colors, registered address, contact phone, GSTIN) is editable here — not just the subset Epic 13 Story 13.1 seeded minimally to unblock report generation.

## Tasks / Subtasks

- [x] Task 1 — Schema extension (AC: #2)
  - [x] Epic 13 Story 13.1 already created `BrandingConfig` (`tenantName`, `logoUrl`, `primaryColor`) as the minimum needed to ship a branded report before this epic existed — this story is the admin UI Epic 13's own Implementation Notes said would come later, extending, not recreating, that model. Add the remaining mockup fields: `secondaryColor String @default("#16273E")`, `accentColor String @default("#C7912B")` (the mockup shows three swatches — Primary/Secondary/Accent — Story 13.1 only seeded `primaryColor`), `registeredAddress String?`, `contactPhone String?`, `gstin String?`. Run `pnpm db:generate`.
- [x] Task 2 — Shared Zod schema (AC: #1, #2)
  - [x] Extend `packages/shared/src/schemas/branding-config.ts` (Story 13.1)'s `updateBrandingConfigSchema` with the new fields (`secondaryColor`/`accentColor` same hex-regex validation as `primaryColor`; `registeredAddress` a longer optional string; `contactPhone` optional string; `gstin` optional string — no format validation on GSTIN beyond length, this product doesn't need to validate India's GST checksum rules to satisfy FR-47).
- [x] Task 3 — `apps/api` (AC: #1)
  - [x] `apps/api/src/reports/branding-config.controller.ts` + `.service.ts` (new files alongside Story 13.1's `reports` module — `BrandingConfig` is read by `ReportCompilerService`, Epic 13, so this lives in the same module rather than a new one). `GET /branding-config` (returns the single seeded row), `PATCH /branding-config`.
  - [x] No "publish" concept anywhere in this service — `update` is a plain `prisma.brandingConfig.update()` against the one existing row, and `ReportCompilerService` (Story 13.1) already reads the current row fresh on every compile run. AC #1's "no separate publish step" is satisfied by there being nothing else to build — don't add a draft/published-version concept that isn't asked for.
  - [x] Logo upload: reuse the existing R2 upload infrastructure from Epic 3 (`apps/api/src/storage/r2-client.ts`, `apps/web/lib/photo-upload.ts`) rather than building a second upload path — the mechanism (presigned URL or direct upload, whichever DSR photos use) is identical, only the destination field (`BrandingConfig.logoUrl` instead of a `Photo` row) differs.
- [x] Task 4 — `apps/web` UI (AC: #1, #2)
  - [x] Replace the stub `apps/web/app/(app)/settings/page.tsx`'s relevant section (this story owns the "Branding" section specifically; Stories 14.2/14.3 add the other sections to the same page) with the real form, matching `17-settings.html`: organisation name, logo dropzone (reusing Epic 3's upload component if one was extracted, else the same underlying upload call inline), three color swatches, registered address, contact phone, GSTIN, and a live "Report Branding Preview" mini-card (mirrors the actual report-preview styling from Epic 13 Story 13.1, using the form's current in-progress values, not the last-saved ones — so the Owner/Admin sees their edit reflected before saving).
- [x] Task 5 — Tests (AC: all)
  - [x] Zod tests for the extended schema.
  - [x] `branding-config.service.spec.ts`: `update` persists correctly; `ReportCompilerService` (extend Story 13.1's test, or add a new integration-style test) picks up an updated `BrandingConfig` value on its very next compile call with no caching/staleness.

## Dev Notes

**This story extends Epic 13 Story 13.1's `BrandingConfig`, it does not create it.** Re-read that story before starting — the model, the seeded-defaults rationale ("not a `Tenant` table, doesn't violate AD-1"), and the report-compiler's read path all already exist. This story's only schema work is adding the fields 13.1 didn't need for its own narrower scope (report generation needing *something* to render) but this story's fuller admin UI does (the mockup's complete field set).

**Reuse Epic 3's R2 upload path for the logo — do not build a second file-upload mechanism.** This is the same "check for existing upload infrastructure before building a one-off" discipline flagged as a risk in Epic 11 Story 11.1 (Expense document upload) — here it's confirmed to exist (`r2-client.ts`, `photo-upload.ts`), so there's no ambiguity to resolve, just reuse.

**Depends on Epic 13 Story 13.1** (`BrandingConfig`, `ReportCompilerService`) and Epic 3 (R2 upload infrastructure).

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7.

### Project Structure Notes

- Extends `infra/prisma/schema.prisma#BrandingConfig` (Story 13.1) and `apps/api/src/reports/` (new `branding-config.controller.ts`/`.service.ts` alongside it).
- `apps/web/app/(app)/settings/page.tsx` already exists as a stub — this story owns its Branding section; Stories 14.2/14.3 add sections to the same page without conflicting (each story's section is visually and functionally independent).

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-14 — Admin Configuration] (FR-47)
- [Source: _bmad-output/planning-artifacts/epics/phase-7-administration/epic-14-tenant-configuration-settings.md]
- [Source: _bmad-output/planning-artifacts/stories/phase-7-administration/epic-14-tenant-configuration-settings/story-14.1-branding-configuration.md]
- [Source: _bmad-output/implementation-artifacts/13-1-auto-compile-deliver-branded-daily-report.md — BrandingConfig's origin and seeded-defaults rationale, this story's direct prerequisite]
- [Source: apps/api/src/storage/r2-client.ts, apps/web/lib/photo-upload.ts — existing upload infrastructure this story reuses]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/17-settings.html — Branding section]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.8 (1M context) (claude-opus-4-8[1m])

### Debug Log References

### Completion Notes List

- **Schema (Task 1) — extends 13.1's `BrandingConfig`, does not recreate it.** Added the five mockup fields to the existing model: `secondaryColor String @default("#16273E")`, `accentColor String @default("#C7912B")` (the two extra swatches — Secondary/Accent — beside 13.1's `primaryColor`), and optional `registeredAddress`/`contactPhone`/`gstin`. The three original fields and the `DailyReport`/`ReportDelivery` models are untouched. Ran `pnpm db:generate` (Prisma client regenerated into `apps/api/src/generated/prisma`).
- **Migration (repo lesson #1 applied first time).** Hand-wrote `infra/prisma/migrations/20260826120000_add_branding_config_fields/migration.sql` (`ALTER TABLE "BrandingConfig" ADD COLUMN ...` for all five, matching Prisma's format and the two precedents). Verified deployability against a throwaway DB (`azentisfieldos_wt_epic14_1`, then dropped): `prisma migrate deploy` replayed every committed migration including this one cleanly, and `\d "BrandingConfig"` confirmed all five new columns exist with the correct types/defaults — no drift vs the schema. The shared local dev DB was left untouched.
- **Shared schema (Task 2, AD-7).** Extended `updateBrandingConfigSchema`: `secondaryColor`/`accentColor` reuse `primaryColor`'s 6-digit-hex regex (factored into a local `hexColor`); `registeredAddress`/`contactPhone`/`gstin` are optional length-bounded strings with NO GSTIN checksum validation (FR-47 doesn't need it). The optional free-text fields (incl. `logoUrl`) are `.nullable().optional()` so the full-replace admin form can clear a field with an explicit `null` — the same pattern `updateVendorSchema` uses. Imported unchanged by both api and web.
- **apps/api (Task 3).** New `apps/api/src/reports/branding-config.controller.ts` + `branding-config.service.ts`, registered in the existing `ReportsModule` (alongside 13.1's compiler — no new module). `GET /branding-config` returns the single seeded row (creates a default row if a fresh DB was never seeded — idempotent singleton). `PATCH /branding-config` is a plain in-place `prisma.brandingConfig.update()` of the one row — **no publish concept**; `ReportCompilerService.getBrandingSnapshot()` already `findFirst()`s the row fresh every compile, so AC #1 is satisfied with nothing else to build. Follows the existing no-auth controller convention (per-request auth is Story 14.2).
- **Logo upload (repo lesson #2 applied — reused Epic 3's R2 path).** No second upload mechanism: added `StorageService.presignBrandingLogoUpload()` that reuses the same `r2Client`/`getSignedUrl` presign as the DSR photo path, only landing the object under a `branding/logo/` key. `POST /branding-config/logo/presign` exposes it; the web client mirrors `photo-upload.ts`'s presign→PUT flow in the new `apps/web/lib/logo-upload.ts`. The only difference vs photos: the returned durable `logoUrl` is stored on `BrandingConfig.logoUrl` via the normal Save PATCH instead of creating a `Photo` row (so no separate confirm endpoint). Added `r2PublicUrl()` in `r2-client.ts` for a durable object URL (a presigned GET would expire, but `logoUrl` is denormalized into every compiled report) — like the rest of the R2 client, never yet run against a real bucket.
- **apps/web (Task 4).** Replaced the stub Branding card in `settings/page.tsx` with a real editable section, leaving the Users & Roles and Category Configuration cards intact for Stories 14.2/14.3 (each section is a self-contained `<Card>`, so later stories slot in without touching this one). New client component `branding-form.tsx`: organisation name, logo dropzone (upload/replace via the reused R2 flow), three colour swatches (native `<input type="color">`, the accessible shared colour primitive), registered address, contact phone, GSTIN, and a live **Report Branding Preview** mini-card that reflects the form's IN-PROGRESS values (not last-saved), mirroring 13.1's branded report header (chosen colours applied as data-driven inline styles, the same exception the report-preview card uses). Renders the full AD-6 state set: saving spinner, inline field errors (validated against the shared schema client-side too), a form-level error alert, and a "Saved" confirmation. Save PATCHes then `router.refresh()` (AC #1 — reflects with no publish step).
- **Shared UI primitive (AD-5).** Added `TextareaField` to `packages/ui`'s `field.tsx` (multiline sibling of `TextField`, same label/error/hint layout) rather than hand-rolling a raw `<textarea>` in the branding form for the registered address — extends the shared field primitive per AD-5.
- **Tests (Task 5).** `branding-config.schema.spec.ts` (Zod: full field set, empty partial, secondary/accent hex validation incl. rejections, null-clearing of optionals, GSTIN accepted without checksum but length-bounded, non-URL logo rejected). `branding-config.service.spec.ts` (getConfig returns/creates the singleton; update persists the extended fields in place; **and the AC #1 no-staleness assertion** — a store-backed harness shared by both services proves `ReportCompilerService.getBrandingSnapshot()` reflects a `BrandingConfigService.update()` on the very next read, no caching). Web `branding-form.test.tsx` (every mockup field seeded from config; live preview reflects in-progress edits; Save PATCHes the shared-schema payload + shows "Saved" + calls `router.refresh`; server error surfaces via an alert, AD-6). `field.test.tsx` extended with `TextareaField` label-association + accessible-error cases.
- **Verification.** `@azentisfieldos/api` typecheck clean; full api suite **637 passed / 51 skipped, 0 failed** (the normally-flaky `dsr`/`consumption` integration specs happened to pass this run — untouched by this diff regardless). `@azentisfieldos/shared` typecheck clean. `@azentisfieldos/web` + `@azentisfieldos/ui` typecheck + lint clean (the AD-4 no-hex-literal rule required building test hex colours from parts). Full web suite **513 passed, 0 failed** (incl. the new branding-form test); full ui suite **91 passed** (incl. the new TextareaField cases). `pnpm --filter @azentisfieldos/web build` compiles with `/settings` as a dynamic route.
- **Left incomplete / risks (consistent with existing epic-wide TODOs).** The R2 logo presign/PUT and the derived public `logoUrl` have never been exercised against a real Cloudflare R2 bucket (same status as Epic 3's photo path and `r2-client.ts` — no `R2_*` creds in any environment yet); in a real deploy `R2_PUBLIC_BASE_URL` must point at the bucket's public/custom domain for `logoUrl` to resolve. The logo is persisted only on Save (part of the form state), matching the mockup's single "Save Branding" button — an uploaded-but-unsaved logo is discarded on navigate-away, which is the intended behaviour, not a bug. No per-request auth guard (Story 14.2's job) — this controller is open like every other one today.

### File List

- `infra/prisma/schema.prisma` (modified — `BrandingConfig` extended with `secondaryColor`/`accentColor`/`registeredAddress`/`contactPhone`/`gstin`)
- `infra/prisma/migrations/20260826120000_add_branding_config_fields/migration.sql` (new — the deployable migration for the five added columns)
- `apps/api/src/generated/prisma/**` (regenerated Prisma client — `pnpm db:generate`)
- `packages/shared/src/schemas/branding-config.ts` (modified — extended `updateBrandingConfigSchema`)
- `apps/api/src/reports/branding-config.controller.ts` (new — `GET`/`PATCH /branding-config`, `POST /branding-config/logo/presign`)
- `apps/api/src/reports/branding-config.service.ts` (new — singleton read + in-place update, no publish concept)
- `apps/api/src/reports/branding-config.schema.spec.ts` (new — Zod tests for the extended schema)
- `apps/api/src/reports/branding-config.service.spec.ts` (new — persistence + the no-staleness compile assertion)
- `apps/api/src/reports/reports.module.ts` (modified — register `BrandingConfigController`/`BrandingConfigService`)
- `apps/api/src/storage/storage.service.ts` (modified — `presignBrandingLogoUpload()` reusing the DSR photo R2 presign path)
- `apps/api/src/storage/r2-client.ts` (modified — `r2PublicUrl()` durable object-URL helper)
- `apps/web/lib/logo-upload.ts` (new — client presign→PUT logo upload, mirrors `photo-upload.ts`)
- `apps/web/app/(app)/settings/page.tsx` (modified — fetch `BrandingConfig`, render the real Branding section; other sections untouched)
- `apps/web/app/(app)/settings/branding-form.tsx` (new — controlled form + live Report Branding Preview)
- `apps/web/app/(app)/settings/branding-form.test.tsx` (new — fields, live preview, save/success, error state)
- `packages/ui/src/components/field.tsx` (modified — new shared `TextareaField` primitive, AD-5)
- `packages/ui/src/components/field.test.tsx` (modified — `TextareaField` cases)

## Suggested Review Order

**Schema + shared contract**

- The five new BrandingConfig fields (extends 13.1's model) + committed migration.
  [`schema.prisma:637`](../../infra/prisma/schema.prisma#L637)
  [`migration.sql:1`](../../infra/prisma/migrations/20260826120000_add_branding_config_fields/migration.sql#L1)

- The shared update schema (AD-7) — nullable+optional so the full-replace form can clear a field.
  [`branding-config.ts:20`](../../packages/shared/src/schemas/branding-config.ts#L20)

**API (no publish concept; R2 reused)**

- Service — plain in-place update of the singleton row; compiler reads it fresh (no staleness).
  [`branding-config.service.ts:1`](../../apps/api/src/reports/branding-config.service.ts#L1)

- Controller — GET/PATCH + logo presign delegating to the reused DSR-photo R2 flow.
  [`branding-config.controller.ts:1`](../../apps/api/src/reports/branding-config.controller.ts#L1)
  [`storage.service.ts:51`](../../apps/api/src/storage/storage.service.ts#L51)

**Web**

- Settings Branding section — editable form + live Report Branding Preview (in-progress values).
  [`branding-form.tsx:1`](../../apps/web/app/(app)/settings/branding-form.tsx#L1)

**Tests** — schema, service no-staleness, form, and the shared TextareaField primitive.
  [`branding-config.service.spec.ts:1`](../../apps/api/src/reports/branding-config.service.spec.ts#L1)
