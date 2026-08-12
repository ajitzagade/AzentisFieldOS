import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Deployment health check — AD-14's observability baseline (Vercel/Sentry)
  // hits this per tenant deployment.
  @Get('health')
  getHealth(): { status: 'ok' } {
    return this.appService.getHealth();
  }
}
