-- spec-dsr-drafts: give DailySiteReport a DRAFT | SUBMITTED lifecycle.
--
-- Hand-written and applied via `prisma migrate deploy` (never `migrate dev`)
-- on purpose: the DB carries hand-written pg_trgm GIN indexes that are not
-- declared in schema.prisma (postgresqlExtensions is still preview-gated), so
-- `migrate dev`'s schema diff would treat them as drift and auto-generate a
-- second migration dropping them (see AGENTS.md). This migration is purely
-- additive — a new enum, two nullable-safe columns (status defaults to
-- SUBMITTED so every existing row keeps its exact prior meaning), and one
-- covering index.

-- CreateEnum
CREATE TYPE "DsrStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- AlterTable
ALTER TABLE "DailySiteReport" ADD COLUMN     "status" "DsrStatus" NOT NULL DEFAULT 'SUBMITTED',
ADD COLUMN     "draftContent" JSONB;

-- CreateIndex
CREATE INDEX "DailySiteReport_siteId_reportDate_status_idx" ON "DailySiteReport"("siteId", "reportDate", "status");
