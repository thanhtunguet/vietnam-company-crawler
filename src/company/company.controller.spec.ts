import { TestingModule } from '@nestjs/testing';
import { AreaModule } from 'src/area/area.module';
import { setupDatabase } from 'src/setup.test';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

describe('CompanyController', () => {
  let controller: CompanyController;

  beforeEach(async () => {
    const module: TestingModule = await setupDatabase({
      providers: [CompanyService],
      controllers: [CompanyController],
      imports: [AreaModule],
    });

    controller = module.get<CompanyController>(CompanyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
