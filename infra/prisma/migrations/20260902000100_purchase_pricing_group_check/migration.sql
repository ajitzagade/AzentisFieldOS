-- D7 hardening (code review 2026-09-02): rate / totalAmount / paymentStatus
-- travel as an all-or-none group. The Zod schema enforces this at the API
-- edge; this CHECK enforces it at the schema layer so `totalAmount IS NULL`
-- stays a trustworthy "Pricing pending" marker no matter who writes.
ALTER TABLE "Purchase"
  ADD CONSTRAINT "Purchase_pricing_all_or_none"
  CHECK (
    (("rate" IS NULL) = ("totalAmount" IS NULL))
    AND (("paymentStatus" IS NULL) = ("totalAmount" IS NULL))
  );
