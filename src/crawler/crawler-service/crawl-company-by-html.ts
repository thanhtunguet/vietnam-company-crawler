import { Business, Company } from 'src/_entities';
import * as cheerio from 'cheerio';
import * as moment from 'moment/moment';
import { splitArrayByLength } from 'src/_helpers/array';
import { CrawlerService } from 'src/crawler/crawler-service/index';

export async function crawlCompanyByHtml(
  this: CrawlerService,
  html: string,
): Promise<Company> {
  const $ = cheerio.load(html);

  const taxCode = $(
    'div.company-info-section .responsive-table-cell[itemprop="taxID"]',
  )
    .text()
    .trim();
  const id = CrawlerService.getCompanyIdFromTaxCode(taxCode);

  const existingCompany = await this.companyRepository.findOne({
    where: { id },
  });

  let company =
    existingCompany ?? this.companyRepository.create({ id, taxCode });

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
  company.description = $('.description[itemprop="description"]').text().trim();
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

  company = this.handleCompanyAddress(company);

  // Parse Businesses
  const businessElements = $('.responsive-table-2cols.nnkd-table')
    .children()
    .toArray()
    .slice(2);
  const businessArray = splitArrayByLength(businessElements, 2);

  const businessRepo = this.businessRepository;
  const existingBusinesses = await businessRepo.find();
  const existingBusinessMap = new Map(existingBusinesses.map((b) => [b.id, b]));

  const businessesToUpsert: Business[] = [];
  const relatedBusinesses: Business[] = [];

  for (const [codeEl, nameEl] of businessArray) {
    const code = $(codeEl).text().trim();
    const nameRaw = $(nameEl).text().trim();
    const id = Number(code.replace(/[A-Za-z]+/, ''));
    const name = nameRaw.replace(/\(Ngành chính\)/, '').trim();

    const business: Business = businessRepo.create({ id, code, name });

    relatedBusinesses.push(business);
    if (!existingBusinessMap.has(id)) {
      businessesToUpsert.push(business);
    }

    if (nameRaw.includes('(Ngành chính)')) {
      company.mainBusiness = name;
      company.mainBusinessId = id;
    }
  }

  // 💥 Transactional Save
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Upsert businesses
    if (businessesToUpsert.length > 0) {
      await queryRunner.manager
        .getRepository(Business)
        .upsert(businessesToUpsert, ['id']);
      console.log(`Upserted ${businessesToUpsert.length} new businesses`);
    }

    // Save or update company
    company = await queryRunner.manager.getRepository(Company).save(company);

    // Save company ↔ business mappings
    for (const business of relatedBusinesses) {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('company_business_mapping')
        .values({ company_id: company.id, business_id: business.id })
        .orIgnore()
        .execute();
    }

    await queryRunner.commitTransaction();
    console.log(`Successfully committed data for company: ${company.name}`);
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error during transactional save:', err);
    throw err;
  } finally {
    await queryRunner.release();
  }

  company.businesses = relatedBusinesses;
  return company;
}
