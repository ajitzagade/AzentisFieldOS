import { z } from "zod";

// Waste & Disposal (debris/excavated-material removal) — a per-trip COST
// record against a Site. `totalAmount` is deliberately NOT an input:
// apps/api computes tripCount × ratePerTrip + otherCharges server-side
// (the qty×rate lesson from Purchase/RMC — users never do multiplication
// the system can do, and corrections can never carry a mismatched total).
export const WASTE_DISPOSAL_OWNERSHIP = ["OWN", "HIRED"] as const;
export type WasteDisposalOwnership = (typeof WASTE_DISPOSAL_OWNERSHIP)[number];

// Same vocabulary as Purchase.paymentStatus.
export const WASTE_DISPOSAL_PAYMENT_STATUSES = ["PAID", "PARTIAL", "UNPAID"] as const;

export const createWasteDisposalSchema = z
  .object({
    siteId: z.uuid(),
    wasteType: z.string().min(1).max(200),
    quantityDetails: z.string().max(200).optional(),
    ownership: z.enum(WASTE_DISPOSAL_OWNERSHIP),
    vendorId: z.uuid().optional(),
    machineryId: z.uuid().optional(),
    vehicleId: z.uuid().optional(),
    vehicleDetails: z.string().max(200).optional(),
    tripCount: z.number().int(),
    ratePerTrip: z.number().nonnegative(),
    otherCharges: z.number().optional(),
    disposalLocation: z.string().max(300).optional(),
    paymentStatus: z.enum(WASTE_DISPOSAL_PAYMENT_STATUSES).optional(),
    notes: z.string().max(1000).optional(),
    disposedAt: z.coerce.date(),
    correctsId: z.uuid().optional(),
    reason: z.string().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    // A register asset is one machine OR one vehicle, never both.
    if (data.machineryId && data.vehicleId) {
      ctx.addIssue({
        code: "custom",
        path: ["vehicleId"],
        message: "Pick either a Machinery or a Vehicle, not both",
      });
    }

    if (data.ownership === "HIRED") {
      if (!data.vendorId) {
        ctx.addIssue({
          code: "custom",
          path: ["vendorId"],
          message: "A hired disposal must name the Vendor/party being paid",
        });
      }
      if (!data.correctsId && !data.paymentStatus) {
        ctx.addIssue({
          code: "custom",
          path: ["paymentStatus"],
          message: "Payment status is required for a hired disposal",
        });
      }
    } else {
      // OWN: there is no third party to owe — a vendor or payment status
      // here would fabricate a payable.
      if (data.vendorId) {
        ctx.addIssue({
          code: "custom",
          path: ["vendorId"],
          message: "An own-vehicle disposal has no Vendor to pay",
        });
      }
      if (data.paymentStatus) {
        ctx.addIssue({
          code: "custom",
          path: ["paymentStatus"],
          message: "Payment status applies only to hired disposals",
        });
      }
    }

    if (data.correctsId) {
      // Epic 5's delta-correction rule (Story 5.1): signed deltas, non-zero
      // net effect, required reason.
      if (!data.reason) {
        ctx.addIssue({
          code: "custom",
          path: ["reason"],
          message: "A reason is required when filing a correction",
        });
      }
      if (data.tripCount === 0 && (data.otherCharges ?? 0) === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["tripCount"],
          message: "A correction must adjust trips and/or other charges",
        });
      }
    } else {
      if (data.tripCount <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["tripCount"],
          message: "Number of trips must be at least 1",
        });
      }
      if ((data.otherCharges ?? 0) < 0) {
        ctx.addIssue({
          code: "custom",
          path: ["otherCharges"],
          message: "Other charges cannot be negative on a fresh entry",
        });
      }
    }
  });

export type CreateWasteDisposalInput = z.infer<typeof createWasteDisposalSchema>;
