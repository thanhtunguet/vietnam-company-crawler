import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { load } from 'cheerio';
import * as moment from 'moment';
import {
  companyStatusActive,
  companyStatusInactive,
  infoDoanhNghiep,
} from 'src/_config/seeds';
import {
  Business,
  Company,
  CompanyBusinessMapping,
  CompanyStatus,
} from 'src/_entities';
import { splitArrayByLength } from 'src/_helpers/array';
import { AreaService } from 'src/area/area.service';
import { IsNull, Not, Repository } from 'typeorm';
import { CrawlerHttpClient } from '../crawler.http-client';
import { BusinessDetails, CompanyDetails } from '../dtos/company-details.dto';
import type { ProvinceData } from '../dtos/province-data.dto';
import { CralwerUtilsService } from '../services/crawler.utils.service';
import { AbstractCrawlerAdapter } from './abstract-crawler.adapter';

const PER_PAGE = 20;

@Injectable()
export class InfoDoanhNghiepAdapter
  extends AbstractCrawlerAdapter
  implements OnModuleInit
{
  private http: CrawlerHttpClient;

  private companyStatuses: Record<string, CompanyStatus> = {};

  constructor(
    private readonly configService: ConfigService,
    private readonly areaService: AreaService,
    private readonly crawlerUtilsService: CralwerUtilsService,
    @InjectRepository(Company)
    protected readonly childCompanyRepository: Repository<Company>,
    @InjectRepository(CompanyStatus)
    private readonly companyStatusRepository: Repository<CompanyStatus>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(CompanyBusinessMapping)
    private readonly companyBusinessMappingRepository: Repository<CompanyBusinessMapping>,
  ) {
    super(childCompanyRepository);
    this.concurrentPages = 4;
  }

  public async onModuleInit() {
    const proxies = this.configService.get<string[]>('CRAWLER_PROXIES');
    this.http = new CrawlerHttpClient(infoDoanhNghiep.link, proxies, 3);
    const statuses = await this.companyStatusRepository.find();
    this.companyStatuses = Object.fromEntries(
      statuses.map((status) => [status.code, status]),
    );
  }

  protected getCompanySlug(link: string): string {
    return link
      .replace(infoDoanhNghiep.link, '')
      .replace('/thong-tin/', '')
      .replace('.html', '');
  }

  public async getProvinceData(): Promise<ProvinceData[]> {
    const html = await this.http.get('/');
    const $ = load(html);

    const anchors = $('.list-link')
      .children()
      .map(function (_, element) {
        return $(element).children('a');
      })
      .toArray();

    const provinces = anchors.map((anchor): ProvinceData => {
      const link = anchor.attr('href');

      return {
        name: link.replace(infoDoanhNghiep.link, '').split('/').join(''),
        link,
        numberOfPages: 0,
        totalCompanies: 0,
      };
    });

    const CRAWLER_CONCURRENT_JOBS =
      this.concurrentPages *
      this.configService.get<string[]>('CRAWLER_PROXIES').length;

    for (let i = 0; i < provinces.length; i += CRAWLER_CONCURRENT_JOBS) {
      const chunks = provinces.slice(i, i + CRAWLER_CONCURRENT_JOBS);
      await Promise.all(
        chunks.map(async (province) => {
          const html: string = await this.http.get(province.link);
          const $ = load(html);

          province.numberOfPages = Number(
            $('.last-page a')
              .attr('href')
              .replace(/^(.*)trang\-([0-9]+)\/$/i, '$2'),
          );

          const lastPageHtml = await this.http.get(
            `${province.link}trang-${province.numberOfPages}/`,
          );
          const $lastPage = load(lastPageHtml);
          const lastPageCompanies = $lastPage('.m-page .company-name').length;

          province.totalCompanies =
            PER_PAGE * (province.numberOfPages - 1) + lastPageCompanies;
          return province;
        }),
      );
      await this.crawlerUtilsService.sleep();
    }

    return provinces;
  }

  public async extractCompaniesFromPage(
    province: ProvinceData,
    page: number,
  ): Promise<Partial<CompanyDetails>[]> {
    const pageUrl = new URL(
      `${province.link}trang-${page}/`,
      infoDoanhNghiep.link,
    ).href;
    const html = await this.http.get(pageUrl);
    const $ = load(html);
    const companies: Partial<CompanyDetails>[] = [];

    $('.company-item').each((_, element) => {
      const company: Partial<CompanyDetails> = {};

      const anchor = $(element).children().toArray()[1].children[0];

      company.link = $(anchor).attr('href');

      company.name = $(anchor).text().trim();

      const description = $(element).children('.description').contents();

      company.issuedAt = moment(
        $(description[3]).text().trim(),
        'DD/MM/YYYY',
      ).toDate();

      const info = $(element).children('p:nth-of-type(2)').text().trim();
      const matchResult =
        /^Mã\s*số\s*thuế:\s*([0-9]+\-?[0-9]+?)(\s*\-\s*Đại\s*diện\s*pháp\s*luật:\s*(.*))?$/im.exec(
          info,
        );

      if (matchResult) {
        const [, taxCode, , representative] = matchResult;
        company.taxCode = taxCode;
        company.representative = representative;
        company.id = InfoDoanhNghiepAdapter.getCompanyIdFromTaxCode(
          company.taxCode,
        );
        company.address = $(element)
          .children('p:nth-of-type(3)')
          .text()
          .replace(/Địa\s*chỉ:\s*/im, '')
          .trim();

        const { province, district, ward } = this.areaService.handleAddress(
          company.address,
        );

        Object.assign(company, {
          province,
          provinceId: province?.id,
          district,
          districtId: district?.id,
          ward,
          wardId: ward?.id,
        });

        companies.push(company);
      } else {
        console.log('Failed to parse company info', info);
        return;
      }
    });

    return companies;
  }

  public async extractCompanyDetails(
    companyDetails: CompanyDetails,
  ): Promise<Company> {
    const html = await this.http.get(companyDetails.link);
    const $ = load(html);

    const taxCode = $(
      'div.company-info-section .responsive-table-cell[itemprop="taxID"]',
    )
      .text()
      .trim();

    const id = InfoDoanhNghiepAdapter.getCompanyIdFromTaxCode(taxCode);

    let company: Company | null = await this.companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      company = this.companyRepository.create();
      company.id = id;
    }

    company.code = taxCode;

    // Basic Info
    company.name = $(
      '.company-info-section .responsive-table-cell[itemprop="name"]',
    )
      .text()
      .trim();
    company.slug = this.getCompanySlug($('link[rel="canonical"]').attr('href'));

    company.englishName = $(
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

    const { province, district, ward } = this.areaService.handleAddress(
      company.address,
    );

    Object.assign(company, {
      province,
      provinceId: province?.id,
      district,
      districtId: district?.id,
      ward,
      wardId: ward?.id,
    });

    const statuses = this.companyStatuses;

    // Issue Date & Status
    $('.company-info-section .responsive-table-cell-head').each(
      (_, element) => {
        const label = $(element).text().trim();
        if (label.match(/Ngày cấp giấy phép:/)) {
          const date = $(element).next().text().trim();
          company.issuedAt = moment(date, 'DD/MM/YYYY').toDate();
        }
        if (label.match(/Tình trạng hoạt động:/)) {
          company.currentStatus = $(element).next().text().trim();
          const matches = company.currentStatus.match(/đang hoạt động/im);
          if (matches) {
            company.status = statuses[companyStatusActive.code];
            company.statusId = companyStatusActive.id;
          } else {
            company.status = statuses[companyStatusInactive.code];
            company.statusId = companyStatusInactive.id;
            const companyTerminationMatches = company.currentStatus.match(
              /([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})$/im,
            );
            if (companyTerminationMatches) {
              const date = companyTerminationMatches[1];
              company.terminatedAt = moment(date, 'DD/MM/YYYY').toDate();
            }
          }
        }
        if (label.match(/Giám đốc:/)) {
          const director = $(element).next().text().trim();
          if (!company.representative) {
            company.representative = director;
          }
          company.director = director;
        }
        if (label.match(/Điện thoại:/i)) {
          company.phoneNumber = $(element).next().text().trim();
        }
      },
    );

    const businesses: Partial<Business>[] = [];
    const companyBusinessMappings: CompanyBusinessMapping[] = [];

    splitArrayByLength(
      $('.responsive-table-2cols.nnkd-table').children().toArray().slice(2),
      2,
    ).forEach(([codeEl, nameEl]) => {
      const code = $(codeEl).text().trim();
      const id = Number(code.replace(/[^0-9]/g, ''));
      const name = $(nameEl).text().trim();
      const isPrimary = !!name.match(/Ngành chính/im);
      if (code && name) {
        businesses.push({
          id,
          code,
          name: name.replace(/Ngành chính/im, '').trim(),
        });
        companyBusinessMappings.push({
          companyId: company.id,
          businessId: id,
          isMainBusiness: isPrimary,
        });
      }
    });

    return {
      ...company,
      businesses,
    } as Company;
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMessage = lastError.message.toLowerCase();
        const isTimeout =
          errorMessage.includes('timed out') ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('deadlock');

        if (!isTimeout || attempt === maxRetries) {
          throw lastError;
        }

        console.log(
          `Operation timed out, retrying (${attempt}/${maxRetries})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt)); // Exponential backoff
      }
    }

    throw lastError;
  }

  private async upsertBusinessesBatch(
    businesses: BusinessDetails[],
  ): Promise<void> {
    // Filter unique businesses by ID
    const uniqueBusinesses = Array.from(
      new Map(businesses.map((b) => [b.id, b])).values(),
    );

    // Use a transaction to ensure atomicity
    const queryRunner =
      this.businessRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First, get existing business IDs with pessimistic lock
      const existingBusinesses = await queryRunner.manager
        .createQueryBuilder(Business, 'business')
        .select('business.id')
        .where('business.id IN (:...ids)', {
          ids: uniqueBusinesses.map((b) => b.id),
        })
        .setLock('pessimistic_write')
        .getMany();

      const existingIds = new Set(existingBusinesses.map((b) => b.id));

      // Split into updates and inserts
      const toUpdate = uniqueBusinesses.filter((b) => existingIds.has(b.id));
      const toInsert = uniqueBusinesses.filter((b) => !existingIds.has(b.id));

      // Handle updates
      if (toUpdate.length > 0) {
        // Update each business individually to maintain lock
        for (const business of toUpdate) {
          await queryRunner.manager
            .createQueryBuilder()
            .update(Business)
            .set({
              name: business.name,
              code: business.code,
              updatedAt: new Date(),
            })
            .where('id = :id', { id: business.id })
            .execute();
        }
      }

      // Handle inserts with individual inserts to ensure proper order
      if (toInsert.length > 0) {
        for (const business of toInsert) {
          try {
            await queryRunner.manager
              .createQueryBuilder()
              .insert()
              .into(Business)
              .values({
                id: business.id,
                code: business.code,
                name: business.name,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .execute();
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            // If insert fails due to concurrent insert, try update
            if (errorMessage.includes('duplicate key')) {
              await queryRunner.manager
                .createQueryBuilder()
                .update(Business)
                .set({
                  code: business.code,
                  name: business.name,
                  updatedAt: new Date(),
                })
                .where('id = :id', { id: business.id })
                .execute();
            } else {
              throw error;
            }
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error in upsertBusinessesBatch:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async updateCompanyBusinessMappingsBatch(
    companies: { id: number; businesses: BusinessDetails[] }[],
  ): Promise<void> {
    const queryRunner =
      this.companyBusinessMappingRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete all existing mappings for these companies
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(CompanyBusinessMapping)
        .where('companyId IN (:...companyIds)', {
          companyIds: companies.map((c) => c.id),
        })
        .execute();

      // Insert new mappings in smaller chunks to avoid parameter limits
      const allMappings = companies.flatMap((company) =>
        company.businesses.map((business) => ({
          companyId: company.id,
          businessId: business.id,
          isMainBusiness: business.isMainBusiness || false,
        })),
      );

      // Process mappings in smaller chunks
      const chunkSize = 100;
      for (let i = 0; i < allMappings.length; i += chunkSize) {
        const chunk = allMappings.slice(i, i + chunkSize);

        // Insert each mapping individually to handle potential foreign key constraints
        for (const mapping of chunk) {
          try {
            await queryRunner.manager
              .createQueryBuilder()
              .insert()
              .into(CompanyBusinessMapping)
              .values(mapping)
              .execute();
          } catch (error) {
            console.error(
              `Error inserting mapping for company ${mapping.companyId} and business ${mapping.businessId}:`,
              error,
            );
            // Continue with other mappings even if one fails
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error in updateCompanyBusinessMappingsBatch:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public async updateExistingCompaniesDetails() {
    try {
      // First count total companies
      const totalCompanies = await this.companyRepository.count({
        where: {
          code: Not(IsNull()),
        },
      });

      console.log(`Found ${totalCompanies} companies to update details`);

      const batchSize = 10;
      const totalBatches = Math.ceil(totalCompanies / batchSize);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const skip = batchIndex * batchSize;

        // Get batch of companies
        const companies = await this.companyRepository.find({
          where: {
            code: Not(IsNull()),
          },
          select: ['id', 'code', 'slug'],
          skip,
          take: batchSize,
        });

        console.log(
          `Processing batch ${batchIndex + 1}/${totalBatches} (${
            companies.length
          } companies)`,
        );

        // Process companies in parallel to get their details
        const companiesWithDetails = await Promise.all(
          companies.map(async (company) => {
            try {
              const companyDetails: Partial<CompanyDetails> = {
                id: company.id,
                taxCode: company.code,
                link: `${infoDoanhNghiep.link}/thong-tin/${company.slug}.html`,
              };

              const updatedCompany = await this.extractCompanyDetails(
                companyDetails,
              );
              return {
                id: company.id,
                details: updatedCompany,
                businesses: updatedCompany.businesses || [],
              };
            } catch (error) {
              console.error(
                `Error extracting details for company ${company.code} (${company.id}):`,
                error,
              );
              return null;
            }
          }),
        );

        // Filter out failed companies
        const validCompanies = companiesWithDetails.filter(
          (c): c is NonNullable<typeof c> => c !== null,
        );

        if (validCompanies.length === 0) {
          console.log('No valid companies in this batch, skipping...');
          continue;
        }

        // Collect all unique businesses
        const allBusinesses = validCompanies.flatMap((c) => c.businesses);

        // Upsert all businesses in one go
        await this.upsertBusinessesBatch(allBusinesses);

        // Update company-business mappings in one go
        await this.updateCompanyBusinessMappingsBatch(
          validCompanies.map((c) => ({
            id: c.id,
            businesses: c.businesses,
          })),
        );

        // Update company details using query builder
        for (const company of validCompanies) {
          const { businesses, ...companyData } = company.details;
          await this.companyRepository
            .createQueryBuilder()
            .update(Company)
            .set(companyData)
            .where('id = :id', { id: company.id })
            .execute();
        }

        console.log(`Successfully processed batch ${batchIndex + 1}`);

        // Add delay between batches
        if (batchIndex < totalBatches - 1) {
          console.log('Waiting 1 second before next batch...');
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      console.log('Finished updating all company details');
      return true;
    } catch (error) {
      console.error('Error updating company details:', error);
      return false;
    }
  }
}

export const InfoDoanhNghiepAdapterProvider = {
  provide: 'InfoDoanhNghiepAdapter',
  useClass: InfoDoanhNghiepAdapter,
};
