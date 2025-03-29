import { CrawlerJob } from 'src/_entities';
import { SOURCE_URL } from 'src/_config/dotenv';
import { retryRequest } from 'src/crawler/crawler.utils';
import { CrawlerService } from 'src/crawler/crawler-service/index';
import { firstValueFrom } from 'rxjs';

export async function crawlCompanyDetails(
  this: CrawlerService,
  job: CrawlerJob,
  companyUrl: string,
) {
  const fullUrl = `${SOURCE_URL}/thong-tin/${companyUrl}.html`;
  const html = await retryRequest(
    () => firstValueFrom(this.infoRepository.crawlPage(fullUrl)),
    3,
  );

  await this.crawlCompanyByHtml(html);
}
