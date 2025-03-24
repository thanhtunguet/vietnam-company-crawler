import { ApiProperty } from '@nestjs/swagger';
import { Company, CompanyBusinessMapping } from 'src/_entities';

export class CompanyBusinessMappingDto implements CompanyBusinessMapping {
  @ApiProperty({ description: 'Business ID', type: Number })
  businessId: number;

  @ApiProperty({ description: 'Company ID', type: Number })
  companyId: number;

  @ApiProperty({ description: 'Company information' })
  company: Company;
}
