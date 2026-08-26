import { z } from "zod";

// FR-19, NFR-4: create+list only — Epic 14 owns the full admin lifecycle
// (Story 6.1's own AC #3 scope). Single schema reused by apps/api (source
// of truth) and apps/web, per AD-7.
export const createEmploymentTypeSchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateEmploymentTypeInput = z.infer<typeof createEmploymentTypeSchema>;

// Story 14.3 (FR-49): the rename/disable admin lifecycle Story 6.1 deferred to
// Epic 14. EmploymentType already carried the `isActive` column since Epic 6;
// it just never got an update schema. Both fields `.optional()`, no `.default()`
// — parse({}) is a true no-op. Source of truth in apps/api, reused by apps/web.
export const updateEmploymentTypeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateEmploymentTypeInput = z.infer<typeof updateEmploymentTypeSchema>;
