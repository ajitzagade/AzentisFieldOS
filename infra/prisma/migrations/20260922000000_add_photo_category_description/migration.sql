-- Hand-written (2026-09-22), following the same precedent as
-- 20260920081631_site_direct_photo_upload's own header: `prisma migrate dev`
-- would bundle DROP INDEX statements for every pg_trgm/GIN index not
-- declared in schema.prisma into this migration's auto-generated output
-- (see AGENTS.md's "Danger" note). Apply with `pnpm db:migrate:deploy`
-- only, never `db:migrate:dev`.

-- CreateEnum
CREATE TYPE "PhotoCategory" AS ENUM ('GENERAL', 'MEASUREMENT');

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "category" "PhotoCategory" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "description" TEXT;
