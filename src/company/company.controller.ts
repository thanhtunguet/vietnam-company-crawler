import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyListPayloadDto } from 'src/company/dtos/company-list-payload.dto';
import { CompanyDto } from 'src/_dtos/company.dto';
import { Company } from 'src/_entities';
import { Repository } from 'typeorm';

@ApiTags('Company')
@Controller('/api/company')
export class CompanyController {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  @Get('/list')
  @ApiResponse({
    type: CompanyDto,
    isArray: true,
  })
  public async list(
    @Query() queryDto: CompanyListPayloadDto,
  ): Promise<CompanyDto[]> {
    const { skip = 0, take = 10, provinceId, districtId, wardId } = queryDto;

    return this.companyRepository.find({
      where: [
        provinceId
          ? {
              provinceId,
            }
          : undefined,
        districtId
          ? {
              districtId,
            }
          : undefined,
        wardId
          ? {
              wardId,
            }
          : undefined,
      ],
      skip,
      take,
    });
  }

  // Count number of company
  @Get('/count')
  @ApiResponse({
    type: Number,
  })
  public async count(
    @Query() queryDto: CompanyListPayloadDto,
  ): Promise<number> {
    const { skip = 0, take = 10, provinceId, districtId, wardId } = queryDto;

    return this.companyRepository.count({
      where: [
        provinceId
          ? {
              provinceId,
            }
          : undefined,
        districtId
          ? {
              districtId,
            }
          : undefined,
        wardId
          ? {
              wardId,
            }
          : undefined,
      ],
      skip,
      take,
    });
  }

  // Get company by id
  @Get('/:idOrTaxCode')
  @ApiResponse({
    type: CompanyDto,
  })
  public async get(
    @Param('idOrTaxCode') idOrTaxCode: string,
  ): Promise<CompanyDto> {
    const company = await this.companyRepository.findOne({
      where: [
        {
          id: Number(idOrTaxCode),
        },
        {
          taxCode: idOrTaxCode,
        },
      ],
      relations: ['businesses', 'province', 'district', 'ward'],
    });
    if (!company) {
      return null;
    }
    return {
      ...company,
      businesses: company.businesses.map((business) => ({
        id: business.id,
        code: business.code,
        name: business.name,
      })),
    };
  }
}
