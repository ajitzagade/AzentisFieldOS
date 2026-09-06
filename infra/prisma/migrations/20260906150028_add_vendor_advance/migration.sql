-- Hand-edited (2026-09-06): `prisma migrate dev`'s schema diff treated every
-- pre-existing hand-written pg_trgm/GIN index and SiteStock_materialSizeId_idx
-- as drift (none of them are declared in schema.prisma — see AGENTS.md's
-- "Danger" note under `pnpm db:migrate:dev`) and bundled a DROP INDEX for
-- every one of them into this migration's auto-generated output. Stripped
-- back down to only the VendorAdvance table this migration actually exists
-- to add — do not let a future `db:migrate:dev` run silently re-add those
-- drops.

-- CreateTable
CREATE TABLE "VendorAdvance" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "wasteDisposalId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentMethod" TEXT,
    "givenAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correctsId" TEXT,
    "correctionReason" TEXT,

    CONSTRAINT "VendorAdvance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorAdvance_vendorId_givenAt_idx" ON "VendorAdvance"("vendorId", "givenAt");

-- AddForeignKey
ALTER TABLE "VendorAdvance" ADD CONSTRAINT "VendorAdvance_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorAdvance" ADD CONSTRAINT "VendorAdvance_wasteDisposalId_fkey" FOREIGN KEY ("wasteDisposalId") REFERENCES "WasteDisposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
