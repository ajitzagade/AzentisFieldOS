-- Client-readiness batch (2026-09-20), goal 1: a Supervisor may record an
-- RMC delivery or Waste Disposal trip before pricing is known — rate/total
-- become optional, mirroring Purchase's D7 pattern (see migration
-- 20260901165103_purchase_pricing_optional). WasteDisposal.paymentStatus
-- was already nullable (20260830153148_add_waste_disposal never made it
-- NOT NULL), so only ratePerTrip/totalAmount need dropping here.
-- AlterTable
ALTER TABLE "RmcEntry" ALTER COLUMN "ratePerM3" DROP NOT NULL,
ALTER COLUMN "totalAmount" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WasteDisposal" ALTER COLUMN "ratePerTrip" DROP NOT NULL,
ALTER COLUMN "totalAmount" DROP NOT NULL;

-- Client-readiness batch, goal 5: Daily Report gains Subcontractor and
-- Labour sections — denormalized JSON, same reasoning as the pre-existing
-- equipmentUsed column (informational tagging, not a money-bearing ledger,
-- so no relational sub-table).
-- AlterTable
ALTER TABLE "DailySiteReport" ADD COLUMN     "subcontractorEntries" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "labourEntries" JSONB NOT NULL DEFAULT '[]';
