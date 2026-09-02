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
      | { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    // Non-schema 400s: contract isn't Active, is Fixed Cost, or a
    // correction would drive quantityCompleted below zero.
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
