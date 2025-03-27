import {
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ApiKeys } from './ApiKeys';
import { ApiUsageTracking } from './ApiUsageTracking';
import { Users } from './Users';
import { Company } from './Company';
import { Business } from './Business';
import { Province } from './Province';
import { District } from './District';
import { Ward } from './Ward';

export { ApiKeys } from './ApiKeys';

export { ApiUsageTracking } from './ApiUsageTracking';

export { Business } from './Business';

export { Company } from './Company';

export { CrawlerJob } from './CrawlerJob';

export { District } from './District';

export { Province } from './Province';

export { Users } from './Users';

export { Ward } from './Ward';

OneToMany(
  () => ApiUsageTracking,
  (apiUsageTracking) => apiUsageTracking.apiKey,
)(ApiKeys.prototype, 'apiUsageTrackings');

ManyToOne(
  () => Users,
  (users) => users.apiKeys,
  {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  },
)(ApiKeys.prototype, 'user');

JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])(
  ApiKeys.prototype,
  'user',
);

ManyToOne(
  () => ApiKeys,
  (apiKeys) => apiKeys.apiUsageTrackings,
  {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  },
)(ApiUsageTracking.prototype, 'apiKey');

JoinColumn([{ name: 'api_key_id', referencedColumnName: 'id' }])(
  ApiUsageTracking.prototype,
  'apiKey',
);

ManyToMany(
  () => Company,
  (company) => company.businesses,
)(Business.prototype, 'companies');

ManyToMany(
  () => Business,
  (business) => business.companies,
)(Company.prototype, 'businesses');

JoinTable({
  name: 'company_business_mapping',
  joinColumns: [{ name: 'company_id', referencedColumnName: 'id' }],
  inverseJoinColumns: [{ name: 'business_id', referencedColumnName: 'id' }],
  schema: 'NEW_TTDN',
})(Company.prototype, 'businesses');

ManyToOne(
  () => Province,
  (province) => province.companies,
  {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  },
)(Company.prototype, 'province');

JoinColumn([{ name: 'province_id', referencedColumnName: 'id' }])(
  Company.prototype,
  'province',
);

ManyToOne(
  () => District,
  (district) => district.companies,
  {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  },
)(Company.prototype, 'district');

JoinColumn([{ name: 'district_id', referencedColumnName: 'id' }])(
  Company.prototype,
  'district',
);

ManyToOne(
  () => Ward,
  (ward) => ward.companies,
  {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  },
)(Company.prototype, 'ward');

JoinColumn([{ name: 'ward_id', referencedColumnName: 'id' }])(
  Company.prototype,
  'ward',
);

OneToMany(
  () => Company,
  (company) => company.province,
)(Province.prototype, 'companies');

OneToMany(
  () => Company,
  (company) => company.district,
)(District.prototype, 'companies');

OneToMany(
  () => Company,
  (company) => company.ward,
)(Ward.prototype, 'companies');

OneToMany(
  () => Ward,
  (ward) => ward.province,
)(Province.prototype, 'wards');

OneToMany(
  () => District,
  (district) => district.province,
)(Province.prototype, 'districts');

OneToMany(
  () => Ward,
  (ward) => ward.district,
)(District.prototype, 'wards');

ManyToOne(
  () => Province,
  (province) => province.districts,
  {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  },
)(District.prototype, 'province');
JoinColumn([{ name: 'province_id', referencedColumnName: 'id' }])(
  District.prototype,
  'province',
);

ManyToOne(
  () => District,
  (district) => district.wards,
  {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  },
)(Ward.prototype, 'district');

JoinColumn([{ name: 'district_id', referencedColumnName: 'id' }])(
  Ward.prototype,
  'district',
);

ManyToOne(
  () => Province,
  (province) => province.wards,
  {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  },
)(Ward.prototype, 'province');

JoinColumn([{ name: 'province_id', referencedColumnName: 'id' }])(
  Ward.prototype,
  'province',
);
