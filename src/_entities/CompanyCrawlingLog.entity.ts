import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Company } from './Company.entity';
import { WebSource } from './WebSource.entity';
import { CrawlingStatus } from './CrawlingStatus.entity';

@Entity('CompanyCrawlingLog')
export class CompanyCrawlingLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint', { name: 'CompanyId', unique: true })
  companyId: number;

  @Column('bigint', { name: 'WebSourceId', nullable: true, unique: true })
  webSourceId: number;

  @Column('bigint', { name: 'CrawlingStatusId', nullable: true })
  crawlingStatusId: number;

  @Column('nvarchar', { name: 'Message', length: 4000, nullable: true })
  message: string;

  @Column('datetime2', { name: 'CreatedAt', default: () => 'getdate()' })
  createdAt: Date;

  @Column('datetime2', { name: 'UpdatedAt', default: () => 'getdate()' })
  updatedAt: Date;

  @Column('datetime2', { name: 'DeletedAt', nullable: true })
  deletedAt: Date;

  // Relationships (defined in index.ts)
  company: Company;
  webSource: WebSource;
  crawlingStatus: CrawlingStatus;
}
