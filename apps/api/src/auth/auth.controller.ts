import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  loginSchema,
  refreshTokenSchema,
  type LoginInput,
  type RefreshTokenInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';

// The endpoints that must be reachable with no valid access token at all —
// everything else in apps/api is protected by construction via the global
// CustomAuthGuard (APP_GUARD). /auth/refresh and /auth/logout authenticate
// via the refresh token in the request body instead of a Bearer header.
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Throttled at 5 attempts/minute per caller — bounds scripted brute-force
  // login attempts. Scoped to this one route (see AuthModule) rather than a
  // global guard, since no other route needs it.
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ login: { limit: 5, ttl: 60_000 } })
  @Post('login')
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginInput) {
    return this.authService.login(body);
  }

  @Public()
  @Post('refresh')
  refresh(
    @Body(new ZodValidationPipe(refreshTokenSchema)) body: RefreshTokenInput,
  ) {
    return this.authService.refresh(body.refreshToken);
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Body(new ZodValidationPipe(refreshTokenSchema)) body: RefreshTokenInput,
  ) {
    await this.authService.logout(body.refreshToken);
  }
}
