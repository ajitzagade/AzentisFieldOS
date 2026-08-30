import { Module } from '@nestjs/common';
import { WasteDisposalController } from './waste-disposal.controller';
import { WasteDisposalService } from './waste-disposal.service';

@Module({
  controllers: [WasteDisposalController],
  providers: [WasteDisposalService],
})
export class WasteDisposalModule {}
