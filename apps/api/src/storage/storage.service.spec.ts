import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageService } from './storage.service';
import type { PrismaService } from '../prisma/prisma.service';

const apiSignRequestMock = vi.hoisted(() => vi.fn(() => 'test-signature'));
// Mock the Cloudinary client wrapper: a deterministic signature + config, and a
// pure cloudinaryUrl matching the real `res.cloudinary.com/<cloud>/image/upload`
// shape so URL assertions are exact.
vi.mock('./cloudinary-client', () => ({
  cloudinary: {
    config: () => ({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret',
    }),
    utils: { api_sign_request: apiSignRequestMock },
  },
  cloudinaryUrl: (publicId: string) =>
    `https://res.cloudinary.com/test-cloud/image/upload/${publicId}`,
  cloudinaryThumbnailUrl: (publicId: string, width = 480) =>
    `https://res.cloudinary.com/test-cloud/image/upload/w_${width},c_limit,q_auto,f_auto/${publicId}`,
}));

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
  apiSignRequestMock.mockClear();
});

describe('StorageService.presignUpload', () => {
  it('returns a Cloudinary-signed param set with a public_id scoped to the DSR, once the DSR is confirmed to exist', async () => {
    const service = makeService({
      dailySiteReport: {
        findUnique: vi.fn().mockResolvedValue({ id: 'dsr-1' }),
      },
    });

    const result = await service.presignUpload({ dailySiteReportId: 'dsr-1' });

    expect(result.uploadUrl).toBe(
      'https://api.cloudinary.com/v1_1/test-cloud/image/upload',
    );
    expect(result.apiKey).toBe('test-key');
    expect(result.signature).toBe('test-signature');
    expect(typeof result.timestamp).toBe('number');
    expect(result.publicId).toMatch(/^dsr\/dsr-1\/[0-9a-f-]{36}$/);
    expect(result.storageKey).toBe(result.publicId);
    expect(result.allowedFormats).toBe('jpg,jpeg,png,webp,heic,heif');
    // Signed via the SDK over exactly { public_id, timestamp, allowed_formats }
    // — allowed_formats is part of the signature so a tampered client can't
    // widen it without invalidating the signature.
    expect(apiSignRequestMock).toHaveBeenCalledWith(
      {
        public_id: result.publicId,
        timestamp: result.timestamp,
        allowed_formats: 'jpg,jpeg,png,webp,heic,heif',
      },
      'test-secret',
    );
  });

  it('throws NotFoundException, not a raw error, for a DSR that does not exist', async () => {
    const service = makeService({
      dailySiteReport: { findUnique: vi.fn().mockResolvedValue(null) },
    });

    await expect(
      service.presignUpload({ dailySiteReportId: 'missing' }),
    ).rejects.toThrow(NotFoundException);
    expect(apiSignRequestMock).not.toHaveBeenCalled();
  });
});

describe('StorageService.presignBrandingLogoUpload', () => {
  it('returns a signed param set plus a durable public logoUrl for the branding public_id', () => {
    const service = makeService({});

    const result = service.presignBrandingLogoUpload();

    expect(result.publicId).toMatch(/^branding\/logo\/[0-9a-f-]{36}$/);
    expect(result.uploadUrl).toBe(
      'https://api.cloudinary.com/v1_1/test-cloud/image/upload',
    );
    expect(result.signature).toBe('test-signature');
    expect(result.allowedFormats).toBe('jpg,jpeg,png,svg');
    expect(result.logoUrl).toBe(
      `https://res.cloudinary.com/test-cloud/image/upload/${result.publicId}`,
    );
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
  it('returns the public, full-resolution Cloudinary delivery URL for the given storageKey', async () => {
    const service = makeService({});

    const url = await service.getReadUrl('dsr/dsr-1/x');

    expect(url).toBe(
      'https://res.cloudinary.com/test-cloud/image/upload/dsr/dsr-1/x',
    );
  });
});

describe('StorageService.getThumbnailUrl', () => {
  it('returns a downsized, format-negotiated Cloudinary delivery URL for the given storageKey', async () => {
    const service = makeService({});

    const url = await service.getThumbnailUrl('dsr/dsr-1/x');

    expect(url).toBe(
      'https://res.cloudinary.com/test-cloud/image/upload/w_480,c_limit,q_auto,f_auto/dsr/dsr-1/x',
    );
  });
});
