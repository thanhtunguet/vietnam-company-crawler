import { Column, Entity, Index } from 'typeorm';

@Index('PK__CrawlerJ__3214EC07192F5F7A', ['id'], { unique: true })
@Entity('CrawlerJob', { schema: 'dbo' })
export class CrawlerJob {
  @Column('uniqueidentifier', {
    primary: true,
    name: 'Id',
    default: () => 'newid()',
  })
  id: number;

  @Column('nvarchar', { name: 'Type', length: 20 })
  type: string;

  @Column('nvarchar', { name: 'Status', length: 20 })
  status: string;

  @Column('float', {
    name: 'Progress',
    nullable: true,
    precision: 53,
    default: () => '(0)',
  })
  progress: number | null;

  @Column('nvarchar', { name: 'Province', nullable: true, length: 100 })
  province: string | null;

  @Column('int', { name: 'PageNumber', nullable: true })
  pageNumber: number | null;

  @Column('nvarchar', { name: 'CompanyUrl', nullable: true, length: 500 })
  companyUrl: string | null;

  @Column('datetime2', { name: 'StartedAt', nullable: true })
  startedAt: Date | null;

  @Column('datetime2', { name: 'FinishedAt', nullable: true })
  finishedAt: Date | null;

  @Column('nvarchar', { name: 'Log', nullable: true })
  log: string | null;

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
}
