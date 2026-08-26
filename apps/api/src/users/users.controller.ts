import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  inviteUserSchema,
  updateUserRoleSchema,
  type InviteUserInput,
  type UpdateUserRoleInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UsersService } from './users.service';

// Story 14.2 (FR-48). The global ClerkAuthGuard (Story 1.8) authenticates every
// route here; RolesGuard adds the authZ layer. GET /users/me carries no @Roles
// and is reachable by any authenticated user (it only returns their own row);
// the three admin routes are @Roles('OWNER_ADMIN'), so a Site Supervisor
// calling them directly gets 403 — the check is server-side, never a hidden UI
// button (AD-11: only the two schema roles ever exist).
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.usersService.getMe(user.id);
  }

  @Get()
  @Roles('OWNER_ADMIN')
  list() {
    return this.usersService.list();
  }

  @Post('invite')
  @Roles('OWNER_ADMIN')
  invite(@Body(new ZodValidationPipe(inviteUserSchema)) body: InviteUserInput) {
    return this.usersService.invite(body);
  }

  @Patch(':id/role')
  @Roles('OWNER_ADMIN')
  updateRole(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserRoleSchema)) body: UpdateUserRoleInput,
  ) {
    return this.usersService.updateRole(id, body);
  }
}
