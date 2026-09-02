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
  createUserSchema,
  updateUserRoleSchema,
  type CreateUserInput,
  type UpdateUserRoleInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UsersService } from './users.service';

// FR-48. The global CustomAuthGuard authenticates every route here;
// RolesGuard adds the authZ layer. GET /users/me carries no @Roles and is
// reachable by any authenticated user (it only returns their own row); the
// three admin routes are @Roles('OWNER_ADMIN'), so a Site Supervisor calling
// them directly gets 403 — the check is server-side, never a hidden UI
// button (AD-11: only the two schema roles ever exist).
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Built straight from request.user (CustomAuthGuard already resolved the
  // full safe profile to attach it there) — no second DB round-trip on the
  // app's single highest-frequency authenticated endpoint.
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Get()
  @Roles('OWNER_ADMIN')
  list() {
    return this.usersService.list();
  }

  @Post()
  @Roles('OWNER_ADMIN')
  create(@Body(new ZodValidationPipe(createUserSchema)) body: CreateUserInput) {
    return this.usersService.createUser(body);
  }

  @Patch(':id/role')
  @Roles('OWNER_ADMIN')
  updateRole(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserRoleSchema))
    body: UpdateUserRoleInput,
  ) {
    return this.usersService.updateRole(id, body);
  }
}
