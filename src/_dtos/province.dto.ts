import { ApiProperty } from '@nestjs/swagger';

export class ProvinceDto {
  @ApiProperty({ description: 'Province ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Province code', example: 'HN' })
  code: string;

  @ApiProperty({ description: 'Province name', example: 'Hà Nội' })
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
    description: 'Province English name',
    example: 'Hanoi',
    required: false,
  })
  englishName: string | null;

  // Districts will be added in index.ts to avoid circular dependency
  districts: any[];

  // Companies will be added in index.ts to avoid circular dependency
  companies: any[];

  // ProvinceCrawlingLogs will be added in index.ts to avoid circular dependency
  provinceCrawlingLogs: any[];
}
