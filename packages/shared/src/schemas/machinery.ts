import { z } from "zod";

// FR-15: name/type/assetNumber/model/ownership/operator are ordinary
// master-data fields, edited via Edit not CorrectAction (AC #3) —
// currentStatus/currentSiteId are deliberately absent from both schemas
// below; they're exclusively written by Story 8.2's movement-recording
// transaction.
export const createMachinerySchema = z.object({
  name: z.string().min(1).max(200),
  typeId: z.uuid(),
  assetNumber: z.string().min(1).max(100),
  model: z.string().max(200).optional(),
  ownership: z.string().max(200).optional(),
  operator: z.string().max(200).optional(),
});

export type CreateMachineryInput = z.infer<typeof createMachinerySchema>;

// Same full-replace-PATCH reasoning as team-member.ts: the edit form
// resubmits every field, so an intentionally-blanked optional field must
// be representable as an explicit `null`, not just omitted.
export const updateMachinerySchema = z
  .object({
    ...createMachinerySchema.shape,
    model: z.string().max(200).nullable(),
    ownership: z.string().max(200).nullable(),
    operator: z.string().max(200).nullable(),
  })
  .partial();

export type UpdateMachineryInput = z.infer<typeof updateMachinerySchema>;
