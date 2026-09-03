import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
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
  // login attempts. Overrides the same `default` profile AppModule's
  // global ThrottlerGuard (APP_GUARD) already applies to every route down
  // to a much stricter limit for just this one. No route-level
  // @UseGuards(ThrottlerGuard) here — the guard is already global; adding
  // it again on this route made ThrottlerGuard run twice per request, so
  // every real login attempt incremented the shared counter twice and
  // silently halved this limit to ~2-3 attempts (caught in code review,
  // see throttler.integration.spec.ts's real-controller regression test).
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
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
