import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClerkAuthGuard } from './auth/clerk-auth.guard';
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
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';

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
    DashboardModule,
    ReportsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Story 1.8 (AC #1/#2/#5): request-level Clerk auth for EVERY apps/api
    // route by construction. Registered globally so a new controller is
    // protected by default — a route only opts out via an explicit @Public().
    { provide: APP_GUARD, useClass: ClerkAuthGuard },
  ],
})
export class AppModule {}
