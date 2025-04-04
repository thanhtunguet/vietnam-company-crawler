import { CrawlerJob } from 'src/_entities';
import { CrawlerService } from 'src/crawler/crawler-service/index';

export async function syncNewCompaniesForAllProvinces(
  this: CrawlerService,
  job: CrawlerJob,
  numPages: number,
  progressCb: (job: CrawlerJob, progress: number) => Promise<void>,
) {
  const provinces = await this.getProvinces();
  console.log(provinces);

  const totalTasks = provinces.length * numPages;
  let completedTasks = 0;

  for (const province of provinces) {
    for (let page = 1; page <= numPages; page++) {
      await this.crawlPage(job, province, page);
      completedTasks++;
      const progress = parseFloat(
        ((completedTasks / totalTasks) * 100).toFixed(2),
      );
      await progressCb(job, progress);
    }
  }
}
