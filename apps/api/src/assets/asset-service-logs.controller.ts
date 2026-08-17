import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import {
  assetTypeSchema,
  createAssetServiceLogSchema,
  updateAssetServiceLogSchema,
  type CreateAssetServiceLogInput,
  type UpdateAssetServiceLogInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AssetServiceLogsService } from './asset-service-logs.service';

@Controller('asset-service-logs')
export class AssetServiceLogsController {
  constructor(
    private readonly assetServiceLogsService: AssetServiceLogsService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createAssetServiceLogSchema))
  create(@Body() body: CreateAssetServiceLogInput) {
    return this.assetServiceLogsService.create(body);
  }

  // The asset detail page's "Service History" section — both query params
  // are required, a Machine/Vehicle's service log is always scoped to one
  // asset (same shape as GET /asset-movements).
  @Get()
  list(
    @Query('assetType') assetType: string,
    @Query('assetId') assetId: string,
  ) {
    const parsedAssetType = assetTypeSchema.safeParse(assetType);
    if (!parsedAssetType.success || !assetId) {
      throw new BadRequestException(
        'assetType (MACHINERY or VEHICLE) and assetId query params are required',
      );
    }
    return this.assetServiceLogsService.list(parsedAssetType.data, assetId);
  }

  // AC #2: a normal Edit affordance (PATCH), not CorrectAction. assetType
  // travels as a query param — it isn't part of the editable body (an
  // entry's asset never changes), only which Prisma delegate to use, so
  // it's validated separately here rather than folded into
  // updateAssetServiceLogSchema. The Zod pipe is bound to `@Body()` only
  // (not `@UsePipes` at the method level) since this handler also has
  // `@Param`/`@Query` arguments that a method-scoped pipe would
  // incorrectly run through the same body schema.
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('assetType') assetType: string,
    @Body(new ZodValidationPipe(updateAssetServiceLogSchema))
    body: UpdateAssetServiceLogInput,
  ) {
    const parsedAssetType = assetTypeSchema.safeParse(assetType);
    if (!parsedAssetType.success) {
      throw new BadRequestException(
        'assetType (MACHINERY or VEHICLE) query param is required',
      );
    }
    return this.assetServiceLogsService.update(id, parsedAssetType.data, body);
  }
}
