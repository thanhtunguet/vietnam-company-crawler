import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Company,
  CompanyCrawlingLog,
  CompanyStatus,
  District,
  Province,
  ProvinceCrawlingLog,
  Ward,
} from 'src/_entities';
import { CrawlerController } from './controllers/crawler.controller';
import { InfoDoanhNghiepAdapter } from './adapters/infodoanhnghiep.adapter';
import { AreaModule } from 'src/area/area.module';
import { CrawlerTestController } from './controllers/crawler-test.controller';
import { CrawlerService } from './services/crawler.service';
import { CralwerUtilsService } from './services/crawler.utils.service';
import { CrawlerProxyService } from './services/crawler.proxy.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      Province,
      District,
      Ward,
      ProvinceCrawlingLog,
      CompanyCrawlingLog,
      CompanyStatus,
    ]),
    AreaModule,
  ],
  providers: [
    CrawlerService,
    CrawlerProxyService,
    CralwerUtilsService,
    InfoDoanhNghiepAdapter,
  ],
  controllers: [CrawlerController, CrawlerTestController],
})
export class CrawlerModule {}
