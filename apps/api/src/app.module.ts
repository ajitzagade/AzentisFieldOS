import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SitesModule } from './sites/sites.module';

@Module({
  imports: [PrismaModule, SitesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
