import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import {
  confirmPhotoUploadSchema,
  presignPhotoUploadSchema,
  presignPurchaseBillUploadSchema,
  presignSitePhotoUploadSchema,
  type ConfirmPhotoUploadInput,
  type PresignPhotoUploadInput,
  type PresignPurchaseBillUploadInput,
  type PresignSitePhotoUploadInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
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

  // Attach Bill (2026-09-22): Owner/Admin only, same reasoning as the
  // confirm step below — a bill is optional record-keeping, but attaching
  // one is still a write a Supervisor shouldn't be able to trigger.
  @Post('purchase-bill/presign')
  @UseGuards(RolesGuard)
  @Roles('OWNER_ADMIN')
  @UsePipes(new ZodValidationPipe(presignPurchaseBillUploadSchema))
  presignPurchaseBill(@Body() body: PresignPurchaseBillUploadInput) {
    return this.storageService.presignPurchaseBillUpload(body);
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
