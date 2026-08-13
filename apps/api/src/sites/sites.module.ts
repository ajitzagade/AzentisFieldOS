import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

@Module({
  imports: [StorageModule],
  controllers: [SitesController],
  providers: [SitesService],
})
export class SitesModule {}
