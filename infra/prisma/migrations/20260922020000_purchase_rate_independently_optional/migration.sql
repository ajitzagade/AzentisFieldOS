-- Rate independently optional (2026-09-22): 20260902000100's CHECK
-- constraint enforced rate/totalAmount/paymentStatus as a strict
-- all-or-none group at the DB layer — a real end-to-end run (Supervisor
-- entering a Purchase with a known Total Amount but no Rate) hit this
-- constraint even though the Zod schema had already been relaxed, since the
-- DB-level CHECK was a separate, forgotten enforcement point. Narrowed to
-- only what should still travel together: totalAmount and paymentStatus
-- (the actual "Pricing pending" signal). Hand-written, apply with
-- `pnpm db:migrate:deploy` only, never `db:migrate:dev` (AGENTS.md).

ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_pricing_all_or_none";

ALTER TABLE "Purchase"
  ADD CONSTRAINT "Purchase_pricing_all_or_none"
  CHECK (("paymentStatus" IS NULL) = ("totalAmount" IS NULL));
