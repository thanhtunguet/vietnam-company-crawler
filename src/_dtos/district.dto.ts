import { ApiProperty } from '@nestjs/swagger';

export class DistrictDto {
  @ApiProperty({ description: 'District ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'District code', example: 'HBT' })
  code: string;

  @ApiProperty({ description: 'District name', example: 'Hai Bà Trưng' })
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
    description: 'District English name',
    example: 'Hai Ba Trung',
    required: false,
  })
  englishName: string | null;

  // Province will be added in index.ts to avoid circular dependency
  province: any;

  // Wards will be added in index.ts to avoid circular dependency
  wards: any[];

  // Companies will be added in index.ts to avoid circular dependency
  companies?: any[];
}
