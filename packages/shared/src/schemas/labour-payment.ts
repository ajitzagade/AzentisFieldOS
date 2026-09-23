import { z } from "zod";

// Labour Payment (2026-09-21) — a separate, decoupled system from
// TeamMember/Advance/Payment (packages/shared/src/schemas/advance.ts,
// advance-adjustment.ts, payment.ts), by explicit decision, for daily-wage
// labour paid on a weekly cycle. Follows the exact same AD-9 conventions
// those schemas already establish.

export const dailyLabourWeeklyPaymentStatusSchema = z.enum(["PAID", "PARTIAL", "UNPAID"]);

export const labourShiftSchema = z.enum(["DAY", "NIGHT"]);

// Fixed category set (2026-09-23) — the request's Men/Women/Mistri
// requirement, enforced here and in the create form's SelectField. The
// underlying Prisma column stays a plain String (soft constraint only, see
// this schema's own module comment below) — DailyLabourer is one day old
// with zero seed/production data and no downstream aggregation reads
// `category`, so a hard enum migration buys no real safety yet. Exported as
// one reusable const so the DSR labour dropdown goal (deferred) can reuse it
// without re-deriving its own list.
export const DAILY_LABOURER_CATEGORIES = ["Men", "Women", "Mistri"] as const;

export const createDailyLabourerSchema = z.object({
  name: z.string().min(1).max(200),
  // Fixed set (Men/Women/Mistri) — was free text (e.g. "Mason", "Helper"),
  // matching DailySiteReport's labourEntries.category convention. The
  // DailyLabourer.category column itself stays a plain Prisma String; only
  // this Zod schema (and the create form's SelectField) constrain it, no
  // lookup table / DB enum.
  category: z.enum(DAILY_LABOURER_CATEGORIES),
  defaultPerDayAmount: z.number().positive().optional(),
  isActive: z.boolean().default(true),
});

export type CreateDailyLabourerInput = z.infer<typeof createDailyLabourerSchema>;

// One row per Labourer per Site per date per shift — a labourer may have an
// independent Day entry AND Night entry on the same date. A correction is a
// fresh row (correctsId set) restating attended/perDayAmount/isHalfDay for
// that same date+shift — never an edit of the original (AD-9); a
// correction's shift must match the original's, enforced at the service
// level (a Zod cross-field check can't see the original row). `isHalfDay` is
// a descriptive flag only — the UI suggests half of defaultPerDayAmount when
// toggled, but perDayAmount is stored exactly as given, never derived here.
// `advance` is the daily-entry form's optional "Advance" checkbox (per the
// ask) — when present, a DailyLabourAdvance is created in the same
// transaction as this attendance row (never on a correction, since
// re-filing a day's attendance must not silently create a second advance).
export const createDailyLabourAttendanceSchema = z
  .object({
    labourerId: z.uuid(),
    siteId: z.uuid(),
    workDate: z.iso.date(),
    shift: labourShiftSchema.default("DAY"),
    isHalfDay: z.boolean().default(false),
    attended: z.boolean().default(true),
    perDayAmount: z.number().positive(),
    advance: z
      .object({
        amount: z.number().positive(),
        description: z.string().max(500).optional(),
      })
      .optional(),
    correctsId: z.uuid().optional(),
    correctionReason: z.string().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.correctsId) {
      if (!data.correctionReason) {
        ctx.addIssue({
          code: "custom",
          path: ["correctionReason"],
          message: "A reason is required when filing a correction",
        });
      }
      if (data.advance) {
        ctx.addIssue({
          code: "custom",
          path: ["advance"],
          message: "A correction cannot also record a new Advance — record the Advance separately",
        });
      }
    }
  });

export type CreateDailyLabourAttendanceInput = z.infer<typeof createDailyLabourAttendanceSchema>;

