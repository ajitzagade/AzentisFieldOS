import { z } from "zod";

// FR-16, NFR-4: same reasoning as machinery-type.ts — a separate table,
// not shared with it, since Machinery and Vehicle types aren't the same
// domain concept.
export const createVehicleTypeSchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateVehicleTypeInput = z.infer<typeof createVehicleTypeSchema>;

// Story 14.3 (FR-49): rename/disable admin lifecycle — same shape and
// no-default reasoning as updateMachineryTypeSchema.
export const updateVehicleTypeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateVehicleTypeInput = z.infer<typeof updateVehicleTypeSchema>;
