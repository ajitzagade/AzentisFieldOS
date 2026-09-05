-- Hand-edited (2026-09-06 code review): `prisma migrate dev` originally
-- generated this file with ~40 `DROP INDEX` statements ahead of the
-- `PushSubscription` addition below — every pg_trgm/GIN search index is
-- undeclared in schema.prisma (postgresqlExtensions is still preview-gated,
-- see 20260902200934's own header), so migrate dev's schema diff treated
-- them as drift and queued them for deletion. This is the exact danger
-- AGENTS.md documents under "Running and verifying" — applying this file as
-- originally generated would have silently dropped every full-text search
-- index in production. Stripped down to only what this migration is
-- actually for.

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
