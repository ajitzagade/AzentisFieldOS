-- spec-dsr-drafts (review): drafts are private per supervisor — at most ONE
-- open DRAFT per (siteId, reportDate, submittedByUserId). This partial unique
-- index is the DB backstop behind saveDraft()'s advisory-lock + findFirst
-- upsert, so two concurrent first-saves by the same author for the same
-- site/date can never fork into two draft rows.
--
-- Hand-written and applied via `prisma migrate deploy` (never `migrate dev`):
-- Prisma's schema language can't express a partial/filtered unique index, so
-- this object is undeclared in schema.prisma — exactly like the pg_trgm GIN
-- indexes — and `migrate dev`'s schema diff would treat it as drift and
-- auto-drop it (see AGENTS.md). SUBMITTED rows and corrections (correctsId
-- not null) are deliberately outside the filter: a site/date can carry one
-- draft AND its later submitted/corrected rows at once.
CREATE UNIQUE INDEX "DailySiteReport_one_open_draft_per_author"
  ON "DailySiteReport" ("siteId", "reportDate", "submittedByUserId")
  WHERE "status" = 'DRAFT' AND "correctsId" IS NULL;
