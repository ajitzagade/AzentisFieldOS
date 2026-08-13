import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SitesModule } from './sites/sites.module';
import { DsrModule } from './dsr/dsr.module';
import { StorageModule } from './storage/storage.module';
import { MaterialsModule } from './materials/materials.module';

@Module({
  imports: [
    PrismaModule,
    SitesModule,
    DsrModule,
    StorageModule,
    MaterialsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
