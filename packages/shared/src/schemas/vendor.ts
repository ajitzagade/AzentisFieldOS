import { z } from "zod";

// FR-39: Owner/Admin creates and maintains Vendor records. This is the
// single schema for that shape — reused by apps/api (source of truth) and
// apps/web (AD-7).
export const createVendorSchema = z.object({
  name: z.string().min(1).max(200),
  contactPerson: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  email: z.email().max(200).optional(),
  address: z.string().max(500).optional(),
  materialsSupplied: z.array(z.string().min(1).max(100)).default([]),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;

// Derived from createVendorSchema's field rules, never hand-written
// separately (AD-7). `materialsSupplied` is overridden to the bare array
// schema (no `.default()`) before calling `.partial()` — same
// default-on-partial trap updateSiteSchema guards against for `status`:
// without this override, updateVendorSchema.parse({}) would silently
// return `{ materialsSupplied: [] }` instead of a true no-op, wiping a
// Vendor's tags on any edit that doesn't touch that field.
//
// `contactPerson`/`phone`/`email`/`address` additionally take
// `.nullable()` — same as updateTeamMemberSchema's `designation`/`contact`:
// the edit form always resubmits every field (a full-replace PATCH, not a
// diff), so an intentionally-blanked field must be representable as an
// explicit `null` to actually clear it, not just omitted (which
// `.partial()` alone would treat as "leave untouched").
export const updateVendorSchema = z
  .object({
    ...createVendorSchema.shape,
    contactPerson: z.string().max(200).nullable(),
    phone: z.string().max(50).nullable(),
    email: z.email().max(200).nullable(),
    address: z.string().max(500).nullable(),
    materialsSupplied: z.array(z.string().min(1).max(100)),
  })
  .partial();

export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
