"use server";

import { redirect } from "next/navigation";
import { createAssetMovementSchema, createAssetServiceLogSchema, updateAssetServiceLogSchema } from "@azentisfieldos/shared";

export interface CreateAssetMovementFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// One Server Action for both a plain Machinery/Vehicle movement entry and
// a correction of one (mirroring createPaymentAction's uniform-write-path
// design) — POST /asset-movements branches on assetType/correctsId.
// assetType/assetId travel as ordinary hidden form fields (unlike
// updateMachineryAction's bound `id`, they're already part of
// createAssetMovementSchema's own body), so the redirect target back to
// the asset's detail page can be derived from the parsed result itself.
export async function createAssetMovementAction(
  _prevState: CreateAssetMovementFormState,
  formData: FormData,
): Promise<CreateAssetMovementFormState> {
  const toStatus = formData.get("toStatus");

  const parsed = createAssetMovementSchema.safeParse({
    assetType: formData.get("assetType"),
    assetId: formData.get("assetId"),
    toStatus,
    siteId: toStatus === "AT_SITE" ? formData.get("siteId") || undefined : undefined,
    movedAt: formData.get("movedAt"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/asset-movements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong recording the Movement. Please try again." };
  }

  if (res.status === 400) {
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> } }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body?.message ?? "This Movement references a Machine/Vehicle or Site that does not exist." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording the Movement. Please try again." };
  }

  const assetType = parsed.data.assetType;
  const assetId = parsed.data.assetId;
  redirect(assetType === "MACHINERY" ? `/machinery-vehicles/machinery/${assetId}` : `/machinery-vehicles/vehicles/${assetId}`);
}

export interface ServiceLogFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

function serviceLogErrorFormState(body: unknown, fallback: string): ServiceLogFormState {
  const parsedBody = body as
    | { error?: { details?: { fieldErrors?: Record<string, string[]> } }; message?: string }
    | undefined;
  if (parsedBody?.error?.details?.fieldErrors) {
    return { errors: parsedBody.error.details.fieldErrors };
  }
  return { formError: parsedBody?.message ?? fallback };
}

// FR-18: logs a fuel/maintenance/repair entry against a Machine/Vehicle —
// POST /asset-service-logs branches on assetType server-side, same
// uniform-write-path design as createAssetMovementAction. assetType/
// assetId travel as hidden form fields, already part of
// createAssetServiceLogSchema's own body.
export async function createServiceLogAction(
  _prevState: ServiceLogFormState,
  formData: FormData,
): Promise<ServiceLogFormState> {
  const cost = formData.get("cost");

  const parsed = createAssetServiceLogSchema.safeParse({
    assetType: formData.get("assetType"),
    assetId: formData.get("assetId"),
    kind: formData.get("kind"),
    notes: formData.get("notes") || undefined,
    cost: cost ? Number(cost) : undefined,
    serviceDate: formData.get("serviceDate"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/asset-service-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong logging this entry. Please try again." };
  }

  if (res.status === 400) {
    const body = await res.json().catch(() => undefined);
    return serviceLogErrorFormState(body, "This entry references a Machine/Vehicle that does not exist.");
  }

  if (!res.ok) {
    return { formError: "Something went wrong logging this entry. Please try again." };
  }

  const assetType = parsed.data.assetType;
  const assetId = parsed.data.assetId;
  redirect(assetType === "MACHINERY" ? `/machinery-vehicles/machinery/${assetId}` : `/machinery-vehicles/vehicles/${assetId}`);
}

// AC #2: a normal Edit affordance (PATCH), never a CorrectAction —
// `logId`/`assetType` are bound at the call site since a Server Action
// passed to useActionState only receives (prevState, formData), same
// pattern as edit/actions.ts's updateMachineryAction. assetId travels as
// a hidden form field so the redirect target back to the asset's detail
// page can be derived without a second fetch.
export async function updateServiceLogAction(
  logId: string,
  assetType: "MACHINERY" | "VEHICLE",
  _prevState: ServiceLogFormState,
  formData: FormData,
): Promise<ServiceLogFormState> {
  const assetId = formData.get("assetId") as string;
  const cost = formData.get("cost");

  // The form always resubmits every field (full-replace, not a diff) —
  // an intentionally-blanked Notes/Cost must reach the API as an explicit
  // `null` so it's actually cleared, not silently dropped by
  // JSON.stringify omitting an `undefined` key (same reasoning as
  // updateMachineryAction).
  const parsed = updateAssetServiceLogSchema.safeParse({
    kind: formData.get("kind") || undefined,
    notes: formData.get("notes") || null,
    cost: cost ? Number(cost) : null,
    serviceDate: formData.get("serviceDate") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/asset-service-logs/${logId}?assetType=${assetType}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong updating this entry. Please try again." };
  }

  if (res.status === 400) {
    const body = await res.json().catch(() => undefined);
    return serviceLogErrorFormState(body, "Something went wrong updating this entry.");
  }

  if (res.status === 404) {
    return { formError: "This Service Log entry no longer exists." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong updating this entry. Please try again." };
  }

  redirect(assetType === "MACHINERY" ? `/machinery-vehicles/machinery/${assetId}` : `/machinery-vehicles/vehicles/${assetId}`);
}
