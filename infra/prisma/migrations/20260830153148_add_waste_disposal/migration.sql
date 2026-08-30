-- CreateTable
CREATE TABLE "WasteDisposal" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "wasteType" TEXT NOT NULL,
    "quantityDetails" TEXT,
    "ownership" TEXT NOT NULL,
    "vendorId" TEXT,
    "machineryId" TEXT,
    "vehicleId" TEXT,
    "vehicleDetails" TEXT,
    "tripCount" INTEGER NOT NULL,
    "ratePerTrip" DECIMAL(65,30) NOT NULL,
    "otherCharges" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "disposalLocation" TEXT,
    "paymentStatus" TEXT,
    "notes" TEXT,
    "disposedAt" TIMESTAMP(3) NOT NULL,
    "recordedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correctsId" TEXT,
    "reason" TEXT,

    CONSTRAINT "WasteDisposal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WasteDisposal" ADD CONSTRAINT "WasteDisposal_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WasteDisposal" ADD CONSTRAINT "WasteDisposal_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WasteDisposal" ADD CONSTRAINT "WasteDisposal_machineryId_fkey" FOREIGN KEY ("machineryId") REFERENCES "Machinery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WasteDisposal" ADD CONSTRAINT "WasteDisposal_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
