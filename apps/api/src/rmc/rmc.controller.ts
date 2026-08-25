import { Controller, Get } from '@nestjs/common';
import { RmcService } from './rmc.service';

@Controller('rmc-entries')
export class RmcController {
  constructor(private readonly rmcService: RmcService) {}

  @Get()
  list() {
    return this.rmcService.list();
  }
}
