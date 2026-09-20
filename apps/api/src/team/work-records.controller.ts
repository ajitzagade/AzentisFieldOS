import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import {
  createWorkRecordBatchSchema,
  createWorkRecordSchema,
  type CreateWorkRecordBatchInput,
  type CreateWorkRecordInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { WorkRecordsService } from './work-records.service';

@Controller('work-records')
export class WorkRecordsController {
  constructor(private readonly workRecordsService: WorkRecordsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createWorkRecordSchema))
  create(@Body() body: CreateWorkRecordInput) {
    return this.workRecordsService.create(body);
  }

  @Post('batch')
  @UsePipes(new ZodValidationPipe(createWorkRecordBatchSchema))
  createBatch(@Body() body: CreateWorkRecordBatchInput) {
    return this.workRecordsService.createBatch(body);
  }

  // `page`/`pageSize` are opt-in (paginationParams) — omitted, this stays
  // the full, unfiltered list every existing caller relies on.
  @Get()
  list(
    @Query('siteId') siteId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.workRecordsService.list(siteId, { page, pageSize });
  }

  @Get('default-crew')
  getDefaultCrew(@Query('siteId') siteId: string, @Query('date') date: string) {
    return this.workRecordsService.getDefaultCrew(siteId, date);
  }

  // spec-dsr-activity-sync-detail-panel (goal 5): Site Activity Feed detail
  // panel target — declared after `default-crew` above, same static-path-
  // before-wildcard discipline as the rest of this controller.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workRecordsService.findOne(id);
  }
}
