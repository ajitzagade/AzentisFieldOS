-- Hand-written (2026-09-22), following the same precedent as
-- 20260920081631_site_direct_photo_upload's own header: `prisma migrate dev`
-- would bundle DROP INDEX statements for every pg_trgm/GIN index not
-- declared in schema.prisma into this migration's auto-generated output
-- (see AGENTS.md's "Danger" note). Apply with `pnpm db:migrate:deploy`
-- only, never `db:migrate:dev`.

-- CreateTable
CREATE TABLE "DailyLabourer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "defaultPerDayAmount" DECIMAL(65,30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "outstandingAdvanceBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyLabourer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLabourAttendance" (
    "id" TEXT NOT NULL,
    "labourerId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "workDate" DATE NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT true,
    "perDayAmount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correctsId" TEXT,
    "correctionReason" TEXT,

    CONSTRAINT "DailyLabourAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLabourAdvance" (
    "id" TEXT NOT NULL,
    "labourerId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "givenAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correctsId" TEXT,
    "correctionReason" TEXT,

    CONSTRAINT "DailyLabourAdvance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLabourAdvanceAdjustment" (
    "id" TEXT NOT NULL,
    "advanceId" TEXT NOT NULL,
    "paymentId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "note" TEXT,
    "adjustedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correctsId" TEXT,
    "correctionReason" TEXT,

    CONSTRAINT "DailyLabourAdvanceAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLabourWeeklyPayment" (
    "id" TEXT NOT NULL,
    "labourerId" TEXT NOT NULL,
    "weekStartDate" DATE NOT NULL,
    "weekEndDate" DATE NOT NULL,
    "totalEarned" DECIMAL(65,30) NOT NULL,
    "amountPaid" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correctsId" TEXT,
    "correctionReason" TEXT,

    CONSTRAINT "DailyLabourWeeklyPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyLabourAttendance_labourerId_workDate_idx" ON "DailyLabourAttendance"("labourerId", "workDate");

-- CreateIndex
CREATE INDEX "DailyLabourAttendance_siteId_workDate_idx" ON "DailyLabourAttendance"("siteId", "workDate");

-- CreateIndex
CREATE INDEX "DailyLabourAdvance_labourerId_givenAt_idx" ON "DailyLabourAdvance"("labourerId", "givenAt");

-- CreateIndex
CREATE INDEX "DailyLabourAdvanceAdjustment_advanceId_adjustedAt_idx" ON "DailyLabourAdvanceAdjustment"("advanceId", "adjustedAt");

-- CreateIndex
CREATE INDEX "DailyLabourWeeklyPayment_labourerId_weekStartDate_idx" ON "DailyLabourWeeklyPayment"("labourerId", "weekStartDate");

-- AddForeignKey
ALTER TABLE "DailyLabourAttendance" ADD CONSTRAINT "DailyLabourAttendance_labourerId_fkey" FOREIGN KEY ("labourerId") REFERENCES "DailyLabourer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLabourAttendance" ADD CONSTRAINT "DailyLabourAttendance_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLabourAdvance" ADD CONSTRAINT "DailyLabourAdvance_labourerId_fkey" FOREIGN KEY ("labourerId") REFERENCES "DailyLabourer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLabourAdvanceAdjustment" ADD CONSTRAINT "DailyLabourAdvanceAdjustment_advanceId_fkey" FOREIGN KEY ("advanceId") REFERENCES "DailyLabourAdvance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLabourAdvanceAdjustment" ADD CONSTRAINT "DailyLabourAdvanceAdjustment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "DailyLabourWeeklyPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLabourWeeklyPayment" ADD CONSTRAINT "DailyLabourWeeklyPayment_labourerId_fkey" FOREIGN KEY ("labourerId") REFERENCES "DailyLabourer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
