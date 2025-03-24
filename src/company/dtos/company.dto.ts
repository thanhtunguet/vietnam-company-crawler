import { ApiProperty } from '@nestjs/swagger';
import { Company } from 'src/_entities';
import { CompanyBusinessMappingDto } from './company-business-mapping.dto';

export class CompanyDto implements Company {
  @ApiProperty({ required: false, description: 'Company ID' })
  id: number;

  @ApiProperty({ required: false, description: 'Company tax code' })
  taxCode: string;

  @ApiProperty({ required: false, description: 'Company name' })
  name: string;

  @ApiProperty({ required: false, description: 'Company description' })
  description: string;

  @ApiProperty({ required: false, description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ required: false, description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({
    required: false,
    description: 'Deletion timestamp',
  })
  deletedAt: Date;

  @ApiProperty({ required: false, description: 'Company representative' })
  representative: string;

  @ApiProperty({ required: false, description: 'Main business activity' })
  mainBusiness: string;

  @ApiProperty({ required: false, description: 'Company address' })
  address: string;

  @ApiProperty({ required: false, description: 'Issue date' })
  issuedAt: Date;

  @ApiProperty({ required: false, description: 'Current company status' })
  currentStatus: string;

  @ApiProperty({
    required: false,
    description: 'Alternative company name',
  })
  alternateName: string;

  @ApiProperty({ required: false, description: 'Province ID' })
  provinceId: number;

  @ApiProperty({ required: false, description: 'District ID' })
  districtId: number;

  @ApiProperty({ required: false, description: 'Main business ID' })
  mainBusinessId: number;

  @ApiProperty({ required: false, description: 'Company URL slug' })
  slug: string;

  @ApiProperty({ required: false, description: 'Ward ID' })
  wardId: number;

  @ApiProperty({ required: false, description: 'Formatted address' })
  formattedAddress: string;

  @ApiProperty({ required: false, description: 'Province name' })
  provinceName: string;

  @ApiProperty({ required: false, description: 'District name' })
  districtName: string;

  @ApiProperty({ required: false, description: 'Ward name' })
  wardName: string;

  @ApiProperty({
    required: false,
    description: 'Whether the company data has been fully crawled',
  })
  isCrawledFull: boolean;

  @ApiProperty({
    required: false,
    description: 'Company business mappings',
    type: [CompanyBusinessMappingDto],
  })
  companyBusinessMappings: CompanyBusinessMappingDto[];
}
