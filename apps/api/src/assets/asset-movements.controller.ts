import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import {
  assetTypeSchema,
  createAssetMovementSchema,
  type CreateAssetMovementInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AssetMovementsService } from './asset-movements.service';

@Controller('asset-movements')
export class AssetMovementsController {
  constructor(private readonly assetMovementsService: AssetMovementsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createAssetMovementSchema))
  create(@Body() body: CreateAssetMovementInput) {
    return this.assetMovementsService.create(body);
  }

  // The asset detail page's reverse-chronological "Movement History"
  // section — both query params are required, a Machine/Vehicle's history
  // is always scoped to one asset.
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
    return this.assetMovementsService.list(parsedAssetType.data, assetId);
  }

  // spec-dsr-activity-sync-detail-panel (goal 5): Site Activity Feed detail
  // panel target — `assetType` is a required query param (same shape as
  // list() above) since a bare id alone can't tell Machinery from Vehicle.
  @Get(':id')
  findOne(@Param('id') id: string, @Query('assetType') assetType: string) {
    const parsedAssetType = assetTypeSchema.safeParse(assetType);
    if (!parsedAssetType.success) {
      throw new BadRequestException(
        'assetType (MACHINERY or VEHICLE) query param is required',
      );
    }
    return this.assetMovementsService.findOne(parsedAssetType.data, id);
  }
}
