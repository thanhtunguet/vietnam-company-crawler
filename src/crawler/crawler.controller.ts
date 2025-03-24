// crawler.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { CrawlerJob } from 'src/_entities';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CrawlerMqttService } from './crawler.mqtt.service';
import { PartialJobDto } from './dtos/partial-job.dto';
import { CrawlerJobStatus } from './types/CrawlerJobStatus';
import { CrawlerJobType } from './types/CrawlerJobType';
import { CrawlerTopic } from './types/CrawlerTopic';

@ApiTags('Crawler')
@Controller('/api/crawler')
export class CrawlerController {
  public constructor(
    @InjectRepository(CrawlerJob)
    private readonly crawlerJobRepository: Repository<CrawlerJob>,
    private readonly mqttService: CrawlerMqttService,
  ) {}

  // Trigger Full Crawl
  @Post('full')
  public async triggerFullCrawl() {
    const job = this.crawlerJobRepository.create({
      id: uuidv4(),
      type: CrawlerJobType.FULL,
      status: CrawlerJobStatus.PENDING,
      progress: 0,
      startedAt: null,
      finishedAt: null,
    });
    await this.crawlerJobRepository.save(job);

    this.mqttService.publish(CrawlerTopic.JOB_START, {
      type: CrawlerJobType.FULL,
      jobId: job.id,
      payload: {},
    });

    return { message: 'Full crawl job triggered', jobId: job.id };
  }

  // Trigger Province Crawl
  @Post('province/:province')
  public async triggerProvinceCrawl(@Param('province') province: string) {
    const job = this.crawlerJobRepository.create({
      id: uuidv4(),
      type: CrawlerJobType.PROVINCE,
      status: CrawlerJobStatus.PENDING,
      progress: 0,
      province,
      startedAt: null,
      finishedAt: null,
    });
    await this.crawlerJobRepository.save(job);

    this.mqttService.publish(CrawlerTopic.JOB_START, {
      type: CrawlerJobType.PROVINCE,
      jobId: job.id,
      payload: { province },
    });

    return {
      message: `Province crawl job triggered for ${province}`,
      jobId: job.id,
    };
  }

  // Trigger Page Crawl
  @Post('page')
  public async triggerPageCrawl(
    @Body() body: { province: string; pageNumber: number },
  ) {
    const { province, pageNumber } = body;

    const job = this.crawlerJobRepository.create({
      id: uuidv4(),
      type: CrawlerJobType.PAGE,
      status: CrawlerJobStatus.PENDING,
      progress: 0,
      province,
      pageNumber,
      startedAt: null,
      finishedAt: null,
    });
    await this.crawlerJobRepository.save(job);

    this.mqttService.publish(CrawlerTopic.JOB_START, {
      type: CrawlerJobType.PAGE,
      jobId: job.id,
      payload: { province, pageNumber },
    });

    return {
      message: `Page crawl triggered: ${province}, page ${pageNumber}`,
      jobId: job.id,
    };
  }

  // Trigger Detail Crawl Full
  @Post('detail-all')
  public async triggerDetailCrawlFull() {
    const job = this.crawlerJobRepository.create({
      id: uuidv4(),
      type: CrawlerJobType.DETAIL_FULL,
      status: CrawlerJobStatus.PENDING,
      progress: 0,
      startedAt: null,
      finishedAt: null,
    });
    await this.crawlerJobRepository.save(job);

    this.mqttService.publish(CrawlerTopic.JOB_START, {
      type: CrawlerJobType.DETAIL_FULL,
      jobId: job.id,
    });

    return {
      message: `Detail crawl triggered for all companies`,
      jobId: job.id,
    };
  }

  // Trigger Detail Crawl
  @Get('detail/:companyUrl')
  public async triggerDetailCrawl(@Param('companyUrl') companyUrl: string) {
    const job = this.crawlerJobRepository.create({
      id: uuidv4(),
      type: CrawlerJobType.DETAIL,
      status: CrawlerJobStatus.PENDING,
      progress: 0,
      companyUrl,
      startedAt: null,
      finishedAt: null,
    });
    await this.crawlerJobRepository.save(job);

    this.mqttService.publish(CrawlerTopic.JOB_START, {
      type: CrawlerJobType.DETAIL,
      jobId: job.id,
      payload: { companyUrl },
    });

    return {
      message: `Detail crawl triggered for ${companyUrl}`,
      jobId: job.id,
    };
  }

  // Get Job Status
  @Get('status/:jobId')
  public async getJobStatus(@Param('jobId') jobId: string) {
    const job = await this.crawlerJobRepository.findOne({
      where: { id: Number(jobId) },
    });
    if (!job) {
      return { message: 'Job not found', jobId };
    }
    return {
      jobId: job.id,
      type: job.type,
      status: job.status,
      progress: job.progress,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt,
      log: job.log,
    };
  }

  @Post('partial-all')
  @ApiBody({
    type: PartialJobDto,
  })
  public async triggerPartialCrawl(@Body('pages') pages: number) {
    const job = this.crawlerJobRepository.create({
      id: uuidv4(),
      type: CrawlerJobType.PARTIAL_ALL,
      status: CrawlerJobStatus.PENDING,
      progress: 0,
      startedAt: null,
      finishedAt: null,
    });
    await this.crawlerJobRepository.save(job);

    this.mqttService.publish(CrawlerTopic.JOB_START, {
      type: 'partial_all',
      jobId: job.id,
      payload: { pages },
    });

    return {
      message: `Partial crawl (newest ${pages} pages per province) triggered`,
      jobId: job.id,
    };
  }
}
