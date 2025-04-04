import { retryRequest } from 'src/crawler/crawler.utils';
import {
  CRAWLER_CONCURRENT_JOBS,
  SLEEP_GAP,
  SLEEP_MIN,
  SOURCE_URL,
} from 'src/_config/dotenv';
import * as cheerio from 'cheerio';
import { CrawlerService } from 'src/crawler/crawler-service/index';
import { firstValueFrom } from 'rxjs';
import { sleep } from 'openai/core';

export interface ProvinceInfo {
  name: string;
  url: string;
  pages: number;
}

export async function getProvinces(
  this: CrawlerService,
): Promise<ProvinceInfo[]> {
  const html: string = await retryRequest(
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

  const provinces = anchors.map((anchor): ProvinceInfo => {
    const link = anchor.attr('href');

    return {
      name: link.replace(SOURCE_URL, '').split('/').join(''),
      url: link,
      pages: 0,
    };
  });

  for (let i = 0; i < provinces.length; i += CRAWLER_CONCURRENT_JOBS) {
    const chunks = provinces.slice(i, i + CRAWLER_CONCURRENT_JOBS);
    await Promise.all(
      chunks.map(async (province) => {
        const html: string = await retryRequest(
          () => firstValueFrom(this.infoRepository.crawlPage(province.url)),
          3,
        );
        const $ = cheerio.load(html);
        province.pages = Number(
          $('.last-page a')
            .attr('href')
            .replace(/^(.*)trang\-([0-9]+)\/$/i, '$2'),
        );
      }),
    );
    await sleep(Math.random() * SLEEP_GAP + SLEEP_MIN);
  }

  return provinces;
}
