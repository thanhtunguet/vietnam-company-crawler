export { Business } from './Business';

export { Company } from './Company';

export { CompanyBusinessMapping } from './CompanyBusinessMapping';

export { CompanyCrawlingLog } from './CompanyCrawlingLog';

export { CompanyStatus } from './CompanyStatus';

export { CrawlingStatus } from './CrawlingStatus';

export { District } from './District';

export { Province } from './Province';

export { ProvinceCrawlingLog } from './ProvinceCrawlingLog';

export { Ward } from './Ward';

export { WebSource } from './WebSource';

import { OneToMany, ManyToOne, JoinColumn } from 'typeorm';

import { Business } from './Business';
import { Company } from './Company';
import { CompanyBusinessMapping } from './CompanyBusinessMapping';
import { CompanyCrawlingLog } from './CompanyCrawlingLog';
import { CompanyStatus } from './CompanyStatus';
import { CrawlingStatus } from './CrawlingStatus';
import { District } from './District';
import { Province } from './Province';
import { ProvinceCrawlingLog } from './ProvinceCrawlingLog';
import { Ward } from './Ward';
import { WebSource } from './WebSource';

/**
 * Decorates all entity relationships after all classes are defined
 * This avoids the "Class used before defined" error in circular dependencies
 */
export function decorateRelationships() {
  // Business relationships
  OneToMany(
    () => Business,
    (business) => business.parent,
  )(Business.prototype, 'businesses');
  OneToMany(
    () => CompanyBusinessMapping,
    (mapping) => mapping.business,
  )(Business.prototype, 'companyBusinessMappings');
  ManyToOne(
    () => Business,
    (business) => business.businesses,
  )(Business.prototype, 'parent');
  JoinColumn([{ name: 'ParentId', referencedColumnName: 'id' }])(
    Business.prototype,
    'parent',
  );

  // Company relationships
  OneToMany(
    () => CompanyBusinessMapping,
    (mapping) => mapping.company,
  )(Company.prototype, 'companyBusinessMappings');
  OneToMany(
    () => CompanyCrawlingLog,
    (log) => log.company,
  )(Company.prototype, 'companyCrawlingLogs');
  ManyToOne(
    () => Province,
    (province) => province.companies,
  )(Company.prototype, 'province');
  JoinColumn([{ name: 'ProvinceId', referencedColumnName: 'id' }])(
    Company.prototype,
    'province',
  );
  ManyToOne(
    () => District,
    (district) => district.companies,
  )(Company.prototype, 'district');
  JoinColumn([{ name: 'DistrictId', referencedColumnName: 'id' }])(
    Company.prototype,
    'district',
  );
  ManyToOne(
    () => Ward,
    (ward) => ward.companies,
  )(Company.prototype, 'ward');
  JoinColumn([{ name: 'WardId', referencedColumnName: 'id' }])(
    Company.prototype,
    'ward',
  );
  ManyToOne(
    () => CompanyStatus,
    (status) => status.companies,
  )(Company.prototype, 'status');
  JoinColumn([{ name: 'StatusId', referencedColumnName: 'id' }])(
    Company.prototype,
    'status',
  );

  // CompanyBusinessMapping relationships
  ManyToOne(
    () => Business,
    (business) => business.companyBusinessMappings,
  )(CompanyBusinessMapping.prototype, 'business');
  JoinColumn([{ name: 'BusinessId', referencedColumnName: 'id' }])(
    CompanyBusinessMapping.prototype,
    'business',
  );
  ManyToOne(
    () => Company,
    (company) => company.companyBusinessMappings,
  )(CompanyBusinessMapping.prototype, 'company');
  JoinColumn([{ name: 'CompanyId', referencedColumnName: 'id' }])(
    CompanyBusinessMapping.prototype,
    'company',
  );

  // CompanyCrawlingLog relationships
  ManyToOne(
    () => Company,
    (company) => company.companyCrawlingLogs,
  )(CompanyCrawlingLog.prototype, 'company');
  JoinColumn([{ name: 'CompanyId', referencedColumnName: 'id' }])(
    CompanyCrawlingLog.prototype,
    'company',
  );
  ManyToOne(
    () => WebSource,
    (source) => source.companyCrawlingLogs,
  )(CompanyCrawlingLog.prototype, 'webSource');
  JoinColumn([{ name: 'WebSourceId', referencedColumnName: 'id' }])(
    CompanyCrawlingLog.prototype,
    'webSource',
  );
  ManyToOne(
    () => CrawlingStatus,
    (status) => status.companyCrawlingLogs,
  )(CompanyCrawlingLog.prototype, 'crawlingStatus');
  JoinColumn([{ name: 'CrawlingStatusId', referencedColumnName: 'id' }])(
    CompanyCrawlingLog.prototype,
    'crawlingStatus',
  );

  // CompanyStatus relationships
  OneToMany(
    () => Company,
    (company) => company.status,
  )(CompanyStatus.prototype, 'companies');

  // CrawlingStatus relationships
  OneToMany(
    () => CompanyCrawlingLog,
    (log) => log.crawlingStatus,
  )(CrawlingStatus.prototype, 'companyCrawlingLogs');
  OneToMany(
    () => ProvinceCrawlingLog,
    (log) => log.crawlingStatus,
  )(CrawlingStatus.prototype, 'provinceCrawlingLogs');

  // District relationships
  OneToMany(
    () => Company,
    (company) => company.district,
  )(District.prototype, 'companies');
  OneToMany(
    () => Ward,
    (ward) => ward.district,
  )(District.prototype, 'wards');
  ManyToOne(
    () => Province,
    (province) => province.districts,
  )(District.prototype, 'province');
  JoinColumn([{ name: 'ProvinceId', referencedColumnName: 'id' }])(
    District.prototype,
    'province',
  );

  // Province relationships
  OneToMany(
    () => Company,
    (company) => company.province,
  )(Province.prototype, 'companies');
  OneToMany(
    () => District,
    (district) => district.province,
  )(Province.prototype, 'districts');
  OneToMany(
    () => ProvinceCrawlingLog,
    (log) => log.province,
  )(Province.prototype, 'provinceCrawlingLogs');

  // ProvinceCrawlingLog relationships
  ManyToOne(
    () => CrawlingStatus,
    (status) => status.provinceCrawlingLogs,
  )(ProvinceCrawlingLog.prototype, 'crawlingStatus');
  JoinColumn([{ name: 'CrawlingStatusId', referencedColumnName: 'id' }])(
    ProvinceCrawlingLog.prototype,
    'crawlingStatus',
  );
  ManyToOne(
    () => WebSource,
    (source) => source.provinceCrawlingLogs,
  )(ProvinceCrawlingLog.prototype, 'webSource');
  JoinColumn([{ name: 'WebSourceId', referencedColumnName: 'id' }])(
    ProvinceCrawlingLog.prototype,
    'webSource',
  );
  ManyToOne(
    () => Province,
    (province) => province.provinceCrawlingLogs,
  )(ProvinceCrawlingLog.prototype, 'province');
  JoinColumn([{ name: 'ProvinceId', referencedColumnName: 'id' }])(
    ProvinceCrawlingLog.prototype,
    'province',
  );

  // Ward relationships
  OneToMany(
    () => Company,
    (company) => company.ward,
  )(Ward.prototype, 'companies');
  ManyToOne(
    () => District,
    (district) => district.wards,
  )(Ward.prototype, 'district');
  JoinColumn([{ name: 'DistrictId', referencedColumnName: 'id' }])(
    Ward.prototype,
    'district',
  );

  // WebSource relationships
  OneToMany(
    () => CompanyCrawlingLog,
    (log) => log.webSource,
  )(WebSource.prototype, 'companyCrawlingLogs');
  OneToMany(
    () => ProvinceCrawlingLog,
    (log) => log.webSource,
  )(WebSource.prototype, 'provinceCrawlingLogs');
}
