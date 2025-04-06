import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { Company } from 'src/_entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Add any necessary imports here, such as TypeOrmModule for database entities
    TypeOrmModule.forFeature([Company]),
  ],
  providers: [CompanyService],
  controllers: [CompanyController],
})
export class CompanyModule {}
