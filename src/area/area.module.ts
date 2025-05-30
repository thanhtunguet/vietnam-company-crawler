import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company, District, Province, Ward } from 'src/_entities';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';

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
