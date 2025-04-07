import { TestingModule } from '@nestjs/testing';
import { AreaModule } from 'src/area/area.module';
import { setupDatabase } from 'src/setup.test';
import { CrawlerService } from './crawler.service';
import { InfoDoanhNghiepAdapter } from '../adapters/infodoanhnghiep.adapter';
import { CrawlerProxyService } from './crawler.proxy.service';
import { CralwerUtilsService } from './crawler.utils.service';

describe('CrawlerService', () => {
  let service: CrawlerService;

  beforeEach(async () => {
    const module: TestingModule = await setupDatabase({
      providers: [
        CrawlerProxyService,
        CralwerUtilsService,
        InfoDoanhNghiepAdapter,
        CrawlerService,
      ],
      imports: [AreaModule],
    });

    service = module.get<CrawlerService>(CrawlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
