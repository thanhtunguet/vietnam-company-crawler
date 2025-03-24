import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/_entities';

@Module({
  providers: [CompanyService],
  controllers: [CompanyController],
  exports: [CompanyService],
  imports: [TypeOrmModule.forFeature([Company])],
})
export class CompanyModule {}
