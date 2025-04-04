import { CrawlerJob } from 'src/_entities';
import { SOURCE_URL } from 'src/_config/dotenv';
import { retryRequest } from 'src/crawler/crawler.utils';
import * as cheerio from 'cheerio';
import { CrawlerService } from 'src/crawler/crawler-service/index';
import { firstValueFrom } from 'rxjs';
import { ProvinceInfo } from './get-provinces';

export async function crawlPage(
  this: CrawlerService,
  job: CrawlerJob,
  province: ProvinceInfo,
  pageNumber: number,
  progressCb?: (job: CrawlerJob, progress: number) => Promise<void>,
  totalPages?: number,
) {
  const pageUrl = `${SOURCE_URL}/${province}/trang-${pageNumber}/`;
  const html: string = await retryRequest(
    () => firstValueFrom(this.infoRepository.crawlPage(pageUrl)),
    3,
  );
  const $ = cheerio.load(html);

  try {
    const companies = await this.extractCompanies($);
    for (const company of companies) {
      // Save company to DB (TODO: implement save logic)
      console.log(`[Crawl] Fetched: ${company.name} (${company.taxCode})`);
    }

    if (progressCb && totalPages) {
      const progress = parseFloat(((pageNumber / totalPages) * 100).toFixed(2));
      await progressCb(job, progress);
    }
  } catch (error) {}
}
