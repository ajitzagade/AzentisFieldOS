// Site photo gallery (FR-31, story 3.3). A plain exported type, not a Zod
// schema — this is a read/response shape apps/web renders, not an input to
// validate, so it doesn't need AD-7's shared-validator treatment.
export interface PhotoGalleryItem {
  id: string;
  /** Presigned R2 GET URL — short-lived (1 hour), regenerated on every
   * request, never persisted or cached by the client. */
  url: string;
  /** Larger rendition of the same photo (same storageKey, wider
   * `getThumbnailUrl` call) for the click-to-preview lightbox — not the
   * grid thumbnail stretched up, and not the untransformed original. */
  previewUrl: string;
  /** ISO-8601 date (YYYY-MM-DD) — the DSR's reportDate for a DSR photo
   * (these can differ from the upload timestamp for an offline-queued
   * submission), or the photo's own createdAt date for a direct Site
   * upload (2026-09-20), which has no DSR to anchor a reportDate to. */
  reportDate: string;
  /** Null for a direct Site upload (2026-09-20) — no parent DSR. */
  dailySiteReportId: string | null;
  uploaderName: string;
  createdAt: string;
  /** Measurement (2026-09-21) — GENERAL for every ordinary upload. */
  category: "GENERAL" | "MEASUREMENT";
  /** Only ever set for a MEASUREMENT photo today. */
  description: string | null;
}
