import { ApiProperty } from '@nestjs/swagger';
import { DistrictDto } from './district.dto';

export class ProvinceDto {
  @ApiProperty({ description: 'Province ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Province code', example: 'HN' })
  code: string;

  @ApiProperty({ description: 'Province name', example: 'Hà Nội' })
  name: string;

  @ApiProperty({ description: 'Province type', example: 'Thành phố' })
  type: string;

  @ApiProperty({ description: 'Province English name', example: 'Hanoi' })
  englishName: string;

  @ApiProperty({ description: 'Province slug', example: 'ha-noi' })
  slug: string;

  districts: DistrictDto[];
}
