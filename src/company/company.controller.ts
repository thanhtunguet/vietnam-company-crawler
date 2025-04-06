import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompanyDto } from 'src/_dtos';
import { QueryFilterDto } from 'src/_filters/query-filter.dto';
import { CompanyService } from './company.service';

@ApiTags('Companies')
@Controller('api/companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('/')
  @ApiResponse({
    type: [CompanyDto],
  })
  public async companies(
    @Query() queryFilter: QueryFilterDto,
  ): Promise<CompanyDto[]> {
    return this.companyService.companies(queryFilter);
  }
}
