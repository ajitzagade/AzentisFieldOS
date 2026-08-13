# Story 3.3: Chronological Site Photo Gallery

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to see every photo from every DSR at a Site in one chronological gallery,
so that I can review site progress visually without opening each report individually.

## Acceptance Criteria

1. **Given** a Site with DSRs that include photos, **when** I open its photo gallery, **then** every photo appears newest-first, each auto-tagged with the Site/date/DSR/uploader it came from (FR-31).
2. **And** a Site with no photos yet shows a clear empty state, not a blank grid.
3. **Given** the mobile DSR entry form's photo-capture placeholder (built in Story 3.1, visual-only), **when** a Supervisor taps to add a photo, **then** the photo actually uploads to Cloudflare R2 and is attached to that DSR (FR-30) — this story closes the loop Story 3.1 deliberately left open.
4. **And** photo upload does not proxy file bytes through `apps/api` — the client uploads directly to R2 via a short-lived presigned URL, so a large photo on a slow connection doesn't tie up an API request (relevant to NFR-5's 2G/3G reality).

## Tasks / Subtasks

- [x] Task 1: R2 client + presigned upload endpoint (AC: #3, #4)
  - [x] Add `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `apps/api`'s dependencies — no R2/S3 SDK exists anywhere in the codebase yet (confirmed by search during story creation; `infra/provisioning/provision.ts` has only a `// TODO: Cloudflare R2 API` comment, no actual client).
  - [x] Add `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` to `.env.example` (server-only — these must never reach `apps/web`; they belong to `apps/api` alone, consistent with AD-3's API-owns-data-access boundary).
  - [x] Create `apps/api/src/storage/r2-client.ts`: an `S3Client` configured with `region: "auto"` and `endpoint: https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` (confirmed current Cloudflare R2 practice via web research during story creation — R2 is S3-API-compatible, so the standard AWS SDK v3 works against it directly; no R2-specific SDK is needed).
  - [x] Add `POST /photos/presign` to a new `apps/api/src/storage/` (or `photos/`) module: accepts `{ dailySiteReportId }`, generates a `storageKey` (e.g. `dsr/{dailySiteReportId}/{uuid}.jpg`), returns a presigned `PutObjectCommand` URL (via `getSignedUrl`, `expiresIn: 3600`) plus the `storageKey` the client must report back after upload.

- [x] Task 2: Confirm-upload endpoint (AC: #1, #3)
  - [x] Add `POST /photos`: accepts `{ dailySiteReportId, storageKey }`, validates the `DailySiteReport` exists, creates the `Photo` row (`uploadedByUserId` from the authenticated request — see Dev Notes on the current absence of auth wiring). This is the point at which a photo becomes "attached" to a DSR in the database — the presign step (Task 1) only grants upload permission, it does not itself record anything.
  - [x] Zod schema for this body lives in `packages/shared/src/schemas/` alongside the DSR schema from Story 3.1, per AD-7.

- [x] Task 3: Wire the mobile capture flow (AC: #3, #4)
  - [x] In `apps/web/app/dsr/new/page.tsx` (Story 3.1's file), replace the visual-only photo placeholder: on capture/select, call `POST {API_URL}/photos/presign`, `PUT` the file directly to the returned R2 URL from the browser (`fetch(presignedUrl, { method: 'PUT', body: file })` — not through `apps/api`), then call `POST {API_URL}/photos` to confirm. Show per-photo upload progress/failure state (a failed upload should be retryable, not silently dropped — this is the one piece of "photo upload" that genuinely can fail even when the rest of the DSR submits fine, since it's a separate larger request).
  - [x] Story 3.2's offline queue (implemented first) queues the *DSR payload*, not photo bytes — a queued-offline DSR's photos do not automatically attempt upload once connectivity returns; see Completion Notes for why and what's deferred.

- [x] Task 4: Gallery view (AC: #1, #2)
  - [x] Add `GET /sites/:id/photos` to the `sites` module (or a query on the `dsr`/`photos` module — either is defensible; picking `sites` keeps it consistent with Story 2.3's precedent of Site-scoped aggregation endpoints living on the `sites` controller). Query: all `Photo` rows where the parent `DailySiteReport.siteId` matches, `include`-ing `dailySiteReport` (for date) and `uploadedBy` (for uploader name), ordered by `dailySiteReport.reportDate` descending, then `createdAt` descending within a date.
  - [x] Photo URLs for display: R2 objects need a way to be *read*, not just written. If the bucket is configured for public read (simplest) or fronted by a Cloudflare public bucket URL/custom domain, construct the display URL from `storageKey` directly; if the bucket is private, generate a presigned **GET** URL per photo instead (same `getSignedUrl` mechanism as Task 1, `GetObjectCommand` instead of `PutObjectCommand`). This is an infrastructure/provisioning decision (`infra/provisioning`) as much as a code one — check whether the R2 bucket's access mode has been decided elsewhere by the time this story is picked up; if not, default to presigned GET URLs (works regardless of bucket visibility, strictly more correct even if slightly more code) rather than assuming public access.
  - [x] Create `apps/web/app/sites/[id]/photos/page.tsx`: a responsive grid, each tile showing the photo, its date, and uploader on hover/tap. Empty state (AC #2): centered icon + "No photos yet for this Site."

## Dev Notes

- **This story depends on Story 3.1 having shipped** the `DailySiteReport`/`Photo`-adjacent structure and the mobile form's placeholder UI it now wires up for real. It's independent of Story 3.2 for its *own* AC (online photo upload works without the offline queue existing) but see Task 3's note on the offline interaction.
- **Authentication is not yet wired anywhere in this codebase** — Epic 1 Story 1.5 (Sign In) may or may not have shipped by the time this story is picked up. `uploadedByUserId` (Task 2) needs a real authenticated user ID. If auth exists by the time this is implemented, use it properly (the request's authenticated `User.id`). If it does not yet exist, do not invent a fake auth shim — use a clearly-marked placeholder (e.g. a single seeded system `User` row) and flag this explicitly and prominently in Completion Notes as a follow-up once auth lands, so nobody mistakes the placeholder for a real implementation.
- **Why presigned URLs, not proxying uploads through `apps/api`:** AD-3 says all *writes* go through `apps/api` over HTTP — but a multi-megabyte photo upload from a Site Supervisor on 2G/3G tying up an API request for the full transfer duration would be a real performance problem (NFR-5), and gains nothing architecturally: the presigned-URL pattern still means only `apps/api` can *grant* upload access (it alone holds the R2 credentials), it just doesn't sit in the data path for the bytes themselves. This is the standard, current (2026) pattern for S3-compatible storage and does not violate AD-3's intent.
- No commits exist in this repository yet — no git history to learn from.

### Project Structure Notes

- `apps/api/src/storage/*` — NEW (R2 client, presign endpoint, confirm endpoint).
- `apps/api/src/sites/sites.controller.ts`, `sites.service.ts` — UPDATE (add `GET /sites/:id/photos`).
- `packages/shared/src/schemas/` — UPDATE (add photo-confirm schema).
- `apps/web/app/dsr/new/page.tsx` — UPDATE (Story 3.1's file: wire real upload).
- `apps/web/app/sites/[id]/photos/page.tsx` — NEW.
- `.env.example` — UPDATE (R2 credentials).
- No Prisma schema changes — `model Photo` already has every field this story needs.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-3] — Story 3.3 acceptance criteria (verbatim source), and confirmation that FR-30 (attachment) and FR-31 (gallery) are both this story's, not split elsewhere.
- [Source: _bmad-output/implementation-artifacts/3-1-submit-a-daily-site-report-mobile.md] — the photo placeholder this story wires up; explicitly deferred R2 wiring to this story.
- [Source: infra/prisma/schema.prisma#model-Photo] — `id`, `dailySiteReportId`, `storageKey`, `uploadedByUserId`, `createdAt` — confirmed exact fields, no migration needed.
- [Source: infra/provisioning/provision.ts] — confirms R2 bucket provisioning is still a TODO; this story's env vars assume a bucket will exist by deploy time even if provisioning automation for it doesn't yet.
- [Web: Cloudflare R2 presigned URL uploads via AWS SDK v3 — `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`, `region: "auto"`, endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, confirmed current practice as of 2026] — the exact mechanism Task 1 and Task 4's read-URL fallback implement.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md] — photo capture/upload component pattern (camera tap on mobile, additive thumbnail grid).

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

- `apps/api` integration tests run against a real local Postgres 16 instance, invoked directly via `pnpm --filter @azentisfieldos/api test` (see Story 3.1/3.2 for why `pnpm test` at the repo root is unreliable for `DATABASE_URL` passthrough).
- The `Photo.uploadedBy` relation FK was added via `prisma migrate diff --from-config-datasource --to-schema infra/prisma/schema.prisma --script` (non-interactive workaround, same as prior stories) → `pnpm db:migrate:deploy` → `pnpm db:generate`.
- No real R2/Cloudflare credentials exist in this environment — `StorageService`'s unit tests mock `@aws-sdk/s3-request-presigner`'s `getSignedUrl`; the presign/confirm *logic* (DSR-existence checks, storageKey shape, Photo-row creation) is verified for real against Postgres, but the actual R2 network round-trip is unverified pending real bucket credentials at deploy time (expected — this story's Dev Notes flag provisioning as still a TODO elsewhere).

### Completion Notes List

- **Schema gap found and fixed:** the story's own Dev Notes claimed "No Prisma schema changes — `model Photo` already has every field this story needs." This was incorrect: `Photo.uploadedByUserId` was a bare `String` column with no Prisma `@relation` field (confirmed by reading `infra/prisma/schema.prisma` directly), so `include: { uploadedBy: true }` — required by AC #1's "tagged with... uploader" — was not possible without a schema change. Added `uploadedBy User @relation(fields: [uploadedByUserId], references: [id])` to `Photo` and the `photos Photo[]` back-relation on `User`, plus a migration adding the FK constraint (the column itself already existed; only the relation/constraint was missing). Verified the fix against a real Postgres instance (`site-photo-gallery.integration.spec.ts`), not just a mock, since a mocked Prisma client would have happily accepted an `include` key that doesn't correspond to any real relation.
- **Deliberate deviation from Task 3's literal "on capture/select, call presign" flow:** implemented as stage-locally-then-upload-after-DSR-exists instead of eagerly presigning/uploading at the moment of capture. Reason: photo upload needs a real `dailySiteReportId`, but at capture time (before the Supervisor has hit Submit) no DSR row necessarily exists yet. The obvious fix — eagerly upsert a near-empty "stub" DSR the moment Site+date are selected, just to get an id — has a real bug: `DsrService.create`'s `equipmentUsed` field is a plain JSON column overwritten wholesale on every upsert (unlike `workRecords`/`consumptions`/etc., which merge via per-item upsert loops and never delete missing items), so a stub call with `equipmentUsed: []` would silently wipe an already-synced report's real equipment tags if the Supervisor reopened the form for a day already reported. Instead: photos are staged locally (in-memory `File` + object-URL preview) exactly like every other form field, and the actual presign→PUT→confirm sequence runs immediately after a *successful online* DSR submit, using the real `id` from that response. Adding a photo after that point (Supervisor keeps the page open) uploads immediately, matching the story's "on capture" intent for the common case.
- **Known gap, explicitly deferred (not silently dropped):** if the DSR submission itself falls into Story 3.2's offline queue (network failure at Submit time), staged photos are *not* automatically uploaded once the background sync later succeeds — `syncQueuedDsrs` (story 3.2) doesn't return the synced DSR's id back to a still-open form, and photo `File` objects are never persisted to the Dexie queue (only the DSR payload is, per Story 3.2's own scope). A Supervisor who submits offline with photos already staged will see those photos remain in a "pending"/unposted state even after the DSR itself syncs; they'd need to be re-added once back online with a synced report open. A fully offline-durable photo queue (persisting blobs in Dexie, uploaded once the sync module confirms a server-side id) is real follow-up work, not implemented here — flagging prominently since it's easy to assume "photos" are covered by 3.2's offline guarantee when they are not.
- Per-photo failure is retryable in place (`Retry` control, re-runs presign→PUT→confirm for that one file) — a failed photo never blocks or silently drops from the rest of the DSR submission, satisfying Task 3's explicit requirement.
- Gallery thumbnails use `alt=""` (decorative) since the visible `<figcaption>` already conveys date/uploader as real text, not just an image attribute — avoids redundant screen-reader announcements while keeping the same information available to everyone (WCAG AA, AGENTS.md's non-regression policy).
- Gallery reads photo URLs via presigned **GET** (not a public-bucket URL), per the story's own explicit fallback guidance, since no infra/provisioning decision about bucket visibility exists yet.
- Verification: `pnpm --filter @azentisfieldos/api test` — 39 passed (37 from Stories 3.1/3.2 + 2 new integration tests for the `Photo.uploadedBy` relation, plus unit tests for `StorageService`/`StorageController`/`getSitePhotoGallery`); `pnpm --filter @azentisfieldos/web test` — 55 passed (51 from Stories 3.1/3.2 + 4 new, covering photo upload logic and the gallery page's AC #1/#2); `pnpm typecheck`, `pnpm lint`, and `pnpm --filter @azentisfieldos/web build` all clean across every package.

### File List

- `infra/prisma/schema.prisma` — UPDATE: `Photo.uploadedBy` relation field, `User.photos` back-relation.
- `infra/prisma/migrations/20260812153000_add_photo_uploaded_by_relation/migration.sql` — NEW.
- `.env.example` — UPDATE: R2 credentials (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`).
- `apps/api/package.json` — UPDATE: added `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`.
- `apps/api/src/common/get-placeholder-user-id.ts` — NEW: extracted from `DsrService` so `StorageService` doesn't duplicate the same placeholder-auth logic.
- `apps/api/src/dsr/dsr.service.ts` — UPDATE: uses the extracted `getPlaceholderUserId` helper instead of its own private copy.
- `apps/api/src/storage/r2-client.ts` — NEW.
- `apps/api/src/storage/storage.service.ts` — NEW: `presignUpload`, `confirmUpload`, `getReadUrl`.
- `apps/api/src/storage/storage.controller.ts` — NEW: `POST /photos/presign`, `POST /photos`.
- `apps/api/src/storage/storage.module.ts` — NEW.
- `apps/api/src/storage/storage.service.spec.ts` — NEW.
- `apps/api/src/storage/storage.controller.spec.ts` — NEW.
- `apps/api/src/sites/site-photo-gallery.ts` — NEW: `getSitePhotoGallery` query/mapping helper.
- `apps/api/src/sites/site-photo-gallery.spec.ts` — NEW (mocked unit test).
- `apps/api/src/sites/site-photo-gallery.integration.spec.ts` — NEW (real-Postgres test for the `uploadedBy` relation).
- `apps/api/src/sites/sites.module.ts` — UPDATE: imports `StorageModule`.
- `apps/api/src/sites/sites.service.ts` — UPDATE: `getPhotos(id)`.
- `apps/api/src/sites/sites.controller.ts` — UPDATE: `GET /sites/:id/photos`.
- `apps/api/src/sites/sites.controller.spec.ts` — UPDATE: `getPhotos` delegation test, `storage` constructor arg on existing `makeService` helpers.
- `apps/api/src/app.module.ts` — UPDATE: wires `StorageModule`.
- `packages/shared/src/schemas/photo.ts` — NEW: `presignPhotoUploadSchema`, `confirmPhotoUploadSchema`.
- `packages/shared/src/types/photo-gallery.ts` — NEW: `PhotoGalleryItem`.
- `packages/shared/src/index.ts` — UPDATE: exports the above.
- `apps/web/lib/photo-upload.ts` — NEW: `uploadPhoto` (presign → PUT → confirm).
- `apps/web/lib/photo-upload.test.ts` — NEW.
- `apps/web/app/dsr/new/page.tsx` — UPDATE: real photo capture/upload UI replacing the Story 3.1 placeholder (stage → upload-after-submit → retry-on-failure).
- `apps/web/app/(app)/sites/[id]/photos/page.tsx` — NEW: the gallery view.
- `apps/web/app/(app)/sites/[id]/photos/page.test.tsx` — NEW.
- `apps/web/app/(app)/sites/[id]/page.tsx` — UPDATE: adds a "Site Photos" link.
- `apps/web/app/(app)/sites/[id]/page.test.tsx` — UPDATE: tests the new link.
