import { z } from "zod";

export const returnWastageKindSchema = z.enum(["RETURN", "WASTAGE"]);

// Glossary "Wastage / Return": both kinds decrease Site Stock — a RETURN
// is material physically leaving the Site (back to a Vendor), the same
// direction as WASTAGE, just a different reason. Neither kind increases
// any balance.
export const createReturnWastageSchema = z
  .object({
    siteId: z.uuid(),
    materialSizeId: z.uuid(),
    kind: returnWastageKindSchema,
    quantity: z.number(),
    notes: z.string().min(1).optional(),
    recordedAt: z.iso.date(),
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

export type CreateReturnWastageInput = z.infer<typeof createReturnWastageSchema>;
