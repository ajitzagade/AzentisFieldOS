import { z } from "zod";

// FR-55: Owner/Admin creates and maintains Subcontractor records. Mirrors
// createVendorSchema/updateVendorSchema field-for-field — Subcontractor is
// the same "external party master data" shape as Vendor, just for
// outsourced work instead of material supply.
export const createSubcontractorSchema = z.object({
  name: z.string().min(1).max(200),
  contactPerson: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  email: z.email().max(200).optional(),
  address: z.string().max(500).optional(),
  workCategories: z.array(z.string().min(1).max(100)).default([]),
});

export type CreateSubcontractorInput = z.infer<typeof createSubcontractorSchema>;

// Derived from createSubcontractorSchema's field rules, never hand-written
// separately (AD-7). `workCategories` is overridden to the bare array
// schema (no `.default()`) before `.partial()` — the same default-on-partial
// trap updateVendorSchema guards against: without this override,
// updateSubcontractorSchema.parse({}) would silently return
// `{ workCategories: [] }` instead of a true no-op, wiping a Subcontractor's
// tags on any edit that doesn't touch that field.
//
// `contactPerson`/`phone`/`email`/`address` additionally take `.nullable()`
// — the edit form always resubmits every field (a full-replace PATCH, not a
// diff), so an intentionally-blanked field must be representable as an
// explicit `null` to actually clear it, not just omitted.
export const updateSubcontractorSchema = z
  .object({
    ...createSubcontractorSchema.shape,
    contactPerson: z.string().max(200).nullable(),
    phone: z.string().max(50).nullable(),
    email: z.email().max(200).nullable(),
    address: z.string().max(500).nullable(),
    workCategories: z.array(z.string().min(1).max(100)),
  })
  .partial();

export type UpdateSubcontractorInput = z.infer<typeof updateSubcontractorSchema>;
