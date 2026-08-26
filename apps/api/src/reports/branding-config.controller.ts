import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import {
  updateBrandingConfigSchema,
  type UpdateBrandingConfigInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { StorageService } from '../storage/storage.service';
import { BrandingConfigService } from './branding-config.service';

// Story 14.1 (FR-47): the admin Branding config endpoints, living in the
// reports module alongside Story 13.1's ReportCompilerService (which reads this
// same BrandingConfig row on every compile). No per-request auth guard is wired
// yet in apps/api — that is Story 14.2's job — so this follows the existing
// no-auth controller convention like every other controller here.
@Controller('branding-config')
export class BrandingConfigController {
  constructor(
    private readonly brandingConfig: BrandingConfigService,
    private readonly storage: StorageService,
  ) {}

  // The single seeded row, for the admin form to populate its fields + preview.
  @Get()
  get() {
    return this.brandingConfig.getConfig();
  }

  // A plain update of the one row — no publish step (AC #1). ReportCompilerService
  // reads the row fresh next compile, so the change lands in the next report.
  @Patch()
  update(
    @Body(new ZodValidationPipe(updateBrandingConfigSchema))
    body: UpdateBrandingConfigInput,
  ) {
    return this.brandingConfig.update(body);
  }

  // Logo upload presign — reuses Epic 3's R2 presign→PUT→store-URL flow
  // (StorageService, the DSR photo path) rather than a second upload mechanism.
  // The client PUTs the bytes directly to R2 (AD-3), then persists the returned
  // durable `logoUrl` via the PATCH above on Save.
  @Post('logo/presign')
  presignLogo() {
    return this.storage.presignBrandingLogoUpload();
  }
}
