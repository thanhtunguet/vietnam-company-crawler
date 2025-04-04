import { ApiProperty } from '@nestjs/swagger';
import { ProvinceDto } from './province.dto';
import { WardDto } from './ward.dto';

export class DistrictDto {
  @ApiProperty({ description: 'District ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'District code', example: 'HBT' })
  code: string;

  @ApiProperty({ description: 'District name', example: 'Hai Bà Trưng' })
  name: string;

  @ApiProperty({ description: 'District type', example: 'Quận' })
  type: string;

  @ApiProperty({
    description: 'District English name',
    example: 'Hai Ba Trung',
  })
  englishName: string;

  @ApiProperty({ description: 'District slug', example: 'hai-ba-trung' })
  slug: string;

  @ApiProperty({ description: 'Province ID', example: 1 })
  provinceId: number;

  province: ProvinceDto;

  wards: WardDto[];
}
