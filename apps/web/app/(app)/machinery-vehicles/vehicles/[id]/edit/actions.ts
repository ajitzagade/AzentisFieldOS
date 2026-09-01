"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseUpdateVehicleForm } from "./parse";

export interface UpdateVehicleFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// `id` is bound at the call site since a Server Action passed to
// useActionState only receives (prevState, formData) — same pattern as
// machinery/[id]/edit/actions.ts's updateMachineryAction.
export async function updateVehicleAction(
  id: string,
  _prevState: UpdateVehicleFormState,
  formData: FormData,
): Promise<UpdateVehicleFormState> {
  const parsed = parseUpdateVehicleForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/vehicles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong updating the Vehicle. Please try again." };
  }

  if (res.status === 400) {
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> } }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body?.message ?? "This Vehicle references a Vehicle Type that does not exist." };
  }

  if (res.status === 404) {
    return { formError: "This Vehicle no longer exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong updating the Vehicle. Please try again." };
  }

  redirect(`/machinery-vehicles?flash=${encodeURIComponent("Vehicle updated")}`);
}
