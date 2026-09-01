"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseCreateVendorForm } from "./parse";

export interface CreateVendorFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// Thin HTTP-calling wrapper, not a data-access layer — apps/web never
// imports PrismaClient or any apps/api internals (AD-3). Client- and
// server-side validation both import the same createVendorSchema instance
// (AD-7).
export async function createVendorAction(
  _prevState: CreateVendorFormState,
  formData: FormData,
): Promise<CreateVendorFormState> {
  const parsed = parseCreateVendorForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/vendors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> } } };
    return { errors: body.error?.details?.fieldErrors ?? {} };
  }

  if (!res.ok) {
    return { formError: "Something went wrong creating the Vendor. Please try again." };
  }

  redirect(`/vendors?flash=${encodeURIComponent("Vendor added")}`);
}
