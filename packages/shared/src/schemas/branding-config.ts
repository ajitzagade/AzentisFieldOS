import { z } from "zod";

// Story 13.1 (FR-32, FR-47): the shared shape for editing the single
// BrandingConfig row. Story 13.1 only needed enough to seed and read the
// config (tenant name, one colour, an optional logo); Story 14.1 extends this
// schema with the rest of the mockup's Branding section so the admin UI can
// edit every field. Defined once here and imported by both apps/api (source of
// truth) and apps/web (AD-7) — never two hand-written validators.
//
// Every field is optional — an admin edits whichever branding fields they want
// without restating the others. The optional free-text fields
// (`logoUrl`/`registeredAddress`/`contactPhone`/`gstin`) are additionally
// `.nullable()`: the admin form always resubmits every field (a full-replace
// PATCH, not a diff), so an intentionally-blanked field must be representable
// as an explicit `null` to actually clear it, not just omitted (which the
// server's partial update would treat as "leave untouched") — the same pattern
// updateVendorSchema/updateTeamMemberSchema use for their optional fields.
const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Must be a 6-digit hex color, e.g. #0F5257");

export const updateBrandingConfigSchema = z.object({
  tenantName: z.string().min(1).max(200).optional(),
  logoUrl: z.url().nullable().optional(),
  // Primary/Secondary/Accent — the three swatches the mockup shows. All three
  // share primaryColor's 6-digit-hex validation.
  primaryColor: hexColor.optional(),
  secondaryColor: hexColor.optional(),
  accentColor: hexColor.optional(),
  // GSTIN is validated for length only — this product does not need to enforce
  // India's GST checksum rules to satisfy FR-47 (a valid-looking 15-char GSTIN
  // is enough; a stricter check would reject legitimate edge cases nobody asked
  // us to police).
  registeredAddress: z.string().max(500).nullable().optional(),
  contactPhone: z.string().max(50).nullable().optional(),
  gstin: z.string().max(50).nullable().optional(),
});

export type UpdateBrandingConfigInput = z.infer<typeof updateBrandingConfigSchema>;
