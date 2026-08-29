import { Body, Controller, Post } from '@nestjs/common';
import { loginSchema, type LoginInput } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';

// The one endpoint that must be reachable with no token at all — everything
// else in apps/api is protected by construction via the global
// CustomAuthGuard (APP_GUARD).
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginInput) {
    return this.authService.login(body);
  }
}
