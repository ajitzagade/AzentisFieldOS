import { createPaymentSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
// The optional linked Advance Adjustment (AC #3/#4) is reconstructed from its
// own flat form fields into createPaymentSchema's nested advanceAdjustment
// shape.
// The schema nests the linked Advance Adjustment under `advanceAdjustment`,
// but the form's fields (and errorFor keys) are flat — remap nested issue
// paths to the flat names so inline errors actually render instead of
// hiding under a key nothing reads.
const NESTED_FIELD_MAP: Record<string, string> = {
  advanceId: "advanceId",
  amount: "adjustmentAmount",
  note: "adjustmentNote",
};

export function parseCreatePaymentForm(formData: FormData) {
  const includeAdjustment = formData.get("includeAdjustment") === "true";

  const parsed = createPaymentSchema.safeParse({
    teamMemberId: formData.get("teamMemberId"),
    basePay: Number(formData.get("basePay")),
    additionalAmount: formData.get("additionalAmount") ? Number(formData.get("additionalAmount")) : undefined,
    deductions: formData.get("deductions") ? Number(formData.get("deductions")) : undefined,
    payPeriod: formData.get("payPeriod") || undefined,
    advanceAdjustment: includeAdjustment
      ? {
          advanceId: formData.get("advanceId"),
          amount: Number(formData.get("adjustmentAmount")),
          note: formData.get("adjustmentNote") || undefined,
        }
      : undefined,
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (parsed.success) return parsed;

  const fieldErrors: Record<string, string[]> = {};
  for (const issue of parsed.error.issues) {
    const key =
      issue.path[0] === "advanceAdjustment" && typeof issue.path[1] === "string"
        ? (NESTED_FIELD_MAP[issue.path[1]] ?? String(issue.path[1]))
        : String(issue.path[0] ?? "form");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return {
    success: false as const,
    error: { flatten: () => ({ fieldErrors }) },
  };
}
