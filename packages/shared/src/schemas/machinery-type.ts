import { z } from "zod";

// FR-15, NFR-4: admin-configurable data, not a hardcoded enum or free
// string — create+list only, same minimal scope Epic 6 gave EmploymentType
// (Epic 14 owns the full admin lifecycle).
export const createMachineryTypeSchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateMachineryTypeInput = z.infer<typeof createMachineryTypeSchema>;
