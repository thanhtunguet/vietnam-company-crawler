import { ApiProperty } from '@nestjs/swagger';

// Handle circular dependencies by applying decorators after all classes are defined
import { ProvinceDto } from './province.dto';
import { DistrictDto } from './district.dto';
import { WardDto } from './ward.dto';

// Add ApiProperty decorators for reference fields
ApiProperty({ type: () => [DistrictDto], description: 'List of districts' })(
  ProvinceDto.prototype,
  'districts',
);

ApiProperty({ type: () => ProvinceDto, description: 'Province information' })(
  DistrictDto.prototype,
  'province',
);

ApiProperty({ type: () => [WardDto], description: 'List of wards' })(
  DistrictDto.prototype,
  'wards',
);

ApiProperty({ type: () => DistrictDto, description: 'District information' })(
  WardDto.prototype,
  'district',
);

export * from './business.dto';

export * from './company.dto';

export * from './district.dto';

export * from './http_error.dto';

export * from './province.dto';

export * from './query.dto';

export * from './ward.dto';