// Append-only (AD-9) — same shape/rules as createAdvanceSchema, scoped to
// DailyLabourer. `description` is the business reason the advance was
// given — a different field from correctionReason (only set when this
// entry corrects another one).
export const createDailyLabourAdvanceSchema = z
  .object({
    labourerId: z.uuid(),
    amount: z.number(),
    description: z.string().max(500).optional(),
    givenAt: z.iso.date(),
    correctsId: z.uuid().optional(),
    correctionReason: z.string().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.correctsId) {
      if (data.amount === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "A correction's amount delta must not be zero",
        });
      }
      if (!data.correctionReason) {
        ctx.addIssue({
          code: "custom",
          path: ["correctionReason"],
          message: "A reason is required when filing a correction",
        });
      }
    } else if (data.amount <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Amount must be positive",
      });
    }
  });

export type CreateDailyLabourAdvanceInput = z.infer<typeof createDailyLabourAdvanceSchema>;

// FR-23's equivalent for this module: `advanceId` is required for audit
// traceability, but the cap check and balance decrement this schema's
// amount feeds are always against the Labourer-pooled
// DailyLabourer.outstandingAdvanceBalance, never a per-Advance remainder —
// same reasoning as createAdvanceAdjustmentSchema.
export const createDailyLabourAdvanceAdjustmentSchema = z
  .object({
    advanceId: z.uuid(),
    paymentId: z.uuid().optional(),
    amount: z.number(),
    note: z.string().max(500).optional(),
    adjustedAt: z.iso.date(),
    correctsId: z.uuid().optional(),
    correctionReason: z.string().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.correctsId) {
      if (data.amount === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "A correction's amount delta must not be zero",
        });
      }
      if (!data.correctionReason) {
        ctx.addIssue({
          code: "custom",
          path: ["correctionReason"],
          message: "A reason is required when filing a correction",
        });
      }
    } else if (data.amount <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Amount must be positive",
      });
    }
  });

export type CreateDailyLabourAdvanceAdjustmentInput = z.infer<typeof createDailyLabourAdvanceAdjustmentSchema>;

// One settlement per (labourerId, weekStartDate=Sunday). totalEarned/
// weekEndDate are always server-computed from that week's attendance —
// deliberately absent here so they can never be trusted from the request
// body (same reasoning createPaymentSchema's own comment gives for Net
// Payable). A correcting Payment is a complete new row with correctsId set
// and the full, correct set of inputs re-entered — not a signed delta,
// same as Payment above (amountPaid/status have no natural "delta" form).
export const createDailyLabourWeeklyPaymentSchema = z
  .object({
    labourerId: z.uuid(),
    weekStartDate: z.iso.date(),
    amountPaid: z.number().nonnegative(),
    status: dailyLabourWeeklyPaymentStatusSchema,
    // Optional — defaults to today server-side when status isn't UNPAID.
    // Lets the Owner backdate a settlement recorded a day or two late.
    paidAt: z.iso.date().optional(),
    // Optional linked Adjustment — omitting it is valid (no advance taken,
    // or none adjusted this week), no warning.
    advanceAdjustment: z
      .object({
        advanceId: z.uuid(),
        amount: z.number().positive(),
        note: z.string().max(500).optional(),
      })
      .optional(),
    correctsId: z.uuid().optional(),
    reason: z.string().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    // Sunday check: z.iso.date() coerces to UTC midnight for getUTCDay().
    // Only applies to fresh (non-correction) submissions — a correction must
    // restate the original row's exact weekStartDate, which may be
    // Monday-anchored for any pre-existing row (the only anchor the old
    // schema ever allowed). The service's create() separately enforces that
    // a correction's weekStartDate matches the original's exactly.
    if (!data.correctsId && new Date(data.weekStartDate).getUTCDay() !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["weekStartDate"],
        message: "Week must start on a Sunday",
      });
    }
    if (data.correctsId && !data.reason) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "A reason is required when filing a correction",
      });
    }
  });

export type CreateDailyLabourWeeklyPaymentInput = z.infer<typeof createDailyLabourWeeklyPaymentSchema>;
