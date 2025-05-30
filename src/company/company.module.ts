import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/_entities';
import { AreaModule } from 'src/area/area.module';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  imports: [
    // Add any necessary imports here, such as TypeOrmModule for database entities
    TypeOrmModule.forFeature([Company]),
    AreaModule,
  ],
  providers: [CompanyService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
