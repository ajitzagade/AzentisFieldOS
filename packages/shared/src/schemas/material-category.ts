import { z } from "zod";

// FR-4: Owner/Admin creates and maintains Material Categories. Single
// schema reused by apps/api (source of truth) and apps/web, per AD-7.
export const createMaterialCategorySchema = z.object({
  name: z.string().min(1).max(200),
});

export type CreateMaterialCategoryInput = z.infer<typeof createMaterialCategorySchema>;

// `isActive` is overridden to the bare boolean (no `.default()`) before
// `.partial()` — same trap `updateSiteSchema` already hit and fixed: Zod
// re-applies a field's default whenever that key is absent from input,
// independent of `.partial()`. Without this override,
// updateMaterialCategorySchema.parse({}) would silently return
// `{ isActive: true }` instead of a true no-op, re-enabling a disabled
// Category on every edit that doesn't touch isActive.
export const updateMaterialCategorySchema = z
  .object({ ...createMaterialCategorySchema.shape, isActive: z.boolean() })
  .partial();

export type UpdateMaterialCategoryInput = z.infer<typeof updateMaterialCategorySchema>;
