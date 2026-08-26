-- AlterTable
ALTER TABLE "BrandingConfig" ADD COLUMN     "accentColor" TEXT NOT NULL DEFAULT '#C7912B',
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "gstin" TEXT,
ADD COLUMN     "registeredAddress" TEXT,
ADD COLUMN     "secondaryColor" TEXT NOT NULL DEFAULT '#16273E';
