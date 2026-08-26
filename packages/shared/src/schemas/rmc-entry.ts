import { z } from "zod";

// FR-26: an RMC delivery is its own entity — separate from the Material
// Catalog/Inventory Transactions data model (AC #1) — but it reuses the
// same single-quantity ledger-row delta-correction pattern Epic 5's
// Purchase established (Story 5.1 Dev Notes): a correcting row's
// quantityM3 is a signed delta applied on top of the current total, not a
// restated total, mirroring Purchase's `quantity` field exactly.
export const createRmcEntrySchema = z
  .object({
    siteId: z.uuid(),
    vendorId: z.uuid(),
    quantityM3: z.number(),
    grade: z.string().min(1).max(50),
    ratePerM3: z.number().positive(),
    totalAmount: z.number().positive(),
    invoiceOrChallanNo: z.string().max(200).optional(),
    deliveredAt: z.coerce.date(),
    correctsId: z.uuid().optional(),
    reason: z.string().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.correctsId) {
      if (data.quantityM3 === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["quantityM3"],
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
    } else if (data.quantityM3 <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["quantityM3"],
        message: "Quantity must be positive",
      });
    }
  });

export type CreateRmcEntryInput = z.infer<typeof createRmcEntrySchema>;
