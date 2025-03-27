import { ApiProperty } from '@nestjs/swagger';
import { Company } from 'src/_entities';

export class CompanyBusinessMappingDto {
  @ApiProperty({ description: 'Business ID', type: Number })
  businessId: number;

  @ApiProperty({ description: 'Company ID', type: Number })
  companyId: number;

  @ApiProperty({ description: 'Company information' })
  company: Company;
}
