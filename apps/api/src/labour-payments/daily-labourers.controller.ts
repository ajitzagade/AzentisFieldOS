import {
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
  createDailyLabourerSchema,
  updateDailyLabourerActiveSchema,
  updateDailyLabourerSchema,
  type CreateDailyLabourerInput,
  type UpdateDailyLabourerActiveInput,
  type UpdateDailyLabourerInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { DailyLabourersService } from './daily-labourers.service';

// Every route here is open to both roles (revised 2026-09-25,
// user-requested): a Site Engineer is the one actually doing Labour
// management day to day (attendance, payments), so editing a Labourer's
// details or deactivating one is routine upkeep, not an Owner-reserved
// decision — unlike Vendor/Subcontractor/Site Contract, where correcting
// an existing record stays Owner/Admin-only. No RolesGuard needed here at
// all now that nothing carries @Roles() metadata.
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

  // Either role edits an existing Labourer's details (name/category/rate)
  // — see the controller-level comment above for why Labour departs from
  // Vendor/Subcontractor's usual "create open, edit Owner-only" split.
  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateDailyLabourerSchema))
  update(@Param('id') id: string, @Body() body: UpdateDailyLabourerInput) {
    return this.labourersService.update(id, body);
  }

  // Deactivate ("Delete" in the product's own vocabulary) / Reactivate —
  // either role. Never a real DELETE: attendance/advance/payment history
  // stays intact either way.
  @Patch(':id/active')
  setActive(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateDailyLabourerActiveSchema))
    body: UpdateDailyLabourerActiveInput,
  ) {
    return this.labourersService.setActive(id, body.isActive);
  }
}
