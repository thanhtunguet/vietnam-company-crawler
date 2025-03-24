import { Column, Entity, Index } from 'typeorm';

@Index('PK__CrawlerJ__3213E83F6D3F97E5', ['id'], { unique: true })
@Entity('CrawlerJob', { schema: 'dbo' })
export class CrawlerJob {
  @Column('uniqueidentifier', {
    primary: true,
    name: 'id',
    default: () => 'newid()',
  })
  id: number;

  @Column('nvarchar', { name: 'type', length: 20 })
  type: string;

  @Column('nvarchar', { name: 'status', length: 20 })
  status: string;

  @Column('float', {
    name: 'progress',
    nullable: true,
    precision: 53,
    default: () => '(0.0)',
  })
  progress: number | null;

  @Column('nvarchar', { name: 'province', nullable: true, length: 100 })
  province: string | null;

  @Column('int', { name: 'page_number', nullable: true })
  pageNumber: number | null;

  @Column('nvarchar', { name: 'company_url', nullable: true, length: 500 })
  companyUrl: string | null;

  @Column('datetime2', { name: 'started_at', nullable: true })
  startedAt: Date | null;

  @Column('datetime2', { name: 'finished_at', nullable: true })
  finishedAt: Date | null;

  @Column('nvarchar', { name: 'log', nullable: true })
  log: string | null;
}
