import { z } from "zod";

// FR-58: a recorded quantity of work done against an Active, non-Fixed-Cost
// Site Contract. Same single-quantity correction-delta shape as
// createAdvanceSchema — `reason` (not `correctionReason`) since this model
// has no other business-meaning reason field to collide with (matches
// Consumption/Movement's convention, not Advance's).
export const createSubcontractorWorkEntrySchema = z
  .object({
    siteContractId: z.uuid(),
    quantity: z.number(),
    workDate: z.coerce.date(),
    note: z.string().max(500).optional(),
    correctsId: z.uuid().optional(),
    reason: z.string().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.correctsId) {
      if (data.quantity === 0) {
        ctx.addIssue({ code: "custom", path: ["quantity"], message: "A correction's quantity delta must not be zero" });
      }
      if (!data.reason) {
        ctx.addIssue({ code: "custom", path: ["reason"], message: "A reason is required when filing a correction" });
      }
    } else if (data.quantity <= 0) {
      ctx.addIssue({ code: "custom", path: ["quantity"], message: "Quantity must be positive" });
    }
  });

export type CreateSubcontractorWorkEntryInput = z.infer<typeof createSubcontractorWorkEntrySchema>;
