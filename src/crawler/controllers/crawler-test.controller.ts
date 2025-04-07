import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ProvinceData } from '../abstract-crawler.adapter';
import { InfoDoanhNghiepAdapter } from '../adapters/infodoanhnghiep.adapter';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/_entities';
import { In, Repository } from 'typeorm';
import { sleep } from 'openai/core';
import { CrawlerProxyService } from '../services/crawler.proxy.service';

class CompanyCrawlingDto {
  @ApiProperty({ type: String })
  link: string;
}

@ApiTags('Crawler Test')
@Controller('/api/crawler')
export class CrawlerTestController {
  constructor(
    private readonly infoDoanhNghiepAdapter: InfoDoanhNghiepAdapter,
    private readonly proxiedHttpClient: CrawlerProxyService,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  @Get('/provinces')
  public async provinces(): Promise<ProvinceData[]> {
    try {
      return this.timeTaken(() =>
        this.infoDoanhNghiepAdapter.getProvinceData(),
      );
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  }

  @Get('/:provinceName/:page')
  public async page(
    @Param('provinceName') provinceName: string,
    @Param('page') page: number,
  ) {
    try {
      return this.timeTaken(() =>
        this.infoDoanhNghiepAdapter.extractCompaniesFromPage(
          {
            name: '',
            link: provinceName,
            numberOfPages: page,
            totalCompanies: 0,
          },
          page,
        ),
      );
    } catch (error) {
      console.error('Error fetching page:', error);
      return {};
    }
  }

  @Post('/company')
  @ApiBody({ type: CompanyCrawlingDto })
  public async crawlCompany(@Body('link') link: string) {
    return this.timeTaken(async () => {
      const company = await this.infoDoanhNghiepAdapter.extractCompanyDetails({
        link,
      });
      await this.companyRepository.save(company);
      return company;
    });
  }

  private async timeTaken<T = any>(job: () => Promise<T>) {
    const now = new Date();
    const result = await job();
    const end = new Date();
    console.log('Time taken:', end.getTime() - now.getTime(), 'ms');
    return result;
  }

  @Get('/trigger')
  public async trigger() {
    this.triggerCrawlingAll();
    return 'Crawling triggered';
  }

  private async triggerCrawlingAll() {
    try {
      const provinces = await this.infoDoanhNghiepAdapter.getProvinceData();
      const CONCURRENT_JOBS = 27;
      for (const province of provinces) {
        const provinceData = {
          name: province.name,
          link: province.link,
          numberOfPages: province.numberOfPages,
          totalCompanies: province.totalCompanies,
        };
        for (
          let page = 1;
          page <= provinceData.numberOfPages;
          page += CONCURRENT_JOBS
        ) {
          const pages = new Array(CONCURRENT_JOBS);
          for (let i = 0; i < CONCURRENT_JOBS; i++) {
            pages[i] = page + i;
          }
          await this.timeTaken(() =>
            Promise.all(
              pages.map(async (page) => {
                const companies =
                  await this.infoDoanhNghiepAdapter.extractCompaniesFromPage(
                    provinceData,
                    page,
                  );

                const companyIds = companies.map((company) => company.id);

                const existingCompanies = await this.companyRepository.find({
                  where: {
                    id: In(companyIds),
                  },
                });
                const existingCompanyIds = existingCompanies.map(
                  (company) => company.id,
                );

                const newCompanies = companies.filter(
                  (company) => !existingCompanyIds.includes(company.id),
                );

                await this.companyRepository.save(
                  newCompanies.map((details) => {
                    const company = this.companyRepository.create();

                    const {
                      id,
                      taxCode,
                      name,
                      address,
                      province,
                      district,
                      ward,
                      issuedAt,
                      representative,
                    } = details;

                    Object.assign(company, {
                      id,
                      code: taxCode,
                      name,
                      address,
                      province,
                      district,
                      ward,
                      issuedAt,
                      representative,
                      slug: details.link,
                    });

                    return company;
                  }),
                );
              }),
            ),
          );
          await sleep(Math.random());
        }
      }
    } catch (error) {
      console.error('Error triggering company crawling:', error);
      return 'Error';
    }
  }
}
