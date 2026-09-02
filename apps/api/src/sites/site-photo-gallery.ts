import type { PhotoGalleryItem, ReportDateRange } from '@azentisfieldos/shared';
import { dateRangeBounds } from '../common/date-range';
import type { PrismaService } from '../prisma/prisma.service';
import type { StorageService } from '../storage/storage.service';

// FR-31: every photo from every DSR at a Site, newest-first, each
// auto-tagged with the Site/date/DSR/uploader it came from. Ordered by the
// DSR's reportDate (not photo createdAt) so an offline-queued submission's
// photos sort by the day they were taken, not the day they happened to
// sync — then by createdAt within a date as a stable tiebreaker.
//
// Story 13.2 (FR-42): the optional `range` narrows the gallery to the report
// window, filtered on the parent DSR's reportDate (matching the sort field)
// — an undefined bound is read by Prisma as "no constraint", so the
// unfiltered Site photo gallery (Story 3.3) behaves exactly as before.
export async function getSitePhotoGallery(
  prisma: PrismaService,
  storage: StorageService,
  siteId: string,
  range: ReportDateRange = {},
): Promise<PhotoGalleryItem[]> {
  const bounds = dateRangeBounds(range.from, range.to);
  const photos = await prisma.photo.findMany({
    where: { dailySiteReport: { siteId, reportDate: bounds } },
    include: { dailySiteReport: true, uploadedBy: true },
    orderBy: [
      { dailySiteReport: { reportDate: 'desc' } },
      { createdAt: 'desc' },
    ],
  });

  return Promise.all(
    photos.map(async (photo): Promise<PhotoGalleryItem> => ({
      id: photo.id,
      // PhotoGalleryItem.url only ever renders into PhotoGalleryGrid's
      // thumbnail cells (no lightbox/full-size viewer exists) — the
      // downsized, format-safe URL, not the full-resolution original.
      url: await storage.getThumbnailUrl(photo.storageKey),
      reportDate: photo.dailySiteReport.reportDate.toISOString().slice(0, 10),
      dailySiteReportId: photo.dailySiteReportId,
      uploaderName: photo.uploadedBy.name,
      createdAt: photo.createdAt.toISOString(),
    })),
  );
}
