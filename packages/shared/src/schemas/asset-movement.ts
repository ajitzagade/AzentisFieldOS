import { z } from "zod";

export const assetTypeSchema = z.enum(["MACHINERY", "VEHICLE"]);
export const assetLocationStatusSchema = z.enum(["AVAILABLE", "AT_SITE", "MAINTENANCE"]);

// FR-17, FR-38: one schema for both Machinery and Vehicle movement —
// identical shape, only the target model (MachineryMovementLog vs.
// VehicleMovementLog, branched on assetType) differs, so this is one
// schema, not two near-duplicates (AD-7).
//
// A correcting movement (correctsId set) is a full restatement of
// toStatus/siteId, not a signed delta — there is no numeric quantity to
// offset for a location/status change (see the schema-level comment on
// MachineryMovementLog/VehicleMovementLog in schema.prisma, and Story
// 7.3's Payment correction for the prior precedent of this same
// "restatement, not delta" shape).
export const createAssetMovementSchema = z
  .object({
    assetType: assetTypeSchema,
    assetId: z.uuid(),
    toStatus: assetLocationStatusSchema,
    siteId: z.uuid().optional(),
    movedAt: z.coerce.date(),
    correctsId: z.uuid().optional(),
    reason: z.string().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.toStatus === "AT_SITE" && !data.siteId) {
      ctx.addIssue({
        code: "custom",
        path: ["siteId"],
        message: "Site is required when moving to a Site",
      });
    }
    if (data.toStatus !== "AT_SITE" && data.siteId) {
      ctx.addIssue({
        code: "custom",
        path: ["siteId"],
        message: "Site must not be set unless moving to a Site",
      });
    }

    if (data.correctsId && !data.reason) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "A reason is required when filing a correction",
      });
    }
  });

export type CreateAssetMovementInput = z.infer<typeof createAssetMovementSchema>;
