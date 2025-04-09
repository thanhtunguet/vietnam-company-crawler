import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CrawlingStatus } from './CrawlingStatus.entity';
import { Province } from './Province.entity';
import { WebSource } from './WebSource.entity';

@Entity('ProvinceCrawlingLog')
export class ProvinceCrawlingLog {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('bigint', { name: 'ProvinceId', unique: true })
  provinceId: number;

  @Column('bigint', { name: 'CurrentPage', nullable: true, unique: true })
  currentPage: number;

  @Column('bigint', { name: 'TotalPage', nullable: true, unique: true })
  totalPage: number;

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

  @Column('datetime2', { name: 'DeletedAt', default: () => 'getdate()' })
  deletedAt: Date;

  // Relationships (defined in index.ts)
  province: Province;
  webSource: WebSource;
  crawlingStatus: CrawlingStatus;
}
