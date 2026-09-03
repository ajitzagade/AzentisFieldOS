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
  /** ISO-8601 date (YYYY-MM-DD) — the DSR's reportDate, not the photo's
   * upload timestamp; these can differ for an offline-queued submission. */
  reportDate: string;
  dailySiteReportId: string;
  uploaderName: string;
  createdAt: string;
}
