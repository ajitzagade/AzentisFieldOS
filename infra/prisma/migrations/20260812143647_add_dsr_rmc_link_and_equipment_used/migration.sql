-- AlterTable
ALTER TABLE "DailySiteReport" ADD COLUMN     "equipmentUsed" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "RmcEntry" ADD COLUMN     "dailySiteReportId" TEXT;

-- AddForeignKey
ALTER TABLE "RmcEntry" ADD CONSTRAINT "RmcEntry_dailySiteReportId_fkey" FOREIGN KEY ("dailySiteReportId") REFERENCES "DailySiteReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
