import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompanyCrawlingLog } from './CompanyCrawlingLog';
import { ProvinceCrawlingLog } from './ProvinceCrawlingLog';

@Index('CrawlingStatus_pk', ['id'], { unique: true })
@Entity('CrawlingStatus', { schema: 'dbo' })
export class CrawlingStatus {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('nvarchar', { name: 'Code', length: 100 })
  code: string;

  @Column('nvarchar', { name: 'Name', length: 100 })
  name: string;

  @OneToMany(
    () => CompanyCrawlingLog,
    (companyCrawlingLog) => companyCrawlingLog.crawlingStatus,
  )
  companyCrawlingLogs: CompanyCrawlingLog[];

  @OneToMany(
    () => ProvinceCrawlingLog,
    (provinceCrawlingLog) => provinceCrawlingLog.crawlingStatus,
  )
  provinceCrawlingLogs: ProvinceCrawlingLog[];
}
