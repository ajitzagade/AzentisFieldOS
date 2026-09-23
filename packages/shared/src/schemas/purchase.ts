import { z } from "zod";

export const purchaseDestinationSchema = z.enum(["GODOWN", "SITE"]);
export const paymentStatusSchema = z.enum(["PAID", "PARTIAL", "UNPAID"]);

export const createPurchaseSchema = z
  .object({
    vendorId: z.uuid(),
    materialSizeId: z.uuid(),
    destination: purchaseDestinationSchema,
    siteId: z.uuid().optional(),
    quantity: z.number(),
    // Pricing is optional (decision D7, 2026-09-01): a Site Supervisor's
    // inward entry carries no money fields at all — the Owner/Admin
    // completes them later via completePurchasePricingSchema. rate,
    // totalAmount, and paymentStatus are each independently optional — no
    // field requires another (reversed 2026-09-23: totalAmount/
    // paymentStatus previously had to travel together, but that blocked the
    // common case of the site knowing the amount from a challan before the
    // office has confirmed payment). "Pricing pending" elsewhere in the app
    // depends only on totalAmount being null, never on paymentStatus, so
    // this doesn't affect that flag.
    rate: z.number().positive().optional(),
    totalAmount: z.number().positive().optional(),
    invoiceOrChallanNo: z.string().min(1).optional(),
    challanPhotoUrl: z.url().optional(),
    paymentStatus: paymentStatusSchema.optional(),
    deliveryLocation: z.string().min(1).optional(),
    vehicleDetails: z.string().min(1).optional(),
    receiverName: z.string().min(1).optional(),
    notes: z.string().min(1).optional(),
    purchasedAt: z.iso.date(),
    correctsId: z.uuid().optional(),
    reason: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.destination === "SITE" && !data.siteId) {
      ctx.addIssue({
        code: "custom",
        path: ["siteId"],
        message: "Site is required when destination is Site",
      });
    }
    if (data.destination === "GODOWN" && data.siteId) {
      ctx.addIssue({
        code: "custom",
        path: ["siteId"],
        message: "Site must not be set when destination is Godown",
      });
    }

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

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;

// D7: the Owner/Admin's one-time completion of a "Pricing pending" inward
// entry (PATCH /purchases/:id/pricing). All three fields are required here —
// this endpoint only ever fills the to-be-priced group; it never edits an
// already-priced Purchase (AD-9: later changes go through the Correct flow).
export const completePurchasePricingSchema = z.object({
  rate: z.number().positive(),
  totalAmount: z.number().positive(),
  paymentStatus: paymentStatusSchema,
});

export type CompletePurchasePricingInput = z.infer<typeof completePurchasePricingSchema>;

// Attach Bill (2026-09-22): purely additive (POST /purchases/:id/bills
// creates a new PurchaseBill row, never touches Purchase itself — AD-9).
// Owner/Admin only; entirely optional — a Purchase is valid and complete
// with zero bills attached, since material commonly arrives before the
// vendor's invoice does.
export const attachPurchaseBillSchema = z.object({
  storageKey: z.string().min(1),
});

export type AttachPurchaseBillInput = z.infer<typeof attachPurchaseBillSchema>;
