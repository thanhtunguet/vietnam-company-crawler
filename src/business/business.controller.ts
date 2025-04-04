import { Controller, Get, Param, Query } from '@nestjs/common';
import { BusinessService } from './business.service';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BusinessDto, CompanyDto, QueryDto } from 'src/_dtos';

@ApiTags('Businesses')
@Controller('api/businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('/')
  @ApiResponse({
    type: BusinessDto,
    isArray: true,
  })
  @ApiQuery({
    type: QueryDto,
    required: false,
    description: 'Query parameters for pagination and filtering',
  })
  public async businesses(
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ): Promise<BusinessDto[]> {
    return this.businessService.list(skip, take);
  }

  @Get('/:businessId')
  @ApiResponse({
    type: BusinessDto,
    status: 200,
    description: 'Get business by ID',
  })
  public async getBusiness(
    @Param('businessId') businessId: number,
  ): Promise<BusinessDto | null> {
    return this.businessService.getBusiness(businessId);
  }

  @Get('/:businessId/companies')
  @ApiResponse({
    type: CompanyDto,
    isArray: true,
  })
  @ApiQuery({
    type: QueryDto,
    required: false,
    description: 'Query parameters for pagination',
  })
  public async companies(
    @Param('businessId') businessId: number,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ): Promise<CompanyDto[]> {
    return this.businessService.getCompaniesByBusiness(businessId, skip, take);
  }

  @Get('/:businessId/companies/count')
  @ApiResponse({
    type: CompanyDto,
    isArray: true,
  })
  public async countCompanies(
    @Param('businessId') businessId: number,
  ): Promise<number> {
    return this.businessService.countCompanyByBusiness(businessId);
  }
}
