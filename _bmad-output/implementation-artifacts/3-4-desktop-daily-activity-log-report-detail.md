# Story 3.4: Desktop Daily Activity Log & Report Detail

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want a desktop log of every Site's Daily Site Reports, showing who has and hasn't reported today, with a full read view of any report's detail,
so that I can review field activity across all Sites without opening each Site individually.

## Acceptance Criteria

1. **Given** DSRs have been submitted for some Sites today and not others, **when** I open the Daily Activity log, **then** each Site shows a clear "Submitted" or "Not submitted yet" state for today — a Site with no report today is never a silent blank row.
2. **When** I open a specific report, **then** I see its full detail — work completed, crew, materials, RMC, equipment used, expenses, issues, and the photo grid.
3. **And** every table row that has a report links to it as a real destination; a row with nothing to open carries no link and no false pointer-cursor affordance (the bug caught during earlier UX review — see `EXPERIENCE.md`'s Component Patterns table).

## Tasks / Subtasks

- [ ] Task 0: Scope correction from the original epic wording (no code impact, read before starting)
  - [ ] The epic's original phrasing called for a three-state badge: Synced / Pending sync / Not submitted. On inspection, **"Pending sync" is not something the server can ever observe** — it describes a DSR still sitting in a Site Supervisor's local Dexie queue (Story 3.2), which by definition has not reached the server yet. From this desktop screen's point of view (a query against server data), there are only two real states: a `DailySiteReport` row exists for that Site/date ("Submitted"), or it doesn't ("Not submitted yet"). This story implements the two-state version; do not attempt to fabricate a "pending" state with no real signal behind it.

- [ ] Task 1: Today's status endpoint (AC: #1)
  - [ ] Add `GET /dsr?date=YYYY-MM-DD` to the `dsr` module (built in Story 3.1): returns all `DailySiteReport` rows for that date, each with `site` (`select: { id, name }`), `submittedBy` (`select: { name }`), and lightweight counts (`_count` on `workRecords`, `consumptions`) for the log table's summary column — do not eagerly load full nested detail here, that's Task 2's job for a single report; this endpoint serves a list.
  - [ ] Frontend (Task 3) cross-references this against the full Sites list (`GET /sites`, from Epic 2 Story 2.1) to compute which Sites are missing today's report — the "Not submitted yet" rows are Sites present in one list and absent from the other, not a server-computed flag.

- [ ] Task 2: Report detail endpoint (AC: #2)
  - [ ] Add `GET /dsr/:id` to the `dsr` module: one `DailySiteReport` with `include`: `workRecords` (with `teamMember` name), `consumptions` (with `materialSize`/`material` name), `rmcEntries` (with `vendor` name), `expenses` (with `category` name), `photos`. `equipmentUsed` is already denormalized JSON on the row itself (Story 3.1) — no join needed for it.
  - [ ] 404 if the ID doesn't exist — same `NotFoundException` pattern Story 2.2/2.3 already established for Sites; match it rather than inventing a different error shape for this module.

- [ ] Task 3: Desktop log page (AC: #1, #3)
  - [ ] Create `apps/web/app/daily-activity/page.tsx`: fetch Task 1's endpoint for today plus `GET /sites`, merge per Task 1's cross-reference logic, render one row per Site — reported Sites show submitter/summary and link to `/daily-activity/{dsrId}`; not-yet-reported Sites show the "Not submitted yet" state with **no link** (AC #3 — do not wrap these rows in an `<a>`, and do not apply hover/pointer-cursor styling that implies they're clickable when they aren't; this exact mistake was caught and fixed during this project's UX design phase on an earlier version of this screen's mockup).
  - [ ] A date picker/filter is reasonable to include but not required by the stated ACs — if time-constrained, default to "today" only and note the filter as a follow-up rather than skipping the core row-status/linking behavior to fit one in.

- [ ] Task 4: Report detail page (AC: #2)
  - [ ] Create `apps/web/app/daily-activity/[id]/page.tsx`: render Task 2's full detail — work completed/in-progress/planned text, crew list (from `workRecords`), materials consumed (from `consumptions`), RMC used (from `rmcEntries`), equipment used (from the `equipmentUsed` JSON field directly), expenses, issues/blockers/safety observations, and the photo grid (reuse Story 3.3's gallery tile component if it exists by the time this is picked up, rather than building a second photo-grid implementation).
  - [ ] 404 → Next.js `notFound()`, matching Story 2.3's precedent.

## Dev Notes

- **This story depends on Story 3.1 having shipped** the `dsr` module and its data shape, and benefits from (but does not strictly require) Story 3.3 for the photo grid — if 3.3 hasn't shipped when this is picked up, render photos as a simple list of thumbnails inline rather than blocking this story on 3.3's more polished gallery component.
- Read Epic 2's `sites` module and its stories (2.1–2.3) for the established list/detail/404 conventions this story should match, not diverge from — this is the same product area's second instance of "list + linked detail + explicit no-link empty case" (the first being Story 2.1/2.3's Sites list/detail), so consistency matters more here than most stories.
- No commits exist in this repository yet — no git history to learn from.

### Project Structure Notes

- `apps/api/src/dsr/dsr.controller.ts`, `dsr.service.ts` — UPDATE (Story 3.1's files: add `GET /dsr`, `GET /dsr/:id`).
- `apps/web/app/daily-activity/page.tsx`, `apps/web/app/daily-activity/[id]/page.tsx` — NEW.
- No Prisma schema changes.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-3] — Story 3.4 acceptance criteria (original three-state wording; corrected per Task 0).
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md#Component-Patterns] — "Data table... rows with nothing to open carry no link and no false pointer-cursor affordance" — the exact rule Task 3 implements, and the bug it was written to prevent recurring.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/18-daily-activities.html] — visual/composition reference; note the mockup itself originally had this exact false-affordance bug before being fixed during design review — a useful concrete example of the mistake to avoid.
- [Source: _bmad-output/implementation-artifacts/3-1-submit-a-daily-site-report-mobile.md] — `dsr` module structure and data shape this story queries.
- [Source: _bmad-output/implementation-artifacts/2-3-view-site-detail-chronological-activity-feed.md] — precedent for the list/detail/404 pattern this story matches.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
