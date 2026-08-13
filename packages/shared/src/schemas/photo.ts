import { z } from "zod";

// FR-30/FR-31: photo upload is a two-step presign-then-confirm flow (AD-3 —
// the client uploads bytes directly to R2, never through apps/api) so
// there are two schemas: what the client asks apps/api to authorize, and
// what it reports back once the upload itself succeeds.
export const presignPhotoUploadSchema = z.object({
  dailySiteReportId: z.string(),
});

export const confirmPhotoUploadSchema = z.object({
  dailySiteReportId: z.string(),
  storageKey: z.string().min(1),
});

export type PresignPhotoUploadInput = z.infer<typeof presignPhotoUploadSchema>;
export type ConfirmPhotoUploadInput = z.infer<typeof confirmPhotoUploadSchema>;
