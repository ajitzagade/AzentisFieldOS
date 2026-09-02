-- CreateIndex
CREATE INDEX "Advance_teamMemberId_givenAt_idx" ON "Advance"("teamMemberId", "givenAt");

-- CreateIndex
CREATE INDEX "AdvanceAdjustment_advanceId_adjustedAt_idx" ON "AdvanceAdjustment"("advanceId", "adjustedAt");

-- CreateIndex
CREATE INDEX "AuditLog_siteId_occurredAt_idx" ON "AuditLog"("siteId", "occurredAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_occurredAt_idx" ON "AuditLog"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "Consumption_siteId_consumedAt_idx" ON "Consumption"("siteId", "consumedAt");

-- CreateIndex
CREATE INDEX "DailySiteReport_correctsId_idx" ON "DailySiteReport"("correctsId");

-- CreateIndex
CREATE INDEX "Expense_siteId_incurredAt_idx" ON "Expense"("siteId", "incurredAt");

-- CreateIndex
CREATE INDEX "Expense_categoryId_incurredAt_idx" ON "Expense"("categoryId", "incurredAt");

-- CreateIndex
CREATE INDEX "Movement_sourceSiteId_movedAt_idx" ON "Movement"("sourceSiteId", "movedAt");

-- CreateIndex
CREATE INDEX "Movement_destinationSiteId_movedAt_idx" ON "Movement"("destinationSiteId", "movedAt");

-- CreateIndex
CREATE INDEX "Payment_teamMemberId_createdAt_idx" ON "Payment"("teamMemberId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Purchase_siteId_purchasedAt_idx" ON "Purchase"("siteId", "purchasedAt");

-- CreateIndex
CREATE INDEX "Purchase_vendorId_purchasedAt_idx" ON "Purchase"("vendorId", "purchasedAt");

-- CreateIndex
CREATE INDEX "Purchase_totalAmount_correctsId_idx" ON "Purchase"("totalAmount", "correctsId");

-- CreateIndex
CREATE INDEX "ReturnWastage_siteId_recordedAt_idx" ON "ReturnWastage"("siteId", "recordedAt");

-- CreateIndex
CREATE INDEX "RmcEntry_siteId_deliveredAt_idx" ON "RmcEntry"("siteId", "deliveredAt");

-- CreateIndex
CREATE INDEX "RmcEntry_vendorId_deliveredAt_idx" ON "RmcEntry"("vendorId", "deliveredAt");

-- CreateIndex
CREATE INDEX "SiteContract_siteId_idx" ON "SiteContract"("siteId");

-- CreateIndex
CREATE INDEX "SiteContract_subcontractorId_idx" ON "SiteContract"("subcontractorId");

-- CreateIndex
CREATE INDEX "SubcontractorPayment_siteContractId_paidAt_idx" ON "SubcontractorPayment"("siteContractId", "paidAt");

-- CreateIndex
CREATE INDEX "SubcontractorWorkEntry_siteContractId_workDate_idx" ON "SubcontractorWorkEntry"("siteContractId", "workDate");

-- CreateIndex
CREATE INDEX "WasteDisposal_siteId_disposedAt_idx" ON "WasteDisposal"("siteId", "disposedAt");

-- CreateIndex
CREATE INDEX "WorkRecord_siteId_workDate_idx" ON "WorkRecord"("siteId", "workDate");
