import { z } from "zod";

// FR-6: Owner/Admin defines Units of Measure.
export const createUnitSchema = z.object({
  name: z.string().min(1).max(50),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;

// FR-49: the rename/disable admin lifecycle every other lookup type
// (MachineryType, VehicleType, EmploymentType, ExpenseCategory) already has.
// Both fields `.optional()` with NO `.default()` — `isActive` was never a
// defaulted field on this schema, so there is no "re-enable on every partial
// edit" trap to guard against; parse({}) is a true no-op. Source of truth in
// apps/api, reused by apps/web (AD-7).
export const updateUnitSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
