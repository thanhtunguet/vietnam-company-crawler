// crawler.job-handler.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrawlerMqttService } from './crawler.mqtt.service';
import { CrawlerJob } from 'src/_entities';
import { CrawlerService } from './crawler.service';
import { CrawlerJobStatus } from './types/CrawlerJobStatus';

@Injectable()
export class CrawlerJobHandler implements OnModuleInit {
  constructor(
    @InjectRepository(CrawlerJob)
    private readonly crawlJobRepo: Repository<CrawlerJob>,
    @Inject(CrawlerService)
    private readonly crawlerService: CrawlerService,
    @Inject(CrawlerMqttService)
    private readonly mqttService: CrawlerMqttService,
  ) {}

  onModuleInit() {
    // Subscribe to job start topic
    this.mqttService.subscribe('crawler/job/start', (payload) => {
      this.handleJobMessage(payload);
    });
  }

  async handleJobMessage(payload: any) {
    const { type, jobId, payload: jobPayload } = payload;

    console.log(`[Job] Received job: ${type}, ID: ${jobId}`);

    const job = await this.crawlJobRepo.findOne({ where: { id: jobId } });
    if (!job) {
      console.error(`[Job] Job ID ${jobId} not found`);
      return;
    }

    try {
      // Mark as in progress
      job.status = 'in_progress';
      job.startedAt = new Date();
      await this.crawlJobRepo.save(job);

      // Dispatch based on job type
      switch (type) {
        case 'full':
          await this.crawlerService.crawlAll(
            job,
            this.updateProgress.bind(this),
          );
          break;

        case 'province':
          await this.crawlerService.crawlProvince(
            job,
            jobPayload.province,
            this.updateProgress.bind(this),
          );
          break;

        case 'page':
          await this.crawlerService.crawlPage(
            job,
            jobPayload.province,
            jobPayload.pageNumber,
            this.updateProgress.bind(this),
          );
          break;

        case 'detail':
          await this.crawlerService.crawlCompanyDetail(
            job,
            jobPayload.companyUrl,
          );
          break;

        case 'detail_full':
          await this.crawlerService.crawlCompanyDetailFull(
            job,
            this.updateProgress.bind(this),
          );
          break;

        case 'partial_all':
          await this.crawlerService.crawlNewestPagesAllProvinces(
            job,
            jobPayload.pages,
            this.updateProgress.bind(this),
          );
          break;

        default:
          throw new Error(`Unknown job type: ${type}`);
      }

      // Mark job done
      job.status = 'done';
      job.finishedAt = new Date();
      job.progress = 100.0;
      await this.crawlJobRepo.save(job);
      this.mqttService.publish(`crawler/job/finished/${job.id}`, {
        status: CrawlerJobStatus.DONE,
      });
    } catch (error) {
      const message = (error as Error).message;
      console.error(`[Job] Job ${jobId} failed:`, message);
      job.status = 'failed';
      job.finishedAt = new Date();
      job.log = message;
      await this.crawlJobRepo.save(job);
      this.mqttService.publish(`crawler/job/finished/${job.id}`, {
        status: CrawlerJobStatus.FAILED,
        error: message,
      });
    }
  }

  public async updateProgress(job: CrawlerJob, progress: number) {
    job.progress = progress;
    await this.crawlJobRepo.save(job);
    this.mqttService.publish(`crawler/job/progress/${job.id}`, { progress });
  }
}
