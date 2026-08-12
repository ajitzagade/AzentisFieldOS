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

// Derived from createSiteSchema's field rules, never hand-written
// separately, so create and update can't silently drift apart (AD-7). No
// `id` field — the Site being updated is identified by the route param,
// not the body.
//
// `status` is overridden to the bare siteStatusSchema (no `.default()`)
// before calling `.partial()` — Zod applies a field's default whenever
// that key is absent from the input, independent of whether `.partial()`
// made the field optional. Without this override, updateSiteSchema.parse({})
// would silently return `{ status: "ACTIVE" }` instead of a true no-op,
// which would reset any Site's status to Active on every edit that
// doesn't explicitly touch status — caught by this schema's own test.
export const updateSiteSchema = z
  .object({ ...createSiteSchema.shape, status: siteStatusSchema })
  .partial();

export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
