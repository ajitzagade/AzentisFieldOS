import type { PhotoGalleryItem } from '@azentisfieldos/shared';
import type { PrismaService } from '../prisma/prisma.service';
import type { StorageService } from '../storage/storage.service';

// FR-31: every photo from every DSR at a Site, newest-first, each
// auto-tagged with the Site/date/DSR/uploader it came from. Ordered by the
// DSR's reportDate (not photo createdAt) so an offline-queued submission's
// photos sort by the day they were taken, not the day they happened to
// sync — then by createdAt within a date as a stable tiebreaker.
export async function getSitePhotoGallery(
  prisma: PrismaService,
  storage: StorageService,
  siteId: string,
): Promise<PhotoGalleryItem[]> {
  const photos = await prisma.photo.findMany({
    where: { dailySiteReport: { siteId } },
    include: { dailySiteReport: true, uploadedBy: true },
    orderBy: [
      { dailySiteReport: { reportDate: 'desc' } },
      { createdAt: 'desc' },
    ],
  });

  return Promise.all(
    photos.map(async (photo): Promise<PhotoGalleryItem> => ({
      id: photo.id,
      url: await storage.getReadUrl(photo.storageKey),
      reportDate: photo.dailySiteReport.reportDate.toISOString().slice(0, 10),
      dailySiteReportId: photo.dailySiteReportId,
      uploaderName: photo.uploadedBy.name,
      createdAt: photo.createdAt.toISOString(),
    })),
  );
}
