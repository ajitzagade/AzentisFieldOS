import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageService } from './storage.service';
import type { PrismaService } from '../prisma/prisma.service';

const getSignedUrlMock = vi.hoisted(() => vi.fn());
vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: getSignedUrlMock,
}));
vi.mock('./r2-client', () => ({ r2Client: {}, r2BucketName: 'test-bucket' }));

function makeService(overrides: {
  dailySiteReport?: { findUnique: ReturnType<typeof vi.fn> };
  user?: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  photo?: { create: ReturnType<typeof vi.fn> };
}) {
  const prisma = {
    dailySiteReport: overrides.dailySiteReport ?? { findUnique: vi.fn() },
    user: overrides.user ?? { findUnique: vi.fn(), create: vi.fn() },
    photo: overrides.photo ?? { create: vi.fn() },
  };
  return new StorageService(prisma as unknown as PrismaService);
}

beforeEach(() => {
  getSignedUrlMock.mockReset();
  getSignedUrlMock.mockResolvedValue('https://r2.example/signed');
});

describe('StorageService.presignUpload', () => {
  it('grants a presigned PUT URL and a storageKey scoped to the DSR, once the DSR is confirmed to exist', async () => {
    const service = makeService({
      dailySiteReport: {
        findUnique: vi.fn().mockResolvedValue({ id: 'dsr-1' }),
      },
    });

    const result = await service.presignUpload({ dailySiteReportId: 'dsr-1' });

    expect(result.uploadUrl).toBe('https://r2.example/signed');
    expect(result.storageKey).toMatch(/^dsr\/dsr-1\/[0-9a-f-]{36}\.jpg$/);
  });

  it('throws NotFoundException, not a raw error, for a DSR that does not exist', async () => {
    const service = makeService({
      dailySiteReport: { findUnique: vi.fn().mockResolvedValue(null) },
    });

    await expect(
      service.presignUpload({ dailySiteReportId: 'missing' }),
    ).rejects.toThrow(NotFoundException);
    expect(getSignedUrlMock).not.toHaveBeenCalled();
  });
});

describe('StorageService.confirmUpload', () => {
  it('creates the Photo row once the DSR is confirmed to exist', async () => {
    const photoCreate = vi.fn().mockResolvedValue({
      id: 'photo-1',
      dailySiteReportId: 'dsr-1',
      storageKey: 'dsr/dsr-1/x.jpg',
    });
    const service = makeService({
      dailySiteReport: {
        findUnique: vi.fn().mockResolvedValue({ id: 'dsr-1' }),
      },
      photo: { create: photoCreate },
    });

    // Story 1.8: the uploader id is passed in by the controller (req.user),
    // no longer resolved to a placeholder inside the service.
    const result = await service.confirmUpload(
      {
        dailySiteReportId: 'dsr-1',
        storageKey: 'dsr/dsr-1/x.jpg',
      },
      'user-1',
    );

    expect(photoCreate).toHaveBeenCalledWith({
      data: {
        dailySiteReportId: 'dsr-1',
        storageKey: 'dsr/dsr-1/x.jpg',
        uploadedByUserId: 'user-1',
      },
    });
    expect(result).toEqual({
      id: 'photo-1',
      dailySiteReportId: 'dsr-1',
      storageKey: 'dsr/dsr-1/x.jpg',
    });
  });

  it('throws NotFoundException, not a raw error, for a DSR that does not exist', async () => {
    const service = makeService({
      dailySiteReport: { findUnique: vi.fn().mockResolvedValue(null) },
    });

    await expect(
      service.confirmUpload(
        {
          dailySiteReportId: 'missing',
          storageKey: 'dsr/missing/x.jpg',
        },
        'user-1',
      ),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('StorageService.getReadUrl', () => {
  it('returns a presigned GET URL for the given storageKey', async () => {
    const service = makeService({});

    const url = await service.getReadUrl('dsr/dsr-1/x.jpg');

    expect(url).toBe('https://r2.example/signed');
  });
});
