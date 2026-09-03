"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseCreateMaterialForm, parseCreateMaterialQuickForm } from "./parse";

export interface CreateMaterialFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  /** Set only by createMaterialQuickAction's non-redirecting success path —
   * createMaterialAction never sets this since it redirects on success
   * instead (mirrors createAdvanceAction/createAdvanceQuickAction). */
  success?: boolean;
  id?: string;
  name?: string;
}

type SubmitMaterialResult =
  | { ok: true; id: string; name: string }
  | { ok: false; state: CreateMaterialFormState };

// The shared parse+POST+error-mapping path — both createMaterialAction
// (full-page /materials/new, redirects) and createMaterialQuickAction
// (inline "+ Add Material" quick-create modal, returns success inline) call
// this so there is exactly one write path to POST /materials. Same AD-3
// (HTTP-only)/AD-7 (shared schema) pattern as sites/new/actions.ts.
async function submitMaterial(formData: FormData): Promise<SubmitMaterialResult> {
  const parsed = parseCreateMaterialForm(formData);

  if (!parsed.success) {
    return { ok: false, state: { errors: parsed.error.flatten().fieldErrors } };
  }

  const res = await authedFetch(`/materials`, {
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
      state: { formError: body.error?.message ?? "This Material references a Category or Unit that does not exist." },
    };
  }

  if (!res.ok) {
    return { ok: false, state: { formError: "Something went wrong creating the Material. Please try again." } };
  }

  const created = (await res.json()) as { id: string; name: string };
  return { ok: true, id: created.id, name: created.name };
}

export async function createMaterialAction(
  _prevState: CreateMaterialFormState,
  formData: FormData,
): Promise<CreateMaterialFormState> {
  const result = await submitMaterial(formData);
  if (!result.ok) return result.state;

  redirect(`/materials?flash=${encodeURIComponent("Material added")}`);
}

// Every entry-form route with a Material picker (inline quick-create spec)
// — the admin list plus every combobox that lists Materials by name.
function revalidateMaterialPaths() {
  revalidatePath("/materials");
  revalidatePath("/movements/purchases/new");
  revalidatePath("/movements/consumption/new");
  revalidatePath("/movements/godown-to-site/new");
  revalidatePath("/movements/return-wastage/new");
  revalidatePath("/daily-activity");
  revalidatePath("/dsr/new");
}

// The inline "+ Add Material" quick-create modal never navigates away, so it
// can't confirm success via the ?flash= pattern (that only exists because a
// redirect unmounts the form). Unlike createMaterialAction, this also
// immediately creates the Material's first Size (POST
// /materials/:id/sizes) — every materialSizeId-keyed picker in the app
// (Purchase/Consumption/Movement/Return-Wastage/DSR) needs a Size to exist
// before a Material can be selected there, and the quick modal can't leave
// the user in that unusable intermediate state the way the full form's
// separate edit-page Sizes section can (FR-5 sizes stay purely additive —
// this never updates/removes a Size, only adds the first one). The caller
// prepends { id, name } — here `id` is the new MaterialSize's id and `name`
// is the composed "Material — Size" label, matching the option shape every
// Material/Size picker already renders — into the picker's local options
// and selects it once this resolves { success: true }.
export async function createMaterialQuickAction(
  _prevState: CreateMaterialFormState,
  formData: FormData,
): Promise<CreateMaterialFormState> {
  const parsed = parseCreateMaterialQuickForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const { sizeLabel, ...materialInput } = parsed.data;

  let materialRes: Response;
  try {
    materialRes = await authedFetch(`/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(materialInput),
    });
  } catch {
    return { formError: "Something went wrong creating the Material. Please try again." };
  }

  if (materialRes.status === 400) {
    const body = (await materialRes.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body?.error?.message ?? "This Material references a Category or Unit that does not exist." };
  }

  if (!materialRes.ok) {
    return { formError: "Something went wrong creating the Material. Please try again." };
  }

  const material = (await materialRes.json()) as { id: string; name: string };

  let sizeRes: Response;
  try {
    sizeRes = await authedFetch(`/materials/${material.id}/sizes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: sizeLabel }),
    });
  } catch {
    return { formError: "The Material was created, but its Size could not be added. Please try again." };
  }

  if (sizeRes.status === 400) {
    const body = (await sizeRes.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: { sizeLabel: body.error.details.fieldErrors.label ?? ["Invalid Size"] } };
    }
    return { formError: body?.error?.message ?? "The Material was created, but this Size already exists for it." };
  }

  if (!sizeRes.ok) {
    return { formError: "The Material was created, but its Size could not be added. Please try again." };
  }

  const size = (await sizeRes.json()) as { id: string; label: string };

  revalidateMaterialPaths();
  return { success: true, id: size.id, name: `${material.name} — ${size.label}` };
}
