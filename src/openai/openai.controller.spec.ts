import { TestingModule } from '@nestjs/testing';
import { AreaModule } from 'src/area/area.module';
import { OpenaiController } from './openai.controller';
import { OpenaiService } from './openai.service';
import { setupDatabase } from 'src/setup.test';

describe('OpenaiController', () => {
  let controller: OpenaiController;

  beforeEach(async () => {
    const module: TestingModule = await setupDatabase({
      providers: [OpenaiService],
      controllers: [OpenaiController],
      imports: [AreaModule],
    });

    controller = module.get<OpenaiController>(OpenaiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
