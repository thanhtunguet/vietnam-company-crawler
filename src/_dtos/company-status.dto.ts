import { ApiProperty } from '@nestjs/swagger';

export class CompanyStatusDto {
  @ApiProperty({ description: 'Status ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Status name', example: 'Đang hoạt động' })
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

  // Companies will be added in index.ts to avoid circular dependency
  companies: any[];
}
