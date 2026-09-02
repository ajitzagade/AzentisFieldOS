import { z } from "zod";

// FR-59: a Payment or Advance made to a Subcontractor against a Site
// Contract. `type` is a display/reporting label only — both values
// contribute identically to SiteContract.amountPaid (see
// apps/api/src/subcontractors/amount-paid.ts).
export const subcontractorPaymentTypeSchema = z.enum(["ADVANCE", "PAYMENT"]);

export type SubcontractorPaymentType = z.infer<typeof subcontractorPaymentTypeSchema>;

// Same single-quantity correction-delta shape as createAdvanceSchema — no
// payable cap (FR-59: an advance may legitimately exceed the amount
// currently payable), only a floor at zero enforced server-side.
export const createSubcontractorPaymentSchema = z
  .object({
    siteContractId: z.uuid(),
    type: subcontractorPaymentTypeSchema,
    amount: z.number(),
    paymentMethod: z.string().max(100).optional(),
    paidAt: z.coerce.date(),
    note: z.string().max(500).optional(),
    correctsId: z.uuid().optional(),
    reason: z.string().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.correctsId) {
      if (data.amount === 0) {
        ctx.addIssue({ code: "custom", path: ["amount"], message: "A correction's amount delta must not be zero" });
      }
      if (!data.reason) {
        ctx.addIssue({ code: "custom", path: ["reason"], message: "A reason is required when filing a correction" });
      }
    } else if (data.amount <= 0) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "Amount must be positive" });
    }
  });

export type CreateSubcontractorPaymentInput = z.infer<typeof createSubcontractorPaymentSchema>;
