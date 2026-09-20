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
    // Nullable, all-or-none with totalAmount (client-readiness batch,
    // goal 1) — a Supervisor may record a delivery before pricing is known.
    ratePerM3: z.number().positive().optional(),
    // Signed on corrections (the correct form submits corrected-total minus
    // original, and reports SUM totalAmount across rows so deltas net
    // correctly); must be positive on a new delivery — enforced below.
    // Optional on a fresh entry only when ratePerM3 is also absent.
    totalAmount: z.number().optional(),
    invoiceOrChallanNo: z.string().max(200).optional(),
    challanPhotoUrl: z.url().optional(),
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
      // Pricing (ratePerM3/totalAmount) travels as a group here too: when
      // the delivery being corrected has no rate yet, a correction must not
      // carry a totalAmount either — there is no dedicated pricing-
      // completion workflow for RMC deliveries, so introducing pricing
      // through a correction is rejected outright rather than silently
      // accepted. When a rate IS present, the existing rule holds: the
      // total-amount delta is required and must actually change something.
      const hasRate = data.ratePerM3 !== undefined;
      if (hasRate) {
        if (data.totalAmount === undefined || data.totalAmount === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["totalAmount"],
            message: "A correction's total-amount change must not be zero",
          });
        }
      } else if (data.totalAmount !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["totalAmount"],
          message: "Pricing can't be added to an RMC delivery through a correction — it can only be set when the delivery is first recorded",
        });
      }
      if (!data.reason) {
        ctx.addIssue({
          code: "custom",
          path: ["reason"],
          message: "A reason is required when filing a correction",
        });
      }
    } else {
      if (data.quantityM3 <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["quantityM3"],
          message: "Quantity must be positive",
        });
      }
      // D7-style pricing group: rate and total amount travel together — a
      // priced delivery has both, a pricing-pending one has neither.
      const hasRate = data.ratePerM3 !== undefined;
      const hasTotal = data.totalAmount !== undefined;
      if (hasRate && !hasTotal) {
        ctx.addIssue({
          code: "custom",
          path: ["totalAmount"],
          message: "Total amount is required when a rate is entered",
        });
      }
      if (!hasRate && hasTotal) {
        ctx.addIssue({
          code: "custom",
          path: ["ratePerM3"],
          message: "Rate is required when a total amount is entered",
        });
      }
      if (hasTotal && data.totalAmount! <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["totalAmount"],
          message: "Total amount must be positive",
        });
      }
    }

  });

export type CreateRmcEntryInput = z.infer<typeof createRmcEntrySchema>;
