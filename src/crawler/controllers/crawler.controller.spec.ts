import { TestingModule } from '@nestjs/testing';
import { AreaModule } from 'src/area/area.module';
import { setupDatabase } from 'src/setup.test';
import { InfoDoanhNghiepAdapterProvider } from '../adapters/infodoanhnghiep.adapter';
import { CrawlerProxyService } from '../services/crawler.proxy.service';
import { CralwerUtilsService } from '../services/crawler.utils.service';
import { CrawlerController } from './crawler.controller';

describe('CrawlerController', () => {
  let controller: CrawlerController;

  beforeEach(async () => {
    const module: TestingModule = await setupDatabase({
      providers: [
        CrawlerProxyService,
        CralwerUtilsService,
        InfoDoanhNghiepAdapterProvider,
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
