import { sleep } from 'openai/core';
import { SLEEP_GAP, SLEEP_MIN } from 'src/_config/dotenv';
import { CrawlerJob } from 'src/_entities';
import { CrawlerService } from 'src/crawler/crawler-service/index';
import { ProvinceInfo } from './get-provinces';

export async function crawlProvince(
  this: CrawlerService,
  job: CrawlerJob,
  province: ProvinceInfo,
  progressCb: (job: CrawlerJob, progress: number) => Promise<void>,
) {
  const lastPage = province.pages;

  for (let page = 1; page <= lastPage; page++) {
    try {
      await this.crawlPage(job, province, page, progressCb, lastPage);
      await sleep(Math.random() * SLEEP_GAP + SLEEP_MIN);
    } catch (error) {
      console.error('Error crawling page', error);
    }
  }
}
