"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseMovementForm } from "./parse";

export interface CreateMovementFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// One Server Action for both a plain Godown-to-Site Movement and a
// correction of one — POST /movements branches on correctsId, same
// uniform-write-path design as Story 5.1's createPurchaseAction.
export async function createMovementAction(
  _prevState: CreateMovementFormState,
  formData: FormData,
): Promise<CreateMovementFormState> {
  const parsed = parseMovementForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/movements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "This Movement references a Material Size or Site that does not exist." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording the Movement. Please try again." };
  }

  redirect(
    `/movements?flash=${encodeURIComponent(formData.get("correctsId") ? "Movement correction recorded" : "Movement recorded")}`,
  );
}
