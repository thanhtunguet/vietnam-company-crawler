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
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';
import { InfoDoanhNghiepAdapter } from './adapters/infodoanhnghiep.adapter';
import { AreaModule } from 'src/area/area.module';
import { CrawlerTestController } from './crawler-test.controller';
import { CralwerUtilsService } from './crawler.utils.service';
import { ProxyHttpClient } from './crawler.proxy.service';

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
    CralwerUtilsService,
    InfoDoanhNghiepAdapter,
    ProxyHttpClient,
  ],
  controllers: [CrawlerController, CrawlerTestController],
})
export class CrawlerModule {}
