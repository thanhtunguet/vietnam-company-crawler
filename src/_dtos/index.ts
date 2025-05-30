import { ApiProperty } from '@nestjs/swagger';

export * from './address-dto';
export * from './company-status.dto';
export * from './company.dto';
export * from './district.dto';
export * from './province-with-company-count.dto';
export * from './province.dto';
export * from './ward.dto';
// Export other DTOs...

// Import the DTOs after export to resolve circular dependencies
import { CompanyStatusDto } from './company-status.dto';
import { CompanyDto } from './company.dto';
import { DistrictDto } from './district.dto';
import { ProvinceDto } from './province.dto';
import { WardDto } from './ward.dto';

// Add ApiProperty decorators for reference fields after all classes are defined

// ProvinceDto references
ApiProperty({ type: () => [DistrictDto], description: 'List of districts' })(
  ProvinceDto.prototype,
  'districts',
);
ApiProperty({
  type: () => [CompanyDto],
  description: 'List of companies in this province',
})(ProvinceDto.prototype, 'companies');

// DistrictDto references
ApiProperty({ type: () => ProvinceDto, description: 'Province information' })(
  DistrictDto.prototype,
  'province',
);
ApiProperty({
  type: () => [WardDto],
  description: 'List of wards in this district',
})(DistrictDto.prototype, 'wards');
ApiProperty({
  type: () => [CompanyDto],
  description: 'List of companies in this district',
})(DistrictDto.prototype, 'companies');

// WardDto references
ApiProperty({ type: () => DistrictDto, description: 'District information' })(
  WardDto.prototype,
  'district',
);
ApiProperty({
  type: () => [CompanyDto],
  description: 'List of companies in this ward',
})(WardDto.prototype, 'companies');

// CompanyDto references
ApiProperty({ type: () => ProvinceDto, description: 'Province information' })(
  CompanyDto.prototype,
  'province',
);
ApiProperty({ type: () => DistrictDto, description: 'District information' })(
  CompanyDto.prototype,
  'district',
);
ApiProperty({ type: () => WardDto, description: 'Ward information' })(
  CompanyDto.prototype,
  'ward',
);
ApiProperty({
  type: () => CompanyStatusDto,
  description: 'Company status information',
})(CompanyDto.prototype, 'status');
