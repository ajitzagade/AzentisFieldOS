import { z } from "zod";

// FR-22, NFR-3: recorded immediately, no approval gate. `reason` is the
// business reason the Advance was given — a different field from
// `correctionReason`, which only applies when this entry corrects another
// one (AD-9).
export const createAdvanceSchema = z
  .object({
    teamMemberId: z.uuid(),
    amount: z.number(),
    reason: z.string().max(500).optional(),
    paymentMethod: z.string().max(100).optional(),
    givenAt: z.coerce.date(),
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

export type CreateAdvanceInput = z.infer<typeof createAdvanceSchema>;
