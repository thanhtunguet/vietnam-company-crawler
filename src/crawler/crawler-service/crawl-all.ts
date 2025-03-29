import { CrawlerJob } from 'src/_entities';
import { sleep } from 'openai/core';
import { CrawlerService } from 'src/crawler/crawler-service/index';
import { SLEEP_GAP, SLEEP_MIN } from 'src/_config/dotenv';

export async function crawlAll(
  this: CrawlerService,
  job: CrawlerJob,
  progressCb: (job: CrawlerJob, progress: number) => Promise<void>,
) {
  const provinces = await this.getProvinces();

  const provinceCount = provinces.length;
  let completed = 0;

  for (const { name } of provinces) {
    try {
      await this.crawlProvince(job, name, progressCb);
      await sleep(Math.random() * SLEEP_GAP + SLEEP_MIN);
      completed++;
      const progress = parseFloat(
        ((completed / provinceCount) * 100).toFixed(2),
      );
      await progressCb(job, progress);
    } catch (error) {
      console.error(`Error crawling province ${name}`, error);
    }
  }
}
