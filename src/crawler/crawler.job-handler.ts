// crawler.job-handler.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrawlerMqttService } from './crawler.mqtt.service';
import { CrawlerJob } from 'src/_entities';
import { CrawlerJobStatus } from './types/CrawlerJobStatus';
import { CrawlerService } from 'src/crawler/crawler-service';
import { CrawlerJobType } from 'src/crawler/types/CrawlerJobType';

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

  public onModuleInit() {
    // Subscribe to job start topic
    this.mqttService.subscribe('crawler/job/start', async (payload) => {
      await this.handleJobMessage(payload);
    });
  }

  public readonly handleJobMessage = async (payload: any) => {
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
        case CrawlerJobType.FULL:
          await this.crawlerService.crawlAll(
            job,
            this.updateProgress.bind(this),
          );
          break;

        case CrawlerJobType.PROVINCE:
          await this.crawlerService.crawlProvince(
            job,
            jobPayload.province,
            this.updateProgress.bind(this),
          );
          break;

        case CrawlerJobType.PAGE:
          await this.crawlerService.crawlPage(
            job,
            jobPayload.province,
            jobPayload.pageNumber,
            this.updateProgress.bind(this),
          );
          break;

        case CrawlerJobType.DETAIL:
          await this.crawlerService.crawlCompanyDetail(
            job,
            jobPayload.companyUrl,
          );
          break;

        case CrawlerJobType.DETAIL_FULL:
          await this.crawlerService.syncCompanyDetails(
            job,
            this.updateProgress.bind(this),
          );
          break;

        case CrawlerJobType.PARTIAL_ALL:
          await this.crawlerService.syncNewCompaniesForAllProvinces(
            job,
            jobPayload.pages,
            this.updateProgress.bind(this),
          );
          break;

        default:
          break;
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
  };

  public readonly updateProgress = async (
    job: CrawlerJob,
    progress: number,
  ) => {
    job.progress = progress;
    await this.crawlJobRepo.save(job);
    this.mqttService.publish(`crawler/job/progress/${job.id}`, { progress });
  };
}
