import { Module } from '@nestjs/common';
import { RmcController } from './rmc.controller';
import { RmcService } from './rmc.service';

@Module({
  controllers: [RmcController],
  providers: [RmcService],
})
export class RmcModule {}
