import { describe, expect, it, vi } from 'vitest';
import { getSitePhotoGallery } from './site-photo-gallery';
import type { PrismaService } from '../prisma/prisma.service';
import type { StorageService } from '../storage/storage.service';

describe('getSitePhotoGallery', () => {
  it('returns photos newest-first by DSR reportDate, each tagged with date/DSR/uploader and a resolved read URL', async () => {
    const prisma = {
      photo: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'photo-2',
            storageKey: 'dsr/dsr-2/b.jpg',
            dailySiteReportId: 'dsr-2',
            dailySiteReport: { reportDate: new Date('2026-08-12T00:00:00Z') },
            uploadedBy: { name: 'Ramesh Yadav' },
            createdAt: new Date('2026-08-12T10:00:00Z'),
          },
          {
            id: 'photo-1',
            storageKey: 'dsr/dsr-1/a.jpg',
            dailySiteReportId: 'dsr-1',
            dailySiteReport: { reportDate: new Date('2026-08-11T00:00:00Z') },
            uploadedBy: { name: 'Suresh Patil' },
            createdAt: new Date('2026-08-11T10:00:00Z'),
          },
        ]),
      },
    } as unknown as PrismaService;

    const storage = {
      getThumbnailUrl: vi.fn((storageKey: string) =>
        Promise.resolve(
          `https://res.cloudinary.com/demo/image/upload/w_480,c_limit,q_auto,f_auto/${storageKey}`,
        ),
      ),
    } as unknown as StorageService;

    const gallery = await getSitePhotoGallery(prisma, storage, 'site-1');

    expect(gallery).toEqual([
      {
        id: 'photo-2',
        url: 'https://res.cloudinary.com/demo/image/upload/w_480,c_limit,q_auto,f_auto/dsr/dsr-2/b.jpg',
        reportDate: '2026-08-12',
        dailySiteReportId: 'dsr-2',
        uploaderName: 'Ramesh Yadav',
        createdAt: '2026-08-12T10:00:00.000Z',
      },
      {
        id: 'photo-1',
        url: 'https://res.cloudinary.com/demo/image/upload/w_480,c_limit,q_auto,f_auto/dsr/dsr-1/a.jpg',
        reportDate: '2026-08-11',
        dailySiteReportId: 'dsr-1',
        uploaderName: 'Suresh Patil',
        createdAt: '2026-08-11T10:00:00.000Z',
      },
    ]);
  });

  it('returns an empty array for a Site with no photos, not an error', async () => {
    const prisma = {
      photo: { findMany: vi.fn().mockResolvedValue([]) },
    } as unknown as PrismaService;
    const getThumbnailUrl = vi.fn();
    const storage = { getThumbnailUrl } as unknown as StorageService;

    const gallery = await getSitePhotoGallery(prisma, storage, 'site-1');

    expect(gallery).toEqual([]);
    expect(getThumbnailUrl).not.toHaveBeenCalled();
  });
});
