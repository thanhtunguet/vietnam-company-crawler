import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CrawlerService } from '../services/crawler.service';
import { CrawlerProxyService } from '../services/crawler.proxy.service';
import { ProxyAddressDto } from '../dtos/proxy-address.dto';

@ApiTags('Crawler')
@Controller('/api/crawler')
export class CrawlerController {
  constructor(
    private readonly crawlerService: CrawlerService,
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
}
