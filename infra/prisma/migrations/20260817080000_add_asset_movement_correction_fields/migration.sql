-- Story 8.2: MachineryMovementLog/VehicleMovementLog gain the same plain
-- correctsId/reason correction pair used elsewhere in this schema
-- (Purchase/Movement/Consumption/ReturnWastage/DailySiteReport). A
-- correction here is a full restatement of toStatus/siteId, not a delta.

-- AlterTable
ALTER TABLE "MachineryMovementLog" ADD COLUMN     "correctsId" TEXT,
ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "VehicleMovementLog" ADD COLUMN     "correctsId" TEXT,
ADD COLUMN     "reason" TEXT;
