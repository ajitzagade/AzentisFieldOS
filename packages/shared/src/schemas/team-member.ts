import { z } from "zod";

// FR-19: Owner/Admin creates and maintains Team Member records. Single
// schema reused by apps/api (source of truth) and apps/web, per AD-7.
// Deliberately no siteId field/relation anywhere on this shape — a Team
// Member is never bound to one Site (AC #2); assignment is derived only
// from WorkRecord.
export const createTeamMemberSchema = z.object({
  name: z.string().min(1).max(200),
  designation: z.string().max(200).optional(),
  contact: z.string().max(100).optional(),
  employmentTypeId: z.uuid(),
});

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;

// `isActive` overridden to the bare boolean (no `.default()`) before
// `.partial()` — the same default-on-partial trap documented in
// material-category.ts/site.ts: without this, updateTeamMemberSchema.parse({})
// would silently return `{ isActive: true }` instead of a true no-op.
export const updateTeamMemberSchema = z
  .object({ ...createTeamMemberSchema.shape, isActive: z.boolean() })
  .partial();

export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;
