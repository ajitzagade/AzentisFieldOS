# Story 3.3: Chronological Site Photo Gallery

Status: ready-for-dev

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

- [ ] Task 1: R2 client + presigned upload endpoint (AC: #3, #4)
  - [ ] Add `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `apps/api`'s dependencies — no R2/S3 SDK exists anywhere in the codebase yet (confirmed by search during story creation; `infra/provisioning/provision.ts` has only a `// TODO: Cloudflare R2 API` comment, no actual client).
  - [ ] Add `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` to `.env.example` (server-only — these must never reach `apps/web`; they belong to `apps/api` alone, consistent with AD-3's API-owns-data-access boundary).
  - [ ] Create `apps/api/src/storage/r2-client.ts`: an `S3Client` configured with `region: "auto"` and `endpoint: https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` (confirmed current Cloudflare R2 practice via web research during story creation — R2 is S3-API-compatible, so the standard AWS SDK v3 works against it directly; no R2-specific SDK is needed).
  - [ ] Add `POST /photos/presign` to a new `apps/api/src/storage/` (or `photos/`) module: accepts `{ dailySiteReportId }`, generates a `storageKey` (e.g. `dsr/{dailySiteReportId}/{uuid}.jpg`), returns a presigned `PutObjectCommand` URL (via `getSignedUrl`, `expiresIn: 3600`) plus the `storageKey` the client must report back after upload.

- [ ] Task 2: Confirm-upload endpoint (AC: #1, #3)
  - [ ] Add `POST /photos`: accepts `{ dailySiteReportId, storageKey }`, validates the `DailySiteReport` exists, creates the `Photo` row (`uploadedByUserId` from the authenticated request — see Dev Notes on the current absence of auth wiring). This is the point at which a photo becomes "attached" to a DSR in the database — the presign step (Task 1) only grants upload permission, it does not itself record anything.
  - [ ] Zod schema for this body lives in `packages/shared/src/schemas/` alongside the DSR schema from Story 3.1, per AD-7.

- [ ] Task 3: Wire the mobile capture flow (AC: #3, #4)
  - [ ] In `apps/web/app/dsr/new/page.tsx` (Story 3.1's file), replace the visual-only photo placeholder: on capture/select, call `POST {API_URL}/photos/presign`, `PUT` the file directly to the returned R2 URL from the browser (`fetch(presignedUrl, { method: 'PUT', body: file })` — not through `apps/api`), then call `POST {API_URL}/photos` to confirm. Show per-photo upload progress/failure state (a failed upload should be retryable, not silently dropped — this is the one piece of "photo upload" that genuinely can fail even when the rest of the DSR submits fine, since it's a separate larger request).
  - [ ] Story 3.2's offline queue (if implemented first) queues the *DSR payload*, not photo bytes — a queued-offline DSR's photos should attempt upload once connectivity returns, same as the rest of the sync. If Story 3.2 hasn't shipped yet when this story is picked up, implement this story's upload flow for the online case only and note the offline-photo interaction as a follow-up in Completion Notes rather than guessing at unbuilt behavior.

- [ ] Task 4: Gallery view (AC: #1, #2)
  - [ ] Add `GET /sites/:id/photos` to the `sites` module (or a query on the `dsr`/`photos` module — either is defensible; picking `sites` keeps it consistent with Story 2.3's precedent of Site-scoped aggregation endpoints living on the `sites` controller). Query: all `Photo` rows where the parent `DailySiteReport.siteId` matches, `include`-ing `dailySiteReport` (for date) and `uploadedBy` (for uploader name), ordered by `dailySiteReport.reportDate` descending, then `createdAt` descending within a date.
  - [ ] Photo URLs for display: R2 objects need a way to be *read*, not just written. If the bucket is configured for public read (simplest) or fronted by a Cloudflare public bucket URL/custom domain, construct the display URL from `storageKey` directly; if the bucket is private, generate a presigned **GET** URL per photo instead (same `getSignedUrl` mechanism as Task 1, `GetObjectCommand` instead of `PutObjectCommand`). This is an infrastructure/provisioning decision (`infra/provisioning`) as much as a code one — check whether the R2 bucket's access mode has been decided elsewhere by the time this story is picked up; if not, default to presigned GET URLs (works regardless of bucket visibility, strictly more correct even if slightly more code) rather than assuming public access.
  - [ ] Create `apps/web/app/sites/[id]/photos/page.tsx`: a responsive grid, each tile showing the photo, its date, and uploader on hover/tap. Empty state (AC #2): centered icon + "No photos yet for this Site."

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

### Completion Notes List

### File List
