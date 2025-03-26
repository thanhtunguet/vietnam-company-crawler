import { Column, Entity } from 'typeorm';

@Entity('CrawlerJob', { schema: 'TTDN' })
export class CrawlerJob {
  @Column('char', {
    primary: true,
    name: 'id',
    length: 36,
    default: () => "'uuid()'",
  })
  id: number;

  @Column('varchar', { name: 'type', length: 20 })
  type: string;

  @Column('varchar', { name: 'status', length: 20 })
  status: string;

  @Column('float', {
    name: 'progress',
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  progress: number | null;

  @Column('varchar', { name: 'province', nullable: true, length: 100 })
  province: string | null;

  @Column('int', { name: 'page_number', nullable: true })
  pageNumber: number | null;

  @Column('varchar', { name: 'company_url', nullable: true, length: 500 })
  companyUrl: string | null;

  @Column('datetime', { name: 'started_at', nullable: true })
  startedAt: Date | null;

  @Column('datetime', { name: 'finished_at', nullable: true })
  finishedAt: Date | null;

  @Column('longtext', { name: 'log', nullable: true })
  log: string | null;
}
