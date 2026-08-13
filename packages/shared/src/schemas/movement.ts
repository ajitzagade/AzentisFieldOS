import { z } from "zod";

export const movementKindSchema = z.enum(["GODOWN_TO_SITE", "SITE_TO_SITE"]);

// Shared by Story 5.2 (GODOWN_TO_SITE) and Story 5.4 (SITE_TO_SITE).
export const createMovementSchema = z
  .object({
    kind: movementKindSchema,
    materialSizeId: z.uuid(),
    sourceSiteId: z.uuid().optional(),
    destinationSiteId: z.uuid(),
    sentQuantity: z.number(),
    vehicleDetails: z.string().min(1).optional(),
    personResponsible: z.string().min(1).optional(),
    notes: z.string().min(1).optional(),
    movedAt: z.iso.date(),
    correctsId: z.string().min(1).optional(),
    reason: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.kind === "GODOWN_TO_SITE" && data.sourceSiteId) {
      ctx.addIssue({
        code: "custom",
        path: ["sourceSiteId"],
        message: "Source Site must not be set for a Godown-to-Site Movement",
      });
    }
    if (data.kind === "SITE_TO_SITE" && !data.sourceSiteId) {
      ctx.addIssue({
        code: "custom",
        path: ["sourceSiteId"],
        message: "Source Site is required for a Site-to-Site Movement",
      });
    }

    if (data.correctsId) {
      if (data.sentQuantity === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["sentQuantity"],
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
    } else if (data.sentQuantity <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["sentQuantity"],
        message: "Sent quantity must be positive",
      });
    }
  });

export type CreateMovementInput = z.infer<typeof createMovementSchema>;

// The receiving Site's confirmation step (AC #2) — a separate, later call
// than createMovementSchema's initial "sent" recording.
export const confirmMovementReceiptSchema = z.object({
  receivedQuantity: z.number().nonnegative(),
});

export type ConfirmMovementReceiptInput = z.infer<typeof confirmMovementReceiptSchema>;
