import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// FR-48, AD-11: the Users, Roles & Permissions module — the current-user
// endpoint and the Owner/Admin-only admin surface.
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
