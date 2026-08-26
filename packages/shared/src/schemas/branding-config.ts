import { z } from "zod";

// Story 13.1 (FR-32, FR-47): the shared shape for editing the single
// BrandingConfig row. Story 13.1 only needs enough to seed and read the
// config; the full CRUD lifecycle (the admin UI wired to this schema) is
// Epic 14's job — but the update schema is defined now because the
// seed/admin boundary is identical to every other lookup-table precedent in
// this project (define the shape once, Epic 14 wires the UI to it later).
//
// Every field is optional — an admin edits whichever branding fields they
// want without restating the others. `primaryColor` is a 6-digit hex string
// (the `#0F5257` neutral placeholder token is the seeded default).
export const updateBrandingConfigSchema = z.object({
  tenantName: z.string().min(1).max(200).optional(),
  logoUrl: z.url().optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a 6-digit hex color, e.g. #0F5257")
    .optional(),
});

export type UpdateBrandingConfigInput = z.infer<typeof updateBrandingConfigSchema>;
