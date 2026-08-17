import { z } from "zod";
import { assetTypeSchema } from "./asset-movement";

// FR-18: one schema for both Machinery and Vehicle service-log entries
// (fuel/maintenance/repair) — identical shape, only the target model
// (MachineryServiceLog vs. VehicleServiceLog, branched on assetType)
// differs, same assetType-discriminator/single-schema pattern Story 8.2's
// asset-movement.ts established (AD-7). The schema's `kind String //
// fuel | maintenance | repair` comment documents a closed set — enforced
// here as a real enum, not left an unconstrained string (same
// "documented but not schema-enforced" tightening as Epic 5 Story 5.1's
// paymentStatus).
export const serviceLogKindSchema = z.enum(["FUEL", "MAINTENANCE", "REPAIR"]);

// AC #2: a service log entry is edited via a normal Edit affordance, not
// CorrectAction — it is not part of FR-54's append-only enumeration (see
// Story 8.1's Dev Notes). There is no correctsId/reason here, unlike
// createAssetMovementSchema.
export const createAssetServiceLogSchema = z.object({
  assetType: assetTypeSchema,
  assetId: z.uuid(),
  kind: serviceLogKindSchema,
  notes: z.string().max(1000).optional(),
  cost: z.number().nonnegative().optional(),
  serviceDate: z.coerce.date(),
});

export type CreateAssetServiceLogInput = z.infer<typeof createAssetServiceLogSchema>;

// Full-replace via PATCH — same full-replace-PATCH reasoning as
// updateMachinerySchema: the edit form resubmits every field, so an
// intentionally-blanked optional field must be representable as an
// explicit `null`, not just omitted. assetType/assetId aren't editable
// (an entry stays tied to the asset it was logged against, only which
// Prisma delegate to call, carried separately as a query param — see
// apps/api/src/assets/asset-service-logs.controller.ts) and are
// therefore excluded here, unlike createAssetServiceLogSchema. No
// correctsId/reason either (AC #2 — nothing to add, this model has no
// correction lifecycle).
export const updateAssetServiceLogSchema = z
  .object({
    kind: serviceLogKindSchema,
    notes: z.string().max(1000).nullable(),
    cost: z.number().nonnegative().nullable(),
    serviceDate: z.coerce.date(),
  })
  .partial();

export type UpdateAssetServiceLogInput = z.infer<typeof updateAssetServiceLogSchema>;
