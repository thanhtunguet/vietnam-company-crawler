import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryDto } from 'src/_dtos/query.dto';
import { Company } from 'src/_entities';
import { Repository } from 'typeorm';
import { CompanyDto } from './dtos/company.dto';

@ApiTags('Company')
@Controller('/api/company')
export class CompanyController {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  // Get list of company with skip-take
  @Get('/list')
  @ApiResponse({
    type: CompanyDto,
    isArray: true,
  })
  public async list(@Query() queryDto: QueryDto): Promise<CompanyDto[]> {
    const { skip = 0, take = 10 } = queryDto;
    return this.companyRepository.find({ skip, take });
  }

  // Count number of company
  @Get('/count')
  @ApiResponse({
    type: 'number',
  })
  public async count(): Promise<number> {
    return this.companyRepository.count();
  }

  // Get company by id
  @Get('/:idOrTaxCode')
  @ApiResponse({
    type: CompanyDto,
  })
  public async get(
    @Param('idOrTaxCode') idOrTaxCode: string,
  ): Promise<CompanyDto> {
    return this.companyRepository.findOne({
      where: [
        {
          id: Number(idOrTaxCode),
        },
        {
          taxCode: idOrTaxCode,
        },
      ],
      relations: ['companyBusinessMappings'],
    });
  }
}
