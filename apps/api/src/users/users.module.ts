import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { ClerkWebhookController } from './clerk-webhook.controller';
import { UsersService } from './users.service';
import { clerkClientProvider } from './clerk-client.provider';

// Story 14.2 (FR-48, AD-10, AD-11): the Users, Roles & Permissions module —
// the current-user endpoint, the Owner/Admin-only admin surface, and the Clerk
// webhook that actually creates the local User rows everything else resolves
// against.
@Module({
  controllers: [UsersController, ClerkWebhookController],
  providers: [UsersService, clerkClientProvider],
})
export class UsersModule {}
