import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ProvinceData } from './abstract-crawler.adapter';
import { InfoDoanhNghiepAdapter } from './adapters/infodoanhnghiep.adapter';
import { ProxyHttpClient } from './crawler.proxy.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/_entities';
import { Repository } from 'typeorm';

class CompanyCrawlingDto {
  @ApiProperty({ type: String })
  link: string;
}

@ApiTags('Crawler Test')
@Controller('/api/crawler')
export class CrawlerTestController {
  constructor(
    private readonly infoDoanhNghiepAdapter: InfoDoanhNghiepAdapter,
    private readonly proxiedHttpClient: ProxyHttpClient,
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

  @Get('/public-ips')
  public async publicIps(): Promise<any[]> {
    try {
      return this.timeTaken(async () => {
        const publicIPs = [];
        const proxies = this.proxiedHttpClient.proxyList;
        for (const proxy of proxies) {
          console.log('Using proxy:', proxy);
          const publicIP = await this.proxiedHttpClient.get(
            'https://api.ipify.org',
          );
          publicIPs.push(publicIP);
        }
        return publicIPs;
      });
    } catch (error) {
      console.error('Error fetching public IPs:', error);
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
}
