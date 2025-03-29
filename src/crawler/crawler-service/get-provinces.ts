import { retryRequest } from 'src/crawler/crawler.utils';
import { SOURCE_URL } from 'src/_config/dotenv';
import * as cheerio from 'cheerio';
import { CrawlerService } from 'src/crawler/crawler-service/index';
import { firstValueFrom } from 'rxjs';

export async function getProvinces(
  this: CrawlerService,
): Promise<{ name: string; url: string }[]> {
  const html = await retryRequest(
    () => firstValueFrom(this.infoRepository.crawlPage('/')),
    3,
  );
  const $ = cheerio.load(html);

  const anchors = $('.list-link')
    .children()
    .map(function () {
      return $(this).children('a');
    })
    .toArray();

  return anchors.map((anchor): { name: string; url: string } => {
    const link = anchor.attr('href');

    return {
      name: link.replace(SOURCE_URL, '').split('/').join(''),
      url: link,
    };
  });
}
