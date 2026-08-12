import { z } from "zod";

// FR-1: Owner/Admin creates and maintains Sites. This is the single schema
// for that shape — reused by apps/api (source of truth) and apps/web
// (client-side validation), per architecture spine AD-7. Do not hand-roll
// a second validator for this shape anywhere else.
export const siteStatusSchema = z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]);

export const createSiteSchema = z.object({
  name: z.string().min(1).max(200),
  location: z.string().min(1).max(500),
  status: siteStatusSchema.default("ACTIVE"),
  contractReference: z.string().max(200).optional(),
});

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type SiteStatus = z.infer<typeof siteStatusSchema>;
