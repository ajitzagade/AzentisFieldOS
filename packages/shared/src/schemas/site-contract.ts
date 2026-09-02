import { z } from "zod";

// FR-56: the sole source of truth for Site Contract rate-type vocabulary —
// plain String on the Prisma model (not an enum), same convention as
// Purchase.paymentStatus, since CUSTOM's free-text rateUnitLabel needs
// schema-level flexibility a hard DB enum doesn't help with.
export const rateTypeSchema = z.enum([
  "FIXED_COST",
  "PER_TRIP",
  "PER_PIPE",
  "PER_UNIT",
  "CUSTOM",
]);

export type RateType = z.infer<typeof rateTypeSchema>;

export const contractStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

export type ContractStatusInput = z.infer<typeof contractStatusSchema>;

// Shared field-combination rules for both create and update — applied by
// the exported superRefine helper below, not duplicated between the two
// schemas.
function checkRateTypeFields(
  data: {
    rateType?: RateType | null;
    rate?: number | null;
    fixedAmount?: number | null;
    rateUnitLabel?: string | null;
  },
  ctx: z.RefinementCtx,
) {
  if (!data.rateType) return;

  if (data.rateType === "FIXED_COST") {
    if (data.fixedAmount === undefined || data.fixedAmount === null) {
      ctx.addIssue({ code: "custom", path: ["fixedAmount"], message: "Fixed Cost requires a total contract amount" });
    }
    if (data.rate !== undefined && data.rate !== null) {
      ctx.addIssue({ code: "custom", path: ["rate"], message: "Fixed Cost does not use a per-unit rate" });
    }
    if (data.rateUnitLabel) {
      ctx.addIssue({ code: "custom", path: ["rateUnitLabel"], message: "Fixed Cost does not use a unit label" });
    }
    return;
  }

  // PER_TRIP | PER_PIPE | PER_UNIT | CUSTOM all require a rate; only
  // PER_UNIT and CUSTOM additionally require a unit label.
  if (data.rate === undefined || data.rate === null) {
    ctx.addIssue({ code: "custom", path: ["rate"], message: `${data.rateType} requires a rate` });
  }
  if (data.fixedAmount !== undefined && data.fixedAmount !== null) {
    ctx.addIssue({ code: "custom", path: ["fixedAmount"], message: `${data.rateType} does not use a fixed amount` });
  }
  if ((data.rateType === "PER_UNIT" || data.rateType === "CUSTOM") && !data.rateUnitLabel) {
    ctx.addIssue({ code: "custom", path: ["rateUnitLabel"], message: `${data.rateType} requires a unit label` });
  }
}

export interface FieldIssue {
  path: string;
  message: string;
}

// FR-57: transitioning to ACTIVE requires work category, rate type, the
// rate-type-appropriate rate/amount, and a start date to all be present —
// "Active" means live and billable, never an engagement with unknown terms.
// This check runs against the CALLER-SUPPLIED merged view of the record
// (existing row overlaid with this request's fields) — see
// SiteContractsService, which is responsible for building that merged view
// before calling this on an update. On create, the input IS the full record.
//
// Returns plain issues rather than writing to a zod RefinementCtx, so this
// same function serves both createSiteContractSchema's superRefine (a real
// request body) AND SiteContractsService.update's merged-record check (a
// synthesized view that was never itself a zod parse) without needing a
// fake ctx object at either call site.
function collectActiveRequiredIssues(data: {
  status?: ContractStatusInput;
  workCategory?: string | null;
  rateType?: RateType | null;
  rate?: number | null;
  fixedAmount?: number | null;
  startDate?: Date | null;
}): FieldIssue[] {
  if (data.status !== "ACTIVE") return [];

  const issues: FieldIssue[] = [];
  if (!data.workCategory) {
    issues.push({ path: "workCategory", message: "Work category is required to activate a contract" });
  }
  if (!data.rateType) {
    issues.push({ path: "rateType", message: "Rate type is required to activate a contract" });
  } else if (data.rateType === "FIXED_COST") {
    if (data.fixedAmount === undefined || data.fixedAmount === null) {
      issues.push({ path: "fixedAmount", message: "Fixed amount is required to activate a Fixed Cost contract" });
    }
  } else if (data.rate === undefined || data.rate === null) {
    issues.push({ path: "rate", message: "Rate is required to activate this contract" });
  }
  if (!data.startDate) {
    issues.push({ path: "startDate", message: "Start date is required to activate a contract" });
  }
  return issues;
}

export const createSiteContractSchema = z
  .object({
    siteId: z.uuid(),
    subcontractorId: z.uuid(),
    workCategory: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    rateType: rateTypeSchema.optional(),
    rateUnitLabel: z.string().max(100).optional(),
    rate: z.number().positive().optional(),
    fixedAmount: z.number().positive().optional(),
    estimatedQuantity: z.number().positive().optional(),
    status: contractStatusSchema.default("DRAFT"),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    checkRateTypeFields(data, ctx);
    for (const issue of collectActiveRequiredIssues(data)) {
      ctx.addIssue({ code: "custom", path: [issue.path], message: issue.message });
    }
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date cannot be before start date" });
    }
  });

export type CreateSiteContractInput = z.infer<typeof createSiteContractSchema>;

// Same shape as create, `.partial()` — the ACTIVE-requires-terms check here
// validates only the fields present in THIS request; SiteContractsService is
// responsible for re-running `checkActiveRequiresTerms`-equivalent logic
// against the full merged record before persisting (a PATCH sending only
// `{ status: "ACTIVE" }` against a Draft row still missing terms must be
// rejected even though this schema alone can't see the stored row).
export const updateSiteContractSchema = z
  .object({
    workCategory: z.string().min(1).max(200).nullable(),
    description: z.string().max(1000).nullable(),
    rateType: rateTypeSchema.nullable(),
    rateUnitLabel: z.string().max(100).nullable(),
    rate: z.number().positive().nullable(),
    fixedAmount: z.number().positive().nullable(),
    estimatedQuantity: z.number().positive().nullable(),
    status: contractStatusSchema,
    startDate: z.coerce.date().nullable(),
    endDate: z.coerce.date().nullable(),
  })
  .partial()
  .superRefine((data, ctx) => {
    checkRateTypeFields(data, ctx);
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date cannot be before start date" });
    }
  });

export type UpdateSiteContractInput = z.infer<typeof updateSiteContractSchema>;

// Exported so SiteContractsService can re-run the ACTIVE-requires-terms
// check against a full merged record (existing row + this PATCH's fields)
// without duplicating the rule.
export { collectActiveRequiredIssues };
