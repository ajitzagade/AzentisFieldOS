"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseWorkEntryForm } from "./parse";

export interface WorkEntryFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// One Server Action for both a plain Work Entry and a correction of one —
// POST /subcontractor-work-entries branches on correctsId, same
// uniform-write-path design as createConsumptionAction. No @Roles gate on
// this endpoint — a Site Supervisor can log work directly.
export async function createWorkEntryAction(
  siteId: string,
  contractId: string,
  _prevState: WorkEntryFormState,
  formData: FormData,
): Promise<WorkEntryFormState> {
  const parsed = parseWorkEntryForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/subcontractor-work-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong recording the Work Entry. Please try again." };
  }

  if (res.status === 400) {
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { code?: string; details?: { fieldErrors?: Record<string, string[]> }; message?: string }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    // A floor-check rejection is about the quantity field specifically —
    // show it inline next to that field (same discipline as Advance
    // Adjustment's balance-floor check, FR-23's pattern), not buried in a
    // generic banner.
    if (body?.error?.code === "QUANTITY_BELOW_ZERO") {
      return { errors: { quantity: [body.error.message ?? "This correction would reduce completed quantity below zero."] } };
    }
    // Any other non-schema 400 (contract isn't Active, or is Fixed Cost).
    return {
      formError: body?.error?.message ?? body?.message ?? "This Work Entry could not be recorded.",
    };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording the Work Entry. Please try again." };
  }

  redirect(
    `/sites/${siteId}/contracts/${contractId}?flash=${encodeURIComponent(
      formData.get("correctsId") ? "Work Entry correction recorded" : "Work Entry recorded",
    )}`,
  );
}
