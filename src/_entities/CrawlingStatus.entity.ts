import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CompanyCrawlingLog } from './CompanyCrawlingLog.entity';
import { ProvinceCrawlingLog } from './ProvinceCrawlingLog.entity';

@Entity('CrawlingStatus')
export class CrawlingStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('nvarchar', { name: 'Name', length: 100 })
  name: string;

  @Column('nvarchar', { name: 'Code', length: 100 })
  code: string;

  // Relationships (defined in index.ts)
  companyLogs: CompanyCrawlingLog[];
  provinceLogs: ProvinceCrawlingLog[];
}
