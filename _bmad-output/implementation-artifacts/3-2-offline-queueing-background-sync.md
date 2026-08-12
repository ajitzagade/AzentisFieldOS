# Story 3.2: Offline Queueing & Background Sync

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Site Supervisor working with patchy or no signal,
I want my submitted DSR to save on my device immediately and sync automatically once I'm back online,
so that I never lose a report to a dropped connection.

## Acceptance Criteria

1. **Given** I submit a DSR while offline, **when** the submission completes, **then** I see "Saved on device — will sync when back online" (warning tokens + wifi-off icon), unambiguously distinct from a synced state.
2. **Given** connectivity returns, **when** the app detects it, **then** the queued DSR syncs automatically and silently, with no re-entry required, using a per-sub-record idempotency key so a retried sync can never create a duplicate.
3. **And** if two devices submitted conflicting sub-records for the same DSR, the last-synced write wins per sub-record (FR-29) — not per whole-DSR.
4. **Given** I submit a second DSR for the same Site/date before the first has synced, **when** the second submission completes, **then** it's treated as an edit to the still-queued entry (overwrite the local queue item), not a duplicate queue entry — this is the offline counterpart to Story 3.1's online-only "reject a true duplicate" rule (AC #4 there).

## Tasks / Subtasks

- [ ] Task 1: Local-first queue (AC: #1, #4)
  - [ ] Add `dexie` to `apps/web`'s dependencies (no offline storage library exists anywhere in the codebase yet — confirmed by search during story creation). Define a Dexie database (e.g. `apps/web/lib/offline-db.ts`) with one table for queued DSR submissions, keyed by `(siteId, reportDate)` as the **local** dedup key (matching AC #4 — a second local submission for the same Site/date overwrites the queued item, it does not append a second queue entry).
  - [ ] Story 3.1's mobile form (`apps/web/app/dsr/new/page.tsx`) currently calls `POST {API_URL}/dsr` directly and assumes success. Change it: attempt the network call first; on failure (offline, timeout, 5xx), write the full payload to the Dexie queue instead of surfacing an error, and show the "Saved on device — will sync when back online" state (AC #1) rather than a failure state — from the Supervisor's point of view, submitting *never* fails, it just sometimes takes a moment longer to actually land on the server.
  - [ ] Generate a client-side UUID for every sub-record (`consumptions[]`, `rmcEntries[]`, `expenses[]` — the three types with no natural composite unique key, per Dev Notes) at queue-write time, not at sync time — this way, a retried sync (e.g. the app closes and reopens mid-sync) reuses the same keys instead of generating new ones and creating duplicates.

- [ ] Task 2: Sync-key migration and upsert semantics (AC: #2, #3)
  - [ ] Add `clientGeneratedId String? @unique` to **`Consumption`, `RmcEntry`, and `Expense`** only. `WorkRecord` already has `@@unique([teamMemberId, workDate])` and `DailySiteReport` already has `@@unique([siteId, reportDate])` — both are suitable natural upsert keys on their own; adding a redundant `clientGeneratedId` to either would be an unnecessary field carrying the same information the existing constraint already provides. (See Dev Notes for the fuller reasoning — this is a deliberate minimalism, not an oversight.)
  - [ ] In `apps/api/src/dsr/dsr.service.ts` (built in Story 3.1), change the sub-record creation logic from plain `create` to `upsert`:
    - `DailySiteReport`: `upsert({ where: { siteId_reportDate: { siteId, reportDate } }, update: {...fields}, create: {...fields} })`.
    - `WorkRecord`: `upsert({ where: { teamMemberId_workDate: { teamMemberId, workDate } }, update: {...}, create: {...} })`.
    - `Consumption` / `RmcEntry` / `Expense`: `upsert({ where: { clientGeneratedId }, update: {...}, create: { clientGeneratedId, ... } })` — when the client didn't send a `clientGeneratedId` (e.g. a caller not going through the offline queue), fall back to a plain `create`.
  - [ ] This upsert change is what makes AC #2 ("retried sync can never create a duplicate") and AC #3 ("last-synced write wins per sub-record") true — a retried sync with the same keys simply overwrites the same rows again, and two devices racing to sync different edits to the same sub-record both land, with whichever writes last winning, exactly per AD-8's rule. No additional conflict-detection logic is needed beyond the upsert itself.
  - [ ] Update `createDsrSchema` (`packages/shared/src/schemas/daily-site-report.ts`, from Story 3.1) to accept an optional `clientGeneratedId` on each `consumptions[]`/`rmcEntries[]`/`expenses[]` item, and an optional top-level idempotency marker is **not** needed for the DSR/WorkRecord rows since their natural keys already serve that purpose (see Task 2's first bullet).

- [ ] Task 3: Sync trigger and UI state (AC: #1, #2)
  - [ ] Listen for the browser's `online` event (and/or poll periodically as a fallback — mobile browsers don't always fire `online` reliably) to trigger a sync attempt: drain the Dexie queue, POST each queued DSR payload, remove it from the queue on success.
  - [ ] Sync is silent on success (AC #2: "no re-entry required" — no confirmation dialog, no navigation change). On repeated failure, leave the item queued and retry on the next trigger; do not surface a failure to the user for a queued item still waiting for connectivity — that would contradict "submitting never fails" from Task 1.
  - [ ] Once an item syncs, any UI still showing it (e.g. if the Supervisor reopens the app before navigating away) should reflect "Synced" (success tokens + check-circle icon) instead of the pending state — this likely means the DSR entry form / a lightweight "recent submissions" list needs to read current queue state from Dexie, not just fire-and-forget.

## Dev Notes

- **This story depends on Story 3.1 having shipped** the `dsr` module, `createDsrSchema`, and the mobile entry form. Read Story 3.1's actual File List/Completion Notes before starting — this story modifies files 3.1 created, not files described from scratch here.
- **Why only `Consumption`/`RmcEntry`/`Expense` get a new `clientGeneratedId`, not all four sub-record types:** `DailySiteReport` and `WorkRecord` each already have a natural composite unique constraint (`(siteId, reportDate)` and `(teamMemberId, workDate)` respectively) that already uniquely identifies "this specific record" independent of *how* it was created. Upserting on those existing keys gets idempotent-retry-safety for free. `Consumption`, `RmcEntry`, and `Expense` have no such natural key — a Site can legitimately have two separate Consumption entries for the same Material on the same day (e.g. materials used for two different activities), so nothing about their own field values inherently identifies "this is a retry of the same queue item" versus "this is a genuinely new second entry." That's exactly what a client-generated idempotency key is for, and exactly why the other two don't need one. Adding one everywhere "for consistency" would be scope creep past what AD-8 actually requires.
- **AD-8's exact rule, quoted for reference:** "the idempotency key is per sub-record, not per DSR — a DSR is a compound object assembled from many independently-syncing pieces, each queued and synced as its own unit with its own client-generated key; the API upserts on that key, so a retried sync can never create a duplicate... conflict only exists at the sub-record level, and the rule there is last-synced-write-wins per sub-record, never a whole-DSR overwrite." This story's design (Task 2) implements this literally.
- **Photo sync is explicitly out of scope here too** — same reasoning as Story 3.1 (no R2 upload wiring exists yet; that's Story 3.3). Queuing photo *metadata* offline without anywhere to actually upload the bytes would be incomplete work; leave photos as the visual-only placeholder Story 3.1 left them as.
- No commits exist in this repository yet — no git history to learn from.

### Project Structure Notes

- `apps/web/package.json` — UPDATE (add `dexie`).
- `apps/web/lib/offline-db.ts` — NEW.
- `apps/web/app/dsr/new/page.tsx` — UPDATE (Story 3.1's file: add offline-fallback submit logic).
- `infra/prisma/schema.prisma` — UPDATE (`clientGeneratedId` on `Consumption`, `RmcEntry`, `Expense`) + new migration.
- `packages/shared/src/schemas/daily-site-report.ts` — UPDATE (Story 3.1's file: optional `clientGeneratedId` per sub-record item).
- `apps/api/src/dsr/dsr.service.ts` — UPDATE (Story 3.1's file: `create` → `upsert`).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-3] — Story 3.2 acceptance criteria (verbatim source).
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-8] — the binding rule this entire story implements; quoted in full above.
- [Source: _bmad-output/implementation-artifacts/3-1-submit-a-daily-site-report-mobile.md] — previous story in this epic; this story extends its schema, service, and form rather than rebuilding them.
- [Source: infra/prisma/schema.prisma] — confirms `WorkRecord`'s and `DailySiteReport`'s existing unique constraints, and the absence of any equivalent on `Consumption`/`RmcEntry`/`Expense`.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
