import { ApiProperty } from '@nestjs/swagger';
import { ProvinceDto } from './province.dto';

export class ProvinceWithCompanyCountDto extends ProvinceDto {
  @ApiProperty({
    description: 'Number of companies in this province',
    example: 1234,
  })
  companyCount: number;

  @ApiProperty({
    description: 'Slug of this province',
    example: 'ha-noi',
  })  
  slug: string;
} 