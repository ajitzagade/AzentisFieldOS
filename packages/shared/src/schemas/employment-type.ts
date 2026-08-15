import { z } from "zod";

// FR-19, NFR-4: create+list only — Epic 14 owns the full admin lifecycle
// (Story 6.1's own AC #3 scope). Single schema reused by apps/api (source
// of truth) and apps/web, per AD-7.
export const createEmploymentTypeSchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateEmploymentTypeInput = z.infer<typeof createEmploymentTypeSchema>;
