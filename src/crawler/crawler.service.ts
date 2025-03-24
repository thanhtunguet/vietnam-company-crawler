// crawler.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import { sleep } from 'openai/core';
import { SOURCE_URL, WEB_URL } from 'src/_config/dotenv';
import {
  Business,
  Company,
  CompanyBusinessMapping,
  CrawlerJob,
  Province,
} from 'src/_entities';
import { splitArrayByLength } from 'src/_helpers/array';
import { vietnameseSlugify } from 'src/_helpers/slugify';
import { In, Repository } from 'typeorm';
import { retryRequest } from './crawler.utils';

@Injectable()
export class CrawlerService {
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
    @InjectRepository(CrawlerJob)
    private readonly crawlerJobRepo: Repository<CrawlerJob>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,

    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,

    @InjectRepository(CompanyBusinessMapping)
    private readonly companyBusinessMappingRepository: Repository<CompanyBusinessMapping>,
  ) {}

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

    company.provinceName = provinceName;
    company.districtName = districtName;
    company.wardName = wardName;

    return company;
  }

  private async crawlCompanyByHtml(html: string) {
    const $ = cheerio.load(html);

    const taxCode = $(
      'div.company-info-section .responsive-table-cell[itemprop="taxID"]',
    )
      .text()
      .trim();
    const id = CrawlerService.getCompanyIdFromTaxCode(taxCode);

    let newCompany: Company | null = await this.companyRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!newCompany) {
      newCompany = this.companyRepository.create();
      newCompany.id = id;
      newCompany.taxCode = taxCode;
    }

    newCompany.name = $(
      '.company-info-section .responsive-table-cell[itemprop="name"]',
    )
      .text()
      .trim();

    newCompany.slug = CrawlerService.getCompanySlug(
      $('link[rel="canonical"]').attr('href'),
    );

    newCompany.alternateName = $(
      '.company-info-section .responsive-table-cell[itemprop="alternateName"]',
    )
      .text()
      .trim();

    newCompany.description = $('.description[itemprop="description"]')
      .text()
      .trim();

    newCompany.address = $(
      'div.company-info-section .responsive-table-cell[itemprop="address"]',
    )
      .text()
      .trim();

    newCompany = this.handleCompanyAddress(newCompany);

    newCompany.representative = $(
      'div.company-info-section .responsive-table-cell[itemprop="founder"]',
    )
      .text()
      .trim();

    $('.company-info-section .responsive-table-cell').each(function () {
      const text = $(this).text().trim();

      if (text.match(/Ngày cấp giấy phép:/)) {
        const date = $(this).next().text().trim();
        newCompany.issuedAt = moment(date, 'DD/MM/YYYY').toDate();
        return;
      }

      if (text.match(/Tình trạng hoạt động:/)) {
        newCompany.currentStatus = $(this).next().text().trim();
        return;
      }
    });

    const businessChilds = $(
      '.responsive-table.responsive-table-2cols.responsive-table-collapse.nnkd-table',
    ).children();

    const businessArray = splitArrayByLength(
      $(businessChilds).toArray().slice(2),
      2,
    );

    const existingBusinesses = await this.businessRepository.find();
    const existingBusinessMap = Object.fromEntries(
      existingBusinesses.map((b) => [b.id, b]),
    );

    let businesses: Business[] = [];

    businessArray.forEach(([code, name]) => {
      const business: Business = this.businessRepository.create();

      business.code = $(code).text().trim();
      business.id = Number(business.code);
      business.name = $(name).text().trim();

      if (business.name.match(/Ngành chính/)) {
        business.name = business.name.replace(/\(Ngành chính\)/, '').trim();
        newCompany.mainBusiness = business.name;
        newCompany.mainBusinessId = business.id;
      }

      businesses = [...businesses, business];
    });

    const newBusinesses = businesses.filter(
      (b) => !Object.prototype.hasOwnProperty.call(existingBusinessMap, b.id),
    );

    try {
      await this.businessRepository.save(newBusinesses);
      console.log(`Saved ${newBusinesses.length} businesses`);
    } catch (error) {
      console.log(error);
      console.error(
        `Error saving businesses with the following ids: ${newBusinesses
          .map((b) => b.id)
          .join(', ')}`,
      );
    }

    const companyBusinessMappings = businesses.map((business) => {
      const mapping = this.companyBusinessMappingRepository.create();
      mapping.companyId = newCompany.id;
      mapping.businessId = business.id;
      return mapping;
    });

    try {
      newCompany = await this.companyRepository.save(newCompany);
      console.log(`Saved company ${newCompany.name}`);
    } catch (error) {
      await this.companyRepository.update(newCompany.id, newCompany);
      console.error(`Error saving company`, error);
    }

    try {
      await this.companyBusinessMappingRepository.delete({
        companyId: newCompany.id,
      });
      await this.companyBusinessMappingRepository.save(companyBusinessMappings);
    } catch (error) {
      console.error(error);
      console.error(
        `Error saving company business mappings with the following ids: ${companyBusinessMappings
          .map((c) => c.businessId)
          .join(', ')}`,
      );
    }

    newCompany.companyBusinessMappings = companyBusinessMappings;

    return newCompany;
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
}
