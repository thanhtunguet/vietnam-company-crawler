import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Company } from './Company';

@Index('IDX_8479cf14fe5c41c38aa3e182d4', ['businessId'], {})
@Index('IDX_0d0acbceb7ea4e547ef5ba1abe', ['companyId'], {})
@Entity('CompanyBusinessMapping', { schema: 'TTDN' })
export class CompanyBusinessMapping {
  @Column('bigint', { primary: true, name: 'BusinessId' })
  businessId: number;

  @Column('bigint', { primary: true, name: 'CompanyId' })
  companyId: number;

  @ManyToOne(() => Company, (company) => company.companyBusinessMappings, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'CompanyId', referencedColumnName: 'id' }])
  company: Company;
}
