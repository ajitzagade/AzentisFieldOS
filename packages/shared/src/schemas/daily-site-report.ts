import { z } from "zod";
import {
  WASTE_DISPOSAL_OWNERSHIP,
  WASTE_DISPOSAL_PAYMENT_STATUSES,
} from "./waste-disposal";

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

// spec-dsr-labour-dropdown, revised 2026-09-24 (user-requested): a DSR
// Labour row supports TWO entry modes together on one row — the
// named-Labourer picker (searchable dropdown + inline quick-create) AND a
// Men/Women/Mistri headcount tally, all four fields optional. A row is
// complete when at least one is set (pick a person, or just log a count, or
// both). `.strict()` so a legacy {category,...} row (below) can never
// accidentally validate against THIS schema first in the union — Zod
// silently strips unknown keys rather than rejecting them by default, which
// would otherwise parse a legacy row through here and silently drop its
// `category` field.
export const dsrLabourEntryNewSchema = z
  .object({
    labourerId: z.string().optional(),
    men: z.number().int().nonnegative().optional(),
    women: z.number().int().nonnegative().optional(),
    mistri: z.number().int().nonnegative().optional(),
    clientGeneratedId: z.string().optional(),
  })
  .strict()
  .refine((d) => !!d.labourerId || (d.men ?? 0) > 0 || (d.women ?? 0) > 0 || (d.mistri ?? 0) > 0, {
    message: "Pick a Labourer or enter at least one headcount (Men/Women/Mistri)",
  });

export type DsrLabourEntryNew = z.infer<typeof dsrLabourEntryNewSchema>;

// Free-text Category (human-confirmed — a lookup table would be premature,
// same reasoning as WasteDisposal.wasteType). `total` is derived
// client-side (men + women) and never submitted as its own field.
//
// spec-dsr-labour-dropdown: this is the LEGACY shape, kept valid only so a
// historical row already stored in DailySiteReport.labourEntries keeps
// validating and rendering exactly as before (AD-9) — predates both the
// named-picker AND the restored Men/Women/Mistri tally above, which is a
// distinct shape (three fixed categories, no free-text `category` field).
// `.strict()` — see dsrLabourEntryNewSchema's comment above for why.
export const dsrLabourEntryLegacySchema = z
  .object({
    category: z.string().min(1),
    men: z.number().int().nonnegative(),
    women: z.number().int().nonnegative(),
    clientGeneratedId: z.string().optional(),
  })
  .strict()
  // Defense-in-depth (client-readiness batch review): the web forms already
  // filter out a men=0/women=0 row before submitting, but that filter used
  // to compare the raw string form value (`"0"` is truthy) — a direct API
  // call must not be able to record a category with nobody in it either.
  .refine((d) => d.men > 0 || d.women > 0, {
    message: "At least one worker required",
  });

export type DsrLabourEntryLegacy = z.infer<typeof dsrLabourEntryLegacySchema>;

// spec-dsr-labour-dropdown: a union — new writes always match
// dsrLabourEntryNewSchema (labourerId and/or Men/Women/Mistri), while a
// historical free-text-category row still matches dsrLabourEntryLegacySchema.
// Never migrated/rewritten (AD-9) — both shapes stay valid indefinitely.
export const dsrLabourEntrySchema = z.union([dsrLabourEntryNewSchema, dsrLabourEntryLegacySchema]);

export type DsrLabourEntry = z.infer<typeof dsrLabourEntrySchema>;

// Picks from the existing Subcontractor register; workNote is a free-text
// note about what the Subcontractor did that day.
//
// Revised 2026-09-24 (user-requested): workNote and siteContractId are now
// REQUIRED — every DSR-tagged Subcontractor must carry a note and link to a
// real Site Contract (any status; dsr.service.ts's syncMissingSiteContracts
// auto-creates a bare Draft one the moment a new Subcontractor is named, so
// a contract always exists to link to by submit time). Only `quantity`
// stays optional — Work Entries can only be recorded against an Active
// contract (work-entry-write.ts), so a Draft-linked row simply can't have
// one yet. This validates NEW writes only (POST /dsr, /dsr/:id/correct,
// /dsr/draft) — a historical row's already-stored JSON is never re-validated
// or rewritten (AD-9), so this change can't retroactively invalidate
// anything already submitted.
export const dsrSubcontractorEntrySchema = z.object({
  subcontractorId: z.string(),
  workNote: z.string().min(1, "Work note is required"),
  clientGeneratedId: z.string().optional(),
  siteContractId: z.string().min(1, "Site Contract is required"),
  quantity: z.number().positive().optional(),
});

export type DsrSubcontractorEntry = z.infer<typeof dsrSubcontractorEntrySchema>;

