-- Hand-edited (2026-09-20): `prisma migrate dev`'s schema diff treated every
-- pre-existing hand-written pg_trgm/GIN index and SiteStock_materialSizeId_idx
-- as drift (none of them are declared in schema.prisma — see AGENTS.md's
-- "Danger" note under `pnpm db:migrate:dev`) and bundled a DROP INDEX for
-- every one of them into this migration's auto-generated output. Stripped
-- back down to only the Photo table changes this migration actually exists
-- to make — do not let a future `db:migrate:dev` run silently re-add those
-- drops.

-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_dailySiteReportId_fkey";

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "siteId" TEXT,
ALTER COLUMN "dailySiteReportId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Photo_siteId_createdAt_idx" ON "Photo"("siteId", "createdAt");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_dailySiteReportId_fkey" FOREIGN KEY ("dailySiteReportId") REFERENCES "DailySiteReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;
