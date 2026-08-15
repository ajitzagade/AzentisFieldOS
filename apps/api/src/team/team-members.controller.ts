import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
  type CreateTeamMemberInput,
  type UpdateTeamMemberInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { TeamMembersService } from './team-members.service';

@Controller('team-members')
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createTeamMemberSchema))
  create(@Body() body: CreateTeamMemberInput) {
    return this.teamMembersService.create(body);
  }

  @Get()
  list() {
    return this.teamMembersService.list();
  }

  // Registered before ':id' — 'team-summary' is a single path segment,
  // same shape as ':id', so a wildcard param route declared first would
  // otherwise swallow this literal one (Express/Nest match in
  // registration order for same-shape competing patterns).
  @Get('team-summary')
  getTeamSummary() {
    return this.teamMembersService.getTeamSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamMembersService.findOne(id);
  }

  @Get(':id/work-history')
  getWorkHistory(@Param('id') id: string) {
    return this.teamMembersService.getWorkHistory(id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateTeamMemberSchema))
  update(@Param('id') id: string, @Body() body: UpdateTeamMemberInput) {
    return this.teamMembersService.update(id, body);
  }
}
