import { Column, Entity, PrimaryColumn } from 'typeorm';
import { CompanyCrawlingLog } from './CompanyCrawlingLog.entity';
import { ProvinceCrawlingLog } from './ProvinceCrawlingLog.entity';

@Entity('WebSource')
export class WebSource {
  @PrimaryColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('nvarchar', { name: 'Name', length: 100, nullable: true })
  name: string;

  @Column('nvarchar', { name: 'Code', length: 100, unique: true })
  code: string;

  @Column('nvarchar', { name: 'Link', length: 255, unique: true })
  link: string;

  @Column('datetime2', { name: 'CreatedAt', default: () => 'getdate()' })
  createdAt: Date;

  @Column('datetime2', { name: 'UpdatedAt', default: () => 'getdate()' })
  updatedAt: Date;

  @Column('datetime2', { name: 'DeleledAt', nullable: true })
  deletedAt: Date;

  // Relationships (defined in index.ts)
  companyLogs: CompanyCrawlingLog[];
  provinceLogs: ProvinceCrawlingLog[];
}
