import { ApiProperty } from '@nestjs/swagger';
import { DistrictDto, ProvinceDto, WardDto } from './index';

export class AddressDto {
  @ApiProperty({
    description: 'Province information if found',
    type: ProvinceDto,
    nullable: true,
  })
  province?: ProvinceDto;

  @ApiProperty({
    description: 'District information if found',
    type: DistrictDto,
    nullable: true,
  })
  district?: DistrictDto;

  @ApiProperty({
    description: 'Ward information if found',
    type: WardDto,
    nullable: true,
  })
  ward?: WardDto;
} 