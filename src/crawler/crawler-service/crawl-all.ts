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

  const MAX_CONCURRENT_REQUESTS = 4;

  for (let i = 0; i < provinceCount; i += MAX_CONCURRENT_REQUESTS) {
    const chunks = provinces.slice(i, i + MAX_CONCURRENT_REQUESTS);
    await Promise.all(
      chunks.map(async ({ name }) => {
        try {
          await this.crawlProvince(job, name, progressCb);
          completed++;
          const progress = parseFloat(
            ((completed / provinceCount) * 100).toFixed(2),
          );
          await progressCb(job, progress);
        } catch (error) {
          console.error(`Error crawling province ${name}`, error);
        }
      }),
    );
    await sleep(Math.random() * SLEEP_GAP + SLEEP_MIN);
  }
}
