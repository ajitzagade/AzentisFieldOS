import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CustomAuthGuard } from './auth/custom-auth.guard';
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
import { WasteDisposalModule } from './waste-disposal/waste-disposal.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
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
    WasteDisposalModule,
    DashboardModule,
    ReportsModule,
    UsersModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Request-level auth for EVERY apps/api route by construction.
    // Registered globally so a new controller is protected by default — a
    // route only opts out via an explicit @Public().
    { provide: APP_GUARD, useClass: CustomAuthGuard },
  ],
})
export class AppModule {}
