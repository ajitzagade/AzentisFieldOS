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
    rate: z.number().positive(),
    totalAmount: z.number().positive(),
    invoiceOrChallanNo: z.string().min(1).optional(),
    challanPhotoUrl: z.url().optional(),
    paymentStatus: paymentStatusSchema,
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
