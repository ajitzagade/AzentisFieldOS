-- Labour Attendance Day/Night shift + Half Day (2026-09-23): a labourer may
-- now have an independent Day entry AND Night entry on the same date, each
-- Full or Half Day. Existing rows backfill to shift=DAY, isHalfDay=false via
-- the column defaults below (fully schema-declared, standard migrate flow).

-- CreateEnum
CREATE TYPE "LabourShift" AS ENUM ('DAY', 'NIGHT');

-- AlterTable
ALTER TABLE "DailyLabourAttendance" ADD COLUMN     "isHalfDay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shift" "LabourShift" NOT NULL DEFAULT 'DAY';
