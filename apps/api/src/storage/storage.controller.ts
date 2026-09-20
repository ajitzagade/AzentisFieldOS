import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import {
  confirmPhotoUploadSchema,
  presignPhotoUploadSchema,
  presignSitePhotoUploadSchema,
  type ConfirmPhotoUploadInput,
  type PresignPhotoUploadInput,
  type PresignSitePhotoUploadInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { StorageService } from './storage.service';

@Controller('photos')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presign')
  @UsePipes(new ZodValidationPipe(presignPhotoUploadSchema))
  presign(@Body() body: PresignPhotoUploadInput) {
    return this.storageService.presignUpload(body);
  }

  @Post('challan/presign')
  presignChallan() {
    return this.storageService.presignChallanUpload();
  }

  // Direct-to-Site upload (2026-09-20) — a photo captured but not uploaded
  // during that day's Daily Report. Confirms via the same POST /photos
  // below, just with `siteId` instead of `dailySiteReportId`.
  @Post('site-presign')
  @UsePipes(new ZodValidationPipe(presignSitePhotoUploadSchema))
  presignSitePhoto(@Body() body: PresignSitePhotoUploadInput) {
    return this.storageService.presignSitePhotoUpload(body);
  }

  // Story 1.8 (AC #1): the Photo is attributed to the real signed-in user
  // (req.user, resolved by ClerkAuthGuard), threaded into the service.
  @Post()
  @UsePipes(new ZodValidationPipe(confirmPhotoUploadSchema))
  confirm(
    @CurrentUser() user: AuthUser,
    @Body() body: ConfirmPhotoUploadInput,
  ) {
    return this.storageService.confirmUpload(body, user.id);
  }
}
