# Story 14.1: Branding Configuration

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to configure my company's branding (name, logo, address, contact, GST, colors, report branding),
so that every generated report carries my own business's identity, not a generic default.

## Acceptance Criteria

1. **Given** I update the Tenant's branding configuration, **when** I save, **then** the change reflects in the next generated report automatically, with no separate publish step. (FR-47)
2. Every field the mockup's Branding section shows (organisation name, logo, brand colors, registered address, contact phone, GSTIN) is editable here — not just the subset Epic 13 Story 13.1 seeded minimally to unblock report generation.

## Tasks / Subtasks

- [ ] Task 1 — Schema extension (AC: #2)
  - [ ] Epic 13 Story 13.1 already created `BrandingConfig` (`tenantName`, `logoUrl`, `primaryColor`) as the minimum needed to ship a branded report before this epic existed — this story is the admin UI Epic 13's own Implementation Notes said would come later, extending, not recreating, that model. Add the remaining mockup fields: `secondaryColor String @default("#16273E")`, `accentColor String @default("#C7912B")` (the mockup shows three swatches — Primary/Secondary/Accent — Story 13.1 only seeded `primaryColor`), `registeredAddress String?`, `contactPhone String?`, `gstin String?`. Run `pnpm db:generate`.
- [ ] Task 2 — Shared Zod schema (AC: #1, #2)
  - [ ] Extend `packages/shared/src/schemas/branding-config.ts` (Story 13.1)'s `updateBrandingConfigSchema` with the new fields (`secondaryColor`/`accentColor` same hex-regex validation as `primaryColor`; `registeredAddress` a longer optional string; `contactPhone` optional string; `gstin` optional string — no format validation on GSTIN beyond length, this product doesn't need to validate India's GST checksum rules to satisfy FR-47).
- [ ] Task 3 — `apps/api` (AC: #1)
  - [ ] `apps/api/src/reports/branding-config.controller.ts` + `.service.ts` (new files alongside Story 13.1's `reports` module — `BrandingConfig` is read by `ReportCompilerService`, Epic 13, so this lives in the same module rather than a new one). `GET /branding-config` (returns the single seeded row), `PATCH /branding-config`.
  - [ ] No "publish" concept anywhere in this service — `update` is a plain `prisma.brandingConfig.update()` against the one existing row, and `ReportCompilerService` (Story 13.1) already reads the current row fresh on every compile run. AC #1's "no separate publish step" is satisfied by there being nothing else to build — don't add a draft/published-version concept that isn't asked for.
  - [ ] Logo upload: reuse the existing R2 upload infrastructure from Epic 3 (`apps/api/src/storage/r2-client.ts`, `apps/web/lib/photo-upload.ts`) rather than building a second upload path — the mechanism (presigned URL or direct upload, whichever DSR photos use) is identical, only the destination field (`BrandingConfig.logoUrl` instead of a `Photo` row) differs.
- [ ] Task 4 — `apps/web` UI (AC: #1, #2)
  - [ ] Replace the stub `apps/web/app/(app)/settings/page.tsx`'s relevant section (this story owns the "Branding" section specifically; Stories 14.2/14.3 add the other sections to the same page) with the real form, matching `17-settings.html`: organisation name, logo dropzone (reusing Epic 3's upload component if one was extracted, else the same underlying upload call inline), three color swatches, registered address, contact phone, GSTIN, and a live "Report Branding Preview" mini-card (mirrors the actual report-preview styling from Epic 13 Story 13.1, using the form's current in-progress values, not the last-saved ones — so the Owner/Admin sees their edit reflected before saving).
- [ ] Task 5 — Tests (AC: all)
  - [ ] Zod tests for the extended schema.
  - [ ] `branding-config.service.spec.ts`: `update` persists correctly; `ReportCompilerService` (extend Story 13.1's test, or add a new integration-style test) picks up an updated `BrandingConfig` value on its very next compile call with no caching/staleness.

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
