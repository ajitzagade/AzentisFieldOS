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
    // POST /auth/login only — bounds brute-force login attempts. Scoped to
    // this module (not a global APP_GUARD) since no other route needs it.
    ThrottlerModule.forRoot([{ name: 'login', ttl: 60_000, limit: 5 }]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
