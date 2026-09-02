import { Module } from '@nestjs/common';
import { RmcController } from './rmc.controller';
import { RmcService } from './rmc.service';

@Module({
  controllers: [RmcController],
  providers: [RmcService],
  // Story 19.2: SearchModule fans out to RmcService.searchCandidates.
  exports: [RmcService],
})
export class RmcModule {}
