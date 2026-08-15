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
// Member per request round-trip — every row in the batch is the same
// crew, at the same Site, on the same date, so a batch mixing Sites or
// dates is rejected rather than silently accepted.
export const createWorkRecordBatchSchema = z
  .array(createWorkRecordSchema)
  .min(1)
  .superRefine((records, ctx) => {
    const [first] = records;
    if (!first) return;
    records.forEach((record, index) => {
      if (record.siteId !== first.siteId) {
        ctx.addIssue({
          code: "custom",
          path: [index, "siteId"],
          message: "Every Work Record in a batch must be for the same Site",
        });
      }
      if (record.workDate !== first.workDate) {
        ctx.addIssue({
          code: "custom",
          path: [index, "workDate"],
          message: "Every Work Record in a batch must be for the same date",
        });
      }
    });
  });

export type CreateWorkRecordBatchInput = z.infer<typeof createWorkRecordBatchSchema>;
