import { TestingModule } from '@nestjs/testing';
import { AreaModule } from 'src/area/area.module';
import { setupDatabase } from 'src/setup.test';
import { CompanyService } from './company.service';

describe('CompanyService', () => {
  let service: CompanyService;

  beforeEach(async () => {
    const module: TestingModule = await setupDatabase({
      providers: [CompanyService],
      imports: [AreaModule],
    });

    service = module.get<CompanyService>(CompanyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
