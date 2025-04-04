import { Company } from 'src/_entities';
import { CrawlerService } from 'src/crawler/crawler-service/index';

export async function handleCompanyAddress(
  this: CrawlerService,
  company: Company,
) {
  const address = company.address || '';

  if (!address) {
    console.warn(`Company ${company.id} has an empty address.`);
    return;
  }

  const { provinceId, districtId, wardId } =
    await this.openaiService.parseAddress(address);

  company.provinceId = provinceId;
  company.districtId = districtId;
  company.wardId = wardId;

  return company;
}
