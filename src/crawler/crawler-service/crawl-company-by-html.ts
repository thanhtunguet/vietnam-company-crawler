import * as cheerio from 'cheerio';
import * as moment from 'moment/moment';
import { Repository } from 'typeorm';
import { Business } from 'src/_entities';
import { splitArrayByLength } from 'src/_helpers/array';
import { CrawlerService } from 'src/crawler/crawler-service/index';

export async function crawlCompanyByHtml(
  this: CrawlerService,
  html: string,
): Promise<void> {
  const $ = cheerio.load(html);

  const taxCode = $(
    'div.company-info-section .responsive-table-cell[itemprop="taxID"]',
  )
    .text()
    .trim();
  const id = CrawlerService.getCompanyIdFromTaxCode(taxCode);

  const company = await this.companyRepository.findOne({
    where: { id },
  });

  if (company) {
    // Basic Info
    company.name = $(
      '.company-info-section .responsive-table-cell[itemprop="name"]',
    )
      .text()
      .trim();
    company.slug = CrawlerService.getCompanySlug(
      $('link[rel="canonical"]').attr('href'),
    );
    company.alternateName = $(
      '.company-info-section .responsive-table-cell[itemprop="alternateName"]',
    )
      .text()
      .trim();
    company.description = $('.description[itemprop="description"]')
      .text()
      .trim();
    company.address = $(
      'div.company-info-section .responsive-table-cell[itemprop="address"]',
    )
      .text()
      .trim();
    company.representative = $(
      'div.company-info-section .responsive-table-cell[itemprop="founder"]',
    )
      .text()
      .trim();

    // Issue Date & Status
    $('.company-info-section .responsive-table-cell').each(function () {
      const label = $(this).text().trim();
      if (label.match(/Ngày cấp giấy phép:/)) {
        const date = $(this).next().text().trim();
        company.issuedAt = moment(date, 'DD/MM/YYYY').toDate();
      }
      if (label.match(/Tình trạng hoạt động:/)) {
        company.currentStatus = $(this).next().text().trim();
      }
    });

    this.handleCompanyAddress(company);

    // Parse Businesses
    const businessElements = $('.responsive-table-2cols.nnkd-table')
      .children()
      .toArray()
      .slice(2);
    const businessArray = splitArrayByLength(businessElements, 2);

    const businessRepo = this.businessRepository;
    const existingBusinesses = await businessRepo.find();
    const existingBusinessMap = new Map(
      existingBusinesses.map((b) => [b.id, b]),
    );

    const newBusinesses: Business[] = [];
    const businessesToUpsert: Business[] = [];

    for (const [codeEl, nameEl] of businessArray) {
      const code = $(codeEl).text().trim();
      const nameRaw = $(nameEl).text().trim();
      const id = Number(code.replace(/[A-Za-z]+/, ''));
      const name = nameRaw.replace(/\(Ngành chính\)/, '').trim();

      const business: Business = businessRepo.create({ id, code, name });

      if (!existingBusinessMap.has(id)) {
        newBusinesses.push(business);
      } else {
        businessesToUpsert.push(business);
      }

      if (nameRaw.includes('(Ngành chính)')) {
        company.mainBusiness = name;
        company.mainBusinessId = id;
      }
    }

    company.businesses = [];

    try {
      if (newBusinesses.length > 0) {
        saveBusiness(
          this.businessRepository,
          newBusinesses,
          existingBusinessMap,
        );
      }

      // Save or update compan with empty businessesy
      await this.companyRepository.save(company);
      // Save businesses to company
      company.businesses = [...newBusinesses, ...businessesToUpsert];
      await this.companyRepository.save(company);

      console.log(`Successfully committed data for company: ${company.name}`);
    } catch (err) {
      console.error('❌ Error during transactional save:', err);
      throw err;
    } finally {
    }
  }
}

async function saveBusiness(
  businessRepository: Repository<Business>,
  businesses: Business[],
  existingBusinessMap: Map<number, Business>,
) {
  for (const business of businesses) {
    try {
      await businessRepository.save(business);
      console.log(`Saved new business: ${business.name}`);
      existingBusinessMap.set(business.id, business);
    } catch (error) {
      // console.error(`❌ Business existed: ${business.name}`);
    }
  }
  console.log(`Saved ${businesses.length} new businesses`);
}
