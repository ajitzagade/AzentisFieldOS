import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import {
  confirmPhotoUploadSchema,
  presignPhotoUploadSchema,
  type ConfirmPhotoUploadInput,
  type PresignPhotoUploadInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { StorageService } from './storage.service';

@Controller('photos')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presign')
  @UsePipes(new ZodValidationPipe(presignPhotoUploadSchema))
  presign(@Body() body: PresignPhotoUploadInput) {
    return this.storageService.presignUpload(body);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(confirmPhotoUploadSchema))
  confirm(@Body() body: ConfirmPhotoUploadInput) {
    return this.storageService.confirmUpload(body);
  }
}
