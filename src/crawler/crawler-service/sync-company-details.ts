import { CrawlerJob } from 'src/_entities';
import { sleep } from 'openai/core';
import { CrawlerService } from 'src/crawler/crawler-service/index';

export async function syncCompanyDetails(
  this: CrawlerService,
  job: CrawlerJob,
  progressCb: (job: CrawlerJob, progress: number) => Promise<void>,
) {
  // const provinces = await this.getProvinces();

  // const provinceCount = provinces.length;
  const companyCount = await this.companyRepository.count({
    where: {
      provinceId: null,
    },
  });
  let completed = 0;

  const CONCURRENT_NUMBER = 4;

  for (let i = 0; i < companyCount; i += CONCURRENT_NUMBER) {
    const companies = await this.companyRepository.find({
      skip: i,
      take: CONCURRENT_NUMBER,
      where: {
        provinceId: null,
      },
    });
    for (const company of companies) {
      try {
        await this.crawlCompanyDetail(job, company.slug);
        await sleep(Math.random() * 500);
        completed++;
        const progress = parseFloat(
          ((completed / companyCount) * 100).toFixed(2),
        );
        await progressCb(job, progress);
      } catch (error) {
        console.error(`Error crawling company ${company.slug}`, error);
      }
    }
  }
}
