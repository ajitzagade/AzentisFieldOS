import { z } from "zod";

// Standalone expense recording (Epic 11, Story 11.1) — separate from the
// DSR-embedded expenses array (Epic 3's dsrExpenseSchema in
// daily-site-report.ts), which stays as-is. This is for expenses recorded
// directly against a Site outside of a Daily Site Report (material, labour,
// machinery/vehicle, fuel, repairs, transportation, site expenses, RMC,
// misc). No `purchaseId` here — that field links an Expense that IS a
// Purchase's own cost entry, populated by a future integration path, not by
// this manual-entry form (Story 11.1 Dev Notes).
export const createExpenseSchema = z
  .object({
    siteId: z.uuid(),
    categoryId: z.uuid(),
    amount: z.number(),
    description: z.string().max(1000).optional(),
    paymentMethod: z.string().max(100).optional(),
    personOrVendor: z.string().max(200).optional(),
    incurredAt: z.coerce.date(),
    correctsId: z.uuid().optional(),
    reason: z.string().min(1).max(500).optional(),
  })
  // Epic 5's delta-correction rule (Story 5.1 Dev Notes), reused here: a
  // correcting row's `amount` is a signed delta on top of the running total
  // (non-zero, either sign) and carries a required reason; a fresh Expense's
  // amount must be positive.
  .superRefine((data, ctx) => {
    if (data.correctsId) {
      if (data.amount === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "A correction's amount delta must not be zero",
        });
      }
      if (!data.reason) {
        ctx.addIssue({
          code: "custom",
          path: ["reason"],
          message: "A reason is required when filing a correction",
        });
      }
    } else if (data.amount <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Amount must be positive",
      });
    }
  });

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
