-- AlterTable
ALTER TABLE "Consumption" ADD COLUMN     "clientGeneratedId" TEXT;

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "clientGeneratedId" TEXT;

-- AlterTable
ALTER TABLE "RmcEntry" ADD COLUMN     "clientGeneratedId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Consumption_clientGeneratedId_key" ON "Consumption"("clientGeneratedId");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_clientGeneratedId_key" ON "Expense"("clientGeneratedId");

-- CreateIndex
CREATE UNIQUE INDEX "RmcEntry_clientGeneratedId_key" ON "RmcEntry"("clientGeneratedId");
