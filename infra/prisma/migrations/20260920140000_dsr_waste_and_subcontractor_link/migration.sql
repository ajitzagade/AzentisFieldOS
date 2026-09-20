-- spec-dsr-activity-sync-detail-panel, goals 3-4: WasteDisposal and
-- SubcontractorWorkEntry each get a DSR link + offline-sync idempotency
-- key, mirroring RmcEntry's exact two-plus-one field addition (see
-- 20260812143647_add_dsr_rmc_link_and_equipment_used +
-- 20260812150156_add_client_generated_id_sync_keys). This migration itself
-- touches no Prisma-undeclared object (no pg_trgm/GIN index), so
-- `prisma migrate dev` would not mis-diff it — hand-written anyway, plainly
-- generated, to keep every migration touching these DSR-linked tables in
-- one consistent, reviewable style.

-- AlterTable
ALTER TABLE "WasteDisposal" ADD COLUMN     "dailySiteReportId" TEXT,
ADD COLUMN     "clientGeneratedId" TEXT;

-- AlterTable
ALTER TABLE "SubcontractorWorkEntry" ADD COLUMN     "dailySiteReportId" TEXT,
ADD COLUMN     "clientGeneratedId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "WasteDisposal_clientGeneratedId_key" ON "WasteDisposal"("clientGeneratedId");

-- CreateIndex
CREATE UNIQUE INDEX "SubcontractorWorkEntry_clientGeneratedId_key" ON "SubcontractorWorkEntry"("clientGeneratedId");

-- AddForeignKey
ALTER TABLE "WasteDisposal" ADD CONSTRAINT "WasteDisposal_dailySiteReportId_fkey" FOREIGN KEY ("dailySiteReportId") REFERENCES "DailySiteReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubcontractorWorkEntry" ADD CONSTRAINT "SubcontractorWorkEntry_dailySiteReportId_fkey" FOREIGN KEY ("dailySiteReportId") REFERENCES "DailySiteReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
