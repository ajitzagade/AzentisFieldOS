import { z } from "zod";

// FR-4: Owner/Admin creates and maintains Materials within a Category,
// each tied to a Unit of Measure. Single schema reused by apps/api
// (source of truth) and apps/web, per AD-7.
export const createMaterialSchema = z.object({
  name: z.string().min(1).max(200),
  categoryId: z.uuid(),
  unitId: z.uuid(),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;

// FR-7: a Custom Field definition is { label, type }, stored as a JSON
// array on the Material — see Dev Notes "Why an array, and why a closed
// type enum" (story 4.3). The type enum is closed (not a free string) so
// every future entry-form renderer can handle a small, deterministic set
// of input kinds. `.max(20)` is a sane implementation cap, not a product
// requirement — adjust only with a documented reason.
export const customFieldTypeSchema = z.enum(["TEXT", "NUMBER", "DATE"]);
export const customFieldDefinitionSchema = z.object({
  label: z.string().min(1).max(100),
  type: customFieldTypeSchema,
});
export const customFieldsSchema = z.array(customFieldDefinitionSchema).max(20);

export type CustomFieldType = z.infer<typeof customFieldTypeSchema>;
export type CustomFieldDefinition = z.infer<typeof customFieldDefinitionSchema>;

// `isActive`/`customFields` overridden to bare (no `.default()`) before
// `.partial()` — same default-on-partial trap as updateSiteSchema /
// updateMaterialCategorySchema; see those files for the full explanation.
// Custom Fields are edited via this same Material PATCH, not a separate
// endpoint — there is no independent lifecycle for a Custom Field apart
// from the Material it belongs to, so it's not on createMaterialSchema.
// FR-36: admin-configurable per-Material low-stock threshold, compared
// against that Material's balance summed across all its Sizes (Story 5.7
// Dev Notes "Per-Material vs per-Size threshold"). Nullable — omitting it
// (or clearing it to null) means the Material is never flagged.
export const updateMaterialSchema = z
  .object({
    ...createMaterialSchema.shape,
    isActive: z.boolean(),
    customFields: customFieldsSchema,
    lowStockThreshold: z.number().positive().nullable(),
  })
  .partial();

export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;

// FR-5: Sizes/Specifications are purely additive — no update/delete schema
// exists, intentionally (AC #2: adding a Size later must never disturb
// existing Stock records tied to a Material's prior Sizes).
export const createMaterialSizeSchema = z.object({
  label: z.string().min(1).max(50),
});

export type CreateMaterialSizeInput = z.infer<typeof createMaterialSizeSchema>;
