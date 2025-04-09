import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompanyDto } from 'src/_dtos';
import { CompanyFilterDto } from 'src/_filters/company-filter.dto';
import { CompanyService } from './company.service';

@ApiTags('Companies')
@Controller('api/companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiResponse({
    type: [CompanyDto],
    description: 'Get all companies with filters',
  })
  public async findAll(
    @Query() filter: CompanyFilterDto,
  ): Promise<CompanyDto[]> {
    return this.companyService.findAll(filter);
  }

  @Get(':id')
  @ApiResponse({
    type: CompanyDto,
    description: 'Get company by ID',
  })
  public async findOne(@Param('id') id: number): Promise<CompanyDto> {
    return this.companyService.findOne(id);
  }

  @Post()
  @ApiResponse({
    type: CompanyDto,
    description: 'Create a new company',
  })
  public async create(@Body() companyDto: CompanyDto): Promise<CompanyDto> {
    return this.companyService.create(companyDto);
  }

  @Put(':id')
  @ApiResponse({
    type: CompanyDto,
    description: 'Update an existing company',
  })
  public async update(
    @Param('id') id: number,
    @Body() companyDto: CompanyDto,
  ): Promise<CompanyDto> {
    return this.companyService.update(id, companyDto);
  }

  @Delete(':id')
  @ApiResponse({
    type: Boolean,
    description: 'Delete a company',
  })
  public async remove(@Param('id') id: number): Promise<boolean> {
    return this.companyService.remove(id);
  }
}
