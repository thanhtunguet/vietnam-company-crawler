import { Module } from '@nestjs/common';
import { ProvinceService } from './province.service';
import { ProvinceController } from './province.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Province } from 'src/_entities';

@Module({
  providers: [ProvinceService],
  controllers: [ProvinceController],
  imports: [TypeOrmModule.forFeature([Province])],
  exports: [ProvinceService],
})
export class ProvinceModule {}
