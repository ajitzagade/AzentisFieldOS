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

    const getThumbnailUrl = vi.fn((storageKey: string, width?: number) =>
      Promise.resolve(
        `https://res.cloudinary.com/demo/image/upload/w_${width ?? 480},c_limit,q_auto,f_auto/${storageKey}`,
      ),
    );
    const storage = { getThumbnailUrl } as unknown as StorageService;

    const gallery = await getSitePhotoGallery(prisma, storage, 'site-1');

    expect(gallery).toEqual([
      {
        id: 'photo-2',
        url: 'https://res.cloudinary.com/demo/image/upload/w_480,c_limit,q_auto,f_auto/dsr/dsr-2/b.jpg',
        previewUrl:
          'https://res.cloudinary.com/demo/image/upload/w_1600,c_limit,q_auto,f_auto/dsr/dsr-2/b.jpg',
        reportDate: '2026-08-12',
        dailySiteReportId: 'dsr-2',
        uploaderName: 'Ramesh Yadav',
        createdAt: '2026-08-12T10:00:00.000Z',
      },
      {
        id: 'photo-1',
        url: 'https://res.cloudinary.com/demo/image/upload/w_480,c_limit,q_auto,f_auto/dsr/dsr-1/a.jpg',
        previewUrl:
          'https://res.cloudinary.com/demo/image/upload/w_1600,c_limit,q_auto,f_auto/dsr/dsr-1/a.jpg',
        reportDate: '2026-08-11',
        dailySiteReportId: 'dsr-1',
        uploaderName: 'Suresh Patil',
        createdAt: '2026-08-11T10:00:00.000Z',
      },
    ]);

    // previewUrl is derived from the same storageKey at a larger width,
    // via the same helper — not a second URL-building path.
    expect(getThumbnailUrl).toHaveBeenCalledWith('dsr/dsr-2/b.jpg');
    expect(getThumbnailUrl).toHaveBeenCalledWith('dsr/dsr-2/b.jpg', 1600);
  });

  // Direct-to-Site upload (2026-09-20): a photo with no parent DSR sorts
  // and displays by its own createdAt instead of a DSR's reportDate.
  it('includes a direct-to-Site upload, sorted by its own createdAt and tagged with a null dailySiteReportId', async () => {
    const prisma = {
      photo: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'photo-dsr',
            storageKey: 'dsr/dsr-1/a.jpg',
            dailySiteReportId: 'dsr-1',
            dailySiteReport: { reportDate: new Date('2026-08-11T00:00:00Z') },
            uploadedBy: { name: 'Suresh Patil' },
            createdAt: new Date('2026-08-11T10:00:00Z'),
          },
          {
            id: 'photo-site',
            storageKey: 'site/site-1/c.jpg',
            dailySiteReportId: null,
            dailySiteReport: null,
            uploadedBy: { name: 'Ramesh Yadav' },
            createdAt: new Date('2026-08-13T09:00:00Z'),
          },
        ]),
      },
    } as unknown as PrismaService;

    const getThumbnailUrl = vi.fn((storageKey: string, width?: number) =>
      Promise.resolve(
        `https://res.cloudinary.com/demo/image/upload/w_${width ?? 480}/${storageKey}`,
      ),
    );
    const storage = { getThumbnailUrl } as unknown as StorageService;

    const gallery = await getSitePhotoGallery(prisma, storage, 'site-1');

    // The direct upload (2026-08-13) sorts newest-first ahead of the DSR
    // photo (2026-08-11), using its own createdAt as the effective date.
    expect(gallery.map((p) => p.id)).toEqual(['photo-site', 'photo-dsr']);
    expect(gallery[0]).toMatchObject({
      id: 'photo-site',
      reportDate: '2026-08-13',
      dailySiteReportId: null,
      uploaderName: 'Ramesh Yadav',
    });
  });

  // Measurement (2026-09-21): category/description pass straight through.
  it("includes a Measurement photo's category and description", async () => {
    const prisma = {
      photo: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'photo-measurement',
            storageKey: 'site/site-1/m.jpg',
            dailySiteReportId: null,
            dailySiteReport: null,
            uploadedBy: { name: 'Ramesh Yadav' },
            createdAt: new Date('2026-08-13T09:00:00Z'),
            category: 'MEASUREMENT',
            description: 'Foundation depth at Ch. 4+200',
          },
        ]),
      },
    } as unknown as PrismaService;
    const getThumbnailUrl = vi.fn(() => Promise.resolve('https://cdn/x.jpg'));
    const storage = { getThumbnailUrl } as unknown as StorageService;

    const gallery = await getSitePhotoGallery(prisma, storage, 'site-1');

    expect(gallery[0]).toMatchObject({
      category: 'MEASUREMENT',
      description: 'Foundation depth at Ch. 4+200',
    });
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
