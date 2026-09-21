import { createDailyLabourAttendanceSchema, createDailyLabourWeeklyPaymentSchema } from "@azentisfieldos/shared";
import { optionalNumber } from "../../../../lib/parse-helpers";

// The single FormData→schema coercion for the attendance entry form (AD-7),
// run by both the Server Action and the client's useClientValidation hook.
// The "Advance" checkbox nests amount/description under `advance` — absent
// entirely unless the checkbox is on, so the shared schema's `.optional()`
// stays honest about "no advance this entry" vs. "an advance of ₹0".
export function parseCreateAttendanceForm(formData: FormData) {
  const advanceChecked = formData.get("advanceGiven") === "1";
  return createDailyLabourAttendanceSchema.safeParse({
    labourerId: formData.get("labourerId"),
    siteId: formData.get("siteId"),
    workDate: formData.get("workDate"),
    attended: formData.get("attended") === "1",
    perDayAmount: optionalNumber(formData.get("perDayAmount")),
    advance: advanceChecked
      ? {
          amount: optionalNumber(formData.get("advanceAmount")),
          description: formData.get("advanceDescription") || undefined,
        }
      : undefined,
    correctsId: formData.get("correctsId") || undefined,
    correctionReason: formData.get("correctionReason") || undefined,
  });
}

// Same AD-7 pattern for the weekly settlement form. The linked Advance
// Adjustment nests under `advanceAdjustment` — omitted entirely when the
// Owner leaves the "Adjust an Advance" amount blank (no advance taken, or
// none adjusted this week).
export function parseCreateWeeklyPaymentForm(formData: FormData) {
  const adjustAdvanceId = formData.get("adjustAdvanceId");
  const adjustAmount = optionalNumber(formData.get("adjustAmount"));
  return createDailyLabourWeeklyPaymentSchema.safeParse({
    labourerId: formData.get("labourerId"),
    weekStartDate: formData.get("weekStartDate"),
    amountPaid: optionalNumber(formData.get("amountPaid")),
    status: formData.get("status"),
    paidAt: formData.get("paidAt") || undefined,
    advanceAdjustment:
      adjustAdvanceId && adjustAmount
        ? {
            advanceId: adjustAdvanceId,
            amount: adjustAmount,
            note: formData.get("adjustNote") || undefined,
          }
        : undefined,
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });
}
