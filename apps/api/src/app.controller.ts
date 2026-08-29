import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Deployment health check — AD-14's observability baseline (Vercel/Sentry)
  // hits this per tenant deployment. @Public(): the probe carries no session
  // token, so it is exempt from the global guard.
  @Public()
  @Get('health')
  getHealth(): { status: 'ok' } {
    return this.appService.getHealth();
  }
}
