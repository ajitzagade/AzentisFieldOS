"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseUpdateDailyLabourerForm } from "./parse";

export interface UpdateDailyLabourerFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// Same AD-3 (HTTP-only) / AD-7 (shared schema) pattern as
// vendors/[id]/edit/actions.ts's updateVendorAction. `id` is bound at the
// call site since a Server Action passed to useActionState only receives
// (prevState, formData).
export async function updateDailyLabourerAction(
  id: string,
  _prevState: UpdateDailyLabourerFormState,
  formData: FormData,
): Promise<UpdateDailyLabourerFormState> {
  const parsed = parseUpdateDailyLabourerForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/daily-labourers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> } } };
    return { errors: body.error?.details?.fieldErrors ?? {} };
  }

  if (res.status === 404) {
    return { formError: "This Labourer no longer exists." };
  }

  if (res.status === 403) {
    return { formError: "Only an Owner/Admin can edit a Labourer." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong updating the Labourer. Please try again." };
  }

  revalidatePath("/labour-payments");
  revalidatePath(`/labour-payments/${id}`);
  redirect(`/labour-payments/${id}?flash=${encodeURIComponent("Labourer updated")}`);
}
