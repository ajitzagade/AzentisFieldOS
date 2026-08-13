import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { DsrController } from './dsr.controller';
import { DsrService } from './dsr.service';

@Module({
  imports: [StorageModule],
  controllers: [DsrController],
  providers: [DsrService],
})
export class DsrModule {}
