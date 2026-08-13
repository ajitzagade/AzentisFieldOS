import { z } from "zod";

// FR-6: Owner/Admin defines Units of Measure. Create+list only — Unit has
// no `isActive` column and no rename/disable AC in story 4.1/4.2.
export const createUnitSchema = z.object({
  name: z.string().min(1).max(50),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
