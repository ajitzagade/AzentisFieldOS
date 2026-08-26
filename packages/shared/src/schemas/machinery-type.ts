import { z } from "zod";

// FR-15, NFR-4: admin-configurable data, not a hardcoded enum or free
// string — create+list only, same minimal scope Epic 6 gave EmploymentType
// (Epic 14 owns the full admin lifecycle).
export const createMachineryTypeSchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateMachineryTypeInput = z.infer<typeof createMachineryTypeSchema>;

// Story 14.3 (FR-49): the rename/disable admin lifecycle Epic 8 deferred to
// Epic 14. Both fields are `.optional()` with NO `.default()` — unlike
// Material's history, `isActive` was never a defaulted field on this schema, so
// there is no "re-enable on every partial edit" trap to guard against; parse({})
// is a true no-op. Source of truth in apps/api, reused by apps/web (AD-7).
export const updateMachineryTypeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateMachineryTypeInput = z.infer<typeof updateMachineryTypeSchema>;
