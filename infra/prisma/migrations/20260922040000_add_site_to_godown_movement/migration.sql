-- Site to Godown (2026-09-22): returning excess/unused material from a Site
-- back to the central Godown was the one Movement flow that didn't exist —
-- neither GODOWN_TO_SITE nor SITE_TO_SITE covers it. destinationSiteId must
-- become nullable (destination is implicitly the Godown for this new kind),
-- the same way sourceSiteId already is for GODOWN_TO_SITE.

-- AlterEnum
ALTER TYPE "MovementKind" ADD VALUE 'SITE_TO_GODOWN';

-- AlterTable
ALTER TABLE "Movement" ALTER COLUMN "destinationSiteId" DROP NOT NULL;
