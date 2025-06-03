import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueryFilterDto } from 'src/_filters/query-filter.dto';
import { vietnameseSlugify } from 'src/_helpers/slugify';
import { AreaService } from 'src/area/area.service';
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
    private readonly areaService: AreaService,
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
          const publicAddress = (
            await this.crawlerProxyService.get('https://icanhazip.com')
          )?.trim();
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
    const provinceDataList =
      await this.infoDoanhNghiepAdapter.getProvinceData();

    const provinces = await this.areaService.getProvincesWithCompanyCount(
      new QueryFilterDto(),
    );

    return provinceDataList.map((provinceData) => {
      const slugName = vietnameseSlugify(
        provinceData.name.replace(/Tỉnh|Thành phố|TP\./, ''),
      );

      console.log(slugName);

      const province = provinces.find((p) => slugName.includes(p.slug));

      return {
        ...provinceData,
        currentCount: province.companyCount,
        slug: slugName,
      };
    });
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

  @Get('/trigger-smallest-first')
  @ApiResponse({
    type: String,
    description:
      'Triggers crawling of provinces ordered by size (smallest first)',
  })
  public async triggerSmallestFirst() {
    try {
      this.infoDoanhNghiepAdapter.crawlSmallestFirst();
      return 'Started crawling provinces from smallest to largest';
    } catch (error) {
      console.error('Error triggering smallest-first crawl:', error);
      return 'Error triggering smallest-first crawl';
    }
  }

  @Get('/trigger-last-pages')
  @ApiQuery({
    name: 'pages',
    type: Number,
    required: true,
    description: 'Number of last pages to crawl per province',
  })
  @ApiResponse({
    type: String,
  })
  public async triggerLastPages(@Query('pages') pages: number) {
    try {
      if (!pages || isNaN(Number(pages)) || Number(pages) <= 0) {
        return 'Invalid pages parameter, must be a positive number';
      }

      this.infoDoanhNghiepAdapter.crawlLastNPages(Number(pages));
      return `Started crawling last ${pages} pages for each province`;
    } catch (error) {
      console.error('Error triggering last pages crawl:', error);
      return 'Error triggering last pages crawl';
    }
  }

  @Get('/trigger-page-range')
  @ApiQuery({
    name: 'fromPage',
    type: Number,
    required: true,
    description: 'Starting page number (inclusive)',
  })
  @ApiQuery({
    name: 'toPage',
    type: Number,
    required: true,
    description: 'Ending page number (inclusive)',
  })
  @ApiResponse({
    type: String,
  })
  public async triggerPageRange(
    @Query('fromPage') fromPage: number,
    @Query('toPage') toPage: number,
  ) {
    try {
      if (
        !fromPage ||
        isNaN(Number(fromPage)) ||
        Number(fromPage) <= 0 ||
        !toPage ||
        isNaN(Number(toPage)) ||
        Number(toPage) <= 0
      ) {
        return 'Invalid page parameters, must be positive numbers';
      }

      if (Number(fromPage) > Number(toPage)) {
        return 'fromPage must be less than or equal to toPage';
      }

      this.infoDoanhNghiepAdapter.crawlPageRange(
        Number(fromPage),
        Number(toPage),
      );
      return `Started crawling pages ${fromPage} to ${toPage} for each province`;
    } catch (error) {
      console.error('Error triggering page range crawl:', error);
      return 'Error triggering page range crawl';
    }
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

  @Get('/update-company-details')
  @ApiResponse({
    type: String,
    description: 'Triggers updating details for all existing companies',
  })
  public async updateCompanyDetails() {
    try {
      await this.infoDoanhNghiepAdapter.updateExistingCompaniesDetails();
      return 'Started updating company details for all existing companies';
    } catch (error) {
      console.error('Error triggering company details update:', error);
      return 'Error triggering company details update';
    }
  }
}
