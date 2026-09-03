import { Module } from '@nestjs/common';
import { WasteDisposalController } from './waste-disposal.controller';
import { WasteDisposalService } from './waste-disposal.service';

@Module({
  controllers: [WasteDisposalController],
  providers: [WasteDisposalService],
  // Story 16.6: SearchModule fans out to WasteDisposalService.searchCandidates.
  exports: [WasteDisposalService],
})
export class WasteDisposalModule {}
