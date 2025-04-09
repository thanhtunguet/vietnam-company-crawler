import { Controller, Get, Inject } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProvinceData } from '../abstract-crawler.adapter';
import { InfoDoanhNghiepAdapter } from '../adapters/infodoanhnghiep.adapter';
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
}
