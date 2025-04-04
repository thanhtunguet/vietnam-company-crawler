import { ApiProperty } from '@nestjs/swagger';
import { DistrictDto } from './district.dto';

export class WardDto {
  @ApiProperty({ description: 'Ward ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Ward code', example: 'P001' })
  code: string;

  @ApiProperty({ description: 'Ward name', example: 'Phường Bạch Mai' })
  name: string;

  @ApiProperty({ description: 'Ward type', example: 'Phường' })
  type: string;

  @ApiProperty({ description: 'Ward English name', example: 'Bach Mai Ward' })
  englishName: string;

  @ApiProperty({ description: 'Ward slug', example: 'bach-mai' })
  slug: string;

  @ApiProperty({ description: 'District ID', example: 1 })
  districtId: number;

  district: DistrictDto;
}
