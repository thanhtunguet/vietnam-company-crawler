// crawler.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlerMqttService } from './crawler.mqtt.service';
import {
  Business,
  Company,
  CompanyBusinessMapping,
  CrawlerJob,
  Province,
} from 'src/_entities';
import { CrawlerJobHandler } from './crawler.job-handler';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { InfoRepository } from 'src/_repositories/info-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CrawlerJob,
      Province,
      Company,
      Province,
      Business,
      CompanyBusinessMapping,
    ]), // Register entities
  ],
  providers: [
    CrawlerMqttService,
    CrawlerService,
    CrawlerJobHandler,
    InfoRepository,
  ],
  exports: [CrawlerMqttService, CrawlerService, CrawlerJobHandler],
  controllers: [CrawlerController],
})
export class CrawlerModule {}
