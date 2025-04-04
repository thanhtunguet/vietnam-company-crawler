// index.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SOURCE_URL, WEB_URL } from 'src/_config/dotenv';
import {
  Business,
  Company,
  CrawlerJob,
  District,
  Province,
  Ward,
} from 'src/_entities';
import { DataSource, Repository } from 'typeorm';
import { crawlCompanyByHtml } from 'src/crawler/crawler-service/crawl-company-by-html';
import { handleCompanyAddress } from 'src/crawler/crawler-service/handle-company-address';
import { extractCompanies } from 'src/crawler/crawler-service/extract-companies';
import { syncCompanyDetails } from 'src/crawler/crawler-service/sync-company-details';
import { syncNewCompaniesForAllProvinces } from 'src/crawler/crawler-service/sync-new-companies-for-all-provinces';
import { crawlAll } from 'src/crawler/crawler-service/crawl-all';
import { crawlProvince } from 'src/crawler/crawler-service/crawl-province';
import { crawlPage } from 'src/crawler/crawler-service/crawl-page';
import { crawlCompanyDetails } from 'src/crawler/crawler-service/crawl-company-details';
import { getProvinces } from 'src/crawler/crawler-service/get-provinces';
import { InfoRepository } from 'src/_repositories/info-repository';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class CrawlerService implements OnModuleInit {
  static getCompanyIdFromTaxCode(taxCode: string) {
    return Number(taxCode.replace(/-/g, ''));
  }

  static getCompanySlug(link: string) {
    return link
      .replace(WEB_URL, '')
      .replace(SOURCE_URL, '')
      .replace('/thong-tin/', '')
      .replace('.html', '');
  }

  provinces: Province[] = [];

  districts: District[] = [];

  wards: Ward[] = [];

  public constructor(
    public readonly dataSource: DataSource, // 👈 Injected here
    @InjectRepository(CrawlerJob)
    private readonly crawlerJobRepo: Repository<CrawlerJob>,
    @InjectRepository(Company)
    public readonly companyRepository: Repository<Company>,
    @InjectRepository(Province)
    public readonly provinceRepository: Repository<Province>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
    @InjectRepository(Business)
    public readonly businessRepository: Repository<Business>,
    public readonly infoRepository: InfoRepository,
    public readonly openaiService: OpenaiService,
  ) {}

  public async onModuleInit() {
    this.provinces = await this.provinceRepository.find();
    this.districts = await this.districtRepository.find();
    this.wards = await this.wardRepository.find();
    console.log('Crawler service initialized');
  }

  // Crawl all provinces
  public readonly crawlAll = crawlAll;

  // Crawl specific province
  public readonly crawlProvince = crawlProvince;

  // Crawl a single page in a province
  public readonly crawlPage = crawlPage;

  public readonly crawlCompanyByHtml = crawlCompanyByHtml;

  // Crawl a company's detail page
  public readonly crawlCompanyDetail = crawlCompanyDetails;

  // Crawl all companies' detail pages
  public readonly syncCompanyDetails = syncCompanyDetails;

  // Get list of provinces
  public readonly getProvinces = getProvinces;

  // Extract company list from a page
  public readonly extractCompanies = extractCompanies;

  public readonly syncNewCompaniesForAllProvinces =
    syncNewCompaniesForAllProvinces;

  public readonly handleCompanyAddress = handleCompanyAddress;
}
