import { TestingModule } from '@nestjs/testing';
import { setupDatabase } from 'src/setup.test';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';

describe('AreaController', () => {
  let controller: AreaController;

  beforeEach(async () => {
    const module: TestingModule = await setupDatabase({
      providers: [AreaService],
      controllers: [AreaController],
    });

    controller = module.get<AreaController>(AreaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
