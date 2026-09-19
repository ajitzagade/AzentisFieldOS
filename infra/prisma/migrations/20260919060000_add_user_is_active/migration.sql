-- Deactivation, not deletion: User rows are referenced by transaction/audit
-- history, so accounts are never hard-deleted. Existing users default to
-- active.
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
