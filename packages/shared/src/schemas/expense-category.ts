import { z } from "zod";

// FR-41, NFR-4 (Story 11.1 AC #1): ExpenseCategory is admin-configurable
// data, not a hardcoded enum — create+list only, same minimal scope every
// other lookup table in this project has (MachineryType/VehicleType/
// EmploymentType/Unit). Epic 14 owns the full admin lifecycle later.
export const createExpenseCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateExpenseCategoryInput = z.infer<
  typeof createExpenseCategorySchema
>;

// Story 14.3 (FR-49): rename/disable admin lifecycle — same shape and
// no-default reasoning as updateMachineryTypeSchema.
export const updateExpenseCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateExpenseCategoryInput = z.infer<
  typeof updateExpenseCategorySchema
>;
