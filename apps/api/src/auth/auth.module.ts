import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// global: true makes JwtService injectable anywhere (in particular,
// CustomAuthGuard, registered globally via APP_GUARD in AppModule) without
// every module that needs it re-importing JwtModule.
//
// Access-token expiry is short (1h): this is the token attached to every
// request, so a stolen one now has a small blast-radius window. Long-lived
// sessions (so users aren't forced to re-login every hour) come from the
// separate refresh token (AuthService.refresh) instead.
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    // A single named throttler: @nestjs/throttler applies every profile
    // configured here to EVERY route by default (confirmed against a real
    // boot — a second, separately-named `login` profile leaked its own
    // strict limit onto routes with no @Throttle() at all, not just
    // /auth/login), so a second name is the wrong tool for "one route
    // needs a stricter limit." `default` is the generous global backstop
    // AppModule wires up via APP_GUARD — every route had no rate limit at
    // all before this; it doesn't protect against a determined attacker
    // (an authenticated caller could still do real damage within the
    // limit), it only bounds a misbehaving client (a buggy frontend retry
    // loop, a leaked token scripted in a tight loop). AuthController's own
    // @Throttle({ default: {...} }) overrides this same profile's limit
    // to something much stricter for just POST /auth/login.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 300 }]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  // AppModule registers ThrottlerGuard as a global APP_GUARD (so every
  // route gets the `default` backstop by construction, matching
  // CustomAuthGuard's own global-by-default pattern) — it needs
  // ThrottlerModule's providers (ThrottlerStorage etc.) visible outside
  // this module to resolve.
  exports: [ThrottlerModule],
})
export class AuthModule {}