// spec-dsr-activity-sync-detail-panel (goal 3): a DSR-embedded Waste
// Material entry. Reuses createWasteDisposalSchema's (waste-disposal.ts)
// OWN/HIRED branching and vendor/machinery/vehicle-or-text superRefine,
// minus siteId/disposedAt/recordedByUserId/correctsId/reason/the advance
// sub-object (those are either DSR-level context or explicitly out of scope
// here — see the "Never add VendorAdvance" boundary), plus
// clientGeneratedId for the same offline-sync/DSR-correction matching every
// other DSR sub-record uses.
export const dsrWasteDisposalEntrySchema = z
  .object({
    wasteType: z.string().min(1).max(200),
    quantityDetails: z.string().max(200).optional(),
    ownership: z.enum(WASTE_DISPOSAL_OWNERSHIP),
    vendorId: z.uuid().optional(),
    machineryId: z.uuid().optional(),
    vehicleId: z.uuid().optional(),
    vehicleDetails: z.string().max(200).optional(),
    tripCount: z.number().int().positive(),
    // Nullable/all-or-none with paymentStatus (D7 pattern) — a Supervisor
    // may log a trip on the Daily Report before pricing is known.
    ratePerTrip: z.number().nonnegative().optional(),
    otherCharges: z.number().nonnegative().optional(),
    disposalLocation: z.string().max(300).optional(),
    paymentStatus: z.enum(WASTE_DISPOSAL_PAYMENT_STATUSES).optional(),
    notes: z.string().max(1000).optional(),
    clientGeneratedId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.machineryId && data.vehicleId) {
      ctx.addIssue({
        code: "custom",
        path: ["vehicleId"],
        message: "Pick either a Machinery or a Vehicle, not both",
      });
    }

    if (data.ownership === "HIRED") {
      if (!data.vendorId) {
        ctx.addIssue({
          code: "custom",
          path: ["vendorId"],
          message: "A hired disposal must name the Vendor/party being paid",
        });
      }
      const hasRate = data.ratePerTrip !== undefined;
      const hasStatus = data.paymentStatus !== undefined;
      if (hasRate && !hasStatus) {
        ctx.addIssue({
          code: "custom",
          path: ["paymentStatus"],
          message: "Payment status is required once a rate is entered",
        });
      }
      if (!hasRate && hasStatus) {
        ctx.addIssue({
          code: "custom",
          path: ["ratePerTrip"],
          message: "Rate is required when Payment Status is set",
        });
      }
    } else {
      if (data.vendorId) {
        ctx.addIssue({
          code: "custom",
          path: ["vendorId"],
          message: "An own-vehicle disposal has no Vendor to pay",
        });
      }
      if (data.paymentStatus) {
        ctx.addIssue({
          code: "custom",
          path: ["paymentStatus"],
          message: "Payment status applies only to hired disposals",
        });
      }
    }
  });

export type DsrWasteDisposalEntry = z.infer<typeof dsrWasteDisposalEntrySchema>;

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
  wasteDisposalEntries: z.array(dsrWasteDisposalEntrySchema).default([]),
});

export type CreateDsrInput = z.infer<typeof createDsrSchema>;

// Revised 2026-09-24: workNote/siteContractId became required on
// dsrSubcontractorEntrySchema for a real submission (user-requested), but a
// DRAFT is explicitly a partial, still-being-built report — a Subcontractor
// row picked but not yet fully filled in must still be saveable, or "Save
// Draft" would block on exactly the in-progress state it exists to capture.
// This is the pre-2026-09-24 relaxed shape, kept ONLY for drafts.
const dsrSubcontractorEntryDraftSchema = z.object({
  subcontractorId: z.string(),
  workNote: z.string().optional(),
  clientGeneratedId: z.string().optional(),
  siteContractId: z.string().optional(),
  quantity: z.number().positive().optional(),
});

// spec-dsr-drafts (AD-7): the single validator for a Save Draft, imported by
// both apps/api (source of truth) and apps/web (inline pre-submit errors). A
// DRAFT is a partial, still-being-built report — the exact same field shape
// as a full submission, but nothing beyond the (siteId, reportDate) it is
// keyed on is required. The sub-record arrays already default to [] in
// createDsrSchema, so a draft with no crew/materials/expenses yet validates
// cleanly; each row that *is* present is still validated by its own schema,
// so Finalize can materialise it straight from draftContent without
// re-parsing. subcontractorEntries is the one deliberate divergence (see
// dsrSubcontractorEntryDraftSchema above) — everything else stays identical
// to createDsrSchema.
export const saveDraftSchema = createDsrSchema.extend({
  subcontractorEntries: z.array(dsrSubcontractorEntryDraftSchema).default([]),
});

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

// spec-dsr-reassign-site-date: Owner-only "Reassign Site/Date" action —
// a narrow, sanctioned AD-9 exception (same class as D7's Purchase-pricing
// completion) that updates only the two identity fields of an uncorrected
// report in place. Deliberately NOT createDsrSchema-derived — this never
// touches any other field on the report.
export const reassignDsrSiteDateSchema = z.object({
  siteId: z.string(),
  reportDate: z.iso.date(), // YYYY-MM-DD
});

export type ReassignDsrSiteDateInput = z.infer<typeof reassignDsrSiteDateSchema>;
