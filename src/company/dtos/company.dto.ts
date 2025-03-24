import { Company, CompanyBusinessMapping } from 'src/_entities';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyBusinessMappingDto } from './company-business-mapping.dto';

export class CompanyDto implements Company {
  @ApiProperty({ description: 'Company ID' })
  id: number;

  @ApiProperty({ description: 'Company tax code' })
  taxCode: string;

  @ApiProperty({ description: 'Company name' })
  name: string;

  @ApiProperty({ description: 'Company description' })
  description: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Deletion timestamp', required: false })
  deletedAt: Date;

  @ApiProperty({ description: 'Company representative' })
  representative: string;

  @ApiProperty({ description: 'Main business activity' })
  mainBusiness: string;

  @ApiProperty({ description: 'Company address' })
  address: string;

  @ApiProperty({ description: 'Issue date' })
  issuedAt: Date;

  @ApiProperty({ description: 'Current company status' })
  currentStatus: string;

  @ApiProperty({ description: 'Alternative company name', required: false })
  alternateName: string;

  @ApiProperty({ description: 'Province ID' })
  provinceId: number;

  @ApiProperty({ description: 'District ID' })
  districtId: number;

  @ApiProperty({ description: 'Main business ID' })
  mainBusinessId: number;

  @ApiProperty({ description: 'Company URL slug' })
  slug: string;

  @ApiProperty({ description: 'Ward ID' })
  wardId: number;

  @ApiProperty({ description: 'Formatted address' })
  formattedAddress: string;

  @ApiProperty({ description: 'Province name' })
  provinceName: string;

  @ApiProperty({ description: 'District name' })
  districtName: string;

  @ApiProperty({ description: 'Ward name' })
  wardName: string;

  @ApiProperty({
    description: 'Whether the company data has been fully crawled',
  })
  isCrawledFull: boolean;

  @ApiProperty({
    description: 'Company business mappings',
    type: [CompanyBusinessMappingDto],
  })
  companyBusinessMappings: CompanyBusinessMappingDto[];
}
