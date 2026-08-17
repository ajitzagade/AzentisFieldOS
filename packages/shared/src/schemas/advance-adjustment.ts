import { z } from "zod";

// FR-23: `advanceId` is required for audit traceability ("this repayment
// relates to the Aug 3rd advance"), but the cap check and balance
// decrement this schema's amount feeds are always against the
// Team-Member-pooled TeamMember.outstandingAdvanceBalance, never a
// per-Advance remainder — see Story 7.1's Dev Notes.
export const createAdvanceAdjustmentSchema = z
  .object({
    advanceId: z.uuid(),
    paymentId: z.uuid().optional(),
    amount: z.number(),
    note: z.string().max(500).optional(),
    adjustedAt: z.coerce.date(),
    correctsId: z.uuid().optional(),
    correctionReason: z.string().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.correctsId) {
      if (data.amount === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "A correction's amount delta must not be zero",
        });
      }
      if (!data.correctionReason) {
        ctx.addIssue({
          code: "custom",
          path: ["correctionReason"],
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

export type CreateAdvanceAdjustmentInput = z.infer<typeof createAdvanceAdjustmentSchema>;
