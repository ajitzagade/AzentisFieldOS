-- Hand-written (2026-09-22): `prisma migrate dev`'s schema diff treats every
-- pre-existing hand-written pg_trgm/GIN index and SiteStock_materialSizeId_idx
-- as drift (none of them are declared in schema.prisma — see AGENTS.md's
-- "Danger" note under `pnpm db:migrate:dev`) and bundles a DROP INDEX for
-- every one of them into the auto-generated output, plus unrelated
-- DailySiteReport.updatedAt default drift. Stripped back down to only the
-- Photo table change this migration exists to make.

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN "deletedAt" TIMESTAMP(3);
