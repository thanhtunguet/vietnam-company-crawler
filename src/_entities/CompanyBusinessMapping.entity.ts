import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Business } from './Business.entity';
import { Company } from './Company.entity';

@Entity('CompanyBusinessMapping')
export class CompanyBusinessMapping {
  @PrimaryColumn('bigint', { name: 'CompanyId' })
  companyId: number;

  @PrimaryColumn('bigint', { name: 'BusinessId' })
  businessId: number;

  @Column('bit', { name: 'IsMainBusiness', default: 0 })
  isMainBusiness: boolean;

  // Relationships (defined in index.ts)
  company?: Company;
  business?: Business;
}
