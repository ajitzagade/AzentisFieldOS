import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
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

  @Get()
  list(@Query('siteId') siteId?: string) {
    return this.workRecordsService.list(siteId);
  }

  @Get('default-crew')
  getDefaultCrew(@Query('siteId') siteId: string, @Query('date') date: string) {
    return this.workRecordsService.getDefaultCrew(siteId, date);
  }
}
