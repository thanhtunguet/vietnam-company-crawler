import {
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Business } from './Business.entity';
import { Company } from './Company.entity';
import { CompanyBusinessMapping } from './CompanyBusinessMapping.entity';
import { CompanyCrawlingLog } from './CompanyCrawlingLog.entity';
import { CompanyStatus } from './CompanyStatus.entity';
import { CrawlingStatus } from './CrawlingStatus.entity';
import { District } from './District.entity';
import { Province } from './Province.entity';
import { ProvinceCrawlingLog } from './ProvinceCrawlingLog.entity';
import { Role } from './Role';
import { User } from './User.entity';
import { Ward } from './Ward.entity';
import { WebSource } from './WebSource.entity';

OneToMany(
  () => CompanyBusinessMapping,
  (mapping) => mapping.business,
)(Business.prototype, 'companyMappings');

// Company entity relationships
ManyToOne(() => CompanyStatus)(Company.prototype, 'status');
JoinColumn({ name: 'StatusId' })(Company.prototype, 'status');

ManyToOne(
  () => Business,
  (business) => business.companyMappings,
)(CompanyBusinessMapping.prototype, 'business');
JoinColumn({ name: 'BusinessId' })(
  CompanyBusinessMapping.prototype,
  'business',
);

// CrawlingStatus entity relationships
OneToMany(
  () => CompanyCrawlingLog,
  (log) => log.crawlingStatus,
)(CrawlingStatus.prototype, 'companyLogs');
OneToMany(
  () => ProvinceCrawlingLog,
  (log) => log.crawlingStatus,
)(CrawlingStatus.prototype, 'provinceLogs');

// District entity relationships
ManyToOne(
  () => Province,
  (province) => province.districts,
)(District.prototype, 'province');
JoinColumn({ name: 'ProvinceId' })(District.prototype, 'province');
OneToMany(
  () => Ward,
  (ward) => ward.district,
)(District.prototype, 'wards');

// Province entity relationships
OneToMany(
  () => District,
  (district) => district.province,
)(Province.prototype, 'districts');

OneToOne(
  () => ProvinceCrawlingLog,
  (log) => log.province,
)(Province.prototype, 'crawlingLog');

// Ward entity relationships
ManyToOne(
  () => District,
  (district) => district.wards,
)(Ward.prototype, 'district');
JoinColumn({ name: 'DistrictId' })(Ward.prototype, 'district');

// WebSource entity relationships
OneToMany(
  () => CompanyCrawlingLog,
  (log) => log.webSource,
)(WebSource.prototype, 'companyLogs');
OneToMany(
  () => ProvinceCrawlingLog,
  (log) => log.webSource,
)(WebSource.prototype, 'provinceLogs');

ManyToOne(
  () => WebSource,
  (webSource) => webSource.companyLogs,
)(CompanyCrawlingLog.prototype, 'webSource');
JoinColumn({ name: 'WebSourceId' })(CompanyCrawlingLog.prototype, 'webSource');
ManyToOne(
  () => CrawlingStatus,
  (status) => status.companyLogs,
)(CompanyCrawlingLog.prototype, 'crawlingStatus');
JoinColumn({ name: 'CrawlingStatusId' })(
  CompanyCrawlingLog.prototype,
  'crawlingStatus',
);

// ProvinceCrawlingLog entity relationships
OneToOne(
  () => Province,
  (province) => province.crawlingLog,
)(ProvinceCrawlingLog.prototype, 'province');
JoinColumn({ name: 'ProvinceId' })(ProvinceCrawlingLog.prototype, 'province');
ManyToOne(
  () => WebSource,
  (webSource) => webSource.provinceLogs,
)(ProvinceCrawlingLog.prototype, 'webSource');
JoinColumn({ name: 'WebSourceId' })(ProvinceCrawlingLog.prototype, 'webSource');
ManyToOne(
  () => CrawlingStatus,
  (status) => status.provinceLogs,
)(ProvinceCrawlingLog.prototype, 'crawlingStatus');
JoinColumn({ name: 'CrawlingStatusId' })(
  ProvinceCrawlingLog.prototype,
  'crawlingStatus',
);

// User entity relationships
ManyToMany(
  () => Role,
  (role) => role.users,
)(User.prototype, 'roleObjects');
JoinTable()(User.prototype, 'roleObjects');

// UserRole entity relationships
ManyToMany(
  () => User,
  (user) => user.roleObjects,
)(Role.prototype, 'users');

// Export all entities
export {
  Business,
  Company,
  CompanyBusinessMapping,
  CompanyCrawlingLog,
  CompanyStatus,
  CrawlingStatus,
  District,
  Province,
  ProvinceCrawlingLog,
  Role,
  User,
  Ward,
  WebSource,
};

// Note: Entity classes follow the convention:
// - TypeScript property names are camelCase (e.g., 'statusId')
// - Database column names are PascalCase (e.g., column name 'StatusId')
// This convention should be used when defining new entities or modifying existing ones
