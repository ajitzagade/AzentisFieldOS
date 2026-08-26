-- CreateIndex
CREATE UNIQUE INDEX "ReportDelivery_dailyReportId_channel_key" ON "ReportDelivery"("dailyReportId", "channel");
