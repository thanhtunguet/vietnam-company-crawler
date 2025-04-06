import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './Company';
import { District } from './District';
import { ProvinceCrawlingLog } from './ProvinceCrawlingLog';

@Index('Province_Code_Unique', ['code'], { unique: true })
@Index('Province_pk', ['id'], { unique: true })
@Entity('Province', { schema: 'dbo' })
export class Province {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('nvarchar', { name: 'Code', unique: true, length: 10 })
  code: string;

  @Column('nvarchar', { name: 'Name', length: 100 })
  name: string;

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

  @Column('nvarchar', { name: 'EnglishName', nullable: true, length: 100 })
  englishName: string | null;

  @Column('nvarchar', { name: 'Slug', nullable: true, length: 100 })
  slug: string | null;

  @OneToMany(() => Company, (company) => company.province)
  companies: Company[];

  @OneToMany(() => District, (district) => district.province)
  districts: District[];

  @OneToMany(
    () => ProvinceCrawlingLog,
    (provinceCrawlingLog) => provinceCrawlingLog.province,
  )
  provinceCrawlingLogs: ProvinceCrawlingLog[];
}
