import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompanyCrawlingLog } from './CompanyCrawlingLog';
import { ProvinceCrawlingLog } from './ProvinceCrawlingLog';

@Index('WebSource_pk', ['id'], { unique: true })
@Index('WebSource_pk_2', ['code'], { unique: true })
@Index('WebSource_pk_3', ['link'], { unique: true })
@Entity('WebSource', { schema: 'dbo' })
export class WebSource {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('nvarchar', { name: 'Code', unique: true, length: 100 })
  code: string;

  @Column('nvarchar', { name: 'Name', nullable: true, length: 100 })
  name: string | null;

  @Column('nvarchar', { name: 'Link', unique: true, length: 255 })
  link: string;

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

  @Column('datetime2', { name: 'DeleledAt', nullable: true })
  deleledAt: Date | null;

  @OneToMany(
    () => CompanyCrawlingLog,
    (companyCrawlingLog) => companyCrawlingLog.webSource,
  )
  companyCrawlingLogs: CompanyCrawlingLog[];

  @OneToMany(
    () => ProvinceCrawlingLog,
    (provinceCrawlingLog) => provinceCrawlingLog.webSource,
  )
  provinceCrawlingLogs: ProvinceCrawlingLog[];
}
