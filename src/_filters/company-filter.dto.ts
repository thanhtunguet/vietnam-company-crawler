import { ApiProperty } from '@nestjs/swagger';
import { QueryFilterDto } from './query-filter.dto';

export class CompanyFilterDto extends QueryFilterDto {
  @ApiProperty({
    description: 'Filter by company code',
    required: false,
  })
  public code?: string;

  @ApiProperty({
    description: 'Filter by company name',
    required: false,
  })
  public name?: string;

  @ApiProperty({
    description: 'Filter by province ID',
    required: false,
  })
  public provinceId?: number;

  @ApiProperty({
    description: 'Filter by district ID',
    required: false,
  })
  public districtId?: number;

  @ApiProperty({
    description: 'Filter by ward ID',
    required: false,
  })
  public wardId?: number;
}
