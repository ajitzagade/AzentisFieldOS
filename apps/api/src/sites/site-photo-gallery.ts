import type { PhotoGalleryItem, ReportDateRange } from '@azentisfieldos/shared';
import { dateRangeBounds } from '../common/date-range';
import { SUBMITTED_DSR_WHERE } from '../common/superseded-dsrs';
import type { PrismaService } from '../prisma/prisma.service';
import type { StorageService } from '../storage/storage.service';

// FR-31: every photo at a Site — from a DSR (the original path) or uploaded
// directly to the Site (2026-09-20, for a photo captured but not uploaded
// during that day's Daily Report) — newest-first, each auto-tagged with the
// Site/date/DSR/uploader it came from. A DSR photo sorts by the DSR's own
// reportDate (not photo createdAt) so an offline-queued submission's photos
// sort by the day they were taken, not the day they happened to sync; a
// direct Site upload has no reportDate, so it sorts by its own createdAt —
// both cases share createdAt as the stable tiebreaker.
//
// Story 13.2 (FR-42): the optional `range` narrows the gallery to the report
// window — a DSR photo is filtered on its parent's reportDate, a direct
// upload on its own createdAt (the same "effective date" each uses for
// sorting). An undefined bound is read by Prisma as "no constraint", so the
// unfiltered Site photo gallery (Story 3.3) behaves exactly as before.
export async function getSitePhotoGallery(
  prisma: PrismaService,
  storage: StorageService,
  siteId: string,
  range: ReportDateRange = {},
): Promise<PhotoGalleryItem[]> {
  const bounds = dateRangeBounds(range.from, range.to);
  const photos = await prisma.photo.findMany({
    where: {
      OR: [
        // spec-dsr-drafts: a draft's photos attach to its DRAFT parent row
        // and stay hidden from the gallery until Finalize — filter them out
        // here by the parent DSR's status.
        {
          dailySiteReport: {
            siteId,
            reportDate: bounds,
            ...SUBMITTED_DSR_WHERE,
          },
        },
        { siteId, dailySiteReportId: null, createdAt: bounds },
      ],
    },
    include: { dailySiteReport: true, uploadedBy: true },
  });

  const items = await Promise.all(
    photos.map(async (photo): Promise<PhotoGalleryItem> => {
      const effectiveDate =
        photo.dailySiteReport?.reportDate ?? photo.createdAt;
      return {
        id: photo.id,
        // PhotoGalleryItem.url renders into PhotoGalleryGrid's thumbnail
        // cells — the downsized, format-safe URL, not the full-resolution
        // original.
        url: await storage.getThumbnailUrl(photo.storageKey),
        // previewUrl feeds the click-to-preview lightbox (same grid,
        // full-size view) — a larger rendition of the same storageKey via
        // the same helper, not the untransformed original.
        previewUrl: await storage.getThumbnailUrl(photo.storageKey, 1600),
        reportDate: effectiveDate.toISOString().slice(0, 10),
        dailySiteReportId: photo.dailySiteReportId,
        uploaderName: photo.uploadedBy.name,
        createdAt: photo.createdAt.toISOString(),
      };
    }),
  );

  // Sorted here rather than via Prisma orderBy: a mixed nullable-relation
  // sort key (DSR reportDate for one branch, createdAt for the other) isn't
  // expressible as a single Prisma orderBy — this reproduces the original
  // "DSR reportDate desc, createdAt desc" ordering exactly for DSR photos
  // while giving direct uploads a sensible date to sort by.
  return items.sort((a, b) => {
    const dateDiff = b.reportDate.localeCompare(a.reportDate);
    return dateDiff !== 0 ? dateDiff : b.createdAt.localeCompare(a.createdAt);
  });
}
