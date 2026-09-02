"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseCreateSubcontractorForm } from "./parse";

export interface CreateSubcontractorFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// Thin HTTP-calling wrapper, not a data-access layer — apps/web never
// imports PrismaClient or any apps/api internals (AD-3). Client- and
// server-side validation both import the same createSubcontractorSchema
// instance (AD-7).
export async function createSubcontractorAction(
  _prevState: CreateSubcontractorFormState,
  formData: FormData,
): Promise<CreateSubcontractorFormState> {
  const parsed = parseCreateSubcontractorForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/subcontractors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> } } };
    return { errors: body.error?.details?.fieldErrors ?? {} };
  }

  if (!res.ok) {
    return { formError: "Something went wrong creating the Subcontractor. Please try again." };
  }

  redirect(`/subcontractors?flash=${encodeURIComponent("Subcontractor added")}`);
}
