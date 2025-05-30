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
  CompanyStatus
} from 'src/_entities';
import { splitArrayByLength } from 'src/_helpers/array';
import { AreaService } from 'src/area/area.service';
import { Repository } from 'typeorm';
import { CrawlerHttpClient } from '../crawler.http-client';
import type { CompanyDetails } from '../dtos/company-details.dto';
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
      .map(function () {
        return $(this).children('a');
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

          province.totalCompanies = PER_PAGE * (province.numberOfPages - 1) + lastPageCompanies;
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
    const adapter = this;

    $('.company-item').each(function () {
      const company: Partial<CompanyDetails> = {};

      const anchor = $(this).children().toArray()[1].children[0];

      company.link = $(anchor).attr('href');

      company.name = $(anchor).text().trim();

      const description = $(this).children('.description').contents();

      company.issuedAt = moment(
        $(description[3]).text().trim(),
        'DD/MM/YYYY',
      ).toDate();

      const info = $(this).children('p:nth-of-type(2)').text().trim();
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
        company.address = $(this)
          .children('p:nth-of-type(3)')
          .text()
          .replace(/Địa\s*chỉ:\s*/im, '')
          .trim();

        const { province, district, ward } = adapter.areaService.handleAddress(company.address);

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

    const { province, district, ward } = this.areaService.handleAddress(company.address);

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
    $('.company-info-section .responsive-table-cell-head').each(function () {
      const label = $(this).text().trim();
      if (label.match(/Ngày cấp giấy phép:/)) {
        const date = $(this).next().text().trim();
        company.issuedAt = moment(date, 'DD/MM/YYYY').toDate();
      }
      if (label.match(/Tình trạng hoạt động:/)) {
        company.currentStatus = $(this).next().text().trim();
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
        const director = $(this).next().text().trim();
        if (!company.representative) {
          company.representative = director;
        }
        company.director = director;
      }
      if (label.match(/Điện thoại:/i)) {
        company.phoneNumber = $(this).next().text().trim();
      }
    });

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
}

export const InfoDoanhNghiepAdapterProvider = {
  provide: 'InfoDoanhNghiepAdapter',
  useClass: InfoDoanhNghiepAdapter,
};
