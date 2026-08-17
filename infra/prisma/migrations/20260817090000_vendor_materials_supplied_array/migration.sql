-- Story 9.1: "Materials / services supplied" renders as discrete
-- chips/tags (12-vendors.html, 13-vendor-detail.html), not a comma-split
-- free-text blob. TEXT -> TEXT[] is not a castable type change, so the
-- column is renamed out of the way, the new array column is added, any
-- existing free-text value is backfilled by splitting on comma (trimmed,
-- empty entries dropped) rather than discarded, and the old column is
-- then dropped.

-- AlterTable: park the old scalar column
ALTER TABLE "Vendor" RENAME COLUMN "materialsSupplied" TO "materialsSupplied_old";

-- AlterTable: add the new array column
ALTER TABLE "Vendor" ADD COLUMN     "materialsSupplied" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill: split any existing comma-separated free text into discrete,
-- trimmed, non-empty tags
UPDATE "Vendor"
SET "materialsSupplied" = COALESCE(
  (
    SELECT array_agg(NULLIF(TRIM(tag), ''))
    FROM unnest(string_to_array("materialsSupplied_old", ',')) AS tag
    WHERE NULLIF(TRIM(tag), '') IS NOT NULL
  ),
  ARRAY[]::TEXT[]
)
WHERE "materialsSupplied_old" IS NOT NULL;

-- AlterTable: drop the now-migrated old column
ALTER TABLE "Vendor" DROP COLUMN "materialsSupplied_old";
