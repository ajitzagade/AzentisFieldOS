import { z } from "zod";

// FR-16, NFR-4: same reasoning as machinery-type.ts — a separate table,
// not shared with it, since Machinery and Vehicle types aren't the same
// domain concept.
export const createVehicleTypeSchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateVehicleTypeInput = z.infer<typeof createVehicleTypeSchema>;
