import { z } from "zod";

// FR-28: One DSR per Site per date. This is the single schema for the
// create shape — reused by apps/api (source of truth) and apps/web
// (client-side validation), per architecture spine AD-7.
//
// Photos are deliberately not part of this schema — story 3.1 leaves
// photo capture as a visual-only placeholder; story 3.3 wires the actual
// R2 upload flow as a separate POST /photos/presign + POST /photos pair,
// not a field on this payload.
export const dsrWorkRecordSchema = z.object({
  teamMemberId: z.string(),
  attended: z.boolean().default(true),
  hours: z.number().positive().optional(),
  overtimeHours: z.number().positive().optional(),
});

// Consumption/RmcEntry/Expense have no natural composite key the way
// DailySiteReport (siteId+reportDate) and WorkRecord (teamMemberId+
// workDate) do — a Site can legitimately have two separate Consumption
// entries for the same Material on the same day. `clientGeneratedId` is
// set by the offline queue (story 3.2) at queue-write time so a retried
// sync upserts the same row instead of creating a duplicate; absent for
// a plain online submission (apps/api falls back to a plain create).
export const dsrConsumptionSchema = z.object({
  materialSizeId: z.string(),
  quantity: z.number().positive(),
  activityReference: z.string().optional(),
  clientGeneratedId: z.string().optional(),
});

export const dsrRmcEntrySchema = z.object({
  vendorId: z.string(),
  quantityM3: z.number().positive(),
  grade: z.string().min(1),
  // Nullable (client-readiness batch, goal 1) — a delivery may be recorded
  // before pricing is known; totalAmount then stays null (see dsr.service).
  ratePerM3: z.number().positive().optional(),
  // totalAmount is server-computed (quantityM3 * ratePerM3) — never
  // accepted from the client.
  clientGeneratedId: z.string().optional(),
});

export const dsrExpenseSchema = z.object({
  categoryId: z.string(),
  amount: z.number().positive(),
  description: z.string().optional(),
  paymentMethod: z.string().optional(),
  personOrVendor: z.string().optional(),
  clientGeneratedId: z.string().optional(),
});

export const dsrEquipmentUsedSchema = z
  .object({
    type: z.enum(["MACHINERY", "VEHICLE", "OTHER"]),
    // Present for MACHINERY/VEHICLE (a Machinery/Vehicle register id);
    // absent for OTHER — a free-text vehicle/equipment that never touches
    // either register (client-readiness batch, goal 2).
    id: z.string().optional(),
    name: z.string().optional(),
    // Optional per-row note (goal 5). Doubles as the OTHER variant's
    // required free-text description instead of a separate field.
    description: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "OTHER") {
      if (!data.description || data.description.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["description"],
          message: "A description is required for Other Vehicle",
        });
      }
    } else {
      if (!data.id) {
        ctx.addIssue({ code: "custom", path: ["id"], message: "id is required" });
      }
      if (!data.name) {
        ctx.addIssue({ code: "custom", path: ["name"], message: "name is required" });
      }
    }
  });

export type DsrEquipmentUsed = z.infer<typeof dsrEquipmentUsedSchema>;

// Free-text Category (human-confirmed — a lookup table would be premature,
// same reasoning as WasteDisposal.wasteType). `total` is derived
// client-side (men + women) and never submitted as its own field.
export const dsrLabourEntrySchema = z
  .object({
    category: z.string().min(1),
    men: z.number().int().nonnegative(),
    women: z.number().int().nonnegative(),
    clientGeneratedId: z.string().optional(),
  })
  // Defense-in-depth (client-readiness batch review): the web forms already
  // filter out a men=0/women=0 row before submitting, but that filter used
  // to compare the raw string form value (`"0"` is truthy) — a direct API
  // call must not be able to record a category with nobody in it either.
  .refine((d) => d.men > 0 || d.women > 0, {
    message: "At least one worker required",
  });

export type DsrLabourEntry = z.infer<typeof dsrLabourEntrySchema>;

// Picks from the existing Subcontractor register; workNote is a free-text
// note about what the Subcontractor did that day.
export const dsrSubcontractorEntrySchema = z.object({
  subcontractorId: z.string(),
  workNote: z.string().optional(),
  clientGeneratedId: z.string().optional(),
});

export type DsrSubcontractorEntry = z.infer<typeof dsrSubcontractorEntrySchema>;

export const createDsrSchema = z.object({
  siteId: z.string(),
  reportDate: z.iso.date(), // YYYY-MM-DD
  workCompleted: z.string().optional(),
  workInProgress: z.string().optional(),
  plannedWork: z.string().optional(),
  issuesBlockers: z.string().optional(),
  safetyObservations: z.string().optional(),
  notes: z.string().optional(),
  workRecords: z.array(dsrWorkRecordSchema).default([]),
  consumptions: z.array(dsrConsumptionSchema).default([]),
  rmcEntries: z.array(dsrRmcEntrySchema).default([]),
  expenses: z.array(dsrExpenseSchema).default([]),
  equipmentUsed: z.array(dsrEquipmentUsedSchema).default([]),
  subcontractorEntries: z.array(dsrSubcontractorEntrySchema).default([]),
  labourEntries: z.array(dsrLabourEntrySchema).default([]),
});

export type CreateDsrInput = z.infer<typeof createDsrSchema>;

// spec-dsr-drafts (AD-7): the single validator for a Save Draft, imported by
// both apps/api (source of truth) and apps/web (inline pre-submit errors). A
// DRAFT is a partial, still-being-built report — the exact same field shape
// as a full submission, but nothing beyond the (siteId, reportDate) it is
// keyed on is required. The sub-record arrays already default to [] in
// createDsrSchema, so a draft with no crew/materials/expenses yet validates
// cleanly; each row that *is* present is still validated by its own schema,
// so Finalize can materialise it straight from draftContent without
// re-parsing. Kept as a distinct export (not an alias) so the draft and
// submit shapes can diverge later without touching either call site.
export const saveDraftSchema = createDsrSchema;

export type SaveDraftInput = z.infer<typeof saveDraftSchema>;

// spec-dsr-drafts (review, item 5): GET /dsr/draft query validation — siteId
// required, date a valid ISO calendar day. Rejecting malformed input at the
// controller keeps `new Date(undefined)`/`new Date("garbage")` from ever
// reaching Prisma as an Invalid Date.
export const getDraftQuerySchema = z.object({
  siteId: z.uuid(),
  date: z.iso.date(), // YYYY-MM-DD
});

export type GetDraftQuery = z.infer<typeof getDraftQuerySchema>;

// spec-dsr-drafts (review, item 5): a draft id path param must be a real
// uuid — a malformed id is a 400, never a value passed on to Prisma.
export const draftIdParamSchema = z.uuid();

// Story 3.5 (AD-9, FR-54): a correction submits the exact same field set as
// a plain DSR — same reused shape, not a parallel one — plus a required
// reason explaining what's being corrected and why.
export const correctDsrSchema = createDsrSchema.extend({
  reason: z.string().min(1),
});

export type CorrectDsrInput = z.infer<typeof correctDsrSchema>;
