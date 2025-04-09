import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
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
import { User } from './User.entity';
import { Role } from './UserRole.entity';
import { Ward } from './Ward.entity';
import { WebSource } from './WebSource.entity';

// Business entity relationships
ManyToMany(
  () => Company,
  (company) => company.businesses,
)(Business.prototype, 'companies');
OneToMany(
  () => CompanyBusinessMapping,
  (mapping) => mapping.business,
)(Business.prototype, 'companyMappings');

// Company entity relationships
ManyToOne(() => CompanyStatus)(Company.prototype, 'status');
JoinColumn({ name: 'StatusId' })(Company.prototype, 'status');
ManyToMany(
  () => Business,
  (business) => business.companies,
)(Company.prototype, 'businesses');
OneToMany(
  () => CompanyBusinessMapping,
  (mapping) => mapping.company,
)(Company.prototype, 'businessMappings');
OneToOne(
  () => CompanyCrawlingLog,
  (log) => log.company,
)(Company.prototype, 'crawlingLog');

// CompanyBusinessMapping entity relationships
ManyToOne(
  () => Company,
  (company) => company.businessMappings,
)(CompanyBusinessMapping.prototype, 'company');
JoinColumn({ name: 'CompanyId' })(CompanyBusinessMapping.prototype, 'company');
ManyToOne(
  () => Business,
  (business) => business.companyMappings,
)(CompanyBusinessMapping.prototype, 'business');
JoinColumn({ name: 'BusinessId' })(
  CompanyBusinessMapping.prototype,
  'business',
);

// CompanyStatus entity relationships
OneToMany(
  () => Company,
  (company) => company.status,
)(CompanyStatus.prototype, 'companies');

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

// CompanyCrawlingLog entity relationships
OneToOne(
  () => Company,
  (company) => company.crawlingLog,
)(CompanyCrawlingLog.prototype, 'company');
JoinColumn({ name: 'CompanyId' })(CompanyCrawlingLog.prototype, 'company');
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
Entity('User')(User);
PrimaryGeneratedColumn()(User.prototype, 'id');
Column({ unique: true })(User.prototype, 'username');
Column({ nullable: true })(User.prototype, 'password');
Column({ nullable: true })(User.prototype, 'email');
Column({ nullable: true })(User.prototype, 'googleId');
Column({
  type: 'simple-array',
  default: 'user',
})(User.prototype, 'roles');
ManyToMany(
  () => Role,
  (role) => role.users,
)(User.prototype, 'roleObjects');
JoinTable()(User.prototype, 'roleObjects');
Column({ default: true })(User.prototype, 'isActive');
Column({ type: 'datetime2', default: () => 'GETDATE()' })(
  User.prototype,
  'createdAt',
);
Column({ type: 'datetime2', default: () => 'GETDATE()' })(
  User.prototype,
  'updatedAt',
);
Column({ type: 'datetime2', nullable: true })(User.prototype, 'deletedAt');
Column({ type: 'datetime2', nullable: true })(User.prototype, 'lastLogin');

// UserRole entity relationships
Entity('UserRole')(Role);
PrimaryGeneratedColumn()(Role.prototype, 'id');
Column({ unique: true })(Role.prototype, 'name');
Column({ nullable: true })(Role.prototype, 'description');
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
