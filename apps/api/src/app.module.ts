import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SitesModule } from './sites/sites.module';
import { DsrModule } from './dsr/dsr.module';
import { StorageModule } from './storage/storage.module';
import { MaterialsModule } from './materials/materials.module';
import { InventoryModule } from './inventory/inventory.module';
import { TeamModule } from './team/team.module';
import { AssetsModule } from './assets/assets.module';
import { VendorsModule } from './vendors/vendors.module';
import { RmcModule } from './rmc/rmc.module';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [
    PrismaModule,
    SitesModule,
    DsrModule,
    StorageModule,
    MaterialsModule,
    InventoryModule,
    TeamModule,
    AssetsModule,
    VendorsModule,
    RmcModule,
    ExpensesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
