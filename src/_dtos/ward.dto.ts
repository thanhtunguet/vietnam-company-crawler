import { ApiProperty } from '@nestjs/swagger';
import type { CompanyDto } from './company.dto';
import type { DistrictDto } from './district.dto';

export class WardDto {
  @ApiProperty({ description: 'Ward ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Ward code', example: 'P001' })
  code: string;

  @ApiProperty({ description: 'Ward name', example: 'Phường Bạch Mai' })
  name: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  createdAt: Date | null;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  updatedAt: Date | null;

  @ApiProperty({ description: 'Deletion date', example: null, required: false })
  deletedAt: Date | null;

  @ApiProperty({
    description: 'Ward English name',
    example: 'Bach Mai Ward',
    required: false,
  })
  englishName: string | null;

  // District will be added in index.ts to avoid circular dependency
  district?: DistrictDto;

  // Companies will be added in index.ts to avoid circular dependency
  companies?: CompanyDto[];
}
