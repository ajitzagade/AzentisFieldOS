import { z } from "zod";

// FR-30/FR-31: photo upload is a two-step presign-then-confirm flow (AD-3 —
// the client uploads bytes directly to R2, never through apps/api) so
// there are two schemas: what the client asks apps/api to authorize, and
// what it reports back once the upload itself succeeds.
export const presignPhotoUploadSchema = z.object({
  dailySiteReportId: z.string(),
});

// A direct-to-Site upload (2026-09-20) — for a photo captured but not
// uploaded during that day's Daily Report. Filed under the upload date
// (Photo.createdAt), never a user-chosen backdate — there is no DSR to
// anchor a reportDate to.
export const presignSitePhotoUploadSchema = z.object({
  siteId: z.string(),
});

// A Photo attaches to exactly one parent — DSR (the original path) or Site
// (direct upload) — never both, never neither.
export const confirmPhotoUploadSchema = z
  .object({
    dailySiteReportId: z.string().optional(),
    siteId: z.string().optional(),
    storageKey: z.string().min(1),
  })
  .refine((data) => Boolean(data.dailySiteReportId) !== Boolean(data.siteId), {
    message: "Exactly one of dailySiteReportId or siteId is required",
    path: ["dailySiteReportId"],
  });

export type PresignPhotoUploadInput = z.infer<typeof presignPhotoUploadSchema>;
export type PresignSitePhotoUploadInput = z.infer<typeof presignSitePhotoUploadSchema>;
export type ConfirmPhotoUploadInput = z.infer<typeof confirmPhotoUploadSchema>;
