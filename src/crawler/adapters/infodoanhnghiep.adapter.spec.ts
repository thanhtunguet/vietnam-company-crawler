import { setupDatabase } from 'src/setup.test';
import { InfoDoanhNghiepAdapter } from './infodoanhnghiep.adapter';

describe('InfoDoanhNghiepAdapter', () => {
  beforeEach(async () => {
    const module = await setupDatabase([InfoDoanhNghiepAdapter]);

    module.get<InfoDoanhNghiepAdapter>(InfoDoanhNghiepAdapter);
  });

  it('should extract companies', async () => {
    ///
  });
});
