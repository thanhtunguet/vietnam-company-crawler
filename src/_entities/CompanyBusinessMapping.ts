import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Business } from './Business';
import { Company } from './Company';

@Index('CompanyBusinessMapping_pk', ['companyId', 'businessId'], {
  unique: true,
})
@Entity('CompanyBusinessMapping', { schema: 'dbo' })
export class CompanyBusinessMapping {
  @Column('bigint', { primary: true, name: 'CompanyId' })
  companyId: number;

  @Column('bigint', { primary: true, name: 'BusinessId' })
  businessId: number;

  @Column('bit', {
    name: 'IsMainBusiness',
    nullable: true,
    default: () => '(0)',
  })
  isMainBusiness: boolean | null;

  @ManyToOne(() => Business, (business) => business.companyBusinessMappings)
  @JoinColumn([{ name: 'BusinessId', referencedColumnName: 'id' }])
  business: Business;

  @ManyToOne(() => Company, (company) => company.companyBusinessMappings)
  @JoinColumn([{ name: 'CompanyId', referencedColumnName: 'id' }])
  company: Company;
}
