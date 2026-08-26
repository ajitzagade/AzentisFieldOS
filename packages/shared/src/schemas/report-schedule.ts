import { z } from "zod";

// Story 14.5 (FR-51): a scheduled report configuration, independent of the
// daily-DSR delivery (FR-50). `reportType` covers Epic 13 Stories 13.2–13.4's
// five report domains (Machinery/Vehicle counted as one, per Story 13.3's own
// grouping); `frequency` is the cadence. Defined once here, imported by both
// apps/api (source of truth) and apps/web (AD-7).
export const REPORT_SCHEDULE_TYPES = [
  "SITE",
  "INVENTORY",
  "LABOUR",
  "MACHINERY_VEHICLE",
  "FINANCIAL",
] as const;

export const REPORT_SCHEDULE_FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY"] as const;

export const reportScheduleTypeSchema = z.enum(REPORT_SCHEDULE_TYPES);
export const reportScheduleFrequencySchema = z.enum(REPORT_SCHEDULE_FREQUENCIES);

export type ReportScheduleType = z.infer<typeof reportScheduleTypeSchema>;
export type ReportScheduleFrequency = z.infer<typeof reportScheduleFrequencySchema>;

export const createReportScheduleSchema = z.object({
  reportType: reportScheduleTypeSchema,
  frequency: reportScheduleFrequencySchema,
  recipientUserIds: z.array(z.uuid()).default([]),
  siteId: z.uuid().optional(),
  enabled: z.boolean().default(true),
});

export type CreateReportScheduleInput = z.infer<typeof createReportScheduleSchema>;

// Partial edit. `enabled` is overridden to a bare boolean (no `.default()`)
// before `.partial()` — the same re-enable-on-empty trap updateMaterialCategory
// / updateSite guard against: without it, updateReportScheduleSchema.parse({})
// would silently return `{ enabled: true }`, re-enabling a paused schedule on
// every edit that doesn't touch it. siteId stays optional+nullable so a
// Site-scoped schedule can be widened back to all Sites with an explicit null.
export const updateReportScheduleSchema = z
  .object({
    reportType: reportScheduleTypeSchema,
    frequency: reportScheduleFrequencySchema,
    recipientUserIds: z.array(z.uuid()),
    siteId: z.uuid().nullable(),
    enabled: z.boolean(),
  })
  .partial();

export type UpdateReportScheduleInput = z.infer<typeof updateReportScheduleSchema>;
