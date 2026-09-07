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
  //
  // AUTH_LOGIN_RATE_LIMIT overrides the 5 (defaulting to it when unset, so
  // production/any environment without the var behaves exactly as before)
  // — found 2026-09-07: e2e's own suite (every spec independently signs
  // in, real flow, real HTTP, no shortcut) legitimately makes 6+ real
  // login attempts from one machine inside a rolling 60s window on a fast
  // run, tripping this same brute-force guard against itself. That surfaced
  // as apps/web's generic "Something went wrong signing you in" (a 429
  // maps to the same catch-all as a network failure — see
  // map-login-error.ts) and read as e2e flakiness for a long time before
  // being traced back here. e2e/playwright.config.ts sets this env var high
  // for its own API process; nothing else should ever set it.
  @Public()
  @Throttle({ default: { limit: Number(process.env.AUTH_LOGIN_RATE_LIMIT) || 5, ttl: 60_000 } })
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
