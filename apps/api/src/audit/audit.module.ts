import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditController } from './audit.controller';
import { AuditLogInterceptor } from './audit-log.interceptor';

@Module({
  controllers: [AuditController],
  providers: [
    // Global by registration: every route's successful POST/PATCH/DELETE is
    // audited without any per-controller wiring.
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
})
export class AuditModule {}
