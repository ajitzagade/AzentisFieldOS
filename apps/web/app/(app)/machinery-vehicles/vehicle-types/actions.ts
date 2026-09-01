"use server";

import { authedFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { updateVehicleTypeSchema } from "@azentisfieldos/shared";
import { parseCreateVehicleTypeForm } from "./parse";

// Story 14.3: the admin list plus the Register Vehicle entry-form picker (AC #1).
function revalidateVehicleTypePaths() {
  revalidatePath("/machinery-vehicles/vehicle-types");
  revalidatePath("/machinery-vehicles/vehicles/new");
}

export interface CreateVehicleTypeFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

export async function createVehicleTypeAction(
  _prevState: CreateVehicleTypeFormState,
  formData: FormData,
): Promise<CreateVehicleTypeFormState> {
  const parsed = parseCreateVehicleTypeForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/vehicle-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "A Vehicle Type with this name already exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong creating the Vehicle Type. Please try again." };
  }

  revalidateVehicleTypePaths();
  return {};
}

// Story 14.3 (FR-49): rename via the shared updateVehicleTypeSchema (AD-7).
export interface RenameVehicleTypeFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  ok?: boolean;
}

export async function renameVehicleTypeAction(
  id: string,
  _prevState: RenameVehicleTypeFormState,
  formData: FormData,
): Promise<RenameVehicleTypeFormState> {
  const parsed = updateVehicleTypeSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/vehicle-types/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body?.error?.message ?? "A Vehicle Type with this name already exists." };
  }

  if (!res.ok) {
    return { formError: "Could not rename this Vehicle Type. Please try again." };
  }

  revalidateVehicleTypePaths();
  return { ok: true };
}

export interface ToggleVehicleTypeFormState {
  formError?: string;
}

export async function toggleVehicleTypeAction(
  id: string,
  nextIsActive: boolean,
): Promise<ToggleVehicleTypeFormState> {
  const res = await authedFetch(`/vehicle-types/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: nextIsActive }),
  });

  if (!res.ok) {
    return {
      formError: nextIsActive
        ? "Could not enable this Vehicle Type. Please try again."
        : "Could not disable this Vehicle Type. Please try again.",
    };
  }

  revalidateVehicleTypePaths();
  return {};
}
