import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CrawlingStatus } from './CrawlingStatus';
import { WebSource } from './WebSource';
import { Province } from './Province';

@Index('ProvinceCrawlingLog_pk', ['id'], { unique: true })
@Index(
  'ProvinceCrawlingLog_pk_2',
  ['provinceId', 'webSourceId', 'currentPage', 'totalPage'],
  { unique: true },
)
@Entity('ProvinceCrawlingLog', { schema: 'dbo' })
export class ProvinceCrawlingLog {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('bigint', { name: 'ProvinceId', unique: true })
  provinceId: number;

  @Column('bigint', { name: 'CurrentPage', nullable: true, unique: true })
  currentPage: string | null;

  @Column('bigint', { name: 'TotalPage', nullable: true, unique: true })
  totalPage: number | null;

  @Column('bigint', { name: 'WebSourceId', nullable: true, unique: true })
  webSourceId: number | null;

  @Column('nvarchar', { name: 'Message', nullable: true, length: 4000 })
  message: string | null;

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

  @Column('datetime2', {
    name: 'DeletedAt',
    nullable: true,
    default: () => 'getdate()',
  })
  deletedAt: Date | null;

  @ManyToOne(
    () => CrawlingStatus,
    (crawlingStatus) => crawlingStatus.provinceCrawlingLogs,
  )
  @JoinColumn([{ name: 'CrawlingStatusId', referencedColumnName: 'id' }])
  crawlingStatus: CrawlingStatus;

  @ManyToOne(() => WebSource, (webSource) => webSource.provinceCrawlingLogs)
  @JoinColumn([{ name: 'WebSourceId', referencedColumnName: 'id' }])
  webSource: WebSource;

  @ManyToOne(() => Province, (province) => province.provinceCrawlingLogs)
  @JoinColumn([{ name: 'ProvinceId', referencedColumnName: 'id' }])
  province: Province;
}
