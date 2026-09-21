-- "My Drafts" quick-resume (2026-09-21): DailySiteReport.updatedAt is the
-- only reliable "last touched" signal for a DRAFT (Save Draft upserts the
-- same row in place, so createdAt never moves past the first save).
-- Backfilled to CURRENT_TIMESTAMP for existing rows; Prisma's @updatedAt
-- manages it explicitly on every create/update going forward.
-- AlterTable
ALTER TABLE "DailySiteReport" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- listMyDrafts() scans across every Site for one user's own open drafts —
-- no siteId to narrow by, so the existing [siteId, reportDate, status]
-- index doesn't serve this query.
-- CreateIndex
CREATE INDEX "DailySiteReport_submittedByUserId_status_idx" ON "DailySiteReport"("submittedByUserId", "status");
