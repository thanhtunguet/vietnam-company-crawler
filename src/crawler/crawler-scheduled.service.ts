import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  InfoDoanhNghiepAdapterProvider,
  type InfoDoanhNghiepAdapter,
} from './adapters/infodoanhnghiep.adapter';

@Injectable()
export class CrawlerScheduledService implements OnModuleInit {
  private readonly logger = new Logger(CrawlerScheduledService.name);

  public constructor(
    @Inject(InfoDoanhNghiepAdapterProvider.provide)
    private readonly infodoanhNghiepAdapter: InfoDoanhNghiepAdapter,
  ) {}

  public onModuleInit() {
    console.log('CrawlerScheduledService initialized');
    this.logger.debug('CrawlerScheduledService initialized');
  }

  @Cron('0 * 16 * * *')
  public async scheduleCrawlingAll() {
    this.logger.debug('Scheduled crawling for all at 16:00 every day');
    await this.infodoanhNghiepAdapter.crawlAll();
  }
}
