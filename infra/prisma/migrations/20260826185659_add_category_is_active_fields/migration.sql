-- AlterTable
ALTER TABLE "ExpenseCategory" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "MachineryType" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "VehicleType" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
