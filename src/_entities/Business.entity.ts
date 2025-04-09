import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Company } from './Company.entity';
import { CompanyBusinessMapping } from './CompanyBusinessMapping.entity';

@Entity('Business')
export class Business {
  @PrimaryColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('nvarchar', { name: 'Name', length: 255 })
  name: string;

  @Column('nvarchar', { name: 'Code', length: 10, unique: true })
  code: string;

  @Column('nvarchar', { name: 'RootCode', length: 10, nullable: true })
  rootCode: string;

  @Column('datetime2', { name: 'CreatedAt', default: () => 'getdate()' })
  createdAt: Date;

  @Column('datetime2', { name: 'UpdatedAt', default: () => 'getdate()' })
  updatedAt: Date;

  @Column('datetime2', { name: 'DeletedAt', nullable: true })
  deletedAt: Date;

  // Relationships (these are defined in index.ts)
  companies: Company[];
  companyMappings: CompanyBusinessMapping[];
}
