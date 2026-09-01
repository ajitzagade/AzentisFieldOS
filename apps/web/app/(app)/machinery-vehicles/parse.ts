import {
  createAssetMovementSchema,
  createAssetServiceLogSchema,
  updateAssetServiceLogSchema,
} from "@azentisfieldos/shared";

// The single FormData→schema coercion for each shared Machinery/Vehicle form,
// run by BOTH the Server Action (source of truth) and the client's
// useClientValidation hook (AD-7) — one validator, two run sites.
export function parseCreateAssetMovementForm(formData: FormData) {
  const toStatus = formData.get("toStatus");

  return createAssetMovementSchema.safeParse({
    assetType: formData.get("assetType"),
    assetId: formData.get("assetId"),
    toStatus,
    siteId: toStatus === "AT_SITE" ? formData.get("siteId") || undefined : undefined,
    movedAt: formData.get("movedAt"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });
}

export function parseCreateServiceLogForm(formData: FormData) {
  const cost = formData.get("cost");

  return createAssetServiceLogSchema.safeParse({
    assetType: formData.get("assetType"),
    assetId: formData.get("assetId"),
    kind: formData.get("kind"),
    notes: formData.get("notes") || undefined,
    cost: cost ? Number(cost) : undefined,
    serviceDate: formData.get("serviceDate"),
  });
}

export function parseUpdateServiceLogForm(formData: FormData) {
  const cost = formData.get("cost");

  // The form always resubmits every field (full-replace, not a diff) —
  // an intentionally-blanked Notes/Cost must reach the API as an explicit
  // `null` so it's actually cleared, not silently dropped by
  // JSON.stringify omitting an `undefined` key.
  return updateAssetServiceLogSchema.safeParse({
    kind: formData.get("kind") || undefined,
    notes: formData.get("notes") || null,
    cost: cost ? Number(cost) : null,
    serviceDate: formData.get("serviceDate") || undefined,
  });
}
