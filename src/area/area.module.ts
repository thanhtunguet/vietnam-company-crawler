import { Module } from '@nestjs/common';
import { AreaService } from './area.service';
import { AreaController } from './area.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { District, Province, Ward } from 'src/_entities';

@Module({
  providers: [AreaService],
  controllers: [AreaController],
  imports: [TypeOrmModule.forFeature([Province, District, Ward])],
  exports: [AreaService],
})
export class AreaModule {}
