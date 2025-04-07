import { setupDatabase } from 'src/setup.test';
import { InfoDoanhNghiepAdapter } from './infodoanhnghiep.adapter';
import { AreaModule } from 'src/area/area.module';
import { CralwerUtilsService } from '../services/crawler.utils.service';
import { CrawlerProxyService } from '../services/crawler.proxy.service';
import { ConfigModule } from '@nestjs/config';

describe('InfoDoanhNghiepAdapter', () => {
  beforeEach(async () => {
    const module = await setupDatabase({
      providers: [
        CralwerUtilsService,
        InfoDoanhNghiepAdapter,
        CrawlerProxyService,
      ],
      imports: [ConfigModule, AreaModule],
    });

    module.get<InfoDoanhNghiepAdapter>(InfoDoanhNghiepAdapter);
  });

  it('should extract companies', async () => {
    ///
  });
});
