-- AlterTable
ALTER TABLE "Advance" ADD COLUMN     "correctionReason" TEXT,
ADD COLUMN     "correctsId" TEXT;

-- AlterTable
ALTER TABLE "AdvanceAdjustment" ADD COLUMN     "correctionReason" TEXT,
ADD COLUMN     "correctsId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "correctsId" TEXT,
ADD COLUMN     "payPeriod" TEXT,
ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "outstandingAdvanceBalance" DECIMAL(65,30) NOT NULL DEFAULT 0;
