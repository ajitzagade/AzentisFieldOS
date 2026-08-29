import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { getSitePhotoGallery } from './site-photo-gallery';
import type { StorageService } from '../storage/storage.service';

// Real integration test against a live Postgres instance — this exercises
// the `Photo.uploadedBy` relation (added in this story's own migration,
// since the schema as inherited from Story 3.1 only had a bare
// `uploadedByUserId` scalar with no FK/relation, which `include:
// { uploadedBy: true }` would silently fail against at the Prisma-client
// level, not something a mocked prisma object could ever catch).
const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

describeIfDb('getSitePhotoGallery (integration)', () => {
  let prisma: PrismaService;
  let siteId: string;
  let dsrId: string;
  let userId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();

    const site = await prisma.site.create({
      data: { name: 'Test Site', location: 'Test Location' },
    });
    siteId = site.id;

    const user = await prisma.user.create({
      data: {
        name: 'Ramesh Yadav',
        email: 'ramesh@example.test',
        passwordHash: 'test-hash',
        role: 'SITE_SUPERVISOR',
      },
    });
    userId = user.id;

    const dsr = await prisma.dailySiteReport.create({
      data: {
        siteId,
        reportDate: new Date('2026-08-12'),
        submittedByUserId: userId,
      },
    });
    dsrId = dsr.id;
  });

  afterEach(async () => {
    await prisma.photo.deleteMany({});
  });

  afterAll(async () => {
    await prisma.dailySiteReport.deleteMany({ where: { id: dsrId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.site.deleteMany({ where: { id: siteId } });
    await prisma.onModuleDestroy();
  });

  it('resolves the uploader via the Photo.uploadedBy relation and returns a gallery item', async () => {
    await prisma.photo.create({
      data: {
        dailySiteReportId: dsrId,
        storageKey: 'dsr/x/1.jpg',
        uploadedByUserId: userId,
      },
    });

    const storage = {
      getReadUrl: vi.fn().mockResolvedValue('https://r2.example/signed'),
    } as unknown as StorageService;
    const gallery = await getSitePhotoGallery(prisma, storage, siteId);

    expect(gallery).toHaveLength(1);
    expect(gallery[0]).toMatchObject({
      uploaderName: 'Ramesh Yadav',
      dailySiteReportId: dsrId,
      reportDate: '2026-08-12',
      url: 'https://r2.example/signed',
    });
  });

  it('returns an empty array for a Site with no photos', async () => {
    const storage = { getReadUrl: vi.fn() } as unknown as StorageService;
    const gallery = await getSitePhotoGallery(prisma, storage, siteId);
    expect(gallery).toEqual([]);
  });
});
