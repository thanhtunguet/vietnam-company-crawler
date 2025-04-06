import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosInstance } from 'axios';
import { load } from 'cheerio';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as moment from 'moment';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { axiosBaseConfig } from 'src/_config/axios';
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
  District,
  Province,
  Ward,
} from 'src/_entities';
import { retryRequest } from 'src/_helpers/retry';
import { vietnameseSlugify } from 'src/_helpers/slugify';
import { AreaService } from 'src/area/area.service';
import { Repository } from 'typeorm';
import {
  AbstractCrawlerAdapter,
  CompanyDetails,
  ProvinceData,
} from '../abstract-crawler.adapter';
import { CralwerUtilsService } from '../crawler.utils.service';
import { splitArrayByLength } from 'src/_helpers/array';

const PER_PAGE = 20;

@Injectable()
export class InfoDoanhNghiepAdapter
  extends AbstractCrawlerAdapter
  implements OnModuleInit
{
  static getCompanyIdFromTaxCode(taxCode: string) {
    return Number(taxCode.replace(/-/g, ''));
  }

  static getCompanySlug(link: string) {
    return link
      .replace(infoDoanhNghiep.link, '')
      .replace('/thong-tin/', '')
      .replace('.html', '');
  }

  private http: InfoDoanhNghiepAxiosClient;

  private companyStatuses: Record<string, CompanyStatus> = {};

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(CompanyStatus)
    private readonly companyStatusRepository: Repository<CompanyStatus>,
    private readonly areaService: AreaService,
    private readonly configService: ConfigService,
    private readonly crawlerUtilsService: CralwerUtilsService,
  ) {
    super();
  }

  async onModuleInit() {
    const proxies =
      this.configService
        .get<string>('CRAWLER_PROXIES')
        ?.split(',')
        .map((proxy) => proxy.trim()) || [];
    console.log(proxies);
    this.http = new InfoDoanhNghiepAxiosClient(proxies, 3);
    const statuses = await this.companyStatusRepository.find();
    this.companyStatuses = Object.fromEntries(
      statuses.map((status) => [status.code, status]),
    );
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

    const CRAWLER_CONCURRENT_JOBS = 30;

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

          province.totalCompanies = province.numberOfPages * PER_PAGE;
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
      `/${province.link}/trang-${page}/`,
      infoDoanhNghiep.link,
    ).href;
    const html = await this.http.get(pageUrl);
    const $ = load(html);
    const companies: Partial<CompanyDetails>[] = [];

    const handleAddress = this.handleAddress;

    $('.company-item').each(function () {
      const company: Partial<CompanyDetails> = {};

      const anchor = $(this).children().toArray()[1].children[0];

      company.link = InfoDoanhNghiepAdapter.getCompanySlug(
        $(anchor).attr('href'),
      );

      company.name = $(anchor).text().trim();

      const description = $(this).children('.description').contents();

      company.issuedAt = moment(
        $(description[3]).text().trim(),
        'DD/MM/YYYY',
      ).toDate();

      const info = $(this).children('p:nth-of-type(2)').text().trim();
      const matchResult =
        /^Mã\s*số\s*thuế:\s*([0-9]+\-?[0-9]+?)\s*\-\s*Đại\s*diện\s*pháp\s*luật:\s*(.*)?$/im.exec(
          info,
        );

      if (matchResult) {
        const [, taxCode, representative] = matchResult;
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

        const { province, district, ward } = handleAddress(company.address);

        Object.assign(company, {
          province,
          district,
          ward,
        });

        companies.push(company);
      } else {
        console.log('Failed to parse company info', info);
        return;
      }
    });

    return companies;
  }

  private handleAddress(address: string): {
    province?: Province;
    district?: District;
    ward?: Ward;
  } {
    const [provinceName, districtName, wardName] = address
      .split(',')
      .map((item) => item.trim())
      .reverse();

    const baseProvinceName = vietnameseSlugify(
      AreaService.getBaseProvinceName(provinceName),
    );
    const baseDistrictName = vietnameseSlugify(
      AreaService.getBaseDistrictName(districtName),
    );
    const baseWardName = vietnameseSlugify(
      AreaService.getBaseWardName(wardName),
    );

    const { provinces, districts, wards } = this.areaService;

    let province: Province | undefined = undefined;
    let district: District | undefined = undefined;
    let ward: Ward | undefined = undefined;

    if (Object.prototype.hasOwnProperty.call(provinces, baseProvinceName)) {
      province = provinces[baseProvinceName];
    }

    if (Object.prototype.hasOwnProperty.call(districts, baseDistrictName)) {
      district = districts[baseDistrictName];
    }

    if (Object.prototype.hasOwnProperty.call(wards, baseWardName)) {
      ward = wards[baseWardName];
    }

    return {
      province,
      district,
      ward,
    };
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
    company.slug = InfoDoanhNghiepAdapter.getCompanySlug(
      $('link[rel="canonical"]').attr('href'),
    );

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

    const { province, district, ward } = this.handleAddress(company.address);

    Object.assign(company, {
      province,
      district,
      ward,
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

    // TODO: handle company address

    // Parse Businesses

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

class InfoDoanhNghiepAxiosClient {
  private proxyIndex = 0;

  constructor(
    private readonly proxyList: string[],
    private readonly maxRetries = 3,
  ) {}

  private createAxiosWithProxy(): AxiosInstance {
    let agent;

    const proxyUrl = this.rotateProxy();

    if (proxyUrl.startsWith('socks')) {
      agent = new SocksProxyAgent(proxyUrl);
    } else {
      agent = new HttpsProxyAgent(proxyUrl);
    }

    return axios.create({
      ...axiosBaseConfig,
      baseURL: infoDoanhNghiep.link,
      httpsAgent: agent,
      httpAgent: agent,
      timeout: 10000,
    });
  }

  private rotateProxy(): string {
    const proxy = this.proxyList[this.proxyIndex];
    this.proxyIndex = (this.proxyIndex + 1) % this.proxyList.length;
    return proxy;
  }

  public async get(url: string): Promise<string> {
    return retryRequest(
      () =>
        this.createAxiosWithProxy()
          .get(url)
          .then((response) => response.data),
      this.maxRetries,
    );
  }
}
