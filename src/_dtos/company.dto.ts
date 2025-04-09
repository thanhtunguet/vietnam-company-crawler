import { ApiProperty } from '@nestjs/swagger';

export class CompanyDto {
  @ApiProperty({ description: 'Company ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Company code', example: 'MST0123456789' })
  code: string;

  @ApiProperty({ description: 'Company name', example: 'Công ty TNHH ABC' })
  name: string;

  @ApiProperty({
    description: 'Company English name',
    example: 'ABC Company Ltd.',
    required: false,
  })
  englishName: string | null;

  @ApiProperty({
    description: 'Company representative',
    example: 'Nguyễn Văn A',
    required: false,
  })
  representative: string | null;

  @ApiProperty({
    description: 'Representative phone number',
    example: '0912345678',
    required: false,
  })
  representativePhoneNumber: string | null;

  @ApiProperty({
    description: 'Company phone number',
    example: '0243123456',
    required: false,
  })
  phoneNumber: string | null;

  @ApiProperty({
    description: 'Company address',
    example: '123 Đường ABC, Phường XYZ, Quận DEF, Hà Nội',
    required: false,
  })
  address: string | null;

  @ApiProperty({
    description: 'Issue date',
    example: '2020-01-01T00:00:00.000Z',
    required: false,
  })
  issuedAt: Date | null;

  @ApiProperty({
    description: 'Termination date',
    example: null,
    required: false,
  })
  terminatedAt: Date | null;

  @ApiProperty({
    description: 'Number of staff',
    example: '50',
    required: false,
    type: Number,
  })
  numberOfStaffs: number | null;

  @ApiProperty({
    description: 'Current status',
    example: 'Đang hoạt động',
    required: false,
  })
  currentStatus: string | null;

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
    description: 'Company director',
    example: 'Nguyễn Văn B',
    required: false,
  })
  director: string | null;

  @ApiProperty({
    description: 'Director phone number',
    example: '0987654321',
    required: false,
  })
  directorPhoneNumber: string | null;

  @ApiProperty({
    description: 'Commencement date',
    example: '2020-02-01T00:00:00.000Z',
    required: false,
  })
  commencementDate: Date | null;

  @ApiProperty({
    description: 'Account creation date',
    example: '2020-01-15T00:00:00.000Z',
    required: false,
  })
  accountCreatedAt: Date | null;

  @ApiProperty({
    description: 'Tax authority',
    example: 'Cục thuế TP Hà Nội',
    required: false,
  })
  taxAuthority: string | null;

  // Related entities will be added in index.ts to avoid circular dependency
  province?: any;
  district?: any;
  ward?: any;
  status?: any;
  companyBusinessMappings?: any[];
  companyCrawlingLogs?: any[];
}
