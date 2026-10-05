-- Hand-written (2026-10-05): `prisma migrate dev`'s schema diff reports
-- pre-existing, unrelated drift on this database (a Movement foreign-key
-- definition mismatch) and wants to reset the local dev DB to resolve it —
-- same class of problem AGENTS.md's "Danger" note describes for
-- Prisma-undeclared objects. Applied via `pnpm db:migrate:deploy` instead
-- (replays migration files in order, no diff against schema.prisma), same
-- workaround as 20260922103645_add_photo_deleted_at.

-- AD-9 exception (approved 2026-10-05): soft-delete for the five movement
-- entities (Purchase, Movement, Consumption, WasteDisposal, RmcEntry), plus
-- creator tracking (recordedByUserId) on the three that didn't already have
-- it (Consumption and WasteDisposal already track this). All new columns
-- are nullable — existing rows have no known creator and are not deleted.

-- AlterTable
ALTER TABLE "Purchase"
  ADD COLUMN "recordedByUserId" TEXT,
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "deletedByUserId" TEXT,
  ADD COLUMN "deleteReason" TEXT;

-- AlterTable
ALTER TABLE "Movement"
  ADD COLUMN "recordedByUserId" TEXT,
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "deletedByUserId" TEXT,
  ADD COLUMN "deleteReason" TEXT;

-- AlterTable
ALTER TABLE "Consumption"
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "deletedByUserId" TEXT,
  ADD COLUMN "deleteReason" TEXT;

-- AlterTable
ALTER TABLE "RmcEntry"
  ADD COLUMN "recordedByUserId" TEXT,
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "deletedByUserId" TEXT,
  ADD COLUMN "deleteReason" TEXT;

-- AlterTable
ALTER TABLE "WasteDisposal"
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "deletedByUserId" TEXT,
  ADD COLUMN "deleteReason" TEXT;
