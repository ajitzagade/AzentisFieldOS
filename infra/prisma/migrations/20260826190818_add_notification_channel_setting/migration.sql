-- CreateTable
CREATE TABLE "NotificationChannelSetting" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "recipientUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "NotificationChannelSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationChannelSetting_channel_key" ON "NotificationChannelSetting"("channel");
