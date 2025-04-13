import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as entities from 'src/_entities';
import { AreaModule } from 'src/area/area.module';
import { InfoDoanhNghiepAdapterProvider } from './adapters/infodoanhnghiep.adapter';
import { CrawlerController } from './controllers/crawler.controller';
import { CrawlerScheduledService } from './crawler-scheduled.service';
import { CrawlerProxyService } from './services/crawler.proxy.service';
import { CralwerUtilsService } from './services/crawler.utils.service';

@Module({
  imports: [TypeOrmModule.forFeature(Object.values(entities)), AreaModule],
  providers: [
    CrawlerProxyService,
    CralwerUtilsService,
    InfoDoanhNghiepAdapterProvider,
    CrawlerScheduledService,
  ],
  exports: [
    InfoDoanhNghiepAdapterProvider,
    CralwerUtilsService,
    CrawlerScheduledService,
  ],
  controllers: [CrawlerController],
})
export class CrawlerModule {}
