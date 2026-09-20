"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseCreateVehicleForm } from "./parse";

export interface CreateVehicleFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  /** Set only by createVehicleQuickAction's non-redirecting success path —
   * createVehicleAction never sets this since it redirects on success
   * instead (mirrors createVendorAction/createVendorQuickAction). */
  success?: boolean;
  id?: string;
  name?: string;
}

type SubmitVehicleResult =
  | { ok: true; id: string; name: string }
  | { ok: false; state: CreateVehicleFormState };

// The shared parse+POST+error-mapping path — both createVehicleAction
// (full-page /machinery-vehicles/vehicles/new, redirects) and
// createVehicleQuickAction (inline "+ Add Vehicle" quick-create modal,
// returns success inline) call this so there is exactly one write path to
// POST /vehicles; only the navigation outcome differs per caller.
async function submitVehicle(formData: FormData): Promise<SubmitVehicleResult> {
  const parsed = parseCreateVehicleForm(formData);

  if (!parsed.success) {
    return { ok: false, state: { errors: parsed.error.flatten().fieldErrors } };
  }

  const res = await authedFetch(`/vehicles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { ok: false, state: { errors: body.error.details.fieldErrors } };
    }
    return {
      ok: false,
      state: { formError: body.error?.message ?? "This Vehicle references a Vehicle Type that does not exist." },
    };
  }

  if (!res.ok) {
    return { ok: false, state: { formError: "Something went wrong registering the Vehicle. Please try again." } };
  }

  const vehicle = (await res.json()) as { id: string; number: string };
  return { ok: true, id: vehicle.id, name: vehicle.number };
}

// Every entry-form route with a Vehicle picker (inline quick-create) — the
// admin list plus every combobox that lists Vehicles by number.
function revalidateVehiclePaths() {
  revalidatePath("/machinery-vehicles");
  revalidatePath("/waste-disposal/new");
  revalidatePath("/daily-activity");
  revalidatePath("/dsr/new");
}

// Same AD-3 (HTTP-only)/AD-7 (shared schema) pattern as
// machinery/new/actions.ts.
export async function createVehicleAction(
  _prevState: CreateVehicleFormState,
  formData: FormData,
): Promise<CreateVehicleFormState> {
  const result = await submitVehicle(formData);
  if (!result.ok) return result.state;

  revalidateVehiclePaths();
  redirect(`/machinery-vehicles?flash=${encodeURIComponent("Vehicle added")}`);
}

// Inline "+ Add Vehicle" quick-create modal — same record, same POST
// /vehicles, only the outcome differs: resolved inline instead of a
// redirect, so the caller's combobox can select it immediately.
export async function createVehicleQuickAction(
  _prevState: CreateVehicleFormState,
  formData: FormData,
): Promise<CreateVehicleFormState> {
  const result = await submitVehicle(formData);
  if (!result.ok) return result.state;

  revalidateVehiclePaths();
  return { success: true, id: result.id, name: result.name };
}
