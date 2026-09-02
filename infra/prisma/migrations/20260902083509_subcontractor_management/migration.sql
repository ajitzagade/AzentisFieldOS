-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Subcontractor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "workCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Subcontractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContract" (
    "id" TEXT NOT NULL,
    "subcontractorId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "workCategory" TEXT,
    "description" TEXT,
    "rateType" TEXT,
    "rateUnitLabel" TEXT,
    "rate" DECIMAL(65,30),
    "fixedAmount" DECIMAL(65,30),
    "estimatedQuantity" DECIMAL(65,30),
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "quantityCompleted" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "amountPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubcontractorWorkEntry" (
    "id" TEXT NOT NULL,
    "siteContractId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "recordedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correctsId" TEXT,
    "reason" TEXT,

    CONSTRAINT "SubcontractorWorkEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubcontractorPayment" (
    "id" TEXT NOT NULL,
    "siteContractId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentMethod" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "recordedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correctsId" TEXT,
    "reason" TEXT,

    CONSTRAINT "SubcontractorPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SiteContract" ADD CONSTRAINT "SiteContract_subcontractorId_fkey" FOREIGN KEY ("subcontractorId") REFERENCES "Subcontractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteContract" ADD CONSTRAINT "SiteContract_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubcontractorWorkEntry" ADD CONSTRAINT "SubcontractorWorkEntry_siteContractId_fkey" FOREIGN KEY ("siteContractId") REFERENCES "SiteContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubcontractorPayment" ADD CONSTRAINT "SubcontractorPayment_siteContractId_fkey" FOREIGN KEY ("siteContractId") REFERENCES "SiteContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
