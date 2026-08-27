import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ConfirmPhotoUploadInput,
  PresignPhotoUploadInput,
} from '@azentisfieldos/shared';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import type { AuthUser } from '../auth/current-user.decorator';

const currentUser: AuthUser = {
  id: 'user-1',
  clerkId: 'clerk-1',
  role: 'OWNER_ADMIN',
};

describe('StorageController', () => {
  let controller: StorageController;
  let service: {
    presignUpload: ReturnType<typeof vi.fn>;
    confirmUpload: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { presignUpload: vi.fn(), confirmUpload: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [{ provide: StorageService, useValue: service }],
    }).compile();

    controller = module.get<StorageController>(StorageController);
  });

  it('presign delegates to StorageService.presignUpload with the validated body', async () => {
    const input: PresignPhotoUploadInput = { dailySiteReportId: 'dsr-1' };
    const signed = {
      uploadUrl: 'https://api.cloudinary.com/v1_1/test-cloud/image/upload',
      apiKey: 'test-key',
      timestamp: 1735689600,
      signature: 'test-signature',
      publicId: 'dsr/dsr-1/x',
      storageKey: 'dsr/dsr-1/x',
    };
    service.presignUpload.mockResolvedValue(signed);

    const result = await controller.presign(input);

    expect(service.presignUpload).toHaveBeenCalledWith(input);
    expect(result).toEqual(signed);
  });

  it('confirm delegates to StorageService.confirmUpload with the validated body', async () => {
    const input: ConfirmPhotoUploadInput = {
      dailySiteReportId: 'dsr-1',
      storageKey: 'dsr/dsr-1/x.jpg',
    };
    service.confirmUpload.mockResolvedValue({ id: 'photo-1', ...input });

    const result = await controller.confirm(currentUser, input);

    expect(service.confirmUpload).toHaveBeenCalledWith(input, currentUser.id);
    expect(result).toEqual({ id: 'photo-1', ...input });
  });
});
