import { z } from "zod";

// FR-20: no dailySiteReportId here — that's populated once Epic 3's DSR
// flow links a Work Record to itself, never set directly by this story's
// standalone entry form.
export const createWorkRecordSchema = z.object({
  teamMemberId: z.uuid(),
  siteId: z.uuid(),
  workDate: z.iso.date(),
  attended: z.boolean().default(true),
  hours: z.number().nonnegative().optional(),
  overtimeHours: z.number().nonnegative().optional(),
});

export type CreateWorkRecordInput = z.infer<typeof createWorkRecordSchema>;

// AC #2: checklist-style entry for a whole crew at once, not one Team
// Member per request round-trip.
export const createWorkRecordBatchSchema = z.array(createWorkRecordSchema).min(1);

export type CreateWorkRecordBatchInput = z.infer<typeof createWorkRecordBatchSchema>;
