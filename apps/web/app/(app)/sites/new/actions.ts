"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { createSiteSchema } from "@azentisfieldos/shared";

export interface CreateSiteFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// Thin HTTP-calling wrapper, not a data-access layer — apps/web never
// imports PrismaClient or any apps/api internals (AD-3). Client- and
// server-side validation both import the same createSiteSchema instance
// (AD-7), so this Server Action's own safeParse is a fail-fast shortcut
// that avoids a round trip for obviously invalid input; the API's own
// ZodValidationPipe remains the actual source of truth.
export async function createSiteAction(
  _prevState: CreateSiteFormState,
  formData: FormData,
): Promise<CreateSiteFormState> {
  const parsed = createSiteSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    status: formData.get("status"),
    contractReference: formData.get("contractReference") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/sites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> } } };
    return { errors: body.error?.details?.fieldErrors ?? {} };
  }

  if (!res.ok) {
    return { formError: "Something went wrong creating the Site. Please try again." };
  }

  redirect(`/sites?flash=${encodeURIComponent("Site created")}`);
}
