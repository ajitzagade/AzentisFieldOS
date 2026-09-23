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
  createDailyLabourerSchema,
  type CreateDailyLabourerInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { DailyLabourersService } from './daily-labourers.service';

@Controller('daily-labourers')
export class DailyLabourersController {
  constructor(private readonly labourersService: DailyLabourersService) {}

  // Master data, not a money movement — either role can register a new
  // daily-wage labourer (matches how a Supervisor can quick-create a
  // Vendor/Material/Site from an entry form elsewhere in the app).
  @Post()
  @UsePipes(new ZodValidationPipe(createDailyLabourerSchema))
  create(@Body() body: CreateDailyLabourerInput) {
    return this.labourersService.create(body);
  }

  @Get()
  list(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.labourersService.list({
      q,
      page,
      pageSize,
      sort,
      order,
      isActive,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labourersService.findOne(id);
  }
}
