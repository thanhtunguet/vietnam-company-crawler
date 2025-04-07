import { TestingModule } from '@nestjs/testing';
import { setupDatabase } from 'src/setup.test';
import { AreaService } from './area.service';

describe('AreaService', () => {
  let service: AreaService;

  beforeEach(async () => {
    const module: TestingModule = await setupDatabase({
      providers: [AreaService],
    });

    service = module.get<AreaService>(AreaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
