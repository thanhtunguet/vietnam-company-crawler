import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business, Company } from 'src/_entities';

@Module({
  imports: [TypeOrmModule.forFeature([Business, Company])],
  providers: [BusinessService],
  controllers: [BusinessController],
})
export class BusinessModule {}
