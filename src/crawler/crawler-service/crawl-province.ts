import { CrawlerJob } from 'src/_entities';
import { SLEEP_GAP, SLEEP_MIN, SOURCE_URL } from 'src/_config/dotenv';
import { retryRequest } from 'src/crawler/crawler.utils';
import * as cheerio from 'cheerio';
import { sleep } from 'openai/core';
import { CrawlerService } from 'src/crawler/crawler-service/index';
import { firstValueFrom } from 'rxjs';

export async function crawlProvince(
  this: CrawlerService,
  job: CrawlerJob,
  province: string,
  progressCb: (job: CrawlerJob, progress: number) => Promise<void>,
) {
  const provinceUrl = `${SOURCE_URL}/${province}/`;
  const html = await retryRequest(
    () => firstValueFrom(this.infoRepository.crawlPage(provinceUrl)),
    3,
  );
  const $ = cheerio.load(html);

  const lastPage = getLastPageNumber($);
  for (let page = 1; page <= lastPage; page++) {
    try {
      await this.crawlPage(job, province, page, progressCb, lastPage);
      await sleep(Math.random() * SLEEP_GAP + SLEEP_MIN);
    } catch (error) {
      console.error('Error crawling page', error);
    }
  }
}

// Get last page number from pagination
function getLastPageNumber($: cheerio.CheerioAPI): number {
  const href = $('.last-page').children('a').attr('href');
  const pages = href.replace(/^(.*)\/trang-([0-9]+)\/?$/gm, '$2');
  return Number(pages);
}
