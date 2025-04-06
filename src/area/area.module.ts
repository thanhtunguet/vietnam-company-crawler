import { Module } from '@nestjs/common';
import { AreaService } from './area.service';
import { AreaController } from './area.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company, District, Province, Ward } from 'src/_entities';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Province, District, Ward, Company]),
  ],
  providers: [AreaService],
  controllers: [AreaController],
  exports: [AreaService, TypeOrmModule.forFeature([Province, District, Ward])],
})
export class AreaModule {}
