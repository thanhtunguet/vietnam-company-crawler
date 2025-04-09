import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InfoDoanhNghiepAdapter } from '../adapters/infodoanhnghiep.adapter';
import { ProvinceData } from '../dtos/province-data.dto';
import { ProxyAddressDto } from '../dtos/proxy-address.dto';
import { CrawlerProxyService } from '../services/crawler.proxy.service';

@ApiTags('Crawler')
@Controller('/api/crawler')
export class CrawlerController {
  constructor(
    @Inject('InfoDoanhNghiepAdapter')
    private readonly infoDoanhNghiepAdapter: InfoDoanhNghiepAdapter,
    private readonly crawlerProxyService: CrawlerProxyService,
  ) {}

  @Get('/public-ips')
  @ApiResponse({
    type: ProxyAddressDto,
  })
  public async publicIps(): Promise<ProxyAddressDto[]> {
    try {
      const publicAddresses: ProxyAddressDto[] = [];
      const proxies = this.crawlerProxyService.proxyList;
      await Promise.all(
        proxies.map(async (proxy) => {
          const publicAddress = await this.crawlerProxyService.get(
            'https://api.ipify.org',
          );
          publicAddresses.push({
            proxy,
            publicAddress,
          });
        }),
      );
      return publicAddresses;
    } catch (error) {
      console.error('Error fetching public IPs:', error);
      return [];
    }
  }

  @Get('/provinces')
  @ApiResponse({
    type: [ProvinceData],
  })
  public async getProvinces(): Promise<ProvinceData[]> {
    return this.infoDoanhNghiepAdapter.getProvinceData();
  }

  @Get('/trigger-all')
  @ApiResponse({
    type: String,
  })
  public async triggerAll() {
    try {
      this.infoDoanhNghiepAdapter.crawlAll();
    } catch (error) {
      console.error('Error triggering all crawlers:', error);
      return 'Error triggering all crawlers';
    }
    return 'All crawling tasks triggered';
  }

  @Get('/trigger-first-pages')
  @ApiQuery({
    name: 'pages',
    type: Number,
    required: true,
    description: 'Number of pages to crawl per province',
  })
  @ApiResponse({
    type: String,
  })
  public async triggerFirstPages(@Query('pages') pages: number) {
    try {
      if (!pages || isNaN(Number(pages)) || Number(pages) <= 0) {
        return 'Invalid pages parameter, must be a positive number';
      }

      this.infoDoanhNghiepAdapter.crawlFirstNPages(Number(pages));
      return `Started crawling first ${pages} pages for each province`;
    } catch (error) {
      console.error('Error triggering partial crawl:', error);
      return 'Error triggering partial crawl';
    }
  }

  @Get('/trigger-province/:provinceName')
  @ApiParam({
    name: 'provinceName',
    type: String,
    description: 'Name of the province to crawl',
  })
  @ApiResponse({
    type: String,
  })
  public async triggerProvince(@Param('provinceName') provinceName: string) {
    try {
      this.infoDoanhNghiepAdapter.crawlProvince(provinceName);
      return `Started crawling province: ${provinceName}`;
    } catch (error) {
      console.error(
        `Error triggering province crawl for ${provinceName}:`,
        error,
      );
      return `Error triggering province crawl for ${provinceName}`;
    }
  }

  @Get('/resume')
  @ApiResponse({
    type: String,
  })
  public async resumeCrawling() {
    try {
      this.infoDoanhNghiepAdapter.resumeCrawling();
      return 'Resumed crawling from last progress';
    } catch (error) {
      console.error('Error resuming crawl:', error);
      return 'Error resuming crawl';
    }
  }

  @Get('/progress')
  @ApiResponse({
    type: Object,
  })
  public getCrawlingProgress() {
    try {
      return this.infoDoanhNghiepAdapter.getCrawlingProgress();
    } catch (error) {
      console.error('Error getting crawl progress:', error);
      return { error: 'Error getting crawl progress' };
    }
  }
}
