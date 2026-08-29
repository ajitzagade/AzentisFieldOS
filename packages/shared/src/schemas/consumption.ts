import { z } from "zod";

// FR-12: the recording user is resolved server-side from the session
// (CustomAuthGuard + @CurrentUser), the same way DSR submissions are
// attributed — never accepted from the request body, where any signed-in
// caller could attribute the write to someone else.
export const createConsumptionSchema = z
  .object({
    siteId: z.uuid(),
    materialSizeId: z.uuid(),
    quantity: z.number(),
    activityReference: z.string().min(1).optional(),
    notes: z.string().min(1).optional(),
    consumedAt: z.iso.date(),
    correctsId: z.uuid().optional(),
    reason: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.correctsId) {
      if (data.quantity === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["quantity"],
          message: "A correction's quantity delta must not be zero",
        });
      }
      if (!data.reason) {
        ctx.addIssue({
          code: "custom",
          path: ["reason"],
          message: "A reason is required when filing a correction",
        });
      }
    } else if (data.quantity <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Quantity must be positive",
      });
    }
  });

export type CreateConsumptionInput = z.infer<typeof createConsumptionSchema>;
