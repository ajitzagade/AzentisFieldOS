import { Module } from '@nestjs/common';
import { SitesModule } from '../sites/sites.module';
import { MaterialsModule } from '../materials/materials.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [SitesModule, MaterialsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
