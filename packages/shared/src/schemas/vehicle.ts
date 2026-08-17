import { z } from "zod";

// FR-16: same shape as machinery.ts, with `number` instead of
// `name`+`assetNumber` and `driver` instead of `operator` — currentStatus/
// currentSiteId are deliberately absent, exclusively written by Story
// 8.2's movement-recording transaction.
export const createVehicleSchema = z.object({
  number: z.string().min(1).max(100),
  typeId: z.uuid(),
  ownership: z.string().max(200).optional(),
  driver: z.string().max(200).optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;

// Same full-replace-PATCH reasoning as machinery.ts/team-member.ts.
export const updateVehicleSchema = z
  .object({
    ...createVehicleSchema.shape,
    ownership: z.string().max(200).nullable(),
    driver: z.string().max(200).nullable(),
  })
  .partial();

export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
