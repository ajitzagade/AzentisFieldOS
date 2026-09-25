import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
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
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DailyLabourersService } from './daily-labourers.service';

// RolesGuard is a no-op on handlers without @Roles() metadata, so adding it
// at controller level restricts ONLY update/setActive below — create/list/
// findOne stay open to both roles, unchanged.
@UseGuards(RolesGuard)
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

  // Editing an existing Labourer's details (name/category/rate) stays
  // Owner/Admin-only — same rule as Vendor/Subcontractor: registering a
  // new one is open to both roles, correcting an existing record is not.
  @Patch(':id')
  @Roles('OWNER_ADMIN')
  @UsePipes(new ZodValidationPipe(updateDailyLabourerSchema))
  update(@Param('id') id: string, @Body() body: UpdateDailyLabourerInput) {
    return this.labourersService.update(id, body);
  }

  // Deactivate ("Delete" in the product's own vocabulary) / Reactivate —
  // Owner/Admin-only, mirrors PATCH /users/:id/active exactly. Never a real
  // DELETE: attendance/advance/payment history stays intact either way.
  @Patch(':id/active')
  @Roles('OWNER_ADMIN')
  setActive(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateDailyLabourerActiveSchema))
    body: UpdateDailyLabourerActiveInput,
  ) {
    return this.labourersService.setActive(id, body.isActive);
  }
}
