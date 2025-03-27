// crawler.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import { sleep } from 'openai/core';
import { SOURCE_URL, WEB_URL } from 'src/_config/dotenv';
import {
  Business,
  Company,
  CrawlerJob,
  District,
  Province,
  Ward,
} from 'src/_entities';
import { splitArrayByLength } from 'src/_helpers/array';
import { vietnameseSlugify } from 'src/_helpers/slugify';
import { DataSource, In, Repository } from 'typeorm';
import { retryRequest } from './crawler.utils';

@Injectable()
export class CrawlerService implements OnModuleInit {
  private provinces: Province[] = [];

  private districts: District[] = [];

  private wards: Ward[] = [];

  private static getCompanySlug(link: string) {
    return link
      .replace(WEB_URL, '')
      .replace(SOURCE_URL, '')
      .replace('/thong-tin/', '')
      .replace('.html', '');
  }

  private static getCompanyIdFromTaxCode(taxCode: string) {
    return Number(taxCode.replace(/-/g, ''));
  }

  public constructor(
    private readonly dataSource: DataSource, // 👈 Injected here

    @InjectRepository(CrawlerJob)
    private readonly crawlerJobRepo: Repository<CrawlerJob>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,

    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,

    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,

    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async onModuleInit() {
    this.provinces = await this.provinceRepository.find();
    this.districts = await this.districtRepository.find();
    this.wards = await this.wardRepository.find();
    console.log('Crawler service initialized');
  }

  // Crawl all provinces
  public async crawlAll(
    job: CrawlerJob,
    progressCb: (job: CrawlerJob, progress: number) => Promise<void>,
  ) {
    const provinces = await this.getProvinces();

    const provinceCount = provinces.length;
    let completed = 0;

    for (const { name } of provinces) {
      try {
        await this.crawlProvince(job, name, progressCb);
        await sleep(Math.random() * 1500);
        completed++;
        const progress = parseFloat(
          ((completed / provinceCount) * 100).toFixed(2),
        );
        await progressCb(job, progress);
      } catch (error) {
        console.error(`Error crawling province ${name}`, error);
      }
    }
  }

  // Crawl specific province
  public async crawlProvince(
    job: CrawlerJob,
    province: string,
    progressCb: (job: CrawlerJob, progress: number) => Promise<void>,
  ) {
    const provinceUrl = `${SOURCE_URL}/${province}/`;
    const html = await retryRequest(() => axios.get(provinceUrl), 3);
    const $ = cheerio.load(html.data);

    const lastPage = this.getLastPageNumber($);
    for (let page = 1; page <= lastPage; page++) {
      try {
        await this.crawlPage(job, province, page, progressCb, lastPage);
        await sleep(Math.random() * 20 + 10);
      } catch (error) {
        console.error('Error crawling page', error);
      }
    }
  }

  // Crawl a single page in a province
  public async crawlPage(
    job: CrawlerJob,
    province: string,
    pageNumber: number,
    progressCb?: (job: CrawlerJob, progress: number) => Promise<void>,
    totalPages?: number,
  ) {
    const pageUrl = `${SOURCE_URL}/${province}/trang-${pageNumber}/`;
    const html = await retryRequest(() => axios.get(pageUrl), 3);
    const $ = cheerio.load(html.data);

    try {
      const companies = await this.extractCompanies($);
      for (const company of companies) {
        // Save company to DB (TODO: implement save logic)
        console.log(`[Crawl] Fetched: ${company.name} (${company.taxCode})`);
      }

      if (progressCb && totalPages) {
        const progress = parseFloat(
          ((pageNumber / totalPages) * 100).toFixed(2),
        );
        await progressCb(job, progress);
      }
    } catch (error) {}
  }

  private async crawlCompanyByHtml(html: string): Promise<Company> {
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

    company = this.handleCompanyAddress(company);

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

    const businessesToUpsert: Business[] = [];
    const relatedBusinesses: Business[] = [];

    for (const [codeEl, nameEl] of businessArray) {
      const code = $(codeEl).text().trim();
      const nameRaw = $(nameEl).text().trim();
      const id = Number(code);
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

  // Crawl a company's detail page
  public async crawlCompanyDetail(job: CrawlerJob, companyUrl: string) {
    const fullUrl = `${SOURCE_URL}/thong-tin/${companyUrl}.html`;
    const html = await retryRequest(() => axios.get(fullUrl), 3);

    await this.crawlCompanyByHtml(html.data);
  }

  // Crawl all companies' detail pages
  public async crawlCompanyDetailFull(
    job: CrawlerJob,
    progressCb: (job: CrawlerJob, progress: number) => Promise<void>,
  ) {
    // const provinces = await this.getProvinces();

    // const provinceCount = provinces.length;
    const companyCount = await this.companyRepository.count();
    let completed = 0;

    const CONCURRENT_NUMBER = 4;

    for (let i = 0; i < companyCount; i += CONCURRENT_NUMBER) {
      const companies = await this.companyRepository.find({
        skip: i,
        take: CONCURRENT_NUMBER,
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

  // Get list of provinces
  private async getProvinces(): Promise<{ name: string; url: string }[]> {
    const html = await retryRequest(() => axios.get(SOURCE_URL), 3);
    const $ = cheerio.load(html.data);

    const anchors = $('.list-link')
      .children()
      .map(function () {
        return $(this).children('a');
      })
      .toArray();

    const groups = anchors.map((anchor): { name: string; url: string } => {
      const link = anchor.attr('href');

      return {
        name: link.replace(SOURCE_URL, '').split('/').join(''),
        url: link,
      };
    });

    return groups;
  }

  // Extract company list from a page
  private async extractCompanies($: cheerio.CheerioAPI): Promise<Company[]> {
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

  // Get last page number from pagination
  private getLastPageNumber($: cheerio.CheerioAPI): number {
    const href = $('.last-page').children('a').attr('href');
    const pages = href.replace(/^(.*)\/trang-([0-9]+)\/?$/gm, '$2');
    return Number(pages);
  }

  // Crawl newest pages from all provinces
  public async crawlNewestPagesAllProvinces(
    job: CrawlerJob,
    numPages: number,
    progressCb: (job: CrawlerJob, progress: number) => Promise<void>,
  ) {
    const provinces = await this.getProvinces();
    console.log(provinces);

    const totalTasks = provinces.length * numPages;
    let completedTasks = 0;

    for (const { name } of provinces) {
      console.log(name);
      for (let page = 1; page <= numPages; page++) {
        await this.crawlPage(job, name, page);
        completedTasks++;
        const progress = parseFloat(
          ((completedTasks / totalTasks) * 100).toFixed(2),
        );
        await progressCb(job, progress);
      }
    }
  }

  private handleCompanyAddress(company: Company) {
    const address = company.address || '';

    if (!address) {
      console.warn(`Company ${company.id} has an empty address.`);
      return;
    }

    // Use the regex patterns
    const addressParts = address.split(',').map((part) => part.trim());

    const provincePart = addressParts[addressParts.length - 1] || '';
    const districtPart = addressParts[addressParts.length - 2] || '';
    const wardPart = addressParts[addressParts.length - 3] || '';

    // Regex patterns
    const provinceRegex = /(?:Tỉnh|Thành phố|TP)?\s*(.+)/i;
    const districtRegex = /(?:Quận|Huyện|Thị xã|Thành phố|TP)?\s*(.+)/i;
    const wardRegex = /(?:Phường|Xã|Thị trấn)?\s*(.+)/i;

    // Extract names
    const provinceMatch = provincePart.match(provinceRegex);
    const districtMatch = districtPart.match(districtRegex);
    const wardMatch = wardPart.match(wardRegex);

    const provinceName = provinceMatch ? provinceMatch[1].trim() : provincePart;
    const districtName = districtMatch ? districtMatch[1].trim() : districtPart;
    const wardName = wardMatch ? wardMatch[1].trim() : wardPart;

    console.log(`${wardName} - ${districtName} - ${provinceName}`);

    if (provinceName) {
      const province = this.provinces.find((p) =>
        vietnameseSlugify(provinceName.toLowerCase()).includes(
          p.slug.replace(/(tinh|thanh-pho)\-/, ''),
        ),
      );
      if (province) {
        company.provinceId = province.id;
      }
    }

    if (districtName) {
      const district = this.districts.find((d) =>
        vietnameseSlugify(districtName.toLowerCase()).includes(
          d.slug.replace(/(quan|huyen|thi\-xa)\-/, ''),
        ),
      );
      if (district) {
        company.districtId = district.id;
      }
    }

    if (wardName) {
      const ward = this.wards.find((w) =>
        vietnameseSlugify(wardName.toLowerCase()).includes(
          w.slug.replace(/(xa|phuong|thi\-tran)\-/, ''),
        ),
      );
      if (ward) {
        company.wardId = ward.id;
      }
    }

    return company;
  }
}
