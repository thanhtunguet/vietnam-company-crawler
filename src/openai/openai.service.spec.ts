import { TestingModule } from '@nestjs/testing';
import { setupDatabase } from 'src/setup.test';
import { OpenaiService } from './openai.service';
import { AreaModule } from 'src/area/area.module';

describe('OpenaiService', () => {
  let service: OpenaiService;

  beforeEach(async () => {
    const module: TestingModule = await setupDatabase({
      providers: [OpenaiService],
      imports: [AreaModule],
    });

    service = module.get<OpenaiService>(OpenaiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
