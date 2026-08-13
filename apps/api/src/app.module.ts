import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SitesModule } from './sites/sites.module';
import { DsrModule } from './dsr/dsr.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [PrismaModule, SitesModule, DsrModule, StorageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
