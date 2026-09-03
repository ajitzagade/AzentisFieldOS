import { createMaterialSchema, createMaterialSizeSchema } from "@azentisfieldos/shared";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseCreateMaterialForm(formData: FormData) {
  return createMaterialSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    unitId: formData.get("unitId"),
  });
}

// Every materialSizeId-keyed picker in the app (Purchase/Consumption/
// Movement/Return-Wastage/DSR) needs a MaterialSize, not a bare Material,
// to exist before the quick-created record can be selected there — the
// full /materials/new form defers Sizes to the separate edit-page section
// (FR-5, purely additive), but the inline quick-create modal can't leave
// the user in that unusable intermediate state (I/O matrix: "prepended +
// selected in parent picker"). This composes the two already-shared
// schemas (AD-7 — not a new hand-written validator for the same fields)
// so the quick modal's Name/Category/Unit/Size fields validate identically
// client- and server-side.
export const createMaterialQuickSchema = createMaterialSchema.extend({
  sizeLabel: createMaterialSizeSchema.shape.label,
});

export function parseCreateMaterialQuickForm(formData: FormData) {
  return createMaterialQuickSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    unitId: formData.get("unitId"),
    sizeLabel: formData.get("sizeLabel"),
  });
}
