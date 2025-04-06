import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './Company';
import { WebSource } from './WebSource';
import { CrawlingStatus } from './CrawlingStatus';

@Index('CompanyCrawlingLog_pk', ['id'], { unique: true })
@Index('CompanyCrawlingLog_pk_2', ['companyId', 'webSourceId'], {
  unique: true,
})
@Entity('CompanyCrawlingLog', { schema: 'dbo' })
export class CompanyCrawlingLog {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('bigint', { name: 'CompanyId', unique: true })
  companyId: number;

  @Column('datetime2', {
    name: 'CreatedAt',
    nullable: true,
    default: () => 'getdate()',
  })
  createdAt: Date | null;

  @Column('datetime2', {
    name: 'UpdatedAt',
    nullable: true,
    default: () => 'getdate()',
  })
  updatedAt: Date | null;

  @Column('datetime2', { name: 'DeletedAt', nullable: true })
  deletedAt: Date | null;

  @Column('bigint', { name: 'WebSourceId', nullable: true, unique: true })
  webSourceId: number | null;

  @Column('nvarchar', { name: 'Message', nullable: true, length: 4000 })
  message: string | null;

  @ManyToOne(() => Company, (company) => company.companyCrawlingLogs)
  @JoinColumn([{ name: 'CompanyId', referencedColumnName: 'id' }])
  company: Company;

  @ManyToOne(() => WebSource, (webSource) => webSource.companyCrawlingLogs)
  @JoinColumn([{ name: 'WebSourceId', referencedColumnName: 'id' }])
  webSource: WebSource;

  @ManyToOne(
    () => CrawlingStatus,
    (crawlingStatus) => crawlingStatus.companyCrawlingLogs,
  )
  @JoinColumn([{ name: 'CrawlingStatusId', referencedColumnName: 'id' }])
  crawlingStatus: CrawlingStatus;
}
