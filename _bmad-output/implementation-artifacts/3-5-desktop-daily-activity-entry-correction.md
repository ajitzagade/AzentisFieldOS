# Story 3.5: Desktop Daily Activity Entry & Correction

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to create a new Daily Activity entry or file a correction on an already-synced one from my desktop,
so that I'm not limited to the mobile flow, and mistakes get fixed the right way — a new linked entry, not a silent edit.

## Acceptance Criteria

1. **Given** I open "New Daily Activity" from the desktop log, **when** I fill in and submit the same fields as the mobile flow (Site, date, work, crew, materials, RMC, equipment used, expenses/issues, photos), **then** a new DSR is created exactly as if submitted from the field — it reuses Story 3.1's endpoint, not a parallel one.
2. **Given** I click "Correct" on an already-synced report, **when** the entry form opens, **then** a correction banner explains this creates a new linked entry, a reason field is required, and the original report is never edited or deleted (AD-9, FR-54).
3. **And** the desktop photo field is a drag-drop dropzone (vs. mobile's camera tap) — same underlying upload flow from Story 3.3, platform-appropriate input method only.
4. **And** submitting a correction succeeds even though a `DailySiteReport` already exists for that Site/date — this is the one case where the "one DSR per Site/date" rule (Story 3.1, AC #4) does not apply, because a correction is explicitly a second, linked row for that same Site/date, not a duplicate.

## Tasks / Subtasks

- [ ] Task 1: Correction schema migration (AC: #2, #4)
  - [ ] Add `correctsId String?` and `reason String?` to `DailySiteReport`, mirroring the exact pattern `Purchase`/`Movement`/`Consumption` already use elsewhere in this schema. Add a self-relation if the Prisma/query patterns elsewhere in this codebase use one for `correctsId` fields (check how `Movement.correctsId` is modeled — plain `String?` with no enforced relation, per the schema read during Story 3.1's creation — match that precedent rather than introducing a stricter self-relation pattern nothing else in the codebase uses).
  - [ ] Change `DailySiteReport`'s `@@unique([siteId, reportDate])` to `@@index([siteId, reportDate])` — a non-unique index (keeps the same query performance for "find the DSR(s) for this Site/date" lookups) instead of a hard constraint, since a correction is a legitimate second row for the same Site/date. **This is the change Story 3.1 explicitly flagged as deferred to this story — do not treat it as an unplanned schema change.**
  - [ ] Run `pnpm db:migrate:dev`.

- [ ] Task 2: Enforce "one *original* DSR per Site/date" at the application level (AC: #4)
  - [ ] Now that the DB no longer enforces this, `apps/api/src/dsr/dsr.service.ts`'s create path (Story 3.1/3.2) must do it in code: before inserting a **non-correcting** `DailySiteReport` (`correctsId` is null/absent), query for an existing row with the same `siteId`+`reportDate` and **no** `correctsId` pointing away from it being superseded (see Task 3's "current version" note) — if found, reject with the same `ConflictException` Story 3.1 already throws for this case. A **correcting** create (`correctsId` present) skips this check entirely — it is expected to coexist with the row it corrects.
  - [ ] Add `POST /dsr/:id/correct` to the `dsr` controller/service: accepts the same body shape as `POST /dsr` (Story 3.1's `createDsrSchema`) plus a required `reason: z.string().min(1)`, sets `correctsId` to the `:id` param, and — critically — creates its **own fresh** nested sub-records (`workRecords`, `consumptions`, `rmcEntries`, `expenses`) rather than modifying the original DSR's. The original `DailySiteReport` row and all its nested rows are never touched (AD-9's non-negotiable rule).

- [ ] Task 3: "Current version" resolution for display (AC: #2)
  - [ ] A Site/date can now have a chain of DSR rows (original → correction → correction...). For Story 3.4's log/detail screens to show the *right* one by default, add a query helper (e.g. `findCurrentForSiteAndDate(siteId, date)`) that returns the row in the chain nothing else's `correctsId` points to (the tip). Update Story 3.4's `GET /dsr?date=` to use this helper so the log shows one row per Site/date, not one per DSR row.
  - [ ] On the detail page (Story 3.4), if a report has since been corrected (something's `correctsId` points at it), show a small banner: "This report was corrected — view the latest version," linking to the correction. This is a real UX need this story surfaces but Story 3.4 built before this story existed — go back and add it to Story 3.4's detail page rather than duplicating a second detail-page implementation here.
  - [ ] **Known open item, not required for this story's AC but worth flagging for whoever builds Epic 13 (Reports):** this story deliberately does not reconcile aggregate totals (e.g. "total Consumption for this Site today") across an original DSR and its correction — the correction's nested rows sit alongside the original's, not replacing them in any aggregate. Whether Epic 13's reporting should sum both or only the current version's is a real design question for that epic, not this one. Note it in Completion Notes so it isn't lost.

- [ ] Task 4: Desktop entry/correction form (AC: #1, #2, #3)
  - [ ] Create `apps/web/app/daily-activity/new/page.tsx` — same field set as Story 3.1's mobile form (Site picker, date, work, crew, materials, RMC, equipment used, expenses/issues), submitting to `POST {API_URL}/dsr` (AC #1 — this is literally Story 3.1's endpoint with a desktop-shaped form in front of it, not a new endpoint).
  - [ ] Create `apps/web/app/daily-activity/[id]/correct/page.tsx` — pre-fills from the original report's current values (`GET /dsr/:id`, Story 3.4), shows the correction banner (AC #2) with a required reason field, submits to `POST {API_URL}/dsr/{id}/correct` (Task 2).
  - [ ] Photo field: drag-drop dropzone (`<input type="file" multiple>` + drag-and-drop handlers), same presign→upload→confirm flow as Story 3.3's mobile camera-tap flow — same underlying `POST /photos/presign` / `POST /photos` calls, different input affordance only. Do not build a second upload mechanism.
  - [ ] Wire the "Correct" button on Story 3.4's detail page (currently, per that story, a read-only view with no action) to link to this story's `.../correct` page.

- [ ] Task 5: Tests (AC: #2, #4)
  - [ ] `apps/api/src/dsr/dsr.controller.spec.ts` (extend the file from Story 3.1/3.2): assert a correcting create succeeds against a Site/date that already has a DSR; assert a second **non-correcting** create for the same Site/date still fails; assert `correctsId`/`reason` persist correctly.

## Dev Notes

- **This story depends on Stories 3.1, 3.3, and 3.4 having shipped.** It reuses 3.1's endpoint and schema, 3.3's photo upload flow, and modifies 3.4's detail page to add the "Correct" entry point and the corrected-report banner. Read all three's actual File Lists before starting — this story's Task 3 in particular assumes specific shapes from 3.4 that may have evolved during that story's real implementation.
- **This is the story that resolves the deferred schema decision from Story 3.1's Dev Notes** — re-read that story's note on the `@@unique([siteId, reportDate])` constraint before starting Task 1; it explains why the constraint existed in the first place and what this story is allowed to change about it (the constraint itself) versus what it must not change (the underlying "no true duplicates" rule, which moves to application-level enforcement instead).
- **Why the correction gets fresh nested rows instead of somehow "diffing" against the original:** matches how every other correction pattern in this codebase works (`Purchase`, `Movement`, `Consumption` — a correction is always a complete new row, never a partial patch) and avoids inventing a bespoke diff/merge mechanism that would be unique to DSRs. Simpler, more consistent, and the aggregate-totals question this raises is explicitly deferred (Task 3's open item) rather than solved with a more complex mechanism nobody asked for.
- No commits exist in this repository yet — no git history to learn from.

### Project Structure Notes

- `infra/prisma/schema.prisma` — UPDATE (`DailySiteReport.correctsId`/`reason`, unique→index) + new migration.
- `apps/api/src/dsr/dsr.controller.ts`, `dsr.service.ts` — UPDATE (Story 3.1/3.2/3.4's files: add `POST /dsr/:id/correct`, application-level duplicate check, current-version resolution).
- `apps/web/app/daily-activity/new/page.tsx`, `apps/web/app/daily-activity/[id]/correct/page.tsx` — NEW.
- `apps/web/app/daily-activity/[id]/page.tsx` — UPDATE (Story 3.4's file: add Correct button + corrected-report banner).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-3] — Story 3.5 acceptance criteria (verbatim source).
- [Source: _bmad-output/implementation-artifacts/3-1-submit-a-daily-site-report-mobile.md] — the deferred schema decision this story resolves; the endpoint/schema this story's "new entry" path reuses.
- [Source: _bmad-output/implementation-artifacts/3-3-chronological-site-photo-gallery.md] — the upload flow this story's dropzone reuses.
- [Source: _bmad-output/implementation-artifacts/3-4-desktop-daily-activity-log-report-detail.md] — the detail page this story adds a Correct entry point to.
- [Source: infra/prisma/schema.prisma#model-Purchase, model-Movement, model-Consumption] — the existing `correctsId`/`reason` pattern this story mirrors for `DailySiteReport`.
- [Source: `AGENTS.md` policy / architecture AD-9] — "a correction is a new, reason-carrying row linked to the one it corrects" — the binding rule this whole story implements.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/19-daily-activity-entry.html] — the correction banner's composition reference.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
