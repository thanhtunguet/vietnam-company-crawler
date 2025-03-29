import * as cheerio from 'cheerio';
import { Company } from 'src/_entities';
import * as moment from 'moment/moment';
import { vietnameseSlugify } from 'src/_helpers/slugify';
import { In } from 'typeorm';
import { CrawlerService } from 'src/crawler/crawler-service/index';

export async function extractCompanies(
  this: CrawlerService,
  $: cheerio.CheerioAPI,
): Promise<Company[]> {
  const provinces = await this.provinceRepository.find();
  const provinceMap = Object.fromEntries(
    provinces.map((p) => [p.slug.toLowerCase(), p]),
  );

  let companies: Company[] = [];
  const companyRepository = this.companyRepository;

  $('.company-item').each(function () {
    const company = companyRepository.create();

    const anchor = $(this).children().toArray()[1].children[0];
    company.slug = CrawlerService.getCompanySlug($(anchor).attr('href'));
    company.name = $(anchor).text().trim();

    const description = $(this).children('.description').contents();

    company.issuedAt = moment(
      $(description[3]).text().trim(),
      'DD/MM/YYYY',
    ).toDate();

    const province = vietnameseSlugify(
      $(description[1]).text().trim().toLowerCase(),
    );
    if (provinceMap[province]) {
      company.provinceId = provinceMap[province].id;
    }
    const info = $(this).children('p:nth-of-type(2)').text().trim();
    const matchResult =
      /^Mã số thuế: ([0-9]+\-?[0-9]+?)( \- Đại diện pháp luật: (.*))?$/gim.exec(
        info,
      );

    if (matchResult) {
      company.taxCode = matchResult[1];
      company.representative = matchResult[3];
      company.id = CrawlerService.getCompanyIdFromTaxCode(company.taxCode);
      company.address = $(this)
        .children('p:nth-of-type(3)')
        .text()
        .replace(/Địa chỉ:\s+/i, '')
        .trim();
      companies = [...companies, company];
    } else {
      console.log('Failed to parse company info', info);
      return;
    }
  });

  const companyIds = companies.map((c) => c.id);

  const existingCompanies = await this.companyRepository.find({
    where: { id: In(companyIds) },
  });

  const existingCompanyMap = Object.fromEntries(
    existingCompanies.map((c) => [c.id, c]),
  );

  const newCompanies = companies.filter(
    (c) => !Object.prototype.hasOwnProperty.call(existingCompanyMap, c.id),
  );

  try {
    await this.companyRepository.save(newCompanies);
    console.log(`Saved ${newCompanies.length} companies`);
  } catch (error) {
    console.error(`Error saving companies: ${companyIds.join(', ')}`);
  }

  return companies;
}
