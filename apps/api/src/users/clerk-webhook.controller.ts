import {
  Controller,
  Headers,
  Post,
  Req,
  UnauthorizedException,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import type { WebhookEvent } from '@clerk/backend';
import { Webhook } from 'svix';
import { Public } from '../auth/public.decorator';
import { UsersService } from './users.service';

// Story 14.2, Task 1 (AC #2): the authoritative user-creator. Clerk delivers
// user lifecycle events here, Svix-signed. This route is @Public() — like the
// Cron routes, it carries a signing secret, NOT a Clerk user session token, so
// it is exempt from the global ClerkAuthGuard and authenticates itself via the
// Svix signature check below. An unverified payload is NEVER processed.
@Public()
@Controller('webhooks/clerk')
export class ClerkWebhookController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('svix-id') svixId?: string,
    @Headers('svix-timestamp') svixTimestamp?: string,
    @Headers('svix-signature') svixSignature?: string,
  ) {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    // Fail closed: no configured secret means we can't trust anything — reject
    // rather than process an unverifiable payload.
    if (!secret) {
      throw new UnauthorizedException();
    }
    // Svix verifies against the RAW request bytes, not Nest's parsed JSON —
    // main.ts enables rawBody so req.rawBody holds them. A missing raw body or
    // missing Svix headers is itself an unverifiable request.
    const rawBody = req.rawBody;
    if (!rawBody || !svixId || !svixTimestamp || !svixSignature) {
      throw new UnauthorizedException();
    }

    let event: WebhookEvent;
    try {
      event = new Webhook(secret).verify(rawBody.toString('utf8'), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch {
      // A tampered, replayed, or wrongly-signed payload — a plain 401, never a
      // leaked reason and never a processed side effect.
      throw new UnauthorizedException();
    }

    switch (event.type) {
      case 'user.created':
        await this.usersService.handleUserCreated(event.data);
        break;
      case 'user.updated':
        await this.usersService.handleUserUpdated(event.data);
        break;
      case 'user.deleted':
        this.usersService.handleUserDeleted();
        break;
      default:
        // Any other Clerk event type is acknowledged (200) but not acted on —
        // this handler owns only the User lifecycle.
        break;
    }

    return { received: true };
  }
}
