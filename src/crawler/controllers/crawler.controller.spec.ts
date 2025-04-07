import { TestingModule } from '@nestjs/testing';
import { AreaModule } from 'src/area/area.module';
import { setupDatabase } from 'src/setup.test';
import { CrawlerService } from '../services/crawler.service';
import { CrawlerController } from './crawler.controller';
import { InfoDoanhNghiepAdapter } from '../adapters/infodoanhnghiep.adapter';
import { CralwerUtilsService } from '../services/crawler.utils.service';
import { CrawlerProxyService } from '../services/crawler.proxy.service';

describe('CrawlerController', () => {
  let controller: CrawlerController;

  beforeEach(async () => {
    const module: TestingModule = await setupDatabase({
      providers: [
        CrawlerService,
        CrawlerProxyService,
        CralwerUtilsService,
        InfoDoanhNghiepAdapter,
      ],
      imports: [AreaModule],
      controllers: [CrawlerController],
    });

    controller = module.get<CrawlerController>(CrawlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
