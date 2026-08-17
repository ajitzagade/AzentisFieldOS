import { z } from "zod";

// FR-24: Net Payable is always server-computed (basePay + additionalAmount
// - deductions - (advanceAdjustment?.amount ?? 0)) — deliberately absent
// from this schema so it can never be trusted from the request body.
//
// A "correcting" Payment is a complete new Payment row with correctsId set
// and the full, correct set of inputs re-entered — not a signed delta like
// Purchase/Advance/AdvanceAdjustment. Net Payable has four inputs, not one
// quantity, so "correct the deductions by -500" as a delta would be
// genuinely ambiguous in a way a single-quantity delta never is. Do not
// add sign-based validation here the way createAdvanceSchema has it —
// basePay/additionalAmount/deductions are always non-negative, correction
// or not.
export const createPaymentSchema = z
  .object({
    teamMemberId: z.uuid(),
    basePay: z.number().nonnegative(),
    additionalAmount: z.number().nonnegative().default(0),
    deductions: z.number().nonnegative().default(0),
    payPeriod: z.string().max(100).optional(),
    // FR-24: optional linked Adjustment — omitting it is valid, no warning.
    advanceAdjustment: z
      .object({
        advanceId: z.uuid(),
        amount: z.number().positive(),
        note: z.string().max(500).optional(),
      })
      .optional(),
    correctsId: z.uuid().optional(),
    reason: z.string().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.correctsId && !data.reason) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "A reason is required when filing a correction",
      });
    }
  });

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

// PATCH /payments/:id/mark-paid takes no input beyond the id in the URL.
export const markPaymentPaidSchema = z.object({});

export type MarkPaymentPaidInput = z.infer<typeof markPaymentPaidSchema>;
