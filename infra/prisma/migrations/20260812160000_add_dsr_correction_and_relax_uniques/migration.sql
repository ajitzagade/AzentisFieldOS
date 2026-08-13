-- DropIndex
DROP INDEX "DailySiteReport_siteId_reportDate_key";

-- DropIndex
DROP INDEX "WorkRecord_teamMemberId_workDate_key";

-- AlterTable
ALTER TABLE "DailySiteReport" ADD COLUMN     "correctsId" TEXT,
ADD COLUMN     "reason" TEXT;

-- CreateIndex
CREATE INDEX "DailySiteReport_siteId_reportDate_idx" ON "DailySiteReport"("siteId", "reportDate");

-- CreateIndex
CREATE INDEX "WorkRecord_teamMemberId_workDate_idx" ON "WorkRecord"("teamMemberId", "workDate");
